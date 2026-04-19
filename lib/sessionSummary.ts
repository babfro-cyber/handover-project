import { Language } from "@/lib/i18n";
import { createId } from "@/lib/id";
import {
  analyseAnswer,
  extractContacts,
  extractLocation,
  getCompletenessStatus,
  inferFrequency,
  splitIntoClauses,
  toSentenceCase,
  uniqueStrings,
} from "@/lib/interviewHeuristics";
import {
  InterviewMessage,
  InterviewSectionId,
  InterviewSession,
  IssueSummary,
  OpenQuestion,
  ResponsibilitySummary,
  SessionSummary,
  ToolSummary,
} from "@/lib/types";

interface ThemeDefinition {
  id: string;
  labels: Record<Language, string>;
  keywords: string[];
}

const responsibilityThemes: ThemeDefinition[] = [
  {
    id: "schedule-control",
    labels: {
      fr: "Arbitrer le planning réel de l’atelier",
      en: "Control the real workshop priority order",
    },
    keywords: ["schedule", "planning", "whiteboard", "bench", "queue", "availability", "atelier", "banc", "charge", "replanifie"],
  },
  {
    id: "urgent-intake",
    labels: {
      fr: "Qualifier les urgences avant d’engager l’atelier",
      en: "Qualify urgent breakdowns before committing the workshop",
    },
    keywords: ["urgent", "breakdown", "priority", "customer history", "deadline", "urgence", "panne", "machine down", "immobilisée", "immobilise"],
  },
  {
    id: "job-readiness",
    labels: {
      fr: "Libérer un dossier seulement quand il est exploitable",
      en: "Release a job only when it is ready for a technician",
    },
    keywords: ["job sheet", "paperwork", "failure symptoms", "photos", "history", "fiche", "papier", "historique", "usable", "exploitable"],
  },
  {
    id: "parts-pricing",
    labels: {
      fr: "Bloquer le risque pièces, délai et devis avant promesse",
      en: "Control parts, lead-time, and quote risk before committing",
    },
    keywords: ["supplier", "parts", "pricing", "quote", "stock", "fournisseur", "pièces", "tarif", "devis", "lead-time", "délai", "delay"],
  },
  {
    id: "customer-updates",
    labels: {
      fr: "Tenir la parole client sans promettre trop tôt",
      en: "Keep customer expectations realistic",
    },
    keywords: ["customer", "client", "promise", "finish date", "follow-up", "updated", "call back", "promettre", "rappelle"],
  },
];

const toolThemes: ThemeDefinition[] = [
  {
    id: "hydtrack",
    labels: {
      fr: "Base HydTrack",
      en: "HydTrack service board",
    },
    keywords: ["erp", "hydtrack", "service board"],
  },
  {
    id: "schedule-workbook",
    labels: {
      fr: "Planning Atelier.xlsx",
      en: "Workshop schedule workbook",
    },
    keywords: ["schedule.xlsx", "planning atelier", "daily control", "schedule"],
  },
  {
    id: "supplier-pricing",
    labels: {
      fr: "Tarifs Fournisseurs.xlsx",
      en: "Supplier pricing workbook",
    },
    keywords: ["supplier pricing", "pricing.xlsx", "tarifs fournisseurs", "pricing", "tarif"],
  },
  {
    id: "critical-lead-times",
    labels: {
      fr: "Suivi délais critiques",
      en: "Critical lead-time tracker",
    },
    keywords: ["lead-time", "critical lead-time", "suivi délais", "delais critiques", "délai critique", "client is down", "immobilisé"],
  },
  {
    id: "live-jobs-folder",
    labels: {
      fr: "Dossier Affaires en cours",
      en: "Live jobs folder",
    },
    keywords: ["live jobs", "dossiers en cours", "photos", "handover notes", "shared drive", "réseau partagé"],
  },
  {
    id: "workshop-inbox",
    labels: {
      fr: "Boîte atelier",
      en: "Workshop inbox",
    },
    keywords: ["workshop@", "atelier@", "outlook", "email", "inbox", "boîte"],
  },
];

