const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEFAULT_FICHE_MODEL = "gpt-4o-mini";
const ALLOWED_STATUSES = ["Non abordé", "Réponse partielle", "Exploitable", "À compléter"] as const;

type FicheStatus = (typeof ALLOWED_STATUSES)[number];

type PlanTheme = {
  id: string;
  title?: string;
  question?: string;
};

type TextAnswer = {
  id: string;
  theme_id: string;
  question_text?: string;
  answer_text?: string;
  created_at?: string;
  updated_at?: string;
};

type AiDecision = {
  id?: string;
  theme_id: string;
  action?: string;
  followup_text?: string;
  answer_text?: string;
  status?: string;
  created_at?: string;
};

type ManagerPayload = {
  interview?: {
    id: string;
    selected_theme_ids?: string[];
  };
  plan?: {
    themes?: PlanTheme[];
  };
  answers?: TextAnswer[];
  ai_decisions?: AiDecision[];
  fiches?: unknown[];
};

type GeneratedFiche = {
  theme_id: string;
  theme_title: string;
  status: FicheStatus;
  summary: string;
  key_technical_points: string[];
  reasoning_heuristics: string[];
  examples_customer_cases: string[];
  risks_mistakes_to_avoid: string[];
  open_questions_missing_points: string[];
  source_references: Array<{
    answer_id: string;
    note: string;
  }>;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function requiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function findSupabasePublishableKey(value: unknown): string {
  if (typeof value === "string") {
    return value.startsWith("sb_publishable_") || value.startsWith("eyJ") ? value : "";
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findSupabasePublishableKey(item);
      if (found) return found;
    }
  }

  if (typeof value === "object" && value !== null) {
    for (const item of Object.values(value)) {
      const found = findSupabasePublishableKey(item);
      if (found) return found;
    }
  }

  return "";
}

function getSupabasePublishableKey() {
  const legacyAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (legacyAnonKey) return legacyAnonKey;

  const publishableKeysJson = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  if (publishableKeysJson) {
    try {
      const publishableKeys = JSON.parse(publishableKeysJson) as Record<string, unknown>;
      const defaultPublishableKey = findSupabasePublishableKey(publishableKeys.default);
      if (defaultPublishableKey) return defaultPublishableKey;

      const anyPublishableKey = findSupabasePublishableKey(publishableKeys);
      if (anyPublishableKey) return anyPublishableKey;
    } catch {
      throw new Error("SUPABASE_PUBLISHABLE_KEYS is not valid JSON");
    }
  }

  throw new Error("Supabase publishable key is not configured");
}

