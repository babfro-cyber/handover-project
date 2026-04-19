import { DEFAULT_LANGUAGE, Language } from "@/lib/i18n";
import { getCompletenessStatus } from "@/lib/interviewHeuristics";
import { buildSessionSummary } from "@/lib/sessionSummary";
import {
  DocumentField,
  DocumentItem,
  DocumentSection,
  GeneratedDocument,
  InterviewSession,
  OpenQuestion,
  ResponsibilitySummary,
  SessionSummary,
  ToolSummary,
} from "@/lib/types";

function getDocumentCopy(language: Language) {
  return language === "fr"
    ? {
        title: "Documentation de passation",
        fallbackSubtitle: "Dossier de transmission",
        notes: "Source de synthèse",
        roleOverview: {
          title: "Vue d’ensemble du poste",
          summary:
            "Ce poste tient surtout sur la qualification des urgences, la protection du planning atelier et la maîtrise du risque pièces/devis avant toute promesse client.",
          fields: {
            frequency: "Fréquence",
            decisionLogic: "Logique d’arbitrage",
            ownerDependencies: "Avec qui ça se joue",
            risks: "Si on se trompe",
            commonMistakes: "Ce qu’un junior rate",
            tribalKnowledge: "Ce qui vient de l’expérience",
          },
          metadata: "Déduit des réponses sur le rôle, les arbitrages et les routines",
        },
        procedures: {
          title: "Modes opératoires",
          summary:
            "Ces séquences montrent comment le responsable atelier engage le travail sans envoyer un dossier faible sur les bancs.",
          fields: {
            trigger: "Déclencheur",
            decisionPoints: "Point de décision",
            checks: "Contrôles",
            ownerDependencies: "Dépendances",
            escalation: "Quand stopper et faire valider",
          },
          metadata: "Déduit des réponses sur les urgences, la préparation dossier et les arbitrages",
          missingSteps: "Les étapes détaillées restent à documenter.",
        },
        troubleshooting: {
          title: "Gestion des incidents",
          summary:
            "À utiliser comme playbook quand une fiche est faible, qu’une pièce glisse ou qu’un client pousse trop tôt pour une réponse ferme.",
          fields: {
            signs: "Signes",
            firstChecks: "Premiers contrôles",
            typicalFix: "Solution habituelle",
            practicalShortcut: "Raccourci utile",
            commonMistakes: "Erreur fréquente",
            escalationCondition: "Quand arrêter",
            escalationPath: "Escalade",
          },
          metadata: "Déduit des réponses sur les écarts, signaux faibles et escalades",
        },
        tools: {
          title: "Outils, dossiers et contacts",
          summary:
            "Ce sont les supports qu’il faut ouvrir au bon moment pour piloter la charge atelier, fiabiliser les promesses client et sécuriser les pièces.",
          fields: {
            purpose: "À quoi ça sert",
            whenUsed: "Quand l’ouvrir",
            whereItLives: "Emplacement",
            riskIfMissing: "Risque si absent",
            primaryUsers: "Utilisateurs clés",
            keyContact: "Contact clé",
          },
          metadata: "Déduit des réponses sur les outils, les fichiers et leurs usages réels",
        },
        openQuestions: {
          title: "Points à clarifier",
          summary:
            "Ce sont les zones encore assez sensibles pour qu’un repreneur puisse se tromper s’il n’a pas de réponse claire.",
          fields: {
            nextStep: "Prochaine action recommandée",
            relatedSection: "Section liée",
          },
          metadata: "Clarification utile avant une passation complète",
        },
      }
    : {
        title: "Knowledge documentation",
        fallbackSubtitle: "Knowledge handover pack",
        notes: "Summary source",
        roleOverview: {
          title: "Role overview",
          summary:
            "This role depends on qualifying urgent work correctly, protecting the live workshop plan, and controlling parts or quote risk before anything is promised.",
          fields: {
            frequency: "Frequency",
            decisionLogic: "Decision logic",
            ownerDependencies: "Who this depends on",
            risks: "What goes wrong if missed",
            commonMistakes: "What a junior may miss",
            tribalKnowledge: "Experience-based know-how",
          },
          metadata: "Derived from the role, judgement calls, and daily control of the workshop",
        },
        procedures: {
          title: "Procedures",
          summary:
            "These sequences show how the workshop manager commits work without sending weak jobs onto the benches.",
          fields: {
            trigger: "Trigger",
            decisionPoints: "Decision checkpoint",
            checks: "Checks",
            ownerDependencies: "Dependencies",
            escalation: "When to stop and get approval",
          },
          metadata: "Derived from urgent intake, job readiness, and commitment decisions",
          missingSteps: "Detailed steps still need to be documented.",
        },
        troubleshooting: {
          title: "Troubleshooting",
          summary:
            "Use this as the playbook when paperwork is weak, parts move, or a customer is pushing for an answer too early.",
          fields: {
            signs: "Signs",
            firstChecks: "First checks",
            typicalFix: "Typical fix",
            practicalShortcut: "Useful shortcut",
            commonMistakes: "Common mistake",
            escalationCondition: "When to stop",
            escalationPath: "Escalation path",
          },
          metadata: "Derived from problem-solving, warning signs, and escalation answers",
        },
        tools: {
          title: "Tools and files",
          summary:
            "These are the operational supports that keep the workshop plan believable and customer promises grounded.",
          fields: {
            purpose: "Purpose",
            whenUsed: "When it is used",
            whereItLives: "Where it lives",
            riskIfMissing: "Risk if missing",
            primaryUsers: "Primary users",
            keyContact: "Key contact",
          },
          metadata: "Derived from tools, files, and their real workshop use",
        },
        openQuestions: {
          title: "Open questions",
          summary:
            "These are the remaining gaps that could still trip up a replacement in live workshop conditions.",
          fields: {
            nextStep: "Recommended next step",
            relatedSection: "Related section",
          },
          metadata: "Actionable clarification needed before handover is complete",
        },
      };
}