const issueThemes: ThemeDefinition[] = [
  {
    id: "missing-parts",
    labels: {
      fr: "Pièce critique indisponible ou délai fournisseur qui glisse",
      en: "Missing parts or supplier delay",
    },
    keywords: ["missing parts", "supplier", "stock", "seal kit", "parts", "pièce", "fournisseur", "retard"],
  },
  {
    id: "urgent-breakdown",
    labels: {
      fr: "Urgence annoncée sans cadrage réel",
      en: "Urgency claim with weak real priority",
    },
    keywords: ["urgent", "breakdown", "deadline", "priority", "urgence", "panne", "machine down", "immobilisée", "noise", "bruyante"],
  },
  {
    id: "incomplete-job-sheet",
    labels: {
      fr: "Fiche de travail incomplète",
      en: "Incomplete job sheet or vague paperwork",
    },
    keywords: ["job sheet", "paperwork", "vague", "failure symptoms", "photos", "fiche", "papier"],
  },
  {
    id: "pricing-risk",
    labels: {
      fr: "Prix ou devis impossible à figer avant ouverture",
      en: "Pricing or quote uncertainty",
    },
    keywords: ["pricing", "quote", "costs", "price", "tarif", "devis", "prix"],
  },
];

function extractDecisionLogic(messages: InterviewMessage[]) {
  return uniqueStrings(
    messages
      .flatMap((message) => splitIntoClauses(message.content))
      .filter((clause) =>
        /\b(decide|décide|decide|arbitre|priority|priorité|urgent|urgence|if|when|si|quand|promise|promesse|approval|validation|quote|devis|downtime|immobili)\b/i.test(
          clause,
        ),
      )
      .map((clause) => toSentenceCase(clause)),
  );
}

function extractTribalKnowledge(messages: InterviewMessage[]) {
  return uniqueStrings(
    messages
      .flatMap((message) => splitIntoClauses(message.content))
      .filter((clause) =>
        /\b(junior|ne se voit pas|not written|par habitude|reflex|réflexe|never|jamais|always|toujours|half-ready|à moitié bon|false urgency|fausse urgence)\b/i.test(
          clause,
        ),
      )
      .map((clause) => toSentenceCase(clause)),
  );
}

function localizeContact(language: Language, contact: string) {
  if (language === "fr") {
    const map: Record<string, string> = {
      "Lead technician": "Technicien référent",
      Technicians: "Techniciens",
      Supplier: "Fournisseur",
      Customer: "Client",
      "Service manager": "Responsable service",
      "Workshop inbox": "Boîte atelier",
      Purchasing: "Achats",
      Accounts: "Comptabilité",
      Owner: "Dirigeant",
    };

    return map[contact] ?? contact;
  }

  return contact;
}

function localizeFrequency(language: Language, value: string) {
  if (language === "fr") {
    if (value === "Daily") return "Quotidien";
    if (value === "Weekly") return "Hebdomadaire";
    if (value === "Monthly") return "Mensuel";
    if (value === "As needed") return "Selon le besoin";
    if (value === "Needs confirmation") return "À confirmer";
    return value;
  }

  if (value === "Quotidien") return "Daily";
  if (value === "Hebdomadaire") return "Weekly";
  if (value === "Mensuel") return "Monthly";
  if (value === "Selon le besoin") return "As needed";
  if (value === "À confirmer") return "Needs confirmation";
  return value;
}

