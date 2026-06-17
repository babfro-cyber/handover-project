import hydraulicGlossary from "../_shared/hydraulicGlossary.json" with { type: "json" };
import interviewThemes from "../_shared/interviewThemes.json" with { type: "json" };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ALLOWED_ACTIONS = [
  "ask_followup",
  "next_question",
  "next_theme",
  "finish_interview",
] as const;
const DEFAULT_DECISION_MODEL = "gpt-4o-mini";
const DEFAULT_MAX_FOLLOWUPS = 2;

type AllowedAction = (typeof ALLOWED_ACTIONS)[number];

type PlanTheme = {
  id: string;
  title?: string;
  question?: string;
  objective?: string;
  mainQuestion?: string;
  followUps?: string[];
  weakAnswerSignals?: string[];
  goodAnswerCriteria?: string[];
  realCasePrompts?: string[];
  avoid?: string[];
  expectedOutput?: string;
  transversalRelanceTypes?: string[];
};

type DecisionRequest = {
  public_token?: string;
  interview_id?: string;
  theme_id?: string;
  current_question_text?: string;
  latest_answer_text?: string;
  selected_themes?: string[];
  plan?: PlanTheme[];
  previous_followup_count?: number;
  max_followups?: number;
};

type AiDecision = {
  action: AllowedAction;
  theme_id: string;
  question_id: string;
  followup_text: string;
  off_topic: boolean;
  confidence: number;
  rationale: string;
  answer_quality?: "faible" | "partielle" | "exploitable";
  missing_elements?: string[];
};