function formatFields(fields: DocumentField[]) {
  return fields.map((field) => `${field.label}: ${field.value}`).join("\n");
}

function formatSectionText(section: Pick<DocumentSection, "summary" | "items">, notesLabel: string) {
  const lines = [section.summary, ""];

  for (const item of section.items) {
    lines.push(item.title);
    lines.push(item.body);

    if (item.fields.length > 0) {
      lines.push(formatFields(item.fields));
    }

    if (item.metadata.length > 0) {
      lines.push(`${notesLabel}: ${item.metadata.join(" | ")}`);
    }

    lines.push("");
  }

  return lines.join("\n").trim();
}

function buildRoleNarrative(responsibility: ResponsibilitySummary, language: Language) {
  if (language === "fr") {
    return `${responsibility.title}. Le point qui demande le plus de jugement est le suivant : ${responsibility.decisionLogic[0].toLowerCase()}`;
  }

  return `${responsibility.title}. The judgement-heavy part is this: ${responsibility.decisionLogic[0].toLowerCase()}`;
}

function buildProcedureNarrative(responsibility: ResponsibilitySummary, language: Language) {
  if (language === "fr") {
    return `À lancer ${responsibility.trigger.toLowerCase()} Le risque principal si on va trop vite est le suivant : ${responsibility.risks[0].toLowerCase()}`;
  }

  return `This starts ${responsibility.trigger.toLowerCase()} The main risk if it is rushed is: ${responsibility.risks[0].toLowerCase()}`;
}

function buildIssueNarrative(issue: SessionSummary["detectedIssues"][number], language: Language) {
  if (language === "fr") {
    return `Ne pas laisser partir le dossier plus loin dès que ${issue.signs[0].toLowerCase()}`;
  }

  return `Do not let the job go any further once ${issue.signs[0].toLowerCase()}`;
}

function buildToolNarrative(tool: ToolSummary, language: Language) {
  if (language === "fr") {
    return `${tool.purpose} À ouvrir surtout ${tool.whenUsed.toLowerCase()}`;
  }

  return `${tool.purpose} Open it especially ${tool.whenUsed.toLowerCase()}`;
}