function getSummaryText(language: Language) {
  return language === "fr"
    ? {
        missingTrigger: "Déclencheur à préciser.",
        missingSteps: "Les étapes détaillées restent à documenter.",
        missingChecks: "Les contrôles clés restent à documenter.",
        missingDecision: "La logique d’arbitrage reste à expliciter.",
        missingTribal: "Le savoir d’expérience reste à rendre explicite.",
        missingDependencies: "Les dépendances ou interlocuteurs restent à préciser.",
        missingRisks: "Les risques associés devraient être décrits plus clairement.",
        missingMistakes: "Les erreurs fréquentes restent à nommer.",
        missingExample: "Un exemple concret reste à ajouter.",
        missingPurpose: "L’usage précis reste à clarifier.",
        missingWhenUsed: "Le moment d’usage reste à préciser.",
        missingLocation: "L’emplacement exact reste à préciser.",
        missingRiskIfMissing: "Le risque opérationnel reste à préciser.",
        missingPrimaryUsers: "Les utilisateurs principaux restent à préciser.",
        missingBackup: "Le relais ou propriétaire de secours reste à préciser.",
        missingSigns: "Les signes repérables restent à préciser.",
        missingFirstChecks: "Les premiers contrôles restent à préciser.",
        missingFix: "La solution habituelle reste à confirmer.",
        missingShortcut: "Le raccourci utile reste à préciser.",
        missingEscalationCondition: "Le point exact d’escalade reste à préciser.",
        missingEscalation: "Le chemin d’escalade reste à confirmer.",
        gapToolPrompt: (tool: string) =>
          `Préciser dans quel dossier, fichier ou outil se trouve ${tool.toLowerCase()}.`,
        gapToolReason:
          "L’outil est cité, mais l’emplacement exact n’est pas assez clair pour une reprise de poste.",
        gapToolNext:
          "Noter le chemin exact, l’inbox, l’URL ou le module à ouvrir en premier.",
        gapTriggerPrompt: (title: string) =>
          `Préciser ce qui déclenche habituellement « ${title.toLowerCase()} ».`,
        gapTriggerReason:
          "Le travail est décrit, mais pas le signal précis qui le lance.",
        gapTriggerNext:
          "Ajouter l’événement, le signal ou le passage de relais qui démarre l’action.",
        gapChecksPrompt: (title: string) =>
          `Documenter les principaux contrôles pour « ${title.toLowerCase()} ».`,
        gapChecksReason:
          "Sans les contrôles, une personne qui reprend le poste risque d’aller trop vite.",
        gapChecksNext:
          "Lister les 2 ou 3 vérifications faites avant transmission ou clôture.",
        gapIssuePrompt: (issue: string) =>
          `Documenter les 3 premiers contrôles quand ${issue.toLowerCase()} se présente.`,
        gapIssueReason:
          "Le problème est connu, mais la première réaction reste trop vague pour une passation fiable.",
        gapIssueNext:
          "Décrire les premiers contrôles dans l’ordre réel de traitement.",
        gapWrapPrompt: "Ajouter les conseils de prise de poste pour la première semaine.",
        gapWrapReason:
          "Il manque encore les consignes de démarrage qu’un repreneur doit entendre tout de suite.",
        gapWrapNext:
          "Noter les réflexes, priorités et erreurs à éviter dès les premiers jours.",
        defaultRole: "Transmission de poste",
      }
    : {
        missingTrigger: "Trigger still needs to be confirmed.",
        missingSteps: "Detailed steps still need to be documented.",
        missingChecks: "Key checks still need to be documented.",
        missingDecision: "Decision logic still needs to be clarified.",
        missingTribal: "Experience-based know-how still needs to be made explicit.",
        missingDependencies: "Owner dependencies still need to be clarified.",
        missingRisks: "Associated risks still need to be captured more clearly.",
        missingMistakes: "Common mistakes still need to be named.",
        missingExample: "A concrete example still needs to be added.",
        missingPurpose: "Purpose still needs to be clarified.",
        missingWhenUsed: "Typical moment of use still needs to be clarified.",
        missingLocation: "Exact location still needs to be confirmed.",
        missingRiskIfMissing: "Operational risk if missing still needs to be clarified.",
        missingPrimaryUsers: "Primary users still need to be clarified.",
        missingBackup: "Backup owner still needs to be clarified.",
        missingSigns: "Recognisable signs still need to be captured.",
        missingFirstChecks: "First diagnostic checks still need to be captured.",
        missingFix: "Typical fix still needs to be confirmed.",
        missingShortcut: "Useful shortcut still needs to be clarified.",
        missingEscalationCondition: "Exact escalation trigger still needs to be clarified.",
        missingEscalation: "Escalation path still needs to be confirmed.",
        gapToolPrompt: (tool: string) =>
          `Clarify which shared folder, file, or system contains ${tool.toLowerCase()}.`,
        gapToolReason:
          "The tool is mentioned, but the exact place a replacement should open first is still unclear.",
        gapToolNext:
          "Record the exact path, inbox, URL, or module name used to access it.",
        gapTriggerPrompt: (title: string) =>
          `Confirm what usually triggers ${title.toLowerCase()}.`,
        gapTriggerReason:
          "The workflow exists, but the handover still lacks the event that starts it.",
        gapTriggerNext:
          "Add the event, signal, or handoff that starts the work.",
        gapChecksPrompt: (title: string) =>
          `Document the main checks for ${title.toLowerCase()}.`,
        gapChecksReason:
          "A replacement needs the checks, not just the steps, to avoid mistakes.",
        gapChecksNext:
          "List the first 2 or 3 checks done before the work is handed on.",
        gapIssuePrompt: (issue: string) =>
          `Document the first 3 checks when ${issue.toLowerCase()} appears.`,
        gapIssueReason:
          "The issue is known, but the first response is still too vague for a handover pack.",
        gapIssueNext:
          "Write the first checks in the same order the current role holder performs them.",
        gapWrapPrompt: "Capture the day-one advice for a replacement.",
        gapWrapReason: "The handover still needs explicit first-week guidance.",
        gapWrapNext:
          "Record the habits, warnings, and first priorities a new starter should adopt.",
        defaultRole: "Knowledge handover",
      };
}