async function callRpc<T>(
  supabaseUrl: string,
  supabaseKey: string,
  functionName: string,
  body: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.message || payload?.error || `${functionName} failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

function cleanText(value: unknown, maxLength = 1800) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function stringList(value: unknown, maxItems = 8, maxLength = 360) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => cleanText(item, maxLength)).filter(Boolean).slice(0, maxItems);
}

function getThemeTitle(theme: PlanTheme | undefined, themeId: string) {
  return cleanText(theme?.title, 160) || themeId;
}

function inferStatus(answerText: string): FicheStatus {
  const clean = cleanText(answerText, 5000);
  if (!clean) return "Non abordé";
  if (clean.length < 80 || /^(je ne sais pas|je sais pas|ca depend|ça dépend)\b/i.test(clean)) {
    return "Réponse partielle";
  }
  if (clean.length < 220) return "À compléter";
  return "Exploitable";
}

function emptyFiche(theme: PlanTheme | undefined, themeId: string): GeneratedFiche {
  const title = getThemeTitle(theme, themeId);
  return {
    theme_id: themeId,
    theme_title: title,
    status: "Non abordé",
    summary: "Ce thème n’a pas encore été abordé dans l’entretien.",
    key_technical_points: [],
    reasoning_heuristics: [],
    examples_customer_cases: [],
    risks_mistakes_to_avoid: [],
    open_questions_missing_points: ["Obtenir une première réponse de l’expert sur ce thème."],
    source_references: [],
  };
}

function fallbackFiche(theme: PlanTheme | undefined, answer: TextAnswer | undefined, themeId: string): GeneratedFiche {
  if (!answer?.answer_text) return emptyFiche(theme, themeId);
  const title = getThemeTitle(theme, themeId);
  const answerText = cleanText(answer.answer_text, 1800);
  return {
    theme_id: themeId,
    theme_title: title,
    status: inferStatus(answerText),
    summary: answerText || "Réponse capturée, mais trop courte pour être synthétisée.",
    key_technical_points: answerText ? [answerText] : [],
    reasoning_heuristics: [],
    examples_customer_cases: [],
    risks_mistakes_to_avoid: [],
    open_questions_missing_points: ["Préciser les règles de décision, exemples, risques et exceptions si disponibles."],
    source_references: [{ answer_id: answer.id, note: "Réponse capturée pour ce thème." }],
  };
}

function validateFiche(
  candidate: Partial<GeneratedFiche>,
  theme: PlanTheme | undefined,
  answer: TextAnswer | undefined,
  themeId: string,
): GeneratedFiche {
  if (!answer?.answer_text) return emptyFiche(theme, themeId);

  const title = getThemeTitle(theme, themeId);
  const status = ALLOWED_STATUSES.includes(candidate.status as FicheStatus)
    ? (candidate.status as FicheStatus)
    : inferStatus(answer.answer_text);
  const sourceReferences = Array.isArray(candidate.source_references)
    ? candidate.source_references
        .map((source) => ({
          answer_id: source?.answer_id === answer.id ? answer.id : "",
          note: cleanText(source?.note, 220),
        }))
        .filter((source) => source.answer_id)
        .slice(0, 3)
    : [];

  return {
    theme_id: themeId,
    theme_title: title,
    status: status === "Non abordé" ? inferStatus(answer.answer_text) : status,
    summary: cleanText(candidate.summary, 900) || cleanText(answer.answer_text, 900),
    key_technical_points: stringList(candidate.key_technical_points),
    reasoning_heuristics: stringList(candidate.reasoning_heuristics),
    examples_customer_cases: stringList(candidate.examples_customer_cases),
    risks_mistakes_to_avoid: stringList(candidate.risks_mistakes_to_avoid),
    open_questions_missing_points: stringList(candidate.open_questions_missing_points, 8, 300),
    source_references: sourceReferences.length
      ? sourceReferences
      : [{ answer_id: answer.id, note: "Réponse capturée pour ce thème." }],
  };
}

async function askOpenAi(
  openAiKey: string,
  model: string,
  themes: PlanTheme[],
  selectedThemeIds: string[],
  answers: TextAnswer[],
  decisions: AiDecision[],
) {
  const answerByTheme = new Map(answers.map((answer) => [answer.theme_id, answer]));
  const themeInputs = selectedThemeIds.map((themeId) => {
    const theme = themes.find((item) => item.id === themeId) || { id: themeId };
    const answer = answerByTheme.get(themeId);
    return {
      theme_id: themeId,
      theme_title: getThemeTitle(theme, themeId),
      fixed_question: theme.question || answer?.question_text || "",
      answer_id: answer?.id || "",
      captured_answer: answer?.answer_text || "",
      accepted_followups: decisions
        .filter((decision) => decision.theme_id === themeId && decision.action === "ask_followup" && decision.status === "accepted")
        .map((decision) => ({
          followup_text: decision.followup_text || "",
          answer_context: decision.answer_text || "",
        })),
    };
  });

  const schema = {
    name: "numerhyd_technical_fiches",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        fiches: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              theme_id: { type: "string" },
              theme_title: { type: "string" },
              status: { type: "string", enum: ALLOWED_STATUSES },
              summary: { type: "string" },
              key_technical_points: { type: "array", items: { type: "string" } },
              reasoning_heuristics: { type: "array", items: { type: "string" } },
              examples_customer_cases: { type: "array", items: { type: "string" } },
              risks_mistakes_to_avoid: { type: "array", items: { type: "string" } },
              open_questions_missing_points: { type: "array", items: { type: "string" } },
              source_references: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    answer_id: { type: "string" },
                    note: { type: "string" },
                  },
                  required: ["answer_id", "note"],
                },
              },
            },
            required: [
              "theme_id",
              "theme_title",
              "status",
              "summary",
              "key_technical_points",
              "reasoning_heuristics",
              "examples_customer_cases",
              "risks_mistakes_to_avoid",
              "open_questions_missing_points",
              "source_references",
            ],
          },
        },
      },
      required: ["fiches"],
    },
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: {
        type: "json_schema",
        json_schema: schema,
      },
      messages: [
        {
          role: "system",
          content:
            "Tu génères des fiches techniques NumerHyd à partir d'un entretien. Tu n'utilises que le contenu capturé fourni. Tu n'ajoutes aucune connaissance hydraulique générale, aucun fait inventé, aucune hypothèse non dite. Si une information manque, tu l'indiques dans les points à compléter. Tu écris en français simple, précis et nuancé.",
        },
        {
          role: "user",
          content: JSON.stringify({
            selected_theme_order: selectedThemeIds,
            themes: themeInputs,
            rules: [
              "Génère exactement une fiche par thème sélectionné, dans le même ordre.",
              "Si captured_answer est vide, status doit être Non abordé et les listes techniques doivent rester vides.",
              "Si la réponse est vague, courte ou générique, status doit être Réponse partielle ou À compléter.",
              "Ne complète jamais avec du contenu de manuel ou des connaissances génériques.",
              "Préserve les incertitudes et formulations conditionnelles.",
              "Les points techniques doivent être traçables au texte capturé.",
              "Inclure le answer_id fourni dans source_references quand il existe.",
            ],
          }),
        },
      ],
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error?.message || `OpenAI fiche generation failed with status ${response.status}`);
  }

  const content = body?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty fiche generation");
  }

  return JSON.parse(content) as { fiches?: Partial<GeneratedFiche>[] };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = requiredEnv("SUPABASE_URL");
    const supabaseKey = getSupabasePublishableKey();
    const openAiKey = requiredEnv("OPENAI_API_KEY");
    const model = Deno.env.get("OPENAI_FICHE_MODEL") || DEFAULT_FICHE_MODEL;
    const body = await req.json().catch(() => ({}));
    const managerToken = cleanText(body.manager_token, 300);
    const interviewId = cleanText(body.interview_id, 80);

    if (!managerToken || !interviewId) {
      return jsonResponse({ error: "manager_token and interview_id are required" }, 400);
    }

    const payload = await callRpc<ManagerPayload>(supabaseUrl, supabaseKey, "get_manager_interview_detail", {
      p_manager_token: managerToken,
      p_interview_id: interviewId,
    });

    if (!payload?.interview) {
      return jsonResponse({ error: "interview not found" }, 404);
    }

    const selectedThemeIds = Array.isArray(payload.interview.selected_theme_ids) ? payload.interview.selected_theme_ids : [];
    const themes = Array.isArray(payload.plan?.themes) ? payload.plan.themes : [];
    const answers = Array.isArray(payload.answers) ? payload.answers : [];
    const decisions = Array.isArray(payload.ai_decisions) ? payload.ai_decisions : [];
    const answersByTheme = new Map(answers.map((answer) => [answer.theme_id, answer]));
    const aiResult = await askOpenAi(openAiKey, model, themes, selectedThemeIds, answers, decisions);
    const candidatesByTheme = new Map((aiResult.fiches || []).map((fiche) => [fiche.theme_id, fiche]));
    const validatedFiches = selectedThemeIds.map((themeId) => {
      const theme = themes.find((item) => item.id === themeId);
      const answer = answersByTheme.get(themeId);
      return validateFiche(candidatesByTheme.get(themeId) || {}, theme, answer, themeId);
    });
    const upsertPayload = validatedFiches.map((fiche) => ({
      theme_id: fiche.theme_id,
      theme_title: fiche.theme_title,
      status: fiche.status,
      fiche,
      source_answer_ids: fiche.source_references.map((source) => source.answer_id).filter(Boolean),
      model,
      generation_status: "generated",
      error_message: "",
    }));
    const savedPayload = await callRpc<ManagerPayload>(supabaseUrl, supabaseKey, "upsert_generated_fiches_for_manager", {
      p_manager_token: managerToken,
      p_interview_id: interviewId,
      p_fiches: upsertPayload,
    });

    return jsonResponse({
      interview_id: interviewId,
      fiches: savedPayload?.fiches || [],
    });
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : "Fiche generation failed";
    return jsonResponse({ error: message }, 500);
  }
});