function buildRoleOverviewSection(summary: SessionSummary, language: Language): DocumentSection {
  const copy = getDocumentCopy(language).roleOverview;
  const items: DocumentItem[] = summary.detectedResponsibilities.map((responsibility) => ({
    id: responsibility.id,
    title: responsibility.title,
    body: buildRoleNarrative(responsibility, language),
    fields: [
      { label: copy.fields.frequency, value: responsibility.frequency },
      {
        label: copy.fields.decisionLogic,
        value: responsibility.decisionLogic.join("; "),
      },
      {
        label: copy.fields.ownerDependencies,
        value: responsibility.ownerDependencies.join(", "),
      },
      { label: copy.fields.risks, value: responsibility.risks.join("; ") },
      {
        label: copy.fields.commonMistakes,
        value: responsibility.commonMistakes.join("; "),
      },
      {
        label: copy.fields.tribalKnowledge,
        value: responsibility.tribalKnowledge.join("; "),
      },
    ],
    metadata: [copy.metadata],
    status: responsibility.status,
  }));

  const confidenceScore = Math.min(100, items.length * 22 + 10);

  return {
    id: "role-overview",
    title: copy.title,
    summary: copy.summary,
    items,
    editableText: formatSectionText({ summary: copy.summary, items }, getDocumentCopy(language).notes),
    status: getCompletenessStatus(confidenceScore),
    confidenceScore,
  };
}

function buildProcedureItem(responsibility: ResponsibilitySummary, language: Language): DocumentItem {
  const copy = getDocumentCopy(language).procedures;

  return {
    id: `procedure-${responsibility.id}`,
    title: responsibility.title,
    body: `${buildProcedureNarrative(responsibility, language)}\n\n${responsibility.steps
      .map((step, index) => `${index + 1}. ${step}`)
      .join("\n")}`,
    fields: [
      { label: copy.fields.trigger, value: responsibility.trigger },
      {
        label: copy.fields.decisionPoints,
        value: responsibility.decisionLogic.join("; "),
      },
      { label: copy.fields.checks, value: responsibility.checks.join("; ") },
      {
        label: copy.fields.ownerDependencies,
        value: responsibility.ownerDependencies.join(", "),
      },
      {
        label: copy.fields.escalation,
        value: responsibility.risks.join("; "),
      },
    ],
    metadata: [copy.metadata],
    status: responsibility.status,
  };
}

function buildProceduresSection(summary: SessionSummary, language: Language): DocumentSection {
  const copy = getDocumentCopy(language).procedures;
  const responsibilities = summary.detectedResponsibilities.filter(
    (responsibility) => responsibility.steps[0] !== copy.missingSteps,
  );
  const items = responsibilities.map((responsibility) =>
    buildProcedureItem(responsibility, language),
  );
  const confidenceScore = Math.min(
    100,
    responsibilities.reduce(
      (sum, responsibility) =>
        sum + (responsibility.status === "strong" ? 30 : responsibility.status === "partial" ? 18 : 8),
      0,
    ),
  );

  return {
    id: "procedures",
    title: copy.title,
    summary: copy.summary,
    items,
    editableText: formatSectionText({ summary: copy.summary, items }, getDocumentCopy(language).notes),
    status: getCompletenessStatus(confidenceScore),
    confidenceScore,
  };
}

function buildTroubleshootingSection(summary: SessionSummary, language: Language): DocumentSection {
  const copy = getDocumentCopy(language).troubleshooting;
  const items: DocumentItem[] = summary.detectedIssues.map((issue) => ({
    id: issue.id,
    title: issue.issue,
    body: buildIssueNarrative(issue, language),
    fields: [
      { label: copy.fields.signs, value: issue.signs.join("; ") },
      { label: copy.fields.firstChecks, value: issue.firstChecks.join("; ") },
      { label: copy.fields.typicalFix, value: issue.typicalFix },
      { label: copy.fields.practicalShortcut, value: issue.practicalShortcut },
      {
        label: copy.fields.commonMistakes,
        value: issue.commonMistakes.join("; "),
      },
      {
        label: copy.fields.escalationCondition,
        value: issue.escalationCondition,
      },
      { label: copy.fields.escalationPath, value: issue.escalationPath },
    ],
    metadata: [copy.metadata],
    status: issue.status,
  }));
  const confidenceScore = Math.min(
    100,
    summary.detectedIssues.reduce(
      (sum, issue) =>
        sum + (issue.status === "strong" ? 28 : issue.status === "partial" ? 17 : 7),
      0,
    ),
  );

  return {
    id: "troubleshooting",
    title: copy.title,
    summary: copy.summary,
    items,
    editableText: formatSectionText({ summary: copy.summary, items }, getDocumentCopy(language).notes),
    status: getCompletenessStatus(confidenceScore),
    confidenceScore,
  };
}

