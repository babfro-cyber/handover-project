const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEFAULT_FICHE_MODEL = "gpt-4o-mini";
const ALLOWED_STATUSES = ["Non abordé", "Réponse partielle", "Exploitable", "À compléter"] as const;
const SECTION_FALLBACKS = {
  key_technical_points: "Aucune connaissance technique exploitable n’a été clairement capturée sur ce point.",
  reasoning_heuristics: "Le raisonnement derrière la décision n’a pas encore été explicité.",
  examples_customer_cases: "Aucun exemple concret suffisamment détaillé n’a été mentionné.",
  risks_mistakes_to_avoid: "Les risques ou erreurs à éviter n’ont pas été précisés.",
  open_questions_missing_points: "Clarifier les connaissances techniques, le raisonnement, les exemples et les risques associés à ce thème.",
};

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

function normalizeForComparison(value: string) {
  return cleanText(value, 1200)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordSet(value: string) {
  return new Set(normalizeForComparison(value).split(" ").filter((word) => word.length > 3));
}

function jaccardSimilarity(a: string, b: string) {
  const aWords = wordSet(a);
  const bWords = wordSet(b);
  if (!aWords.size || !bWords.size) return 0;
  let intersection = 0;
  for (const word of aWords) {
    if (bWords.has(word)) intersection += 1;
  }
  return intersection / (aWords.size + bWords.size - intersection);
}

function isNearDuplicate(a: string, b: string) {
  const cleanA = normalizeForComparison(a);
  const cleanB = normalizeForComparison(b);
  if (!cleanA || !cleanB) return false;
  return cleanA === cleanB || cleanA.includes(cleanB) || cleanB.includes(cleanA) || jaccardSimilarity(cleanA, cleanB) >= 0.62;
}

function wordTokens(value: string) {
  return normalizeForComparison(value).split(" ").filter(Boolean);
}

function hasConsecutiveRawWords(value: string, answerText: string, threshold = 40) {
  const itemWords = wordTokens(value);
  const answerWords = wordTokens(answerText);
  if (itemWords.length < threshold || answerWords.length < threshold) return false;

  for (let itemIndex = 0; itemIndex <= itemWords.length - threshold; itemIndex += 1) {
    const needle = itemWords.slice(itemIndex, itemIndex + threshold).join(" ");
    for (let answerIndex = 0; answerIndex <= answerWords.length - threshold; answerIndex += 1) {
      if (answerWords.slice(answerIndex, answerIndex + threshold).join(" ") === needle) {
        return true;
      }
    }
  }
  return false;
}

function wordCount(value: string) {
  return wordTokens(value).length;
}

function splitLongBullet(value: string) {
  const text = cleanText(value, 1200);
  if (!text) return [];
  const sentenceParts = text
    .split(/(?<=[.!?])\s+|;\s+|\s+-\s+/)
    .map((part) => cleanText(part, 220))
    .filter(Boolean);
  const parts = sentenceParts.length > 1 ? sentenceParts : [text];
  return parts
    .flatMap((part) => {
      if (wordCount(part) <= 35) return [part];
      const words = part.split(/\s+/).filter(Boolean);
      return [words.slice(0, 30).join(" ") + "…"];
    })
    .filter(Boolean)
    .slice(0, 4);
}

function compactSummaryFromAnswer(answerText: string) {
  const text = cleanText(answerText, 420);
  if (!text) return "Aucune réponse exploitable n’a été capturée pour ce thème.";
  if (text.length < 140) {
    return "Une réponse a été capturée, mais elle reste trop vague pour produire une fiche technique structurée.";
  }
  return "Une réponse a été capturée pour ce thème, mais certains éléments doivent encore être clarifiés avant d’en faire une fiche pleinement exploitable.";
}

function stringList(value: unknown, maxItems = 8, maxLength = 360) {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((item) => splitLongBullet(cleanText(item, maxLength)))
    .filter(Boolean)
    .slice(0, maxItems);
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
    summary: compactSummaryFromAnswer(answerText),
    key_technical_points: [SECTION_FALLBACKS.key_technical_points],
    reasoning_heuristics: [SECTION_FALLBACKS.reasoning_heuristics],
    examples_customer_cases: [SECTION_FALLBACKS.examples_customer_cases],
    risks_mistakes_to_avoid: [SECTION_FALLBACKS.risks_mistakes_to_avoid],
    open_questions_missing_points: [SECTION_FALLBACKS.open_questions_missing_points],
    source_references: [{ answer_id: answer.id, note: "Réponse capturée pour ce thème." }],
  };
}

function dedupeSectionItems(sections: Record<string, string[]>) {
  const seen: string[] = [];
  const result: Record<string, string[]> = {};
  let removed = 0;

  for (const [sectionName, items] of Object.entries(sections)) {
    result[sectionName] = [];
    for (const item of items) {
      if (seen.some((existing) => isNearDuplicate(existing, item))) {
        removed += 1;
        continue;
      }
      result[sectionName].push(item);
      seen.push(item);
    }
  }

  return { sections: result, removed };
}

