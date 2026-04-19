import { DEFAULT_LANGUAGE, Language } from "@/lib/i18n";
import { createId } from "@/lib/id";
import {
  detectSignals,
  analyseAnswer,
  getSectionMetrics,
  getWordCount,
} from "@/lib/interviewHeuristics";
import {
  getInterviewHintsForLanguage,
  getOpeningPrompt,
  getSampleMessages,
  getSectionOpeners,
  getSectionOrder,
  getWrapUpClosingPrompt,
} from "@/lib/mockData";
import {
  InterviewMessage,
  InterviewSection,
  InterviewSectionId,
  InterviewSession,
  SignalTag,
} from "@/lib/types";

function createMessage(
  role: InterviewMessage["role"],
  content: string,
  sectionId: InterviewSectionId,
  createdAt: string,
  detectedSignals: SignalTag[] = [],
): InterviewMessage {
  return {
    id: createId(),
    role,
    content,
    createdAt,
    sectionId,
    detectedSignals,
  };
}

function getDefaultRoleTitle(language: Language) {
  return language === "fr" ? "Session de passation" : "Untitled handover session";
}

function getDefaultParticipantLabel(language: Language) {
  return language === "fr" ? "Responsable atelier" : "Workshop lead";
}

function getUserMessagesForSection(
  messages: InterviewMessage[],
  sectionId: InterviewSectionId,
) {
  return messages.filter(
    (message) => message.role === "user" && message.sectionId === sectionId,
  );
}

function hasCompletedSection(messages: InterviewMessage[], sectionId: InterviewSectionId) {
  const metrics = getSectionMetrics(getUserMessagesForSection(messages, sectionId));

  switch (sectionId) {
    case "role-overview":
      return (
        metrics.answers >= 1 &&
        metrics.substantialAnswers >= 1 &&
        metrics.exampleAnswers >= 1
      );
    case "recurring-responsibilities":
      return (
        metrics.answers >= 2 &&
        metrics.taskAnswers >= 1 &&
        metrics.frequencyAnswers >= 1 &&
        metrics.checkAnswers >= 1
      );
    case "step-by-step-tasks":
      return (
        metrics.answers >= 1 &&
        metrics.triggerAnswers >= 1 &&
        metrics.stepAnswers >= 1 &&
        metrics.checkAnswers >= 1
      );
    case "problem-solving":
      return (
        metrics.answers >= 2 &&
        metrics.problemAnswers >= 1 &&
        (metrics.signAnswers >= 1 || metrics.substantialAnswers >= 2) &&
        metrics.checkAnswers >= 1 &&
        (metrics.fixAnswers >= 1 || metrics.escalationAnswers >= 1)
      );
    case "tools-files":
      return (
        metrics.answers >= 2 &&
        metrics.toolAnswers >= 1 &&
        metrics.locationAnswers >= 1 &&
        metrics.ownerAnswers >= 1
      );
    case "wrap-up":
      return metrics.answers >= 1 && metrics.substantialAnswers >= 1;
    default:
      return false;
  }
}

function getProgressForSection(messages: InterviewMessage[], sectionId: InterviewSectionId) {
  const metrics = getSectionMetrics(getUserMessagesForSection(messages, sectionId));

  switch (sectionId) {
    case "role-overview":
      return Math.min(metrics.substantialAnswers * 60 + metrics.exampleAnswers * 40, 100);
    case "recurring-responsibilities":
      return Math.min(
        metrics.answers * 20 +
          metrics.taskAnswers * 20 +
          metrics.frequencyAnswers * 20 +
          metrics.checkAnswers * 20 +
          metrics.ownerAnswers * 10 +
          metrics.exampleAnswers * 10,
        100,
      );
    case "step-by-step-tasks":
      return Math.min(
        metrics.triggerAnswers * 25 +
          metrics.stepAnswers * 35 +
          metrics.checkAnswers * 20 +
          metrics.exampleAnswers * 20,
        100,
      );
    case "problem-solving":
      return Math.min(
        metrics.problemAnswers * 20 +
          metrics.signAnswers * 20 +
          metrics.checkAnswers * 25 +
          metrics.fixAnswers * 15 +
          metrics.escalationAnswers * 20,
        100,
      );
    case "tools-files":
      return Math.min(
        metrics.toolAnswers * 25 +
          metrics.locationAnswers * 30 +
          metrics.ownerAnswers * 20 +
          metrics.answers * 15 +
          metrics.exampleAnswers * 10,
        100,
      );
    case "wrap-up":
      return Math.min(
        metrics.answers * 35 + metrics.substantialAnswers * 35 + metrics.exampleAnswers * 30,
        100,
      );
    default:
      return 0;
  }
}

