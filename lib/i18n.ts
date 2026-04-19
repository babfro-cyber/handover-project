import { SignalTag, InterviewSectionStatus, CompletenessStatus } from "@/lib/types";

export type Language = "fr" | "en";

export const LANGUAGE_STORAGE_KEY = "knowledge-capture.v1.language";

export const DEFAULT_LANGUAGE: Language = "fr";

type Dictionary = {
  langLabel: string;
  languageToggle: {
    fr: string;
    en: string;
  };
  common: {
    appName: string;
    prototypeNote: string;
    home: string;
    interview: string;
    output: string;
    example: string;
    demoLoaded: string;
    backToHome: string;
  };
  landing: {
    eyebrow: string;
    title: string;
    subtitle: string;
    interviewSurface: string;
    ownerSurface: string;
    startInterview: string;
    viewOwnerArea: string;
  };
  interview: {
    areaLabel: string;
    pageTitle: string;
    startTitle: string;
    firstName: string;
    lastName: string;
    begin: string;
    currentQuestion: string;
    captureNote: string;
    yourAnswer: string;
    answerPlaceholder: string;
    submitHint: string;
    sendAnswer: string;
    hintsTitle: string;
    answerMode: string;
    typeResponse: string;
    speakResponse: string;
    startMicrophone: string;
    stopMicrophone: string;
    speechListening: string;
    speechStopped: string;
    speechUnavailable: string;
    speechDenied: string;
    speechError: string;
    speechHint: string;
    latestResponse: string;
    progress: string;
    currentFocus: string;
    next: string;
    reset: string;
    finish: string;
    sectionTracker: string;
    sectionRole: string;
    sectionTasks: string;
    sectionProcess: string;
    sectionProblems: string;
    sectionTools: string;
    sectionDecisions: string;
  };
  output: {
    areaLabel: string;
    title: string;
    subtitle: string;
    dashboardTitle: string;
    dashboardSubtitle: string;
    people: string;
    openFile: string;
    interviewee: string;
    progressLabel: string;
    sectionsDone: string;
    inProgress: string;
    done: string;
    notStarted: string;
    lastGenerated: string;
    lastUpdated: string;
    backToDashboard: string;
    backToInterview: string;
    exportPdf: string;
    sections: string;
    itemsCount: string;
    sessionSummary: string;
    responsibilities: string;
    issues: string;
    tools: string;
    gaps: string;
    keyContacts: string;
    noContacts: string;
    confidence: string;
    editableDraft: string;
    editableHelp: string;
    autoDemoTitle: string;
    autoDemoBody: string;
    startInterview: string;
  };
  statuses: Record<CompletenessStatus, string>;
  sectionStatuses: Record<InterviewSectionStatus, string>;
  signalTags: Record<SignalTag, string>;
};