function hasSevereDuplication(sections: Record<string, string[]>) {
  const sectionTexts = Object.values(sections)
    .map((items) => items.join(" "))
    .filter((text) => normalizeForComparison(text).length > 30);
  for (let index = 0; index < sectionTexts.length; index += 1) {
    for (let other = index + 1; other < sectionTexts.length; other += 1) {
      if (isNearDuplicate(sectionTexts[index], sectionTexts[other])) return true;
    }
  }
  return false;
}

function hasRawTranscriptLeak(sectionItems: string[], answerText: string) {
  const answer = normalizeForComparison(answerText);
  if (!answer) return false;
  return sectionItems.some((item) => {
    const cleanItem = normalizeForComparison(item);
    return (
      hasConsecutiveRawWords(item, answerText, 40) ||
      wordCount(item) > 55 ||
      (cleanItem.length > 100 && (answer.includes(cleanItem) || jaccardSimilarity(cleanItem, answer) >= 0.78))
    );
  });
}

function sectionsLookMostlySimilar(sections: Record<string, string[]>) {
  const sectionTexts = Object.entries(sections)
    .filter(([sectionName]) => sectionName !== "open_questions_missing_points")
    .map(([, items]) => items.join(" "))
    .filter((text) => wordCount(text) >= 8);
  if (sectionTexts.length < 3) return false;

  let similarPairs = 0;
  let totalPairs = 0;
  for (let index = 0; index < sectionTexts.length; index += 1) {
    for (let other = index + 1; other < sectionTexts.length; other += 1) {
      totalPairs += 1;
      if (jaccardSimilarity(sectionTexts[index], sectionTexts[other]) >= 0.48) {
        similarPairs += 1;
      }
    }
  }
  return totalPairs > 0 && similarPairs / totalPairs >= 0.5;
}

function applySectionFallbacks(fiche: GeneratedFiche): GeneratedFiche {
  const openQuestionFallback =
    fiche.status === "Exploitable"
      ? "Aucun point à compléter prioritaire n’a été identifié dans le contenu capturé."
      : SECTION_FALLBACKS.open_questions_missing_points;
  const next: GeneratedFiche = {
    ...fiche,
    key_technical_points: fiche.key_technical_points.length
      ? fiche.key_technical_points
      : [SECTION_FALLBACKS.key_technical_points],
    reasoning_heuristics: fiche.reasoning_heuristics.length
      ? fiche.reasoning_heuristics
      : [SECTION_FALLBACKS.reasoning_heuristics],
    examples_customer_cases: fiche.examples_customer_cases.length
      ? fiche.examples_customer_cases
      : [SECTION_FALLBACKS.examples_customer_cases],
    risks_mistakes_to_avoid: fiche.risks_mistakes_to_avoid.length
      ? fiche.risks_mistakes_to_avoid
      : [SECTION_FALLBACKS.risks_mistakes_to_avoid],
    open_questions_missing_points: fiche.open_questions_missing_points.length
      ? fiche.open_questions_missing_points
      : [openQuestionFallback],
  };

  if (
    next.status === "Exploitable" &&
    (next.key_technical_points.includes(SECTION_FALLBACKS.key_technical_points) ||
      next.reasoning_heuristics.includes(SECTION_FALLBACKS.reasoning_heuristics))
  ) {
    return { ...next, status: "Réponse partielle" as FicheStatus };
  }

  return next;
}