function deriveCompletionPercent(messages: InterviewMessage[], language: Language) {
  const total = getSectionOrder(language).reduce(
    (sum, section) => sum + getProgressForSection(messages, section.id),
    0,
  );

  return Math.round(total / getSectionOrder(language).length);
}

function deriveSections(
  messages: InterviewMessage[],
  currentSectionId: InterviewSectionId,
  language: Language,
): InterviewSection[] {
  const sectionOrder = getSectionOrder(language);
  const currentIndex = sectionOrder.findIndex((section) => section.id === currentSectionId);

  return sectionOrder.map((section, index) => {
    const promptCount = getUserMessagesForSection(messages, section.id).length;
    const isCurrent = section.id === currentSectionId;
    const isComplete =
      hasCompletedSection(messages, section.id) &&
      (index < currentIndex ||
        (section.id === currentSectionId &&
          currentSectionId === "wrap-up" &&
          promptCount > 0));

    return {
      id: section.id,
      title: section.title,
      completionHint: section.completionHint,
      promptCount,
      status: isComplete ? "complete" : isCurrent ? "current" : "upcoming",
    };
  });
}

function buildSession(
  messages: InterviewMessage[],
  currentSectionId: InterviewSectionId,
  source: InterviewSession["source"],
  language: Language,
  overrides?: Partial<
    Pick<
      InterviewSession,
      "roleTitle" | "participantLabel" | "id" | "firstName" | "lastName"
    >
  >,
): InterviewSession {
  const detectedSignals = new Set<SignalTag>();

  for (const message of messages) {
    for (const signal of message.detectedSignals) {
      detectedSignals.add(signal);
    }
  }

  return {
    id: overrides?.id ?? createId(),
    language,
    firstName: overrides?.firstName ?? "",
    lastName: overrides?.lastName ?? "",
    roleTitle: overrides?.roleTitle ?? getDefaultRoleTitle(language),
    participantLabel: overrides?.participantLabel ?? getDefaultParticipantLabel(language),
    currentSectionId,
    messages,
    sections: deriveSections(messages, currentSectionId, language),
    answeredPromptCount: messages.filter((message) => message.role === "user").length,
    completionPercent: deriveCompletionPercent(messages, language),
    detectedSignals: [...detectedSignals],
    source,
    updatedAt: messages[messages.length - 1]?.createdAt ?? new Date().toISOString(),
  };
}

function getNextSectionId(sectionId: InterviewSectionId, language: Language) {
  const sectionOrder = getSectionOrder(language);
  const index = sectionOrder.findIndex((section) => section.id === sectionId);
  return sectionOrder[index + 1]?.id ?? null;
}

function buildTransitionPrompt(sectionId: InterviewSectionId, language: Language) {
  if (language === "fr") {
    switch (sectionId) {
      case "role-overview":
        return "Très bien, j’ai la logique générale du poste.";
      case "recurring-responsibilities":
        return "Parfait, passons maintenant à une tâche importante déroulée pas à pas.";
      case "step-by-step-tasks":
        return "C’est clair. Voyons maintenant les incidents et écarts qui perturbent le flux normal.";
      case "problem-solving":
        return "Très utile. Je voudrais maintenant noter les outils, dossiers et contacts qui soutiennent ce travail.";
      case "tools-files":
        return "Très bien. Il ne reste plus qu’à capter les conseils de passation.";
      default:
        return "";
    }
  }

  switch (sectionId) {
    case "role-overview":
      return "That gives me the shape of the role.";
    case "recurring-responsibilities":
      return "Good. Let’s move into one important task step by step.";
    case "step-by-step-tasks":
      return "That process is clear. Next, let’s capture the issues that interrupt it.";
    case "problem-solving":
      return "Helpful. Now let’s record the tools, files, and contacts behind the work.";
    case "tools-files":
      return "Great. We can finish with the handover advice someone new really needs.";
    default:
      return "";
  }
}