function getUserMessages(session: InterviewSession) {
  return session.messages.filter((message) => message.role === "user");
}

function messagesForSection(messages: InterviewMessage[], sections: InterviewSectionId[]) {
  return messages.filter((message) => sections.includes(message.sectionId));
}

function messagesMatchingTheme(messages: InterviewMessage[], theme: ThemeDefinition) {
  return messages.filter((message) =>
    theme.keywords.some((keyword) =>
      message.content.toLowerCase().includes(keyword.toLowerCase()),
    ),
  );
}

function firstMatchingClause(messages: InterviewMessage[], keywords: string[]) {
  for (const message of messages) {
    const clause = splitIntoClauses(message.content).find((segment) =>
      keywords.some((keyword) => segment.toLowerCase().includes(keyword.toLowerCase())),
    );

    if (clause) {
      return toSentenceCase(clause);
    }
  }

  return null;
}

function extractMistakes(messages: InterviewMessage[]) {
  return uniqueStrings(
    messages
      .flatMap((message) => splitIntoClauses(message.content))
      .filter((clause) => /\b(mistake|assum|miss|erreur|suppos)\b/i.test(clause))
      .map((clause) => toSentenceCase(clause)),
  );
}

function buildResponsibilitySummary(session: InterviewSession) {
  const language = session.language;
  const copy = getSummaryText(language);
  const messages = messagesForSection(getUserMessages(session), [
    "role-overview",
    "recurring-responsibilities",
    "step-by-step-tasks",
    "wrap-up",
  ]);

  return responsibilityThemes
    .map((theme) => {
      const matches = messagesMatchingTheme(messages, theme);

      if (matches.length === 0) {
        return null;
      }

      const frequencies = uniqueStrings(matches.map((message) => localizeFrequency(language, inferFrequency(message.content))));
      const trigger =
        firstMatchingClause(matches, [
          "if",
          "when",
          "whenever",
          "urgent",
          "supplier",
          "si",
          "quand",
          "dès que",
          "fournisseur",
        ]) ?? copy.missingTrigger;
      const steps = uniqueStrings(
        matches
          .flatMap((message) => splitIntoClauses(message.content))
          .filter((clause) => clause.length > 22)
          .slice(0, 4)
          .map((clause) => toSentenceCase(clause)),
      );
      const checks = uniqueStrings(
        matches
          .flatMap((message) => splitIntoClauses(message.content))
          .filter((clause) => /\b(check|confirm|review|verify|make sure|contrôle|controle|vérif|verif)\b/i.test(clause))
          .slice(0, 3)
          .map((clause) => toSentenceCase(clause)),
      );
      const decisionLogic = extractDecisionLogic(matches).slice(0, 3);
      const tribalKnowledge = extractTribalKnowledge([
        ...matches,
        ...messagesForSection(getUserMessages(session), ["problem-solving", "wrap-up"]),
      ]).slice(0, 2);
      const dependencies = uniqueStrings(
        matches.flatMap((message) =>
          extractContacts(message.content).map((contact) => localizeContact(language, contact)),
        ),
      );
      const risks = uniqueStrings(
        messagesForSection(getUserMessages(session), ["problem-solving"])
          .flatMap((message) => splitIntoClauses(message.content))
          .filter((clause) =>
            theme.keywords.some((keyword) =>
              clause.toLowerCase().includes(keyword.toLowerCase()),
            ),
          )
          .slice(0, 3)
          .map((clause) => toSentenceCase(clause)),
      );
      const commonMistakes = extractMistakes([
        ...matches,
        ...messagesForSection(getUserMessages(session), ["problem-solving"]),
      ]).slice(0, 2);
      const example =
        matches.find((message) => analyseAnswer(message.content).hasExample)?.content ??
        matches[0]?.content ??
        copy.missingExample;

      const score =
        (steps.length >= 3 ? 30 : steps.length * 10) +
        (checks.length >= 1 ? 20 : 0) +
        (trigger !== copy.missingTrigger ? 20 : 0) +
        (dependencies.length >= 1 ? 10 : 0) +
        (decisionLogic.length >= 1 ? 10 : 0) +
        (tribalKnowledge.length >= 1 ? 5 : 0) +
        (commonMistakes.length >= 1 ? 5 : 0);

      return {
        id: theme.id,
        title: theme.labels[language],
        frequency: frequencies[0] ?? localizeFrequency(language, "Needs confirmation"),
        trigger,
        steps: steps.length > 0 ? steps : [copy.missingSteps],
        checks: checks.length > 0 ? checks : [copy.missingChecks],
        decisionLogic:
          decisionLogic.length > 0 ? decisionLogic : [copy.missingDecision],
        tribalKnowledge:
          tribalKnowledge.length > 0 ? tribalKnowledge : [copy.missingTribal],
        ownerDependencies: dependencies.length > 0 ? dependencies : [copy.missingDependencies],
        risks: risks.length > 0 ? risks : [copy.missingRisks],
        commonMistakes:
          commonMistakes.length > 0 ? commonMistakes : [copy.missingMistakes],
        example,
        status: getCompletenessStatus(score),
      } satisfies ResponsibilitySummary;
    })
    .filter((item): item is ResponsibilitySummary => Boolean(item));
}

