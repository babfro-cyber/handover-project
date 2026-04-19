import {
  CompletenessStatus,
  InterviewMessage,
  SignalTag,
} from "@/lib/types";

const ambiguityPattern =
  /\b(sometimes|depends|usually|often|can vary|it varies|parfois|souvent|ça dépend|cela dépend|en général|habituellement)\b/i;
const problemPattern =
  /\b(issue|problem|error|breakdown|failure|mistake|urgent|missing|incomplete|delay|slip|blocked|problème|panne|erreur|urgence|manquant|incomplet|retard|blocage)\b/i;
const toolPattern =
  /\b(folder|file|excel|spreadsheet|erp|email|drive|software|shared drive|inbox|outlook|system|board|dossier|fichier|réseau partagé|boîte mail|outil|logiciel)\b/i;
const taskPattern =
  /\b(manage|coordinate|check|review|schedule|handle|receive|process|update|assign|plan|quote|order|track|prepare|chase|log|call|balance|allocate|follow up|prioritise|prioritize|gérer|coordonner|vérifier|contrôler|planifier|traiter|mettre à jour|suivre|préparer|appeler|rééquilibrer|déclencher)\b/i;
const contactPattern =
  /\b(technician|lead technician|supplier|customer|service manager|workshop@|accounts|purchasing|owner|ops manager|technicien|technicien référent|fournisseur|client|atelier@|achats|dirigeant|responsable)\b/i;
const examplePattern =
  /\b(example|for example|for instance|last week|this morning|yesterday|recently|when a|if a|on a typical day|par exemple|la semaine dernière|ce matin|hier|récemment|quand|si|sur un cas typique)\b/i;
const frequencyPattern =
  /\b(every|daily|each day|morning|afternoon|weekly|every week|monthly|most days|most weeks|whenever|as needed|as soon as|chaque|tous les jours|chaque matin|toutes les semaines|hebdomadaire|mensuel|dès que|au besoin)\b/i;
const triggerPattern =
  /\b(if|when|whenever|once|as soon as|comes in|arrives|starts with|trigger|si|quand|dès que|à partir du moment où|arrive|déclenche)\b/i;
