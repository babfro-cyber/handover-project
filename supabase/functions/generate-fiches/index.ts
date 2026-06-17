import hydraulicGlossary from "../_shared/hydraulicGlossary.json" with { type: "json" };
import interviewThemes from "../_shared/interviewThemes.json" with { type: "json" };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEFAULT_FICHE_MODEL = "gpt-4o-mini";
const ALLOWED_STATUSES = [
  "Non abordé",
  "Réponse partielle",
  "Exploitable",
  "À compléter",
] as const;
const SECTION_FALLBACKS = {
  key_technical_points:
    "Aucune connaissance technique exploitable n’a été clairement capturée sur ce point.",
  reasoning_heuristics:
    "Le raisonnement n’a pas été clairement explicité dans l’entretien.",
  examples_customer_cases:
    "Aucun exemple concret suffisamment détaillé n’a été mentionné.",
  risks_mistakes_to_avoid:
    "Les risques ou erreurs à éviter n’ont pas été précisés.",
  open_questions_missing_points:
    "Clarifier les connaissances techniques, le raisonnement, les exemples et les risques associés à ce thème.",
};
const NON_ABORDE_STATUS = "Non abordé";
const PARTIAL_STATUS = "Réponse partielle";
const USABLE_STATUS = "Exploitable";
const COMPLETE_LATER_STATUS = "À compléter";

type FicheStatus = (typeof ALLOWED_STATUSES)[number];

type PlanTheme = {
  id: string;
  title?: string;
  question?: string;
  objective?: string;
  mainQuestion?: string;
  expectedOutput?: string;
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
  understanding?: string[];
  method_reasoning?: string[];
  practical_rules?: string[];
  vigilance_points?: string[];
  mistakes_to_avoid?: string[];
  cases_or_examples?: string[];
  technical_vocabulary?: string[];
  to_complete?: string[];
  useful_raw_extracts?: string[];
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

function cleanText(value: unknown, maxLength = 1800) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
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
  return new Set(
    normalizeForComparison(value)
      .split(" ")
      .filter((word) => word.length > 3),
  );
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
  return (
    cleanA === cleanB ||
    cleanA.includes(cleanB) ||
    cleanB.includes(cleanA) ||
    jaccardSimilarity(cleanA, cleanB) >= 0.5
  );
}

function wordTokens(value: string) {
  return normalizeForComparison(value).split(" ").filter(Boolean);
}

function hasConsecutiveRawWords(
  value: string,
  answerText: string,
  threshold = 40,
) {
  const itemWords = wordTokens(value);
  const answerWords = wordTokens(answerText);
  if (itemWords.length < threshold || answerWords.length < threshold)
    return false;

  for (
    let itemIndex = 0;
    itemIndex <= itemWords.length - threshold;
    itemIndex += 1
  ) {
    const needle = itemWords.slice(itemIndex, itemIndex + threshold).join(" ");
    for (
      let answerIndex = 0;
      answerIndex <= answerWords.length - threshold;
      answerIndex += 1
    ) {
      if (
        answerWords.slice(answerIndex, answerIndex + threshold).join(" ") ===
        needle
      ) {
        return true;
      }
    }
  }
  return false;
}

function hasRawSentenceLeak(value: string, answerText: string) {
  const item = normalizeForComparison(value);
  if (!item) return false;
  return cleanText(answerText, 6000)
    .split(/(?<=[.!?])\s+|(?:\s+Suivi\s*:\s*)/i)
    .map((sentence) => normalizeForComparison(sentence))
    .filter((sentence) => wordTokens(sentence).length >= 10)
    .some((sentence) => item.includes(sentence) || sentence.includes(item));
}

function hasRawNgramLeak(value: string, answerText: string, threshold = 12) {
  const itemWords = wordTokens(value);
  const answerWords = wordTokens(answerText);
  if (itemWords.length < threshold || answerWords.length < threshold)
    return false;

  const rawNgrams = new Set<string>();
  for (let index = 0; index <= answerWords.length - threshold; index += 1) {
    rawNgrams.add(answerWords.slice(index, index + threshold).join(" "));
  }

  for (let index = 0; index <= itemWords.length - threshold; index += 1) {
    if (rawNgrams.has(itemWords.slice(index, index + threshold).join(" ")))
      return true;
  }
  return false;
}

function wordCount(value: string) {
  return wordTokens(value).length;
}