function buildToolItem(tool: ToolSummary, language: Language): DocumentItem {
  const copy = getDocumentCopy(language).tools;

  return {
    id: tool.id,
    title: tool.name,
    body: buildToolNarrative(tool, language),
    fields: [
      { label: copy.fields.purpose, value: tool.purpose },
      { label: copy.fields.whenUsed, value: tool.whenUsed },
      { label: copy.fields.whereItLives, value: tool.whereItLives },
      { label: copy.fields.riskIfMissing, value: tool.riskIfMissing },
      { label: copy.fields.primaryUsers, value: tool.primaryUsers.join(", ") },
      { label: copy.fields.keyContact, value: tool.backupContact },
    ],
    metadata: [copy.metadata],
    status: tool.status,
  };
}

function buildToolsSection(summary: SessionSummary, language: Language): DocumentSection {
  const copy = getDocumentCopy(language).tools;
  const items = summary.detectedTools.map((tool) => buildToolItem(tool, language));
  const confidenceScore = Math.min(
    100,
    summary.detectedTools.reduce(
      (sum, tool) =>
        sum + (tool.status === "strong" ? 18 : tool.status === "partial" ? 10 : 4),
      0,
    ),
  );

  return {
    id: "tools-files",
    title: copy.title,
    summary: copy.summary,
    items,
    editableText: formatSectionText({ summary: copy.summary, items }, getDocumentCopy(language).notes),
    status: getCompletenessStatus(confidenceScore),
    confidenceScore,
  };
}

function buildOpenQuestionsSection(
  openQuestions: OpenQuestion[],
  language: Language,
): DocumentSection {
  const copy = getDocumentCopy(language).openQuestions;
  const items: DocumentItem[] = openQuestions.map((question) => ({
    id: question.id,
    title: question.prompt,
    body: question.reason,
    fields: [
      { label: copy.fields.nextStep, value: question.nextStep },
      { label: copy.fields.relatedSection, value: question.relatedSectionId.replace(/-/g, " ") },
    ],
    metadata: [copy.metadata],
    status: "needs clarification",
  }));

  const confidenceScore =
    openQuestions.length === 0 ? 100 : Math.max(25, 100 - openQuestions.length * 18);

  return {
    id: "open-questions",
    title: copy.title,
    summary: copy.summary,
    items,
    editableText: formatSectionText({ summary: copy.summary, items }, getDocumentCopy(language).notes),
    status: openQuestions.length === 0 ? "strong" : getCompletenessStatus(confidenceScore),
    confidenceScore,
  };
}

export function generateDocument(
  session: InterviewSession,
  language: Language = session.language ?? DEFAULT_LANGUAGE,
): GeneratedDocument {
  const localizedSession = session.language === language ? session : { ...session, language };
  const sessionSummary = buildSessionSummary(localizedSession);
  const roleOverview = buildRoleOverviewSection(sessionSummary, language);
  const procedures = buildProceduresSection(sessionSummary, language);
  const troubleshooting = buildTroubleshootingSection(sessionSummary, language);
  const toolsAndFiles = buildToolsSection(sessionSummary, language);
  const openQuestions = sessionSummary.detectedGaps;
  const openQuestionsSection = buildOpenQuestionsSection(openQuestions, language);
  const timestamp = new Date().toISOString();
  const copy = getDocumentCopy(language);

  return {
    id: crypto.randomUUID(),
    sessionId: session.id,
    language,
    title: copy.title,
    subtitle: sessionSummary.mainRole || session.roleTitle || copy.fallbackSubtitle,
    sessionSummary,
    sections: [
      roleOverview,
      procedures,
      troubleshooting,
      toolsAndFiles,
      openQuestionsSection,
    ],
    openQuestions,
    generatedAt: timestamp,
    updatedAt: timestamp,
  };
}