const checkPattern =
  /\b(check|confirm|review|verify|make sure|cross-check|look at|vérifie|vérifier|contrôle|contrôler|confirme|relire|s’assure|s'assurer)\b/i;
const stepPattern =
  /\b(first|then|after that|next|before|once|start by|step|d’abord|d'abord|ensuite|puis|avant|une fois|commencer par|étape)\b/i;
const locationPattern =
  /\b(shared drive\s*>\s*[^.]+|réseau partagé\s*>\s*[^.]+|under\s+[^.]+|dans\s+[^.]+(?:dossier|réseau|erp|outlook|boîte|board)[^.]*|in\s+[^.]+(?:drive|folder|erp|outlook|inbox|board)[^.]*|on the\s+[^.]+board|hydtrack[^.]*)/i;
const ownerPattern =
  /\b(who uses|used by|updated by|owned by|relies on|team|technician|supplier|customer|accounts|purchasing|service manager|owner|qui l’utilise|qui l'utilise|mis à jour par|mis a jour par|dépend de|équipe|technicien|fournisseur|client|achats|dirigeant)\b/i;
const signPattern =
  /\b(sign|warning|notice|recognise|recognize|red flag|shows up|tells us|look for|signe|alerte|repère|repérer|repere|repérer|on voit|indique|surveiller)\b/i;
const fixPattern =
  /\b(fix|resolve|workaround|sort it out|rebook|reorder|update|correct|clean up|corriger|résoudre|resoudre|solutionner|replanifier|mettre à jour|mettre a jour|nettoyer)\b/i;
const escalationPattern =
  /\b(escalate|escalation|call the owner|call the supplier|call the customer|raise it|handover to|escalade|remonte|remonter|prévenir le dirigeant|prévenir le fournisseur|prévenir le client)\b/i;
const mistakePattern =
  /\b(mistake|mistakes|assume|assuming|miss|missed|erreur|erreurs|supposer|suppose|oublier)\b/i;

const contactLabels = [
  {
    key: "Lead technician",
    patterns: ["lead technician", "technicien référent", "technicien referent"],
  },
  {
    key: "Technicians",
    patterns: ["technicians", "technician", "techniciens", "technicien"],
  },
  {
    key: "Supplier",
    patterns: ["supplier", "fournisseur", "fournisseurs"],
  },
  {
    key: "Customer",
    patterns: ["customer", "client", "clients"],
  },
  {
    key: "Service manager",
    patterns: ["service manager", "responsable service", "service manager"],
  },
  {
    key: "Workshop inbox",
    patterns: ["workshop@", "atelier@", "inbox", "boîte mail", "boite mail"],
  },
  {
    key: "Purchasing",
    patterns: ["purchasing", "achats", "buyer"],
  },
  {
    key: "Accounts",
    patterns: ["accounts", "compta", "comptabilité", "comptabilite"],
  },
  {
    key: "Owner",
    patterns: ["owner", "dirigeant", "gérant", "gerant"],
  },
];

export interface AnswerAnalysis {
  wordCount: number;
  isShort: boolean;
  isAmbiguous: boolean;
  isAbstract: boolean;
  mentionsTask: boolean;
  mentionsProblem: boolean;
  mentionsTool: boolean;
  mentionsContact: boolean;
  hasExample: boolean;
  hasFrequency: boolean;
  hasTrigger: boolean;
  hasCheck: boolean;
  hasStepCue: boolean;
  hasLocation: boolean;
  hasOwner: boolean;
  hasSigns: boolean;
  hasFix: boolean;
  hasEscalation: boolean;
  hasMistake: boolean;
  contacts: string[];
}

export interface SectionMetrics {
  answers: number;
  substantialAnswers: number;
  taskAnswers: number;
  problemAnswers: number;
  toolAnswers: number;
  exampleAnswers: number;
  frequencyAnswers: number;
  triggerAnswers: number;
  checkAnswers: number;
  stepAnswers: number;
  locationAnswers: number;
  ownerAnswers: number;
  signAnswers: number;
  fixAnswers: number;
  escalationAnswers: number;
}

export function getWordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function splitIntoClauses(text: string) {
  return text
    .split(/\.\s+|,\s+|\s+then\s+|\s+after\s+|\s+before\s+|\s+once\s+/i)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 12);
}

export function toSentenceCase(value: string) {
  const trimmed = value.trim().replace(/\.$/, "");

  if (!trimmed) {
    return "";
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function uniqueStrings(values: string[]) {
  const seen = new Set<string>();

  return values.filter((value) => {
    const key = value.toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function getCompletenessStatus(score: number): CompletenessStatus {
  if (score >= 80) {
    return "strong";
  }

  if (score >= 55) {
    return "partial";
  }

  return "needs clarification";
}

export function extractContacts(text: string) {
  const lower = text.toLowerCase();

  return contactLabels
    .filter((label) => label.patterns.some((pattern) => lower.includes(pattern)))
    .map((label) => label.key);
}

export function inferFrequency(text: string) {
  const lower = text.toLowerCase();

  if (/\b(every morning|every day|daily|each day|most days)\b/.test(lower)) {
    return "Daily";
  }

  if (/\b(chaque matin|chaque jour|tous les jours|quotidien)\b/.test(lower)) {
    return "Quotidien";
  }

  if (/\b(every week|weekly|most weeks)\b/.test(lower)) {
    return "Weekly";
  }

  if (/\b(chaque semaine|toutes les semaines|hebdomadaire)\b/.test(lower)) {
    return "Hebdomadaire";
  }

  if (/\b(monthly)\b/.test(lower)) {
    return "Monthly";
  }

  if (/\b(mensuel|chaque mois)\b/.test(lower)) {
    return "Mensuel";
  }

  if (/\b(when|whenever|as needed|as soon as|quand|dès que|au besoin)\b/.test(lower)) {
    return "As needed";
  }

  return "Needs confirmation";
}

export function extractLocation(text: string) {
  const match = text.match(locationPattern);
  return match?.[0] ? toSentenceCase(match[0]) : "Exact location still unclear";
}

export function detectSignals(text: string): SignalTag[] {
  const signals = new Set<SignalTag>();
  const analysis = analyseAnswer(text);

  if (analysis.mentionsTask) {
    signals.add("tasks captured");
  }

  if (analysis.mentionsProblem) {
    signals.add("problems captured");
  }

  if (analysis.mentionsTool) {
    signals.add("tools mentioned");
  }

  if (analysis.mentionsContact) {
    signals.add("contacts mentioned");
  }

  if (analysis.hasExample || analysis.wordCount >= 40) {
    signals.add("examples captured");
  }

  return [...signals];
}

export function analyseAnswer(text: string): AnswerAnalysis {
  const wordCount = getWordCount(text);
  const hasExample =
    examplePattern.test(text) ||
    (/\b(if|when|every morning|every day|last week|this morning|yesterday)\b/i.test(text) &&
      wordCount >= 24);
  const mentionsTask = taskPattern.test(text);

  return {
    wordCount,
    isShort: wordCount < 20,
    isAmbiguous: ambiguityPattern.test(text),
    isAbstract: wordCount < 32 && !hasExample,
    mentionsTask,
    mentionsProblem: problemPattern.test(text),
    mentionsTool: toolPattern.test(text),
    mentionsContact: contactPattern.test(text),
    hasExample,
    hasFrequency: frequencyPattern.test(text),
    hasTrigger: triggerPattern.test(text),
    hasCheck: checkPattern.test(text),
    hasStepCue: stepPattern.test(text) || splitIntoClauses(text).length >= 3,
    hasLocation: locationPattern.test(text),
    hasOwner: ownerPattern.test(text) || contactPattern.test(text),
    hasSigns: signPattern.test(text),
    hasFix: fixPattern.test(text),
    hasEscalation: escalationPattern.test(text) || contactPattern.test(text),
    hasMistake: mistakePattern.test(text),
    contacts: extractContacts(text),
  };
}

export function getSectionMetrics(messages: InterviewMessage[]) {
  return messages.reduce<SectionMetrics>(
    (metrics, message) => {
      const analysis = analyseAnswer(message.content);

      metrics.answers += 1;

      if (analysis.wordCount >= 20) metrics.substantialAnswers += 1;
      if (analysis.mentionsTask) metrics.taskAnswers += 1;
      if (analysis.mentionsProblem) metrics.problemAnswers += 1;
      if (analysis.mentionsTool) metrics.toolAnswers += 1;
      if (analysis.hasExample) metrics.exampleAnswers += 1;
      if (analysis.hasFrequency) metrics.frequencyAnswers += 1;
      if (analysis.hasTrigger) metrics.triggerAnswers += 1;
      if (analysis.hasCheck) metrics.checkAnswers += 1;
      if (analysis.hasStepCue) metrics.stepAnswers += 1;
      if (analysis.hasLocation) metrics.locationAnswers += 1;
      if (analysis.hasOwner) metrics.ownerAnswers += 1;
      if (analysis.hasSigns) metrics.signAnswers += 1;
      if (analysis.hasFix) metrics.fixAnswers += 1;
      if (analysis.hasEscalation) metrics.escalationAnswers += 1;

      return metrics;
    },
    {
      answers: 0,
      substantialAnswers: 0,
      taskAnswers: 0,
      problemAnswers: 0,
      toolAnswers: 0,
      exampleAnswers: 0,
      frequencyAnswers: 0,
      triggerAnswers: 0,
      checkAnswers: 0,
      stepAnswers: 0,
      locationAnswers: 0,
      ownerAnswers: 0,
      signAnswers: 0,
      fixAnswers: 0,
      escalationAnswers: 0,
    },
  );
}