function improveFicheQuality(fiche: GeneratedFiche, answerText: string): GeneratedFiche {
  const sections = {
    key_technical_points: fiche.key_technical_points,
    reasoning_heuristics: fiche.reasoning_heuristics,
    examples_customer_cases: fiche.examples_customer_cases,
    risks_mistakes_to_avoid: fiche.risks_mistakes_to_avoid,
    open_questions_missing_points: fiche.open_questions_missing_points,
  };
  const severeDuplicationBefore = hasSevereDuplication(sections);
  const deduped = dedupeSectionItems(sections);
  const hasRawLeak = hasRawTranscriptLeak(
    [
      ...deduped.sections.key_technical_points,
      ...deduped.sections.reasoning_heuristics,
      ...deduped.sections.examples_customer_cases,
      ...deduped.sections.risks_mistakes_to_avoid,
    ],
    answerText,
  );
  const severeDuplicationAfter = hasSevereDuplication(deduped.sections);

  if (severeDuplicationBefore || severeDuplicationAfter || hasRawLeak || sectionsLookMostlySimilar(deduped.sections)) {
    const qualityFallback: GeneratedFiche = {
      ...fiche,
      status: fiche.status === "Non abordé" ? "Non abordé" : ("À compléter" as FicheStatus),
      summary:
        "La réponse contient des éléments utiles, mais la synthèse automatique n’a pas réussi à les structurer correctement. Veuillez consulter la réponse brute.",
      key_technical_points: [],
      reasoning_heuristics: [],
      examples_customer_cases: [],
      risks_mistakes_to_avoid: [],
      open_questions_missing_points: [
        "La réponse capturée doit être clarifiée : la génération automatique n’a pas pu séparer proprement connaissances, raisonnement, exemples et risques.",
      ],
    };
    return applySectionFallbacks(qualityFallback);
  }

  const dedupedStatus: FicheStatus =
    deduped.removed > 0 && fiche.status === "Exploitable" ? "Réponse partielle" : fiche.status;
  const dedupedFiche: GeneratedFiche = {
    ...fiche,
    key_technical_points: deduped.sections.key_technical_points,
    reasoning_heuristics: deduped.sections.reasoning_heuristics,
    examples_customer_cases: deduped.sections.examples_customer_cases,
    risks_mistakes_to_avoid: deduped.sections.risks_mistakes_to_avoid,
    open_questions_missing_points: deduped.sections.open_questions_missing_points,
    status: dedupedStatus,
  };
  return applySectionFallbacks(dedupedFiche);
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

  const base = {
    theme_id: themeId,
    theme_title: title,
    status: status === "Non abordé" ? inferStatus(answer.answer_text) : status,
    summary: cleanText(candidate.summary, 900) || compactSummaryFromAnswer(answer.answer_text),
    key_technical_points: stringList(candidate.key_technical_points),
    reasoning_heuristics: stringList(candidate.reasoning_heuristics),
    examples_customer_cases: stringList(candidate.examples_customer_cases),
    risks_mistakes_to_avoid: stringList(candidate.risks_mistakes_to_avoid),
    open_questions_missing_points: stringList(candidate.open_questions_missing_points, 8, 300),
    source_references: sourceReferences.length
      ? sourceReferences
      : [{ answer_id: answer.id, note: "Réponse capturée pour ce thème." }],
  };

  return improveFicheQuality(base, answer.answer_text);
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
            "Tu génères des fiches techniques NumerHyd à partir d'un entretien. Tu extrais des idées, tu synthétises et tu classes le contenu capturé en bullets courts. Tu ne dois jamais citer, coller ou recopier un paragraphe du transcript brut dans les sections de synthèse. Le texte brut appartient uniquement à la section de vérification côté manager, pas à la fiche générée. Tu n'utilises que le contenu capturé fourni. Tu n'ajoutes aucune connaissance hydraulique générale, aucun fait inventé, aucune hypothèse non dite. Si une information manque, tu écris explicitement: Non précisé dans l’entretien. Tu écris en français simple, pratique, précis et nuancé.",
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
              "Exploitable est autorisé uniquement si la fiche contient à la fois du contenu technique clair et du raisonnement ou une règle de décision explicite.",
              "Ne complète jamais avec du contenu de manuel ou des connaissances génériques.",
              "Préserve les incertitudes et formulations conditionnelles.",
              "Les points techniques doivent être traçables au texte capturé.",
              "Inclure le answer_id fourni dans source_references quand il existe.",
              "Ne copie pas une même phrase dans plusieurs sections.",
              "Ne colle pas le transcript brut comme item de liste; le transcript reste visible séparément côté manager.",
              "Ne cite pas le raw transcript sauf dans source_references.",
              "Reformule en bullets concis, idéalement moins de 25 mots par bullet.",
              "Chaque bullet doit exprimer une seule idée extraite.",
              "Chaque section doit contenir une information différente.",
              "N’utilise jamais le même bullet, la même phrase ou le même paragraphe dans deux sections.",
              "Si un contenu ne peut pas être classé dans une section, écris: Non précisé dans l’entretien.",
              "Chaque section a un rôle distinct.",
              "key_technical_points contient uniquement des faits techniques explicitement dits: choix matière, procédé, contrôle, contrainte, préférence technique. Si rien n'est clair, utiliser exactement: Aucune connaissance technique exploitable n’a été clairement capturée sur ce point.",
              "reasoning_heuristics contient uniquement logique de décision, règle pratique, arbitrage ou raisonnement diagnostic. Si absent, utiliser exactement: Le raisonnement derrière la décision n’a pas encore été explicité.",
              "examples_customer_cases contient uniquement exemples réels, cas client, incident ou situation terrain. Si l'exemple est vague, dire qu'il est incomplet. Si absent, utiliser exactement: Aucun exemple concret suffisamment détaillé n’a été mentionné.",
              "risks_mistakes_to_avoid contient uniquement risques ou erreurs explicitement mentionnés ou clairement impliqués. Si absent, utiliser exactement: Les risques ou erreurs à éviter n’ont pas été précisés.",
              "open_questions_missing_points doit activement lister ce qu'il faut clarifier quand la réponse est vague.",
              "Pour Blocs forés, classifier ainsi quand ces idées sont présentes: connaissances = fonction du bloc, schéma, débits, pressions, sécurité, contraintes de montage, usinabilité, montage, contrôle, dépannage; raisonnement = penser au contrôle final, éviter la compacité risquée, accepter d’agrandir pour fiabilité/contrôle; exemples = cas client ou machine mobile; risques = perçages proches, croisements dangereux, bouchons difficiles, zone faible, contrôle difficile.",
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