export const dictionaries: Record<Language, Dictionary> = {
  fr: {
    langLabel: "Français",
    languageToggle: {
      fr: "Français",
      en: "English",
    },
    common: {
      appName: "Transmission des savoirs",
      prototypeNote: "Prototype de capture et de transmission des savoirs métier.",
      home: "Accueil",
      interview: "Entretien",
      output: "Documentation",
      example: "Exemple",
      demoLoaded: "Exemple chargé",
      backToHome: "Retour à l’accueil",
    },
    landing: {
      eyebrow: "Prototype",
      title: "Capturer le savoir opérationnel des personnes-clés",
      subtitle: "Interroger une personne-clé, puis retrouver son savoir-faire côté manager.",
      interviewSurface: "Poser les questions et capter les réponses simplement.",
      ownerSurface: "Suivre les personnes interrogées et ouvrir leur dossier.",
      startInterview: "Commencer un entretien",
      viewOwnerArea: "Accéder à l’espace manager",
    },
    interview: {
      areaLabel: "Espace entretien",
      pageTitle: "Entretien",
      startTitle: "Commencer",
      firstName: "Prénom",
      lastName: "Nom",
      begin: "Commencer",
      currentQuestion: "Question en cours",
      captureNote: "Les réponses sont enregistrées au fil de l’entretien.",
      yourAnswer: "Votre réponse",
      answerPlaceholder:
        "Expliquez comme si vous formiez quelqu’un qui reprend le poste.",
      submitHint: "Entrée pour envoyer. Maj + Entrée pour aller à la ligne.",
      sendAnswer: "Envoyer",
      hintsTitle: "Repères utiles",
      answerMode: "Mode de réponse",
      typeResponse: "Répondre par écrit",
      speakResponse: "Répondre à l’oral",
      startMicrophone: "Activer le micro",
      stopMicrophone: "Arrêter le micro",
      speechListening: "Écoute en cours",
      speechStopped: "Micro arrêté",
      speechUnavailable: "La saisie vocale n’est pas disponible dans ce navigateur.",
      speechDenied: "Accès au micro refusé. Vous pouvez continuer par écrit.",
      speechError: "La saisie vocale n’a pas pu démarrer. Vous pouvez continuer par écrit.",
      speechHint: "Parlez puis relisez le texte avant d’envoyer.",
      latestResponse: "Dernière réponse enregistrée",
      progress: "Avancement",
      currentFocus: "Étape en cours",
      next: "Ensuite",
      reset: "Recommencer",
      finish: "Terminer l’entretien",
      sectionTracker: "Étapes",
      sectionRole: "rôle",
      sectionTasks: "tâches",
      sectionProcess: "process",
      sectionProblems: "problèmes",
      sectionTools: "outils",
      sectionDecisions: "décisions",
    },
    output: {
      areaLabel: "Espace manager",
      title: "Dossier de savoir-faire",
      subtitle: "Ouvrir une personne pour relire et affiner sa documentation.",
      dashboardTitle: "Personnes interrogées",
      dashboardSubtitle: "Suivi simple des entretiens et accès aux dossiers.",
      people: "Personnes",
      openFile: "Ouvrir le dossier",
      interviewee: "Personne interrogée",
      progressLabel: "Progression",
      sectionsDone: "sections terminées",
      inProgress: "en cours",
      done: "terminé",
      notStarted: "non démarré",
      lastGenerated: "Dernière génération",
      lastUpdated: "Mis à jour",
      backToDashboard: "Retour à la liste",
      backToInterview: "Revenir à l’entretien",
      exportPdf: "Exporter en PDF",
      sections: "Sections",
      itemsCount: "éléments",
      sessionSummary: "Résumé de session",
      responsibilities: "Responsabilités",
      issues: "Incidents",
      tools: "Outils",
      gaps: "Zones à préciser",
      keyContacts: "Contacts clés",
      noContacts: "Aucun contact clé n’a encore été repéré.",
      confidence: "Niveau de complétude",
      editableDraft: "Texte modifiable",
      editableHelp:
        "Vous pouvez ajuster ce brouillon directement. Les modifications restent enregistrées dans ce navigateur.",
      autoDemoTitle: "Exemple de démonstration",
      autoDemoBody:
        "Aucune session en direct n’a été trouvée. Un exemple complet a été chargé pour montrer le résultat attendu.",
      startInterview: "Lancer un entretien",
    },
    statuses: {
      strong: "solide",
      partial: "partiel",
      "needs clarification": "à préciser",
    },
    sectionStatuses: {
      current: "en cours",
      upcoming: "à venir",
      complete: "terminé",
    },
    signalTags: {
      "tasks captured": "tâches repérées",
      "problems captured": "problèmes repérés",
      "tools mentioned": "outils cités",
      "contacts mentioned": "contacts cités",
      "examples captured": "exemples concrets",
    },
  },
  en: {
    langLabel: "English",
    languageToggle: {
      fr: "Français",
      en: "English",
    },
    common: {
      appName: "Knowledge transfer",
      prototypeNote: "Prototype for operational knowledge capture and transfer.",
      home: "Home",
      interview: "Interview",
      output: "Documentation",
      example: "Example",
      demoLoaded: "Demo loaded",
      backToHome: "Back to home",
    },
    landing: {
      eyebrow: "Prototype",
      title: "Capture the operational know-how behind key roles",
      subtitle: "Interview a key person, then review their know-how from the manager space.",
      interviewSurface: "Ask the questions and capture answers with minimal friction.",
      ownerSurface: "See interviewees, track progress, and open each handover file.",
      startInterview: "Start an interview",
      viewOwnerArea: "Open manager space",
    },
    interview: {
      areaLabel: "Interview space",
      pageTitle: "Interview",
      startTitle: "Start",
      firstName: "First name",
      lastName: "Last name",
      begin: "Start",
      currentQuestion: "Current question",
      captureNote: "Answers are saved as the interview progresses.",
      yourAnswer: "Your answer",
      answerPlaceholder:
        "Explain it as if you were handing the role to someone new.",
      submitHint: "Press Enter to send. Use Shift+Enter for a new line.",
      sendAnswer: "Send",
      hintsTitle: "Helpful prompts",
      answerMode: "Answer mode",
      typeResponse: "Type response",
      speakResponse: "Speak response",
      startMicrophone: "Start microphone",
      stopMicrophone: "Stop microphone",
      speechListening: "Listening",
      speechStopped: "Microphone stopped",
      speechUnavailable: "Voice input is not available in this browser.",
      speechDenied: "Microphone access was denied. You can keep typing instead.",
      speechError: "Voice input could not start. You can keep typing instead.",
      speechHint: "Speak, then review the text before sending.",
      latestResponse: "Latest saved response",
      progress: "Progress",
      currentFocus: "Current focus",
      next: "Next",
      reset: "Start over",
      finish: "Finish interview",
      sectionTracker: "Steps",
      sectionRole: "role",
      sectionTasks: "tasks",
      sectionProcess: "process",
      sectionProblems: "problems",
      sectionTools: "tools",
      sectionDecisions: "decisions",
    },
    output: {
      areaLabel: "Owner review area",
      title: "Knowledge file",
      subtitle: "Open a person to review and refine their documentation.",
      dashboardTitle: "Interviewees",
      dashboardSubtitle: "Simple view of interview progress and handover files.",
      people: "People",
      openFile: "Open file",
      interviewee: "Interviewee",
      progressLabel: "Progress",
      sectionsDone: "sections done",
      inProgress: "in progress",
      done: "done",
      notStarted: "not started",
      lastGenerated: "Last generated",
      lastUpdated: "Last updated",
      backToDashboard: "Back to list",
      backToInterview: "Back to interview",
      exportPdf: "Export to PDF",
      sections: "Sections",
      itemsCount: "items",
      sessionSummary: "Session summary",
      responsibilities: "Responsibilities",
      issues: "Issues",
      tools: "Tools",
      gaps: "Gaps",
      keyContacts: "Key contacts",
      noContacts: "No key contacts have been captured yet.",
      confidence: "Completeness",
      editableDraft: "Editable draft",
      editableHelp:
        "You can adjust this draft directly. Changes are stored in this browser.",
      autoDemoTitle: "Sample handover",
      autoDemoBody:
        "No live session was found, so a complete demo handover was loaded to show the experience.",
      startInterview: "Start interview",
    },
    statuses: {
      strong: "strong",
      partial: "partial",
      "needs clarification": "needs clarification",
    },
    sectionStatuses: {
      current: "current",
      upcoming: "upcoming",
      complete: "complete",
    },
    signalTags: {
      "tasks captured": "tasks captured",
      "problems captured": "problems captured",
      "tools mentioned": "tools mentioned",
      "contacts mentioned": "contacts mentioned",
      "examples captured": "examples captured",
    },
  },
};

export function getDictionary(language: Language = DEFAULT_LANGUAGE) {
  return dictionaries[language];
}

export function getDateLocale(language: Language) {
  return language === "fr" ? "fr-FR" : "en-AU";
}