function isFallbackItem(value: string) {
  return Object.values(SECTION_FALLBACKS).some(
    (fallback) =>
      normalizeForComparison(fallback) === normalizeForComparison(value),
  );
}

function isTranscriptLeakItem(value: string, answerText: string) {
  const item = cleanText(value, 1400);
  const normalizedItem = normalizeForComparison(item);
  const normalizedAnswer = normalizeForComparison(answerText);
  if (!normalizedItem || !normalizedAnswer) return false;
  return (
    wordCount(item) > 38 ||
    hasConsecutiveRawWords(item, answerText, 18) ||
    hasRawNgramLeak(item, answerText, 12) ||
    hasRawSentenceLeak(item, answerText) ||
    (normalizedItem.length > 90 &&
      (normalizedAnswer.includes(normalizedItem) ||
        jaccardSimilarity(normalizedItem, normalizedAnswer) >= 0.68))
  );
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
  if (!text)
    return "Aucune réponse exploitable n’a été capturée pour ce thème.";
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
          term: cleanText(entry.term, 120),
          aliases: Array.isArray(entry.aliases)
            ? entry.aliases.map((item) => cleanText(item, 120)).filter(Boolean)
            : [],
          category: cleanText(entry.category || section, 120),
          definition: cleanText(entry.definition, 260),
        }))
      : [],
  );
}

function detectedGlossaryTerms(answerText: string) {
  const normalized = normalizeForComparison(answerText);
  return glossaryEntries()
    .filter((entry) =>
      [entry.term, ...entry.aliases].some(
        (term) => term && normalized.includes(normalizeForComparison(term)),
      ),
    )
    .slice(0, 24);
}

function getUncertaintyScore(answerText: string) {
  const normalized = normalizeForComparison(answerText);
  const patterns = [
    /\bje ne suis pas le plus precis\b/,
    /\bpas le plus precis\b/,
    /\bje ne connais pas\b/,
    /\bje ne sais pas\b/,
    /\bje sais pas\b/,
    /\bje ne peux pas donner\b/,
    /\bpas donner une regle\b/,
    /\bpas toujours la regle exacte\b/,
    /\bpas d exemple tres detaille\b/,
    /\bil faudrait demander\b/,
    /\bquelqu un de plus expert\b/,
    /\bpas la bonne personne\b/,
    /\bje ne suis pas expert\b/,
    /\bje ne me souviens pas\b/,
  ];
  return patterns.reduce(
    (score, pattern) => score + (pattern.test(normalized) ? 1 : 0),
    0,
  );
}

function hasConcreteTechnicalContent(items: string[]) {
  return items.some((item) => !isFallbackItem(item) && wordCount(item) >= 4);
}

function hasReasoningContent(items: string[]) {
  return items.some((item) => {
    if (isFallbackItem(item) || wordCount(item) < 4) return false;
    const normalized = normalizeForComparison(item);
    return (
      /\b(parce que|car|si|quand|lorsque|plutot|arbitr|choisir|eviter|prefer|regle|raison|risque|fiabil|controle|decision)\b/.test(
        normalized,
      ) || wordCount(item) >= 7
    );
  });
}

function inferStatus(answerText: string): FicheStatus {
  const clean = cleanText(answerText, 5000);
  if (!clean) return NON_ABORDE_STATUS;
  const uncertaintyScore = getUncertaintyScore(clean);
  if (uncertaintyScore >= 2) return COMPLETE_LATER_STATUS;
  if (
    clean.length < 80 ||
    /^(je ne sais pas|je sais pas|ca depend|ça dépend)\b/i.test(clean)
  ) {
    return PARTIAL_STATUS;
  }
  if (uncertaintyScore >= 1 || clean.length < 220) return PARTIAL_STATUS;
  return USABLE_STATUS;
}

function emptyFiche(
  theme: PlanTheme | undefined,
  themeId: string,
): GeneratedFiche {
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
    open_questions_missing_points: [
      "Obtenir une première réponse de l’expert sur ce thème.",
    ],
    understanding: [],
    method_reasoning: [],
    practical_rules: [],
    vigilance_points: [],
    mistakes_to_avoid: [],
    cases_or_examples: [],
    technical_vocabulary: [],
    to_complete: ["Obtenir une première réponse de l’expert sur ce thème."],
    useful_raw_extracts: [],
    source_references: [],
  };
}