type PublicInterviewPayload = {
  interview?: {
    id: string;
    public_token: string;
    selected_theme_ids: string[];
    current_theme_id?: string;
    status?: string;
  };
  plan?: {
    themes?: PlanTheme[];
  };
  ai_decisions?: Array<{
    theme_id: string;
    action: AllowedAction;
    status: string;
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

function getSupabasePublishableKey() {
  const legacyAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (legacyAnonKey) return legacyAnonKey;

  const publishableKeysJson = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  if (publishableKeysJson) {
    try {
      const publishableKeys = JSON.parse(publishableKeysJson) as Record<
        string,
        unknown
      >;
      const defaultPublishableKey = findSupabasePublishableKey(
        publishableKeys.default,
      );
      if (defaultPublishableKey) return defaultPublishableKey;

      const anyPublishableKey = findSupabasePublishableKey(publishableKeys);
      if (anyPublishableKey) return anyPublishableKey;
    } catch {
      throw new Error("SUPABASE_PUBLISHABLE_KEYS is not valid JSON");
    }
  }

  throw new Error("Supabase publishable key is not configured");
}

function findSupabasePublishableKey(value: unknown): string {
  if (typeof value === "string") {
    return value.startsWith("sb_publishable_") || value.startsWith("eyJ")
      ? value
      : "";
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
    const message =
      payload?.message ||
      payload?.error ||
      `${functionName} failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

function clamp(value: unknown) {
  const numberValue =
    typeof value === "number" && Number.isFinite(value) ? value : 0;
  return Math.max(0, Math.min(1, numberValue));
}

function cleanText(value: unknown, maxLength = 2000) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function isUnknownAnswer(answer: string) {
  const normalized = answer
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  return /^(je ne sais pas|je ne me souviens pas|je m'?en souviens pas|je ne me rappelle pas|je m'?en rappelle pas|j'?en sais rien|aucune idee|pas d'?idee|je sais pas|je suis bloque|je suis bloquee|no idea|i don'?t know)\b/.test(
    normalized,
  );
}

function normalizeForSearch(value: string) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getV2Theme(themeId: string) {
  return ((interviewThemes as { themes?: PlanTheme[] }).themes || []).find(
    (theme) => theme.id === themeId,
  );
}

function glossaryEntries() {
  const sections = [
    "coreTerms",
    "standards",
    "sunCavities",
    "componentFamilies",
    "manufacturers",
    "productReferences",
    "materials",
    "surfaceTreatments",
  ];
  return sections.flatMap((section) =>
    Array.isArray((hydraulicGlossary as Record<string, unknown>)[section])
      ? (
          (hydraulicGlossary as Record<string, unknown>)[section] as Array<
            Record<string, unknown>
          >
        ).map((entry) => ({
          term: String(entry.term || ""),
          aliases: Array.isArray(entry.aliases)
            ? entry.aliases.map(String)
            : [],
          transcriptionHints: Array.isArray(entry.transcriptionHints)
            ? entry.transcriptionHints.map(String)
            : [],
          category: String(entry.category || section),
        }))
      : [],
  );
}

function detectedGlossaryTerms(answerText: string) {
  const normalized = normalizeForSearch(answerText);
  return glossaryEntries()
    .filter((entry) =>
      [entry.term, ...entry.aliases, ...entry.transcriptionHints].some(
        (term) =>
          normalizeForSearch(term) &&
          normalized.includes(normalizeForSearch(term)),
      ),
    )
    .slice(0, 20);
}

function isWeakUsinabiliteAnswer(themeId: string, answerText: string) {
  if (themeId !== "usinabilite_contraintes_atelier") return false;
  const normalized = normalizeForSearch(answerText);
  const words = normalized.split(/\s+/).filter(Boolean);
  return (
    words.length <= 24 &&
    /\b(perçage|percage|foret|forets|cavite|cavites)\b/.test(normalized)
  );
}

function usinabiliteFollowUpDecision(
  themeId: string,
  questionId: string,
): AiDecision {
  return {
    action: "ask_followup",
    theme_id: themeId,
    question_id: questionId,
    followup_text:
      "Pouvez-vous raconter un cas concret de bloc difficile à usiner, avec la longueur des forets, l’accès machine, les trous inclinés, l’épaisseur de matière et les contraintes de cavités ?",
    off_topic: false,
    confidence: 0.92,
    rationale:
      "Réponse courte sur l’usinabilité : relance vers un cas concret et les contraintes atelier manquantes.",
    answer_quality: "faible",
    missing_elements: [
      "cas concret",
      "longueur des forets",
      "accès machine",
      "trous inclinés",
      "épaisseur de matière",
      "contraintes de cavités",
    ],
  };
}

function deterministicAction(
  selectedThemes: string[],
  themeId: string,
): AllowedAction {
  const currentIndex = selectedThemes.indexOf(themeId);
  if (currentIndex < 0 || currentIndex >= selectedThemes.length - 1) {
    return "finish_interview";
  }
  return "next_theme";
}

function deterministicDecision(
  selectedThemes: string[],
  themeId: string,
  questionId: string,
  rationale: string,
): AiDecision {
  return {
    action: deterministicAction(selectedThemes, themeId),
    theme_id: themeId,
    question_id: questionId,
    followup_text: "",
    off_topic: false,
    confidence: 1,
    rationale,
    answer_quality: "partielle",
    missing_elements: [],
  };
}

function validateDecision(
  candidate: Partial<AiDecision>,
  selectedThemes: string[],
  themeId: string,
  questionId: string,
  previousFollowupCount: number,
  maxFollowups: number,
) {
  const action = ALLOWED_ACTIONS.includes(candidate.action as AllowedAction)
    ? (candidate.action as AllowedAction)
    : deterministicAction(selectedThemes, themeId);

  const base: AiDecision = {
    action,
    theme_id: cleanText(candidate.theme_id, 120) || themeId,
    question_id: cleanText(candidate.question_id, 160) || questionId,
    followup_text: cleanText(candidate.followup_text, 260),
    off_topic: Boolean(candidate.off_topic),
    confidence: clamp(candidate.confidence),
    rationale: cleanText(candidate.rationale, 500),
    answer_quality:
      candidate.answer_quality === "faible" ||
      candidate.answer_quality === "partielle" ||
      candidate.answer_quality === "exploitable"
        ? candidate.answer_quality
        : "partielle",
    missing_elements: Array.isArray(candidate.missing_elements)
      ? candidate.missing_elements
          .map((item) => cleanText(item, 180))
          .filter(Boolean)
          .slice(0, 8)
      : [],
  };

  if (base.theme_id !== themeId || !selectedThemes.includes(base.theme_id)) {
    return {
      decision: deterministicDecision(
        selectedThemes,
        themeId,
        questionId,
        "AI returned an invalid theme.",
      ),
      status: "fallback",
      error: "invalid theme",
    };
  }

  if (base.action === "ask_followup") {
    if (previousFollowupCount >= maxFollowups) {
      return {
        decision: deterministicDecision(
          selectedThemes,
          themeId,
          questionId,
          "Follow-up limit reached.",
        ),
        status: "fallback",
        error: "follow-up limit reached",
      };
    }

    if (
      base.off_topic ||
      !base.followup_text ||
      base.followup_text.length < 12
    ) {
      return {
        decision: deterministicDecision(
          selectedThemes,
          themeId,
          questionId,
          "Follow-up was off-topic or empty.",
        ),
        status: "fallback",
        error: "invalid follow-up",
      };
    }
  } else {
    base.followup_text = "";
  }

  return {
    decision: base,
    status: "accepted",
    error: "",
  };
}

async function saveDecision(
  supabaseUrl: string,
  supabaseKey: string,
  publicToken: string,
  questionText: string,
  answerText: string,
  decision: AiDecision,
  status: string,
  errorMessage: string,
  rawResponse: unknown,
) {
  await callRpc(
    supabaseUrl,
    supabaseKey,
    "insert_ai_decision_for_public_interview",
    {
      p_public_token: publicToken,
      p_theme_id: decision.theme_id,
      p_question_id: decision.question_id,
      p_question_text: questionText,
      p_answer_text: answerText,
      p_action: decision.action,
      p_followup_text: decision.followup_text,
      p_off_topic: decision.off_topic,
      p_confidence: decision.confidence,
      p_rationale: decision.rationale,
      p_status: status,
      p_error_message: errorMessage || null,
      p_raw_response: rawResponse || null,
      p_validated_response: decision,
    },
  );
}

async function askOpenAi(
  openAiKey: string,
  model: string,
  plan: PlanTheme[],
  theme: PlanTheme,
  selectedThemes: string[],
  questionText: string,
  answerText: string,
  previousFollowupCount: number,
  maxFollowups: number,
) {
  const schema = {
    name: "numerhyd_next_step",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        action: { type: "string", enum: ALLOWED_ACTIONS },
        theme_id: { type: "string" },
        question_id: { type: "string" },
        followup_text: { type: "string" },
        off_topic: { type: "boolean" },
        confidence: { type: "number", minimum: 0, maximum: 1 },
        rationale: { type: "string" },
        answer_quality: {
          type: "string",
          enum: ["faible", "partielle", "exploitable"],
        },
        missing_elements: { type: "array", items: { type: "string" } },
      },
      required: [
        "action",
        "theme_id",
        "question_id",
        "followup_text",
        "off_topic",
        "confidence",
        "rationale",
        "answer_quality",
        "missing_elements",
      ],
    },
  };
  const enrichedTheme = { ...(getV2Theme(theme.id) || {}), ...theme };
  const glossaryTerms = detectedGlossaryTerms(answerText);

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
            "Vous êtes le moteur contrôlé de relance NumerHyd. Le plan fixe est la source de vérité. Vous évaluez la qualité métier de la réponse avec les signaux faibles et critères du thème, puis vous demandez au maximum une seule relance courte, en vouvoiement, concrète et spécifique au métier. Vous ne menez pas un entretien libre, ne changez pas de thème et ne posez jamais de question générique si une relance métier est possible.",
        },
        {
          role: "user",
          content: JSON.stringify({
            current_theme: enrichedTheme,
            selected_theme_order: selectedThemes,
            fixed_plan: plan,
            current_question_text: questionText,
            latest_answer_text: answerText,
            detected_glossary_terms: glossaryTerms,
            previous_followup_count: previousFollowupCount,
            max_followups: maxFollowups,
            rules: [
              "Classer answer_quality: faible, partielle ou exploitable.",
              "missing_elements doit lister les critères métier manquants, en français court.",
              "Si la réponse respecte plusieurs goodAnswerCriteria avec méthode ou exemple, passer au thème suivant.",
              "Si la réponse est utile mais incomplète et previous_followup_count est sous la limite, action doit être ask_followup.",
              "Si la réponse est très courte, vague, générique ou superficielle, action doit être ask_followup.",
              "La relance doit exploiter objective, missing_elements, followUps, realCasePrompts et detected_glossary_terms.",
              "Poser une seule question.",
              "Utiliser le vouvoiement.",
              "Rester court.",
              "Pousser vers exemple concret, méthode, règle de décision, diagnostic, contrôle atelier ou réflexe terrain.",
              "Éviter 'Pouvez-vous préciser ?' sauf si aucune meilleure relance n'est possible.",
              "Si l'expert dit ne pas savoir ou être bloqué, passer au thème suivant.",
              "Si la réponse est hors sujet, ne pas suivre la tangente; passer au thème suivant ou terminer.",
              "followup_text doit être en français, spécifique au thème NumerHyd courant, jamais hors thème.",
              "Ne jamais dépasser max_followups relances pour ce thème/question.",
            ],
          }),
        },
      ],
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      body?.error?.message ||
        `OpenAI decision failed with status ${response.status}`,
    );
  }

  const content = body?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty decision");
  }

  return {
    raw: body,
    parsed: JSON.parse(content) as Partial<AiDecision>,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = requiredEnv("SUPABASE_URL");
  const supabaseKey = getSupabasePublishableKey();
  const openAiKey = requiredEnv("OPENAI_API_KEY");
  const model = Deno.env.get("OPENAI_DECISION_MODEL") || DEFAULT_DECISION_MODEL;

  let requestBody: DecisionRequest = {};
  let publicToken = "";
  let themeId = "";
  let questionText = "";
  let answerText = "";
  let questionId = "";
  let selectedThemes: string[] = [];

  try {
    requestBody = await req.json();
    publicToken = cleanText(requestBody.public_token, 200);
    themeId = cleanText(requestBody.theme_id, 120);
    questionText = cleanText(requestBody.current_question_text, 1200);
    answerText = cleanText(requestBody.latest_answer_text, 6000);

    if (!publicToken || !themeId || !questionText || !answerText) {
      return jsonResponse(
        {
          error:
            "public_token, theme_id, current_question_text and latest_answer_text are required",
        },
        400,
      );
    }

    const payload = await callRpc<PublicInterviewPayload>(
      supabaseUrl,
      supabaseKey,
      "get_public_interview",
      {
        p_public_token: publicToken,
      },
    );

    const interview = payload?.interview;
    if (!interview) {
      return jsonResponse({ error: "invalid public token" }, 404);
    }

    selectedThemes = Array.isArray(interview.selected_theme_ids)
      ? interview.selected_theme_ids
      : [];
    if (!selectedThemes.includes(themeId)) {
      return jsonResponse(
        { error: "theme is not part of this interview" },
        400,
      );
    }

    const plan = Array.isArray(payload.plan?.themes) ? payload.plan.themes : [];
    const theme = plan.find((item) => item.id === themeId) || {
      id: themeId,
      question: questionText,
    };
    questionId = `${themeId}:followup:${Date.now()}`;
    const storedFollowupCount = (payload.ai_decisions || []).filter(
      (decision) =>
        decision.theme_id === themeId &&
        decision.action === "ask_followup" &&
        decision.status === "accepted",
    ).length;
    const previousFollowupCount = Math.max(
      storedFollowupCount,
      Number.isFinite(requestBody.previous_followup_count)
        ? Number(requestBody.previous_followup_count)
        : 0,
    );
    const maxFollowups = Math.max(
      0,
      Math.min(2, Number(requestBody.max_followups || DEFAULT_MAX_FOLLOWUPS)),
    );

    if (isUnknownAnswer(answerText)) {
      const decision = deterministicDecision(
        selectedThemes,
        themeId,
        questionId,
        "Expert does not know; moving on.",
      );
      await saveDecision(
        supabaseUrl,
        supabaseKey,
        publicToken,
        questionText,
        answerText,
        decision,
        "fallback",
        "",
        null,
      );
      return jsonResponse(decision);
    }

    if (previousFollowupCount >= maxFollowups) {
      const decision = deterministicDecision(
        selectedThemes,
        themeId,
        questionId,
        "Follow-up limit reached; moving on.",
      );
      await saveDecision(
        supabaseUrl,
        supabaseKey,
        publicToken,
        questionText,
        answerText,
        decision,
        "fallback",
        "",
        null,
      );
      return jsonResponse(decision);
    }

    if (isWeakUsinabiliteAnswer(themeId, answerText)) {
      const decision = usinabiliteFollowUpDecision(themeId, questionId);
      await saveDecision(
        supabaseUrl,
        supabaseKey,
        publicToken,
        questionText,
        answerText,
        decision,
        "accepted",
        "",
        null,
      );
      return jsonResponse(decision);
    }

    const aiResult = await askOpenAi(
      openAiKey,
      model,
      plan,
      theme,
      selectedThemes,
      questionText,
      answerText,
      previousFollowupCount,
      maxFollowups,
    );
    const validated = validateDecision(
      aiResult.parsed,
      selectedThemes,
      themeId,
      questionId,
      previousFollowupCount,
      maxFollowups,
    );

    await saveDecision(
      supabaseUrl,
      supabaseKey,
      publicToken,
      questionText,
      answerText,
      validated.decision,
      validated.status,
      validated.error,
      aiResult.raw,
    );

    return jsonResponse(validated.decision);
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "AI decision failed";
    const fallbackTheme = themeId || "unknown";
    const decision = deterministicDecision(
      selectedThemes.length ? selectedThemes : [fallbackTheme],
      fallbackTheme,
      questionId || `${fallbackTheme}:fallback`,
      message,
    );

    if (
      publicToken &&
      themeId &&
      questionText &&
      answerText &&
      selectedThemes.includes(themeId)
    ) {
      try {
        await saveDecision(
          supabaseUrl,
          supabaseKey,
          publicToken,
          questionText,
          answerText,
          decision,
          "error",
          message,
          null,
        );
      } catch {
        // The answer is already saved; never block the interview because fallback logging failed.
      }
    }

    return jsonResponse(decision);
  }
});