function buildToolSummary(session: InterviewSession) {
  const language = session.language;
  const copy = getSummaryText(language);
  const messages = messagesForSection(getUserMessages(session), ["tools-files"]);

  return toolThemes
    .map((theme) => {
      const matches = messagesMatchingTheme(messages, theme);

      if (matches.length === 0) {
        return null;
      }

      const purpose =
        firstMatchingClause(matches, [
          "for",
          "track",
          "status",
          "pricing",
          "notes",
          "email",
          "pour",
          "suivi",
          "tarif",
          "notes",
          "mail",
        ]) ?? copy.missingPurpose;
      const whenUsed =
        firstMatchingClause(matches, [
          "every morning",
          "when",
          "urgent",
          "immobil",
          "before we promise",
          "chaque matin",
          "quand",
          "urgence",
          "avant de promettre",
        ]) ?? copy.missingWhenUsed;
      const locatedMessage = matches.find(
        (message) => extractLocation(message.content) !== "Exact location still unclear",
      );
      const whereItLives = locatedMessage
        ? extractLocation(locatedMessage.content)
        : copy.missingLocation;
      const riskIfMissing =
        firstMatchingClause(matches, [
          "without",
          "promise too fast",
          "wrong jobs",
          "strip down",
          "risk",
          "sans",
          "promet trop vite",
          "mauvaise priorité",
          "démonte",
          "risque",
        ]) ?? copy.missingRiskIfMissing;
      const primaryUsers = uniqueStrings(
        matches.flatMap((message) =>
          extractContacts(message.content).map((contact) => localizeContact(language, contact)),
        ),
      );
      const backupContact = primaryUsers[0] ?? copy.missingBackup;
      const score =
        (purpose !== copy.missingPurpose ? 35 : 0) +
        (whenUsed !== copy.missingWhenUsed ? 15 : 0) +
        (whereItLives !== copy.missingLocation ? 30 : 0) +
        (riskIfMissing !== copy.missingRiskIfMissing ? 10 : 0) +
        (primaryUsers.length > 0 ? 10 : 0);

      return {
        id: theme.id,
        name: theme.labels[language],
        purpose,
        whenUsed,
        whereItLives,
        riskIfMissing,
        primaryUsers: primaryUsers.length > 0 ? primaryUsers : [copy.missingPrimaryUsers],
        backupContact,
        status: getCompletenessStatus(score),
      } satisfies ToolSummary;
    })
    .filter((item): item is ToolSummary => Boolean(item));
}