function getFallbackPrompt(sectionId: InterviewSectionId, language: Language) {
  if (language === "fr") {
    switch (sectionId) {
      case "role-overview":
        return "Sur quoi les autres comptent-ils particulièrement sur vous, au-delà de la théorie ?";
      case "recurring-responsibilities":
        return "Quelle responsabilité créerait le plus de désordre si personne ne la reprenait pendant une journée ?";
      case "step-by-step-tasks":
        return "Pouvez-vous reprendre cette tâche dans l’ordre exact où vous la faites ?";
      case "problem-solving":
        return "Quel premier signal vous fait sentir qu’un dossier est en train de dérailler ?";
      case "tools-files":
        return "Quel dossier, fichier ou contact serait le plus difficile à retrouver pour quelqu’un de nouveau ?";
      case "wrap-up":
        return "Quel mauvais réflexe faudrait-il absolument éviter au démarrage ?";
      default:
        return getOpeningPrompt(language);
    }
  }

  switch (sectionId) {
    case "role-overview":
      return "What do people rely on you for that would be hard to pick up from a job description alone?";
    case "recurring-responsibilities":
      return "Which responsibility would cause the most disruption if nobody picked it up for a day?";
    case "step-by-step-tasks":
      return "Can you run me through that same task in the exact order you handle it?";
    case "problem-solving":
      return "What early warning sign tells you the job is about to go off track?";
    case "tools-files":
      return "Which file, folder, inbox, or contact would be hardest for someone new to find?";
    case "wrap-up":
      return "What is the first bad habit you would warn a replacement not to fall into?";
    default:
      return getOpeningPrompt(language);
  }
}