function fallbackFiche(
  theme: PlanTheme | undefined,
  answer: TextAnswer | undefined,
  themeId: string,
): GeneratedFiche {
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
    open_questions_missing_points: [
      SECTION_FALLBACKS.open_questions_missing_points,
    ],
    understanding: [SECTION_FALLBACKS.key_technical_points],
    method_reasoning: [SECTION_FALLBACKS.reasoning_heuristics],
    practical_rules: [SECTION_FALLBACKS.reasoning_heuristics],
    vigilance_points: [SECTION_FALLBACKS.risks_mistakes_to_avoid],
    mistakes_to_avoid: [SECTION_FALLBACKS.risks_mistakes_to_avoid],
    cases_or_examples: [SECTION_FALLBACKS.examples_customer_cases],
    technical_vocabulary: detectedGlossaryTerms(answerText).map(
      (entry) => entry.term,
    ),
    to_complete: [SECTION_FALLBACKS.open_questions_missing_points],
    useful_raw_extracts: [answerText.slice(0, 280)],
    source_references: [
      { answer_id: answer.id, note: "Réponse capturée pour ce thème." },
    ],
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

function removeTranscriptLeaks(
  sections: Record<string, string[]>,
  answerText: string,
) {
  const result: Record<string, string[]> = {};
  let removed = 0;

  for (const [sectionName, items] of Object.entries(sections)) {
    result[sectionName] = [];
    for (const item of items) {
      if (isTranscriptLeakItem(item, answerText)) {
        removed += 1;
        continue;
      }
      result[sectionName].push(item);
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
      if (isNearDuplicate(sectionTexts[index], sectionTexts[other]))
        return true;
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
      isTranscriptLeakItem(item, answerText) ||
      (cleanItem.length > 100 &&
        (answer.includes(cleanItem) ||
          jaccardSimilarity(cleanItem, answer) >= 0.68))
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
    fiche.status === USABLE_STATUS
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
    next.status === USABLE_STATUS &&
    (next.key_technical_points.includes(
      SECTION_FALLBACKS.key_technical_points,
    ) ||
      next.reasoning_heuristics.includes(
        SECTION_FALLBACKS.reasoning_heuristics,
      ))
  ) {
    return { ...next, status: PARTIAL_STATUS as FicheStatus };
  }

  return next;
}

function enforceStatus(answerText: string, fiche: GeneratedFiche): FicheStatus {
  if (!cleanText(answerText)) return NON_ABORDE_STATUS;
  const uncertaintyScore = getUncertaintyScore(answerText);
  const hasTechnical = hasConcreteTechnicalContent(fiche.key_technical_points);
  const hasReasoning = hasReasoningContent(fiche.reasoning_heuristics);

  if (uncertaintyScore >= 2) return COMPLETE_LATER_STATUS;
  if (uncertaintyScore >= 1) return PARTIAL_STATUS;
  if (!hasTechnical && !hasReasoning) return COMPLETE_LATER_STATUS;
  if (!hasTechnical || !hasReasoning) return PARTIAL_STATUS;
  return fiche.status === USABLE_STATUS ? USABLE_STATUS : fiche.status;
}

function improveFicheQuality(
  fiche: GeneratedFiche,
  answerText: string,
): GeneratedFiche {
  const sections = {
    key_technical_points: fiche.key_technical_points,
    reasoning_heuristics: fiche.reasoning_heuristics,
    examples_customer_cases: fiche.examples_customer_cases,
    risks_mistakes_to_avoid: fiche.risks_mistakes_to_avoid,
    open_questions_missing_points: fiche.open_questions_missing_points,
  };
  const withoutRawLeaks = removeTranscriptLeaks(sections, answerText);
  const severeDuplicationBefore = hasSevereDuplication(
    withoutRawLeaks.sections,
  );
  const deduped = dedupeSectionItems(withoutRawLeaks.sections);
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
  const remainingSynthesisItems = [
    ...deduped.sections.key_technical_points,
    ...deduped.sections.reasoning_heuristics,
    ...deduped.sections.examples_customer_cases,
    ...deduped.sections.risks_mistakes_to_avoid,
  ].filter((item) => !isFallbackItem(item));

  if (
    severeDuplicationBefore ||
    severeDuplicationAfter ||
    hasRawLeak ||
    sectionsLookMostlySimilar(deduped.sections) ||
    (withoutRawLeaks.removed > 0 && remainingSynthesisItems.length === 0)
  ) {
    const qualityFallback: GeneratedFiche = {
      ...fiche,
      status:
        fiche.status === NON_ABORDE_STATUS
          ? NON_ABORDE_STATUS
          : (COMPLETE_LATER_STATUS as FicheStatus),
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
    (deduped.removed > 0 || withoutRawLeaks.removed > 0) &&
    fiche.status === USABLE_STATUS
      ? PARTIAL_STATUS
      : fiche.status;
  const dedupedFiche: GeneratedFiche = {
    ...fiche,
    key_technical_points: deduped.sections.key_technical_points,
    reasoning_heuristics: deduped.sections.reasoning_heuristics,
    examples_customer_cases: deduped.sections.examples_customer_cases,
    risks_mistakes_to_avoid: deduped.sections.risks_mistakes_to_avoid,
    open_questions_missing_points:
      deduped.sections.open_questions_missing_points,
    status: dedupedStatus,
  };
  const withFallbacks = applySectionFallbacks(dedupedFiche);
  return {
    ...withFallbacks,
    status: enforceStatus(answerText, withFallbacks),
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

  const base = {
    theme_id: themeId,
    theme_title: title,
    status:
      status === NON_ABORDE_STATUS ? inferStatus(answer.answer_text) : status,
    summary:
      cleanText(candidate.summary, 900) ||
      compactSummaryFromAnswer(answer.answer_text),
    key_technical_points: stringList(candidate.key_technical_points),
    reasoning_heuristics: stringList(candidate.reasoning_heuristics),
    examples_customer_cases: stringList(candidate.examples_customer_cases),
    risks_mistakes_to_avoid: stringList(candidate.risks_mistakes_to_avoid),
    open_questions_missing_points: stringList(
      candidate.open_questions_missing_points,
      8,
      300,
    ),
    understanding: stringList(
      candidate.understanding || candidate.key_technical_points,
    ),
    method_reasoning: stringList(
      candidate.method_reasoning || candidate.reasoning_heuristics,
    ),
    practical_rules: stringList(
      candidate.practical_rules || candidate.reasoning_heuristics,
    ),
    vigilance_points: stringList(
      candidate.vigilance_points || candidate.risks_mistakes_to_avoid,
    ),
    mistakes_to_avoid: stringList(
      candidate.mistakes_to_avoid || candidate.risks_mistakes_to_avoid,
    ),
    cases_or_examples: stringList(
      candidate.cases_or_examples || candidate.examples_customer_cases,
    ),
    technical_vocabulary: stringList(candidate.technical_vocabulary, 12, 160),
    to_complete: stringList(
      candidate.to_complete || candidate.open_questions_missing_points,
      8,
      260,
    ),
    useful_raw_extracts: stringList(candidate.useful_raw_extracts, 4, 280),
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
  const answerByTheme = new Map(
    answers.map((answer) => [answer.theme_id, answer]),
  );
  const themeInputs = selectedThemeIds.map((themeId) => {
    const theme = {
      ...(getV2Theme(themeId) || {}),
      ...(themes.find((item) => item.id === themeId) || { id: themeId }),
    };
    const answer = answerByTheme.get(themeId);
    const detectedTerms = detectedGlossaryTerms(answer?.answer_text || "");
    return {
      theme_id: themeId,
      theme_title: getThemeTitle(theme, themeId),
      objective: theme.objective || "",
      expected_output: theme.expectedOutput || "",
      fixed_question:
        theme.mainQuestion || theme.question || answer?.question_text || "",
      answer_id: answer?.id || "",
      captured_answer: answer?.answer_text || "",
      glossary_terms_detected: detectedTerms,
      accepted_followups: decisions
        .filter(
          (decision) =>
            decision.theme_id === themeId &&
            decision.action === "ask_followup" &&
            decision.status === "accepted",
        )
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
              key_technical_points: {
                type: "array",
                items: { type: "string" },
              },
              reasoning_heuristics: {
                type: "array",
                items: { type: "string" },
              },
              examples_customer_cases: {
                type: "array",
                items: { type: "string" },
              },
              risks_mistakes_to_avoid: {
                type: "array",
                items: { type: "string" },
              },
              open_questions_missing_points: {
                type: "array",
                items: { type: "string" },
              },
              understanding: { type: "array", items: { type: "string" } },
              method_reasoning: { type: "array", items: { type: "string" } },
              practical_rules: { type: "array", items: { type: "string" } },
              vigilance_points: { type: "array", items: { type: "string" } },
              mistakes_to_avoid: { type: "array", items: { type: "string" } },
              cases_or_examples: { type: "array", items: { type: "string" } },
              technical_vocabulary: {
                type: "array",
                items: { type: "string" },
              },
              to_complete: { type: "array", items: { type: "string" } },
              useful_raw_extracts: { type: "array", items: { type: "string" } },
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
              "understanding",
              "method_reasoning",
              "practical_rules",
              "vigilance_points",
              "mistakes_to_avoid",
              "cases_or_examples",
              "technical_vocabulary",
              "to_complete",
              "useful_raw_extracts",
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
            "Tu génères des fiches métier NumerHyd pratiques à partir de réponses validées. Tu ne produis pas un cours hydraulique générique et tu ne nettoies pas simplement le transcript. La réponse validée est la source de vérité. Le glossaire sert uniquement à clarifier le vocabulaire. Tu n'inventes aucun fait, tu marques les règles implicites comme à confirmer, et tu gardes les fiches simples, éditables et vérifiables.",
        },
        {
          role: "user",
          content: JSON.stringify({
            selected_theme_order: selectedThemeIds,
            themes: themeInputs,
            rules: [
              "Génère exactement une fiche par thème sélectionné, dans le même ordre.",
              "Remplis les sections V2: understanding, method_reasoning, practical_rules, vigilance_points, mistakes_to_avoid, cases_or_examples, technical_vocabulary, to_complete, useful_raw_extracts.",
              "Ces sections correspondent à: Ce qu’il faut comprendre; Méthode ou raisonnement métier; Règles pratiques à retenir; Points de vigilance; Erreurs à éviter; Cas ou exemples racontés; Vocabulaire technique associé; À compléter; Extraits bruts utiles.",
              "Si captured_answer est vide, status doit être Non abordé et les listes techniques doivent rester vides.",
              "Si la réponse est vague, courte ou générique, status doit être Réponse partielle ou À compléter.",
              "Exploitable est autorisé uniquement si la fiche contient à la fois du contenu technique clair et du raisonnement ou une règle de décision explicite.",
              "Ne complète jamais avec du contenu de manuel ou des connaissances génériques.",
              "N'utilise le glossaire que pour nommer ou clarifier le vocabulaire technique associé.",
              "technical_vocabulary doit venir des termes détectés ou explicitement cités.",
              "useful_raw_extracts peut contenir de courts extraits bruts utiles, jamais de longs paragraphes.",
              "Marque une règle implicite comme 'à confirmer' si elle n'est pas explicitement formulée.",
              "Préserve les incertitudes et formulations conditionnelles.",
              "Les points techniques doivent être traçables au texte capturé.",
              "Inclure le answer_id fourni dans source_references quand il existe.",
              "Ne copie pas une même phrase dans plusieurs sections.",
              "Ne colle pas le transcript brut comme item de liste; le transcript reste visible séparément côté manager.",
              "Ne cite pas le raw transcript sauf dans source_references.",
              "Ne transforme jamais un paragraphe du transcript en bullet long. Extrais l'idée et reformule-la.",
              "Aucun bullet de synthèse ne doit reprendre plus de 10 mots consécutifs du transcript brut.",
              "Reformule en bullets concis, idéalement moins de 25 mots par bullet.",
              "Si tu as besoin d'écrire plus de 30 mots, découpe en plusieurs bullets distincts ou écris Non précisé dans l’entretien.",
              "Chaque bullet doit exprimer une seule idée extraite.",
              "Chaque section doit contenir une information différente.",
              "N’utilise jamais le même bullet, la même phrase ou le même paragraphe dans deux sections.",
              "Si un contenu ne peut pas être classé dans une section, écris: Non précisé dans l’entretien.",
              "Chaque section a un rôle distinct.",
              "key_technical_points contient uniquement des faits techniques explicitement dits: choix matière, procédé, contrôle, contrainte, préférence technique. Si rien n'est clair, utiliser exactement: Aucune connaissance technique exploitable n’a été clairement capturée sur ce point.",
              "reasoning_heuristics contient uniquement logique de décision, règle pratique, arbitrage ou raisonnement diagnostic. Si absent, utiliser exactement: Le raisonnement n’a pas été clairement explicité dans l’entretien.",
              "examples_customer_cases contient uniquement exemples réels, cas client, incident ou situation terrain. Si l'exemple est vague, dire qu'il est incomplet. Si absent, utiliser exactement: Aucun exemple concret suffisamment détaillé n’a été mentionné.",
              "risks_mistakes_to_avoid contient uniquement risques ou erreurs explicitement mentionnés ou clairement impliqués. Si absent, utiliser exactement: Les risques ou erreurs à éviter n’ont pas été précisés.",
              "open_questions_missing_points doit activement lister ce qu'il faut clarifier quand la réponse est vague.",
              "Le status Exploitable est interdit si l'expert dit qu'il n'est pas précis, qu'il ne connaît pas la règle, qu'il faut demander à plus expert, ou qu'il manque un exemple.",
              "Pour une réponse sur traitements de surface où l'expert dit ne pas être précis, ne pas connaître la règle exacte, et devoir demander à plus expert, utiliser Réponse partielle ou À compléter, jamais Exploitable.",
              "Pour une réponse faible sur traitements de surface, les questions ouvertes doivent clarifier les règles de choix, les standards utilisés, le propriétaire de l'expertise, et les exemples concrets.",
              "Pour Blocs forés, classifier ainsi quand ces idées sont présentes: connaissances = fonction du bloc, schéma, débits, pressions, sécurité, contraintes de montage, usinabilité, montage, contrôle, dépannage; raisonnement = penser au contrôle final, éviter la compacité risquée, accepter d’agrandir pour fiabilité/contrôle; exemples = cas client ou machine mobile; risques = perçages proches, croisements dangereux, bouchons difficiles, zone faible, contrôle difficile.",
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
        `OpenAI fiche generation failed with status ${response.status}`,
    );
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
      return jsonResponse(
        { error: "manager_token and interview_id are required" },
        400,
      );
    }

    const payload = await callRpc<ManagerPayload>(
      supabaseUrl,
      supabaseKey,
      "get_manager_interview_detail",
      {
        p_manager_token: managerToken,
        p_interview_id: interviewId,
      },
    );

    if (!payload?.interview) {
      return jsonResponse({ error: "interview not found" }, 404);
    }

    const selectedThemeIds = Array.isArray(payload.interview.selected_theme_ids)
      ? payload.interview.selected_theme_ids
      : [];
    const themes = Array.isArray(payload.plan?.themes)
      ? payload.plan.themes
      : [];
    const answers = Array.isArray(payload.answers) ? payload.answers : [];
    const decisions = Array.isArray(payload.ai_decisions)
      ? payload.ai_decisions
      : [];
    const answersByTheme = new Map(
      answers.map((answer) => [answer.theme_id, answer]),
    );
    const aiResult = await askOpenAi(
      openAiKey,
      model,
      themes,
      selectedThemeIds,
      answers,
      decisions,
    );
    const candidatesByTheme = new Map(
      (aiResult.fiches || []).map((fiche) => [fiche.theme_id, fiche]),
    );
    const validatedFiches = selectedThemeIds.map((themeId) => {
      const theme = themes.find((item) => item.id === themeId);
      const answer = answersByTheme.get(themeId);
      return validateFiche(
        candidatesByTheme.get(themeId) || {},
        theme,
        answer,
        themeId,
      );
    });
    const upsertPayload = validatedFiches.map((fiche) => ({
      theme_id: fiche.theme_id,
      theme_title: fiche.theme_title,
      status: fiche.status,
      fiche,
      source_answer_ids: fiche.source_references
        .map((source) => source.answer_id)
        .filter(Boolean),
      model,
      generation_status: "generated",
      error_message: "",
    }));
    const savedPayload = await callRpc<ManagerPayload>(
      supabaseUrl,
      supabaseKey,
      "upsert_generated_fiches_for_manager",
      {
        p_manager_token: managerToken,
        p_interview_id: interviewId,
        p_fiches: upsertPayload,
      },
    );

    return jsonResponse({
      interview_id: interviewId,
      fiches: savedPayload?.fiches || [],
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Fiche generation failed";
    return jsonResponse({ error: message }, 500);
  }
});