function buildIssueSummary(session: InterviewSession) {
  const language = session.language;
  const copy = getSummaryText(language);
  const messages = messagesForSection(getUserMessages(session), ["problem-solving"]);

  return issueThemes
    .map((theme) => {
      const matches = messagesMatchingTheme(messages, theme);

      if (matches.length === 0) {
        return null;
      }

      const signs = uniqueStrings(
        matches
          .flatMap((message) => splitIntoClauses(message.content))
          .filter((clause) => /\b(sign|warning|vague|missing|does not match|tighter|red flag|signe|alerte|ne colle pas)\b/i.test(clause))
          .slice(0, 3)
          .map((clause) => toSentenceCase(clause)),
      );
      const firstChecks = uniqueStrings(
        matches
          .flatMap((message) => splitIntoClauses(message.content))
          .filter((clause) => /\b(check|confirm|review|talk to|vérif|verif|parler|contrôle|controle)\b/i.test(clause))
          .slice(0, 3)
          .map((clause) => toSentenceCase(clause)),
      );
      const typicalFix =
        firstMatchingClause(matches, [
          "update",
          "clean",
          "confirm",
          "flag",
          "rebook",
          "corriger",
          "nettoyer",
          "confirmer",
          "remonter",
        ]) ?? copy.missingFix;
      const practicalShortcut =
        firstMatchingClause(matches, [
          "shortcut",
          "call the supplier straight away",
          "call the supplier right away",
          "raccourci",
          "appeler le fournisseur tout de suite",
          "tout de suite",
        ]) ?? copy.missingShortcut;
      const commonMistakes = extractMistakes(matches).slice(0, 2);
      const escalationCondition =
        firstMatchingClause(matches, [
          "before we promise",
          "before committing",
          "if parts or price risk",
          "si le risque",
          "avant d’annoncer",
          "avant de m’engager",
          "avant de promettre",
        ]) ?? copy.missingEscalationCondition;
      const escalationPath =
        firstMatchingClause(matches, [
          "escalate",
          "owner",
          "purchasing",
          "supplier",
          "customer",
          "escalade",
          "dirigeant",
          "achats",
          "fournisseur",
          "client",
        ]) ?? copy.missingEscalation;
      const score =
        (signs.length > 0 ? 25 : 0) +
        (firstChecks.length > 0 ? 30 : 0) +
        (typicalFix !== copy.missingFix ? 20 : 0) +
        (practicalShortcut !== copy.missingShortcut ? 10 : 0) +
        (commonMistakes.length > 0 ? 5 : 0) +
        (escalationCondition !== copy.missingEscalationCondition ? 5 : 0) +
        (escalationPath !== copy.missingEscalation ? 5 : 0);

      return {
        id: theme.id,
        issue: theme.labels[language],
        signs: signs.length > 0 ? signs : [copy.missingSigns],
        firstChecks: firstChecks.length > 0 ? firstChecks : [copy.missingFirstChecks],
        typicalFix,
        practicalShortcut,
        commonMistakes:
          commonMistakes.length > 0 ? commonMistakes : [copy.missingMistakes],
        escalationCondition,
        escalationPath,
        status: getCompletenessStatus(score),
      } satisfies IssueSummary;
    })
    .filter((item): item is IssueSummary => Boolean(item));
}