function buildFollowUpPrompt(
  sectionId: InterviewSectionId,
  content: string,
  language: Language,
) {
  const analysis = analyseAnswer(content);

  if (language === "fr") {
    if (analysis.isShort) {
      return "Pouvez-vous donner un peu plus de détail ou un exemple concret récent ?";
    }

    if (analysis.isAmbiguous) {
      return "Dans les cas les plus fréquents, comment cela se passe-t-il concrètement ?";
    }

    switch (sectionId) {
      case "role-overview":
        if (analysis.isAbstract || !analysis.hasExample) {
          return "Pouvez-vous illustrer cela avec un exemple d’une semaine normale ?";
        }

        return "Dans ce poste, sur quoi votre jugement compte-t-il le plus ?";
      case "recurring-responsibilities":
        if (!analysis.hasFrequency || !analysis.hasTrigger) {
          return "À quelle fréquence cela revient-il, et qu’est-ce qui le déclenche en général ?";
        }

        if (!analysis.hasCheck) {
          return "Avant d’avancer, quels contrôles faites-vous systématiquement ?";
        }

        if (!analysis.hasExample) {
          return "Avez-vous un exemple récent pour rendre le rythme plus concret ?";
        }

        return "Qui est impacté en premier si cette responsabilité dérape ?";
      case "step-by-step-tasks":
        if (!analysis.hasTrigger) {
          return "Qu’est-ce qui déclenche cette tâche, et qui vous la transmet ?";
        }

        if (!analysis.hasStepCue) {
          return "Pouvez-vous la reprendre étape par étape, dans l’ordre exact ?";
        }

        if (!analysis.hasCheck) {
          return "Quels contrôles faites-vous avant de transmettre ou de clôturer ?";
        }

        if (!analysis.hasExample) {
          return "Pouvez-vous prendre un vrai dossier comme exemple ?";
        }

        return "À quel moment cette séquence se dégrade-t-elle le plus souvent si quelqu’un va trop vite ?";
      case "problem-solving":
        if (!analysis.hasSigns) {
          return "Comment voyez-vous le problème arriver avant qu’il fasse perdre du temps à l’atelier ?";
        }

        if (!analysis.hasCheck) {
          return "Quels sont vos premiers contrôles quand vous le repérez ?";
        }

        if (!analysis.hasFix) {
          return "Quelle est la solution habituelle, et quand passez-vous en escalade ?";
        }

        return "Quelle erreur revient le plus souvent quand ce problème apparaît ?";
      case "tools-files":
        if (!analysis.hasLocation) {
          return "Où cela se trouve-t-il exactement ?";
        }

        if (!analysis.hasOwner) {
          return "Qui s’appuie dessus ou le met à jour au quotidien ?";
        }

        return "Quel contact ou quelle boîte mail devient critique si cet élément est faux ?";
      case "wrap-up":
        if (analysis.isAbstract || !analysis.hasExample) {
          return "Qu’est-ce qui se passerait mal dès la première semaine si cette consigne était oubliée ?";
        }

        return "S’il ne fallait garder qu’un réflexe dès le premier jour, lequel serait-ce ?";
      default:
        return null;
    }
  }

  if (analysis.isShort) {
    return "Can you give more detail or a real example from a recent job?";
  }

  if (analysis.isAmbiguous) {
    return "What are the most common cases, and can you anchor that in a real example?";
  }

  switch (sectionId) {
    case "role-overview":
      if (analysis.isAbstract || !analysis.hasExample) {
        return "Can you explain that with a real example from a normal week?";
      }

      return "Which part of the role depends most on your judgement rather than a written process?";
    case "recurring-responsibilities":
      if (!analysis.hasFrequency || !analysis.hasTrigger) {
        return "How often does that happen, and what usually triggers it?";
      }

      if (!analysis.hasCheck) {
        return "When that comes up, what do you check before you move it forward?";
      }

      if (!analysis.hasExample) {
        return "Can you give me one recent example so the rhythm of the work is clear?";
      }

      return "Who else feels it first if that responsibility slips?";
    case "step-by-step-tasks":
      if (!analysis.hasTrigger) {
        return "What usually triggers that task, and who hands it to you?";
      }

      if (!analysis.hasStepCue) {
        return "Can you walk me through the steps in the exact order you do them?";
      }

      if (!analysis.hasCheck) {
        return "What checks do you do before you hand it on or close it out?";
      }

      if (!analysis.hasExample) {
        return "Can you use a real job as the example?";
      }

      return "What part of that workflow most often goes wrong if someone rushes it?";
    case "problem-solving":
      if (!analysis.hasSigns) {
        return "How do you recognise that issue early, before the workshop loses time?";
      }

      if (!analysis.hasCheck) {
        return "What are the first checks you do when you spot it?";
      }

      if (!analysis.hasFix) {
        return "What is the usual fix, and when do you escalate it instead of pushing ahead?";
      }

      return "What is the common mistake people make when this issue first shows up?";
    case "tools-files":
      if (!analysis.hasLocation) {
        return "Where exactly is that stored or accessed?";
      }

      if (!analysis.hasOwner) {
        return "Who else relies on it being correct, or updates it when things change?";
      }

      return "Which contact or inbox matters most when that file or system is wrong?";
    case "wrap-up":
      if (analysis.isAbstract || !analysis.hasExample) {
        return "What would go wrong in the first week if a replacement missed that?";
      }

      return "What one habit would you insist they keep from day one?";
    default:
      return null;
  }
}

export function getInterviewHints(sectionId: InterviewSectionId, language: Language) {
  return getInterviewHintsForLanguage(language)[sectionId];
}

export function createBlankSession(language: Language = DEFAULT_LANGUAGE) {
  const createdAt = new Date().toISOString();
  const messages = [
    createMessage("assistant", getOpeningPrompt(language), "role-overview", createdAt),
  ];

  return buildSession(messages, "role-overview", "blank", language, {
    roleTitle: getDefaultRoleTitle(language),
    participantLabel: getDefaultParticipantLabel(language),
    firstName: "",
    lastName: "",
  });
}

export function createNamedBlankSession(
  language: Language = DEFAULT_LANGUAGE,
  interviewee: { firstName: string; lastName: string },
) {
  const session = createBlankSession(language);

  return buildSession(session.messages, session.currentSectionId, "live", language, {
    id: session.id,
    firstName: interviewee.firstName.trim(),
    lastName: interviewee.lastName.trim(),
    roleTitle: getDefaultRoleTitle(language),
    participantLabel:
      language === "fr"
        ? `${interviewee.firstName.trim()} ${interviewee.lastName.trim()}`.trim()
        : `${interviewee.firstName.trim()} ${interviewee.lastName.trim()}`.trim(),
  });
}