function buildOpenQuestions(
  session: InterviewSession,
  responsibilities: ResponsibilitySummary[],
  tools: ToolSummary[],
  issues: IssueSummary[],
) {
  const language = session.language;
  const copy = getSummaryText(language);
  const questions: OpenQuestion[] = [];

  for (const tool of tools) {
    if (tool.whereItLives === copy.missingLocation) {
      questions.push({
        id: createId(),
        prompt: copy.gapToolPrompt(tool.name),
        reason: copy.gapToolReason,
        relatedSectionId: "tools-files",
        status: "open",
        nextStep: copy.gapToolNext,
      });
    }
  }

  for (const responsibility of responsibilities) {
    if (responsibility.trigger === copy.missingTrigger) {
      questions.push({
        id: createId(),
        prompt: copy.gapTriggerPrompt(responsibility.title),
        reason: copy.gapTriggerReason,
        relatedSectionId: "step-by-step-tasks",
        status: "open",
        nextStep: copy.gapTriggerNext,
      });
    }

    if (responsibility.checks[0] === copy.missingChecks) {
      questions.push({
        id: createId(),
        prompt: copy.gapChecksPrompt(responsibility.title),
        reason: copy.gapChecksReason,
        relatedSectionId: "step-by-step-tasks",
        status: "open",
        nextStep: copy.gapChecksNext,
      });
    }

    if (
      responsibility.id === "parts-pricing" &&
      !responsibility.decisionLogic.some((item) =>
        /\b(approval|validation|dirigeant|owner|promettre|promise)\b/i.test(item),
      )
    ) {
      questions.push({
        id: createId(),
        prompt:
          language === "fr"
            ? "Préciser à partir de quel niveau d’incertitude prix ou délai il faut stopper et demander validation dirigeant."
            : "Clarify when price or lead-time uncertainty is high enough that the owner must approve before anything is promised.",
        reason:
          language === "fr"
            ? "Le risque devis est mentionné, mais la limite exacte d’engagement reste implicite."
            : "Quote risk is mentioned, but the exact point where commitment must stop is still implicit.",
        relatedSectionId: "step-by-step-tasks",
        status: "open",
        nextStep:
          language === "fr"
            ? "Noter le cas typique où l’atelier stoppe la promesse et demande arbitrage."
            : "Record the typical case where the workshop stops and asks for approval.",
      });
    }
  }

  for (const issue of issues) {
    if (issue.firstChecks[0] === copy.missingFirstChecks) {
      questions.push({
        id: createId(),
        prompt: copy.gapIssuePrompt(issue.issue),
        reason: copy.gapIssueReason,
        relatedSectionId: "problem-solving",
        status: "open",
        nextStep: copy.gapIssueNext,
      });
    }
  }

  const wrapUpMessages = messagesForSection(getUserMessages(session), ["wrap-up"]);
  if (wrapUpMessages.length === 0) {
    questions.push({
      id: createId(),
      prompt: copy.gapWrapPrompt,
      reason: copy.gapWrapReason,
      relatedSectionId: "wrap-up",
      status: "open",
      nextStep: copy.gapWrapNext,
    });
  }

  if (
    responsibilities.some((responsibility) => responsibility.id === "urgent-intake") &&
    !responsibilities
      .filter((responsibility) => responsibility.id === "urgent-intake")
      .some((responsibility) =>
        responsibility.decisionLogic.some((item) =>
          /\b(machine down|immobil|false urgency|fausse urgence|downtime|bruit)\b/i.test(item),
        ),
      )
  ) {
    questions.push({
      id: createId(),
      prompt:
        language === "fr"
          ? "Formaliser les critères qui font passer une urgence devant le planning déjà engagé."
          : "Formalise the criteria that move an urgent job ahead of work already committed in the plan.",
      reason:
        language === "fr"
          ? "Le poste repose sur un arbitrage d’urgence réel contre bruit commercial."
          : "The role depends on separating real urgency from noise.",
      relatedSectionId: "recurring-responsibilities",
      status: "open",
      nextStep:
        language === "fr"
          ? "Lister 2 ou 3 critères simples : arrêt client réel, fenêtre atelier réaliste, pièces ou technicien disponibles."
          : "List 2 or 3 simple criteria such as real customer downtime, a realistic workshop slot, and available parts or technician time.",
    });
  }

  const deduped = new Map<string, OpenQuestion>();

  for (const question of questions) {
    const key = question.prompt.toLowerCase();
    if (!deduped.has(key)) {
      deduped.set(key, question);
    }
  }

  return [...deduped.values()];
}

export function buildSessionSummary(session: InterviewSession): SessionSummary {
  const responsibilities = buildResponsibilitySummary(session);
  const tools = buildToolSummary(session);
  const issues = buildIssueSummary(session);
  const gaps = buildOpenQuestions(session, responsibilities, tools, issues);
  const keyContacts = uniqueStrings(
    getUserMessages(session).flatMap((message) =>
      extractContacts(message.content).map((contact) => localizeContact(session.language, contact)),
    ),
  );
  const roleSource =
    getUserMessages(session).find((message) => message.sectionId === "role-overview")?.content ??
    session.roleTitle;
  const defaultRole = getSummaryText(session.language).defaultRole;
  const mainRole =
    session.roleTitle !== (session.language === "fr" ? "Session de passation" : "Untitled handover session")
      ? session.roleTitle
      : toSentenceCase(roleSource.split(".")[0] ?? defaultRole);

  const overallScore =
    responsibilities.reduce(
      (sum, responsibility) =>
        sum +
        (responsibility.status === "strong"
          ? 25
          : responsibility.status === "partial"
            ? 15
            : 6),
      0,
    ) +
    tools.reduce(
      (sum, tool) =>
        sum + (tool.status === "strong" ? 12 : tool.status === "partial" ? 7 : 3),
      0,
    ) +
    issues.reduce(
      (sum, issue) =>
        sum + (issue.status === "strong" ? 15 : issue.status === "partial" ? 8 : 3),
      0,
    ) -
    gaps.length * 5;

  return {
    id: createId(),
    sessionId: session.id,
    mainRole,
    detectedResponsibilities: responsibilities,
    detectedTools: tools,
    detectedIssues: issues,
    detectedGaps: gaps,
    keyContacts,
    overallStatus: getCompletenessStatus(Math.max(0, Math.min(overallScore, 100))),
  };
}