export function createSampleSession(language: Language = DEFAULT_LANGUAGE) {
  const sampleMessages = getSampleMessages(language);
  const startedAt = Date.now() - sampleMessages.length * 60_000;
  const messages = sampleMessages.map((message, index) =>
    createMessage(
      message.role,
      message.content,
      message.sectionId,
      new Date(startedAt + index * 60_000).toISOString(),
      message.detectedSignals,
    ),
  );

  return buildSession(messages, "wrap-up", "sample", language, {
    firstName: language === "fr" ? "Jean" : "Jean",
    lastName: language === "fr" ? "Dupont" : "Dupont",
    roleTitle:
      language === "fr" ? "Responsable d’atelier" : "Workshop manager",
    participantLabel:
      language === "fr"
        ? "PME de réparation hydraulique industrielle"
        : "Small industrial hydraulics company",
  });
}

export function relocalizeSession(
  session: InterviewSession,
  language: Language,
): InterviewSession {
  if (session.source === "blank") {
    return createBlankSession(language);
  }

  if (session.source === "sample") {
    return createSampleSession(language);
  }

  return buildSession(
    session.messages,
    session.currentSectionId,
    session.source,
    language,
    {
      id: session.id,
      firstName: session.firstName,
      lastName: session.lastName,
      roleTitle: session.roleTitle,
      participantLabel: session.participantLabel,
    },
  );
}

export function getActiveAssistantPrompt(
  messages: InterviewMessage[],
  language: Language = DEFAULT_LANGUAGE,
) {
  return (
    [...messages].reverse().find((message) => message.role === "assistant")?.content ??
    getOpeningPrompt(language)
  );
}

export function advanceInterview(
  session: InterviewSession,
  userText: string,
  language: Language = session.language ?? DEFAULT_LANGUAGE,
) {
  const trimmed = userText.trim();

  if (!trimmed) {
    return session;
  }

  const createdAt = new Date().toISOString();
  const sectionId = session.currentSectionId;
  const signals = detectSignals(trimmed);
  const nextMessages = [
    ...session.messages,
    createMessage("user", trimmed, sectionId, createdAt, signals),
  ];

  const completedCurrentSection = hasCompletedSection(nextMessages, sectionId);
  const nextSectionId = completedCurrentSection ? getNextSectionId(sectionId, language) : null;
  const sectionOpeners = getSectionOpeners(language);

  let assistantMessage = "";
  let assistantSectionId = sectionId;
  let currentSectionId = sectionId;

  if (completedCurrentSection && nextSectionId) {
    assistantMessage = `${buildTransitionPrompt(sectionId, language)} ${sectionOpeners[nextSectionId]}`;
    assistantSectionId = nextSectionId;
    currentSectionId = nextSectionId;
  } else if (completedCurrentSection && sectionId === "wrap-up") {
    assistantMessage = getWrapUpClosingPrompt(language);
  } else {
    assistantMessage =
      buildFollowUpPrompt(sectionId, trimmed, language) ??
      getFallbackPrompt(sectionId, language);
  }

  const updatedMessages = [
    ...nextMessages,
    createMessage(
      "assistant",
      assistantMessage,
      assistantSectionId,
      new Date(new Date(createdAt).getTime() + 1_000).toISOString(),
    ),
  ];

  const inferredRoleTitle =
    sectionId === "role-overview" && getWordCount(trimmed) > 8
      ? trimmed
          .split(".")[0]
          ?.replace(/^(i|je)\s+/i, "")
          .trim()
      : session.roleTitle;

  return buildSession(updatedMessages, currentSectionId, "live", language, {
    id: session.id,
    firstName: session.firstName,
    lastName: session.lastName,
    roleTitle:
      inferredRoleTitle && inferredRoleTitle.length < 90
        ? inferredRoleTitle.charAt(0).toUpperCase() + inferredRoleTitle.slice(1)
        : session.roleTitle,
    participantLabel: session.participantLabel,
  });
}
