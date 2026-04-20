(function () {
  const STORAGE_KEYS = {
    language: "knowledge-capture.static.language",
    activeSessionId: "knowledge-capture.static.active-session",
    sessions: "knowledge-capture.static.sessions",
    documents: "knowledge-capture.static.documents",
  };

  const SECTION_ORDER = [
    "role-overview",
    "recurring-responsibilities",
    "step-by-step-tasks",
    "problem-solving",
    "tools-files-contacts",
    "wrap-up",
  ];

  const routeLabels = {
    home: "#/",
    interview: "#/interview",
    manager: "#/manager",
  };

  const dictionaries = {
    fr: {
      appName: "Transmission des savoirs",
      landingEyebrow: "Prototype",
      landingTitle: "Capturer le savoir opérationnel des personnes-clés",
      landingSubtitle:
        "Un espace entretien pour la personne interrogée, puis un espace manager pour revoir et structurer ce savoir-faire.",
      interviewSurface: "Poser les bonnes questions et capter les réponses sans friction.",
      managerSurface: "Suivre les personnes interrogées et ouvrir leur dossier.",
      startInterview: "Commencer un entretien",
      openManager: "Accéder à l’espace manager",
      backHome: "Retour à l’accueil",
      languageFr: "Français",
      languageEn: "English",
      interviewArea: "Espace entretien",
      managerArea: "Espace manager",
      captureNote: "Les réponses sont enregistrées au fil de l’entretien.",
      firstName: "Prénom",
      lastName: "Nom",
      begin: "Commencer",
      currentQuestion: "Question en cours",
      yourAnswer: "Votre réponse",
      answerPlaceholder: "Expliquez comme si vous formiez quelqu’un qui reprend le poste.",
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
      sendAnswer: "Envoyer",
      submitHint: "Entrée pour envoyer. Maj + Entrée pour aller à la ligne.",
      hintsTitle: "Repères utiles",
      latestResponse: "Dernière réponse",
      progress: "Avancement",
      currentFocus: "Étape en cours",
      nextStep: "Ensuite",
      reset: "Recommencer",
      finishInterview: "Terminer l’entretien",
      noInterviewYet: "Aucun entretien en cours",
      startTitle: "Commencer",
      managerTitle: "Personnes interrogées",
      managerSubtitle: "Suivi simple des entretiens et accès aux dossiers.",
      people: "Personnes",
      openFile: "Ouvrir le dossier",
      progressLabel: "Progression",
      sectionsDone: "sections terminées",
      lastUpdated: "Mis à jour",
      statusDone: "terminé",
      statusProgress: "en cours",
      statusNotStarted: "non démarré",
      interviewee: "Personne interrogée",
      docTitle: "Dossier de savoir-faire",
      docSubtitle: "Relire, compléter et affiner la documentation structurée.",
      backToDashboard: "Retour à la liste",
      exportPdf: "Exporter en PDF",
      sessionSummary: "Résumé de session",
      responsibilities: "Responsabilités",
      issues: "Incidents",
      tools: "Outils",
      gaps: "Zones à préciser",
      keyContacts: "Contacts clés",
      noContacts: "Aucun contact clé n’a encore été repéré.",
      editableDraft: "Texte modifiable",
      editableHelp:
        "Vous pouvez ajuster ce brouillon directement. Les modifications restent enregistrées dans ce navigateur.",
      demoLoaded: "Exemple chargé automatiquement",
      demoBody:
        "Aucune donnée locale n’a été trouvée. Un exemple réaliste a été chargé pour montrer le rendu côté manager.",
      openQuestions: "Questions ouvertes",
      procedures: "Modes opératoires",
      troubleshooting: "Gestion des incidents",
      toolsFilesContacts: "Outils, fichiers et contacts",
      roleOverview: "Vue d’ensemble du poste",
      confidenceStrong: "solide",
      confidencePartial: "partiel",
      confidenceNeeds: "à préciser",
      saveNotice: "Enregistré localement",
      sectionRole: "rôle",
      sectionTasks: "tâches",
      sectionProcess: "process",
      sectionProblems: "problèmes",
      sectionTools: "outils",
      sectionDecisions: "décisions",
      qRole: "Commençons. Expliquez votre rôle comme si j’arrivais aujourd’hui dans l’entreprise.",
      qRecurring:
        "Quelles sont les responsabilités qui reviennent toutes les semaines ou presque ?",
      qProcess:
        "Prenons une tâche importante. Pouvez-vous me décrire comment vous la lancez puis comment vous la sécurisez ?",
      qProblems:
        "Quand quelque chose déraille dans l’atelier, quels sont les cas qui reviennent le plus souvent ?",
      qTools:
        "Sur quels outils, fichiers, dossiers partagés ou contacts vous appuyez-vous au quotidien ?",
      qWrap:
        "Si quelqu’un reprenait ce rôle demain, qu’est-ce qu’il devrait absolument comprendre dès le premier jour ?",
      followShort: "Pouvez-vous donner plus de détail ou un exemple concret ?",
      followAmbiguous: "Dans les cas les plus fréquents, qu’est-ce qui se passe vraiment ?",
      followTask:
        "Qu’est-ce qui déclenche cette tâche, quelles sont les étapes, puis quels contrôles vous faites avant de passer la main ?",
      followProblem:
        "Comment voyez-vous tout de suite que ça pose problème, et quel est votre premier contrôle ?",
      followTools:
        "Où est-ce exactement, et qui s’en sert ou en dépend au quotidien ?",
      followAbstract: "Pouvez-vous raconter un cas réel récent, même simple ?",
      closingPrompt:
        "Parfait. Vous pouvez terminer l’entretien. Le dossier manager sera mis à jour automatiquement.",
      managerEmpty: "Aucun dossier n’est encore disponible.",
      managerEmptyAction: "Charger un exemple",
    },
    en: {
      appName: "Knowledge transfer",
      landingEyebrow: "Prototype",
      landingTitle: "Capture the operational know-how behind key roles",
      landingSubtitle:
        "An interview space for the employee, then a manager space to review and structure that know-how.",
      interviewSurface: "Ask the right questions and capture answers with minimal friction.",
      managerSurface: "Track interviewees and open each handover file.",
      startInterview: "Start an interview",
      openManager: "Open manager area",
      backHome: "Back to home",
      languageFr: "Français",
      languageEn: "English",
      interviewArea: "Interview space",
      managerArea: "Manager area",
      captureNote: "Answers are saved as the interview progresses.",
      firstName: "First name",
      lastName: "Last name",
      begin: "Start",
      currentQuestion: "Current question",
      yourAnswer: "Your answer",
      answerPlaceholder: "Explain it as if you were training the person taking over.",
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
      speechHint: "Speak naturally, then review the text before sending.",
      sendAnswer: "Send",
      submitHint: "Enter to send. Shift + Enter for a new line.",
      hintsTitle: "Helpful cues",
      latestResponse: "Latest answer",
      progress: "Progress",
      currentFocus: "Current step",
      nextStep: "Next",
      reset: "Start over",
      finishInterview: "Finish interview",
      noInterviewYet: "No active interview",
      startTitle: "Start",
      managerTitle: "Interviewed people",
      managerSubtitle: "Simple interview tracking and access to each handover file.",
      people: "People",
      openFile: "Open file",
      progressLabel: "Progress",
      sectionsDone: "sections completed",
      lastUpdated: "Updated",
      statusDone: "done",
      statusProgress: "in progress",
      statusNotStarted: "not started",
      interviewee: "Interviewee",
      docTitle: "Knowledge file",
      docSubtitle: "Review, refine, and complete the structured documentation.",
      backToDashboard: "Back to list",
      exportPdf: "Export PDF",
      sessionSummary: "Session summary",
      responsibilities: "Responsibilities",
      issues: "Issues",
      tools: "Tools",
      gaps: "Gaps",
      keyContacts: "Key contacts",
      noContacts: "No key contacts have been detected yet.",
      editableDraft: "Editable draft",
      editableHelp:
        "You can edit this draft directly. Changes stay saved in this browser.",
      demoLoaded: "Demo loaded automatically",
      demoBody:
        "No local data was found. A realistic example has been loaded to show the manager experience.",
      openQuestions: "Open questions",
      procedures: "Operating methods",
      troubleshooting: "Incident handling",
      toolsFilesContacts: "Tools, files, and contacts",
      roleOverview: "Role overview",
      confidenceStrong: "strong",
      confidencePartial: "partial",
      confidenceNeeds: "needs clarification",
      saveNotice: "Saved locally",
      sectionRole: "role",
      sectionTasks: "tasks",
      sectionProcess: "process",
      sectionProblems: "problems",
      sectionTools: "tools",
      sectionDecisions: "decisions",
      qRole: "Let’s start. Explain your role as if I joined the business today.",
      qRecurring: "What responsibilities come back every week or almost every week?",
      qProcess:
        "Let’s take an important task. How do you start it, then how do you make sure it is safe to release?",
      qProblems:
        "When something goes wrong in the workshop, which cases come up most often?",
      qTools:
        "Which tools, files, shared folders, or contacts do you rely on day to day?",
      qWrap:
        "If someone took over this role tomorrow, what would they need to understand on day one?",
      followShort: "Can you add more detail or give a concrete example?",
      followAmbiguous: "In the most common cases, what really happens?",
      followTask:
        "What triggers that task, what are the steps, and what checks do you do before handing it over?",
      followProblem:
        "How do you recognise that issue straight away, and what is the first thing you check?",
      followTools:
        "Where exactly is that, and who uses it or depends on it day to day?",
      followAbstract: "Can you walk me through a recent real example, even a simple one?",
      closingPrompt:
        "Great. You can finish the interview. The manager file will be updated automatically.",
      managerEmpty: "No file is available yet.",
      managerEmptyAction: "Load example",
    },
  };

  const appState = {
    language: loadLanguage(),
    sessions: loadJson(STORAGE_KEYS.sessions, []),
    documents: loadJson(STORAGE_KEYS.documents, []),
    activeSessionId: loadString(STORAGE_KEYS.activeSessionId),
    answerMode: "type",
    draftAnswer: "",
    speech: {
      supported: false,
      listening: false,
      status: "idle",
      recognition: null,
      transcriptBase: "",
    },
    currentDocId: null,
    showDemoNotice: false,
  };

  initializeSpeech();
  normalizeSeedState();
  window.addEventListener("hashchange", render);
  window.addEventListener("beforeunload", stopSpeechIfNeeded);
  render();

  function dictionary() {
    return dictionaries[appState.language];
  }

  function loadJson(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function loadString(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function persist() {
    try {
      window.localStorage.setItem(STORAGE_KEYS.language, appState.language);
      window.localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(appState.sessions));
      window.localStorage.setItem(STORAGE_KEYS.documents, JSON.stringify(appState.documents));

      if (appState.activeSessionId) {
        window.localStorage.setItem(STORAGE_KEYS.activeSessionId, appState.activeSessionId);
      } else {
        window.localStorage.removeItem(STORAGE_KEYS.activeSessionId);
      }
    } catch {
      // Ignore localStorage write failures for this prototype.
    }
  }

  function loadLanguage() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEYS.language);
      return stored === "en" ? "en" : "fr";
    } catch {
      return "fr";
    }
  }

  function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    const locale = appState.language === "fr" ? "fr-FR" : "en-AU";
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  function getRoute() {
    const hash = window.location.hash || routeLabels.home;
    const cleaned = hash.replace(/^#\/?/, "");
    const parts = cleaned ? cleaned.split("/") : [];
    const root = parts[0] || "";

    if (root === "interview") {
      return { name: "interview", sessionId: parts[1] || null };
    }

    if (root === "manager") {
      return { name: "manager", sessionId: parts[1] || null };
    }

    return { name: "home", sessionId: null };
  }

  function setHash(hash) {
    if (window.location.hash === hash) {
      render();
      return;
    }

    window.location.hash = hash;
  }

  function getSectionTitle(sectionId) {
    const copy = dictionary();
    switch (sectionId) {
      case "role-overview":
        return copy.sectionRole;
      case "recurring-responsibilities":
        return copy.sectionTasks;
      case "step-by-step-tasks":
        return copy.sectionProcess;
      case "problem-solving":
        return copy.sectionProblems;
      case "tools-files-contacts":
        return copy.sectionTools;
      case "wrap-up":
        return copy.sectionDecisions;
      default:
        return sectionId;
    }
  }

  function createSections(currentSectionId) {
    return SECTION_ORDER.map((sectionId) => ({
      id: sectionId,
      title: getSectionTitle(sectionId),
      status:
        sectionId === currentSectionId
          ? "current"
          : SECTION_ORDER.indexOf(sectionId) < SECTION_ORDER.indexOf(currentSectionId)
            ? "complete"
            : "upcoming",
    }));
  }

  function getSectionQuestion(sectionId) {
    const copy = dictionary();
    switch (sectionId) {
      case "role-overview":
        return copy.qRole;
      case "recurring-responsibilities":
        return copy.qRecurring;
      case "step-by-step-tasks":
        return copy.qProcess;
      case "problem-solving":
        return copy.qProblems;
      case "tools-files-contacts":
        return copy.qTools;
      case "wrap-up":
      default:
        return copy.qWrap;
    }
  }

  function createBlankSession(firstName, lastName) {
    const createdAt = new Date().toISOString();
    return {
      id: createId(),
      firstName,
      lastName,
      language: appState.language,
      roleTitle: appState.language === "fr" ? "Entretien en cours" : "Interview in progress",
      source: "live",
      currentSectionId: "role-overview",
      completionPercent: 6,
      answeredPromptCount: 0,
      updatedAt: createdAt,
      messages: [
        {
          id: createId(),
          role: "assistant",
          content: getSectionQuestion("role-overview"),
          sectionId: "role-overview",
          createdAt,
        },
      ],
      sections: createSections("role-overview"),
    };
  }

  function seedSampleSession(language) {
    const now = Date.now();
    const messages = [
      assistantMsg(language, "role-overview", getSectionQuestion("role-overview"), now - 28 * 60000),
      userMsg(
        language === "fr"
          ? "Je reçois les urgences atelier, je regarde si la machine est vraiment immobilisée, puis je protège le planning des techniciens et le risque pièces avant de promettre quoi que ce soit."
          : "I receive urgent workshop requests, check whether the machine is truly down, then protect technician time and parts risk before promising anything.",
        "role-overview",
        now - 27 * 60000,
      ),
      assistantMsg(language, "recurring-responsibilities", getSectionQuestion("recurring-responsibilities"), now - 26 * 60000),
      userMsg(
        language === "fr"
          ? "Chaque semaine je trie les vraies urgences, j’affecte les techniciens selon le niveau de diagnostic demandé, je vérifie si le dossier est exploitable et je rappelle les clients quand le devis reste trop incertain avant démontage."
          : "Every week I sort real urgencies, assign technicians based on the level of diagnosis required, check whether the file is usable, and call customers back when the quote is still too uncertain before strip-down.",
        "recurring-responsibilities",
        now - 24 * 60000,
      ),
      assistantMsg(language, "step-by-step-tasks", getSectionQuestion("step-by-step-tasks"), now - 22 * 60000),
      userMsg(
        language === "fr"
          ? "Quand une pompe hydraulique arrive en urgence, je regarde d’abord si la fiche mentionne bien le symptôme, l’environnement et la pression de service. Ensuite je demande les photos, je vérifie l’historique ERP, puis j’ouvre le dossier atelier seulement si le technicien aura assez d’éléments pour éviter un démontage à l’aveugle."
          : "When an urgent hydraulic pump comes in, I first check whether the job sheet clearly states the symptom, environment, and working pressure. Then I ask for photos, check the ERP history, and only release the job to the workshop if the technician has enough information to avoid a blind strip-down.",
        "step-by-step-tasks",
        now - 20 * 60000,
      ),
      assistantMsg(language, "problem-solving", getSectionQuestion("problem-solving"), now - 18 * 60000),
      userMsg(
        language === "fr"
          ? "Le plus pénible, c’est la fiche incomplète, la pièce fournisseur qui glisse alors que le client est arrêté, ou le commercial qui vend déjà un délai avant qu’on sache l’état réel de l’intérieur. On voit vite que ça sent le problème quand personne n’arrive à dire depuis quand la panne est apparue ou quand le devis est demandé avant diagnostic sérieux."
          : "The worst cases are incomplete job sheets, supplier parts slipping while the customer is down, or sales already promising a lead time before we know the real internal condition. You can tell it is going wrong quickly when no one can say how long the fault has existed or when a quote is requested before a serious diagnosis.",
        "problem-solving",
        now - 16 * 60000,
      ),
      assistantMsg(language, "tools-files-contacts", getSectionQuestion("tools-files-contacts"), now - 14 * 60000),
      userMsg(
        language === "fr"
          ? "J’utilise l’ERP Atelier pour l’historique et le statut, la boîte mail partagée pour les confirmations client, le dossier réseau Hydraulique/Devis urgents pour les photos et devis, un tableau Excel délais critiques pour les pièces longues, et deux contacts fournisseurs qu’il faut appeler directement quand une machine client est immobilisée."
          : "I use the workshop ERP for history and status, the shared mailbox for customer confirmations, the network folder Hydraulics/Urgent Quotes for photos and quotes, an Excel critical lead-time tracker for long parts, and two supplier contacts that must be called directly when a customer machine is down.",
        "tools-files-contacts",
        now - 12 * 60000,
      ),
      assistantMsg(language, "wrap-up", getSectionQuestion("wrap-up"), now - 10 * 60000),
      userMsg(
        language === "fr"
          ? "La vraie difficulté, ce n’est pas le planning théorique. C’est de sentir quand une urgence est réelle, quand il faut protéger l’atelier d’un dossier faible, et quand il faut arrêter la promesse client parce que le chiffrage devient trop risqué sans démontage."
          : "The real difficulty is not the theoretical plan. It is knowing when an urgency is real, when you must protect the workshop from a weak file, and when you have to stop the customer promise because pricing becomes too risky without strip-down.",
        "wrap-up",
        now - 8 * 60000,
      ),
      assistantMsg(language, "wrap-up", dictionaries[language].closingPrompt, now - 7 * 60000),
    ];

    const session = {
      id: createId(),
      firstName: language === "fr" ? "Jean" : "Jean",
      lastName: language === "fr" ? "Dupont" : "Dupont",
      language,
      roleTitle:
        language === "fr"
          ? "Responsable atelier hydraulique"
          : "Hydraulics workshop manager",
      source: "sample",
      currentSectionId: "wrap-up",
      completionPercent: 100,
      answeredPromptCount: 6,
      updatedAt: new Date(now - 7 * 60000).toISOString(),
      messages,
      sections: SECTION_ORDER.map((id) => ({
        id,
        title: getSectionTitle(id),
        status: "complete",
      })),
    };

    return session;
  }

  function assistantMsg(language, sectionId, content, time) {
    return {
      id: createId(),
      role: "assistant",
      content,
      sectionId,
      createdAt: new Date(time).toISOString(),
    };
  }

  function userMsg(content, sectionId, time) {
    return {
      id: createId(),
      role: "user",
      content,
      sectionId,
      createdAt: new Date(time).toISOString(),
    };
  }

  function normalizeSeedState() {
    if (!Array.isArray(appState.sessions)) {
      appState.sessions = [];
    }

    if (!Array.isArray(appState.documents)) {
      appState.documents = [];
    }
  }

  function getSessionById(id) {
    return appState.sessions.find((item) => item.id === id) || null;
  }

  function getActiveSession() {
    return appState.activeSessionId ? getSessionById(appState.activeSessionId) : null;
  }

  function saveSession(session, makeActive = true) {
    const index = appState.sessions.findIndex((item) => item.id === session.id);
    if (index >= 0) {
      appState.sessions[index] = session;
    } else {
      appState.sessions.unshift(session);
    }

    if (makeActive) {
      appState.activeSessionId = session.id;
    }

    persist();
  }

  function saveDocument(document) {
    const index = appState.documents.findIndex((item) => item.sessionId === document.sessionId);
    if (index >= 0) {
      appState.documents[index] = document;
    } else {
      appState.documents.unshift(document);
    }

    persist();
  }

  function loadDocument(sessionId) {
    return appState.documents.find((item) => item.sessionId === sessionId) || null;
  }

  function removeDocument(sessionId) {
    appState.documents = appState.documents.filter((item) => item.sessionId !== sessionId);
    persist();
  }

  function analyzeText(text) {
    const normalized = text.toLowerCase();
    const wordCount = normalized.trim().split(/\s+/).filter(Boolean).length;
    const hasAmbiguity = /\b(sometimes|depends|usually|often|parfois|ça dépend|souvent|généralement)\b/.test(normalized);
    const hasProblem = /\b(issue|problem|error|failure|breakdown|mistake|panne|problème|erreur|blocage|dérive|glisse)\b/.test(normalized);
    const hasTool = /\b(folder|file|excel|erp|email|drive|software|mailbox|spreadsheet|shared|dossier|fichier|excel|erp|mail|boîte|tableau|réseau)\b/.test(normalized);
    const hasTask = /\b(check|schedule|assign|call|prepare|launch|verify|quote|plan|triage|organise|vérifie|affecte|prépare|lance|planifie|diagnostique|rappelle|ouvre)\b/.test(normalized);
    const hasExample = /\b(example|recent|last week|for example|par exemple|récemment|la semaine dernière|hier)\b/.test(normalized);
    const hasSteps = /\b(first|then|after|before|ensuite|puis|d’abord|avant|après)\b/.test(normalized);
    const hasLocation = /\b(folder|drive|mailbox|shared|réseau|dossier|boîte|chemin|dans le dossier|dans le réseau)\b/.test(normalized);
    const hasContacts = /\b(contact|supplier|sales|customer|technician|commercial|fournisseur|client|technicien|achat)\b/.test(normalized);

    return {
      wordCount,
      hasAmbiguity,
      hasProblem,
      hasTool,
      hasTask,
      hasExample,
      hasSteps,
      hasLocation,
      hasContacts,
    };
  }

  function getUserMessagesForSection(session, sectionId) {
    return session.messages.filter(
      (message) => message.role === "user" && message.sectionId === sectionId,
    );
  }

  function shouldAdvanceSection(sectionId, messages) {
    const analyses = messages.map((message) => analyzeText(message.content));
    const substantial = analyses.filter((item) => item.wordCount >= 16).length;
    const tasks = analyses.filter((item) => item.hasTask).length;
    const tools = analyses.filter((item) => item.hasTool).length;
    const problems = analyses.filter((item) => item.hasProblem).length;
    const steps = analyses.filter((item) => item.hasSteps).length;
    const locations = analyses.filter((item) => item.hasLocation).length;
    const examples = analyses.filter((item) => item.hasExample).length;
    const totalWords = analyses.reduce((sum, item) => sum + item.wordCount, 0);

    switch (sectionId) {
      case "role-overview":
        return substantial >= 2 || (tasks >= 1 && totalWords >= 60) || examples >= 1;
      case "recurring-responsibilities":
        return tasks >= 2 || messages.length >= 2;
      case "step-by-step-tasks":
        return steps >= 1 && substantial >= 1;
      case "problem-solving":
        return problems >= 2 || messages.length >= 2;
      case "tools-files-contacts":
        return tools >= 2 || (tools >= 1 && locations >= 1);
      case "wrap-up":
        return messages.length >= 1;
      default:
        return false;
    }
  }

  function buildFollowUp(text, sectionId) {
    const copy = dictionary();
    const analysis = analyzeText(text);

    if (analysis.wordCount < 20) {
      return copy.followShort;
    }

    if (analysis.hasAmbiguity) {
      return copy.followAmbiguous;
    }

    if (analysis.hasProblem) {
      return copy.followProblem;
    }

    if (analysis.hasTool) {
      return copy.followTools;
    }

    if (analysis.hasTask || sectionId === "recurring-responsibilities" || sectionId === "step-by-step-tasks") {
      return copy.followTask;
    }

    if (!analysis.hasExample) {
      return copy.followAbstract;
    }

    return null;
  }

  function advanceInterview(session, answer) {
    const trimmed = answer.trim();
    if (!trimmed) {
      return session;
    }

    const now = new Date().toISOString();
    const userEntry = {
      id: createId(),
      role: "user",
      content: trimmed,
      sectionId: session.currentSectionId,
      createdAt: now,
    };

    const nextMessages = session.messages.concat(userEntry);
    const currentSectionMessages = getUserMessagesForSection(
      { messages: nextMessages },
      session.currentSectionId,
    );
    const followUp = buildFollowUp(trimmed, session.currentSectionId);
    const sectionDone = shouldAdvanceSection(session.currentSectionId, currentSectionMessages);
    let nextSectionId = session.currentSectionId;
    let assistantContent = followUp;

    if (sectionDone) {
      const currentIndex = SECTION_ORDER.indexOf(session.currentSectionId);
      nextSectionId = SECTION_ORDER[Math.min(currentIndex + 1, SECTION_ORDER.length - 1)];
      assistantContent =
        nextSectionId === session.currentSectionId
          ? dictionary().closingPrompt
          : getSectionQuestion(nextSectionId);
    }

    if (!assistantContent) {
      assistantContent = getSectionQuestion(session.currentSectionId);
    }

    nextMessages.push({
      id: createId(),
      role: "assistant",
      content: assistantContent,
      sectionId: nextSectionId,
      createdAt: new Date(Date.now() + 10).toISOString(),
    });

    const answeredPromptCount = session.answeredPromptCount + 1;
    const completionPercent = Math.min(
      100,
      Math.round(((SECTION_ORDER.indexOf(nextSectionId) + (nextSectionId === "wrap-up" ? 1 : 0)) / SECTION_ORDER.length) * 100),
    );

    return {
      ...session,
      currentSectionId: nextSectionId,
      answeredPromptCount,
      completionPercent: nextSectionId === "wrap-up" && sectionDone ? 100 : Math.max(session.completionPercent, completionPercent),
      updatedAt: new Date().toISOString(),
      messages: nextMessages,
      sections: createSections(nextSectionId).map((section) => ({
        ...section,
        status:
          section.id === nextSectionId
            ? "current"
            : SECTION_ORDER.indexOf(section.id) < SECTION_ORDER.indexOf(nextSectionId)
              ? "complete"
              : "upcoming",
      })),
    };
  }

  function extractSummary(session) {
    const userTexts = session.messages
      .filter((message) => message.role === "user")
      .map((message) => message.content);
    const combined = userTexts.join(" ");
    const clauses = combined
      .split(/[\n.!?]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    const responsibilities = unique(
      clauses.filter((clause) =>
        /\b(urgence|planning|technicien|devis|atelier|client|fournisseur|schedule|technician|quote|supplier|customer|workshop)\b/i.test(
          clause,
        ),
      ),
    ).slice(0, 5);

    const issues = unique(
      clauses.filter((clause) =>
        /\b(problème|panne|erreur|incomplète|incomplet|délai|risque|issue|error|failure|delay|uncertain|incomplete)\b/i.test(
          clause,
        ),
      ),
    ).slice(0, 5);

    const tools = unique(
      clauses.filter((clause) =>
        /\b(erp|excel|mail|boîte|dossier|réseau|shared|folder|mailbox|spreadsheet|contact|fournisseur|supplier)\b/i.test(
          clause,
        ),
      ),
    ).slice(0, 5);

    const contacts = unique(
      clauses
        .filter((clause) =>
          /\b(fournisseur|commercial|client|technicien|supplier|sales|customer|technician)\b/i.test(clause),
        )
        .map(compactSentence),
    ).slice(0, 4);

    const gaps = [];
    if (!combined.match(/\b(réseau|dossier|shared|folder|mailbox|boîte)\b/i)) {
      gaps.push(
        appState.language === "fr"
          ? "Préciser où se trouvent les dossiers et fichiers critiques."
          : "Clarify where critical folders and files are stored.",
      );
    }
    if (!combined.match(/\b(d’abord|ensuite|puis|first|then|after)\b/i)) {
      gaps.push(
        appState.language === "fr"
          ? "Documenter plus précisément les étapes et les contrôles."
          : "Document the detailed steps and checks more precisely.",
      );
    }
    if (!combined.match(/\b(appeler|contacter|call|contact)\b/i)) {
      gaps.push(
        appState.language === "fr"
          ? "Nommer les contacts à appeler quand une machine client est immobilisée."
          : "Name the people to call when a customer machine is down.",
      );
    }

    return {
      mainRole: session.roleTitle,
      responsibilities,
      issues,
      tools,
      gaps,
      contacts,
      overallStatus:
        gaps.length === 0
          ? "strong"
          : session.completionPercent >= 60
            ? "partial"
            : "needs clarification",
    };
  }

  function generateDocument(session) {
    const summary = extractSummary(session);
    const roleText =
      appState.language === "fr"
        ? `Le responsable atelier reçoit les demandes urgentes, arbitre la charge réelle de l’atelier et évite d’engager un technicien ou un délai client sur un dossier encore trop faible.`
        : `The workshop manager receives urgent requests, protects the real workshop load, and avoids committing technician time or customer lead times on files that are still too weak.`;

    const proceduresText = summary.responsibilities.length
      ? summary.responsibilities
          .map((item, index) => `${index + 1}. ${compactSentence(item)}`)
          .join("\n")
      : appState.language === "fr"
        ? "1. Recevoir la demande\n2. Vérifier si le dossier est exploitable\n3. Confirmer pièces, charge atelier et risque devis"
        : "1. Receive the request\n2. Check whether the file is workable\n3. Confirm parts, workshop load, and quote risk";

    const troubleshootingText = summary.issues.length
      ? summary.issues
          .map((item) =>
            [
              `- ${compactSentence(item)}`,
              appState.language === "fr"
                ? "  Signes : information incomplète, pression client, délai déjà annoncé, ou pièce critique non confirmée."
                : "  Signs: incomplete information, customer pressure, pre-sold lead time, or an unconfirmed critical part.",
              appState.language === "fr"
                ? "  Premier contrôle : vérifier fiche atelier, historique ERP, disponibilité pièces et personne à rappeler."
                : "  First check: review the workshop file, ERP history, parts availability, and who needs to be called back.",
            ].join("\n"),
          )
          .join("\n\n")
      : "";

    const toolsText = summary.tools.length
      ? summary.tools
          .map((item) => `- ${compactSentence(item)}`)
          .join("\n")
      : appState.language === "fr"
        ? "- ERP atelier\n- Mail partagé\n- Dossiers réseau"
        : "- Workshop ERP\n- Shared mailbox\n- Network folders";

    const openQuestions = unique(summary.gaps).slice(0, 4);

    const sections = [
      {
        id: "role-overview",
        title: dictionary().roleOverview,
        status: summary.overallStatus,
        editableText: roleText,
        fields: [
          {
            key: appState.language === "fr" ? "Poste" : "Role",
            value: session.roleTitle,
          },
          {
            key: appState.language === "fr" ? "Responsabilités clés" : "Key responsibilities",
            value: summary.responsibilities.length
              ? summary.responsibilities.map(compactSentence)
              : [roleText],
          },
          {
            key: appState.language === "fr" ? "Arbitrages" : "Decision logic",
            value:
              appState.language === "fr"
                ? "Trier les vraies urgences, protéger le planning engagé, et stopper la promesse client quand le risque pièces ou devis devient trop flou."
                : "Sort real urgencies, protect committed workshop time, and stop customer promises when parts or quote risk becomes too unclear.",
          },
        ],
      },
      {
        id: "procedures",
        title: dictionary().procedures,
        status: summary.responsibilities.length >= 3 ? "strong" : "partial",
        editableText: proceduresText,
        fields: [
          {
            key: appState.language === "fr" ? "Séquence type" : "Typical sequence",
            value: proceduresText.split("\n"),
          },
          {
            key: appState.language === "fr" ? "Point d’arrêt" : "Stop point",
            value:
              appState.language === "fr"
                ? "Arrêter la promesse si la machine n’est pas diagnostiquée, si la pièce critique n’est pas confirmée, ou si le devis reste trop instable."
                : "Stop the promise if the machine is not diagnosed, the critical part is not confirmed, or the quote is still too unstable.",
          },
        ],
      },
      {
        id: "troubleshooting",
        title: dictionary().troubleshooting,
        status: summary.issues.length >= 2 ? "strong" : "partial",
        editableText: troubleshootingText,
        fields: [
          {
            key: appState.language === "fr" ? "Cas fréquents" : "Frequent cases",
            value: summary.issues.length
              ? summary.issues.map(compactSentence)
              : [
                  appState.language === "fr"
                    ? "Fiches atelier incomplètes"
                    : "Incomplete workshop job sheets",
                ],
          },
          {
            key: appState.language === "fr" ? "Premiers contrôles" : "First checks",
            value:
              appState.language === "fr"
                ? "Fiche atelier, historique ERP, photos, pression client réelle, statut pièces et personne à rappeler."
                : "Workshop sheet, ERP history, photos, real customer pressure, parts status, and who must be called back.",
          },
        ],
      },
      {
        id: "tools-files-contacts",
        title: dictionary().toolsFilesContacts,
        status: summary.tools.length >= 2 ? "strong" : "partial",
        editableText: toolsText,
        fields: [
          {
            key: appState.language === "fr" ? "Outils repérés" : "Detected tools",
            value: summary.tools.length ? summary.tools.map(compactSentence) : [toolsText],
          },
          {
            key: appState.language === "fr" ? "Contacts" : "Contacts",
            value: summary.contacts.length ? summary.contacts : [dictionary().noContacts],
          },
          {
            key: appState.language === "fr" ? "Risque si l’info manque" : "Risk if missing",
            value:
              appState.language === "fr"
                ? "Perdre du temps en diagnostic, relancer trop tard le fournisseur, ou annoncer un délai irréaliste au client."
                : "Lose diagnosis time, chase suppliers too late, or give the customer an unrealistic lead time.",
          },
        ],
      },
      {
        id: "open-questions",
        title: dictionary().openQuestions,
        status: openQuestions.length === 0 ? "strong" : "needs clarification",
        editableText: openQuestions.join("\n"),
        fields: [
          {
            key: appState.language === "fr" ? "À préciser" : "Needs clarification",
            value: openQuestions.length
              ? openQuestions
              : [
                  appState.language === "fr"
                    ? "Aucune question ouverte prioritaire."
                    : "No priority open question.",
                ],
          },
        ],
      },
    ];

    return {
      id: createId(),
      sessionId: session.id,
      title: dictionary().docTitle,
      subtitle: `${session.firstName} ${session.lastName}`.trim(),
      updatedAt: new Date().toISOString(),
      sessionSummary: summary,
      sections,
    };
  }

  function compactSentence(value) {
    if (!value) return "";
    return value.replace(/\s+/g, " ").trim().replace(/^[a-zà-ÿ]/, (m) => m.toUpperCase());
  }

  function unique(values) {
    const result = [];
    values.forEach((value) => {
      const cleaned = compactSentence(value);
      if (cleaned && !result.includes(cleaned)) {
        result.push(cleaned);
      }
    });
    return result;
  }

  function ensureManagerDemo() {
    if (appState.sessions.length > 0) {
      appState.showDemoNotice = appState.sessions.every((item) => item.source === "sample");
      return;
    }

    const sample = seedSampleSession(appState.language);
    appState.sessions = [sample];
    appState.documents = [generateDocument(sample)];
    appState.showDemoNotice = true;
    persist();
  }

  function initializeSpeech() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    appState.speech.supported = Boolean(Recognition);

    if (!Recognition) {
      appState.speech.status = "unavailable";
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = appState.language === "fr" ? "fr-FR" : "en-AU";
    recognition.onstart = function () {
      appState.speech.listening = true;
      appState.speech.status = "listening";
      render();
    };
    recognition.onend = function () {
      appState.speech.listening = false;
      if (appState.speech.status !== "denied" && appState.speech.status !== "error") {
        appState.speech.status = "stopped";
      }
      render();
    };
    recognition.onerror = function (event) {
      appState.speech.listening = false;
      appState.speech.status =
        event.error === "not-allowed" || event.error === "service-not-allowed"
          ? "denied"
          : "error";
      render();
    };
    recognition.onresult = function (event) {
      let transcript = "";
      for (let index = 0; index < event.results.length; index += 1) {
        transcript += `${event.results[index][0].transcript} `;
      }

      const clean = transcript.replace(/\s+/g, " ").trim();
      const base = appState.speech.transcriptBase.trim();
      appState.draftAnswer = clean ? (base ? `${base}\n${clean}` : clean) : base;
      patchTextareaValue();
    };

    appState.speech.recognition = recognition;
    appState.speech.status = "idle";
  }

  function patchTextareaValue() {
    const textarea = document.querySelector("#answer-input");
    if (textarea && textarea.value !== appState.draftAnswer) {
      textarea.value = appState.draftAnswer;
    }
  }

  function stopSpeechIfNeeded() {
    if (appState.speech.recognition && appState.speech.listening) {
      appState.speech.recognition.stop();
    }
  }

  function resetSpeechForLanguage() {
    stopSpeechIfNeeded();
    initializeSpeech();
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function nl2br(value) {
    return escapeHtml(value).replace(/\n/g, "<br />");
  }

  function render() {
    document.documentElement.lang = appState.language;
    const route = getRoute();
    const root = document.getElementById("app");
    root.innerHTML = `<div class="shell">${renderView(route)}</div>`;
    bindCommonEvents();
    bindViewEvents(route);
  }

  function renderView(route) {
    switch (route.name) {
      case "interview":
        return renderInterview(route);
      case "manager":
        return renderManager(route);
      case "home":
      default:
        return renderHome();
    }
  }

  function renderLanguageToggle(compact) {
    const copy = dictionary();
    return `
      <div class="${compact ? "language-switch" : "language-switch"}">
        <button class="language-pill ${appState.language === "fr" ? "active" : ""}" data-action="set-language" data-language="fr">${copy.languageFr}</button>
        <button class="language-pill ${appState.language === "en" ? "active" : ""}" data-action="set-language" data-language="en">${copy.languageEn}</button>
      </div>
    `;
  }

  function renderHome() {
    const copy = dictionary();
    return `
      <div class="page-stack">
        <div class="topbar">
          <div>
            <p class="eyebrow">${copy.landingEyebrow}</p>
            <p class="app-name">${copy.appName}</p>
          </div>
          ${renderLanguageToggle(false)}
        </div>
        <div>
          <h1 class="title">${copy.landingTitle}</h1>
          <p class="subtitle">${copy.landingSubtitle}</p>
          <div class="hero-grid">
            <section class="card">
              <p class="eyebrow">${copy.interviewArea}</p>
              <p class="card-text" style="margin-top:14px;font-size:19px;">${copy.interviewSurface}</p>
              <div class="card-actions" style="margin-top:22px;">
                <button class="button full" data-action="go-interview">${copy.startInterview}</button>
              </div>
            </section>
            <section class="card">
              <p class="eyebrow">${copy.managerArea}</p>
              <p class="card-text" style="margin-top:14px;font-size:19px;">${copy.managerSurface}</p>
              <div class="card-actions" style="margin-top:22px;">
                <button class="button-secondary full" data-action="go-manager">${copy.openManager}</button>
              </div>
            </section>
          </div>
        </div>
      </div>
    `;
  }

  function renderInterview(route) {
    const copy = dictionary();
    const session = route.sessionId ? getSessionById(route.sessionId) : getActiveSession();

    if (!session) {
      return `
        <div class="page-stack">
          <div class="split-topbar">
            <div>
              <a href="${routeLabels.home}" class="small-link">${copy.backHome}</a>
              <p class="eyebrow" style="margin-top:12px;">${copy.interviewArea}</p>
            </div>
            ${renderLanguageToggle(true)}
          </div>
          <section class="card" style="max-width:760px;">
            <p class="eyebrow">${copy.startTitle}</p>
            <div style="margin-top:22px;" class="field-grid">
              <div>
                <label class="label" for="first-name">${copy.firstName}</label>
                <input id="first-name" class="field" />
              </div>
              <div>
                <label class="label" for="last-name">${copy.lastName}</label>
                <input id="last-name" class="field" />
              </div>
            </div>
            <div class="card-actions" style="margin-top:22px;">
              <button class="button" data-action="start-interview">${copy.begin}</button>
            </div>
          </section>
        </div>
      `;
    }

    const activeQuestion = [...session.messages].reverse().find((item) => item.role === "assistant");
    const latestUser = [...session.messages].reverse().find((item) => item.role === "user");
    const nextSection = SECTION_ORDER[SECTION_ORDER.indexOf(session.currentSectionId) + 1] || null;
    const hints = getInterviewHints(session.currentSectionId);

    return `
      <div class="page-stack">
        <div class="split-topbar">
          <div>
            <a href="${routeLabels.home}" class="small-link">${copy.backHome}</a>
            <p class="eyebrow" style="margin-top:12px;">${copy.interviewArea}</p>
            <p class="helper-note" style="margin-top:10px;">${copy.captureNote}</p>
          </div>
          ${renderLanguageToggle(true)}
        </div>
        <div class="two-col">
          <div class="stack">
            <div class="section-tracker">
              ${session.sections
                .map(
                  (section) => `<span class="tracker-pill ${section.status}">${escapeHtml(
                    getSectionTitle(section.id),
                  )}</span>`,
                )
                .join("")}
            </div>
            <section class="question-card">
              <p class="eyebrow">${copy.currentQuestion}</p>
              <h1 class="question-title" style="margin-top:18px;">${escapeHtml(
                activeQuestion ? activeQuestion.content : getSectionQuestion(session.currentSectionId),
              )}</h1>
              ${
                latestUser
                  ? `<div style="margin-top:22px;">
                      <p class="label">${copy.latestResponse}</p>
                      <div class="bubble user">${nl2br(latestUser.content)}</div>
                    </div>`
                  : ""
              }
            </section>
            <section class="panel">
              <div class="mode-row" style="justify-content:space-between;align-items:center;">
                <label class="label" for="answer-input" style="margin:0;">${copy.yourAnswer}</label>
                <div class="mode-row" style="align-items:center;">
                  <span class="helper-note">${copy.answerMode}</span>
                  <div class="mode-switch">
                    <button class="mode-pill ${appState.answerMode === "type" ? "active" : ""}" data-action="answer-mode" data-mode="type">${copy.typeResponse}</button>
                    <button class="mode-pill ${appState.answerMode === "speak" ? "active" : ""}" data-action="answer-mode" data-mode="speak">${copy.speakResponse}</button>
                  </div>
                </div>
              </div>
              ${
                appState.answerMode === "speak"
                  ? `<div class="microphone-row" style="margin-top:16px;">
                      <div class="inline-actions" style="align-items:center;">
                        <button class="${appState.speech.listening ? "button" : "button-secondary"}" data-action="toggle-microphone">
                          ${appState.speech.listening ? copy.stopMicrophone : copy.startMicrophone}
                        </button>
                        <span class="dot ${appState.speech.listening ? "live" : ""}"></span>
                      </div>
                      <p class="helper-note">${getSpeechStatusLabel()}</p>
                    </div>`
                  : ""
              }
              <div style="margin-top:16px;">
                <textarea id="answer-input" class="textarea" placeholder="${escapeHtml(
                  appState.answerMode === "speak" ? copy.speechHint : copy.answerPlaceholder,
                )}">${escapeHtml(appState.draftAnswer)}</textarea>
              </div>
              <div class="split-line" style="margin-top:16px;">
                <p class="helper-note">${copy.submitHint}</p>
                <div class="button-row">
                  <button class="button-secondary" data-action="reset-session">${copy.reset}</button>
                  <button class="button" data-action="submit-answer">${copy.sendAnswer}</button>
                </div>
              </div>
            </section>
            <div class="hint-row">
              ${hints.map((hint) => `<span class="hint-chip">${escapeHtml(hint)}</span>`).join("")}
            </div>
          </div>
          <aside class="stack">
            <section class="panel">
              <p class="eyebrow">${copy.progress}</p>
              <div class="progress-meter" style="margin-top:14px;"><span style="width:${Math.max(
                6,
                session.completionPercent,
              )}%;"></span></div>
              <div class="stats-grid" style="margin-top:18px;">
                <div class="stat">
                  <span class="helper-note">${copy.progress}</span>
                  <strong>${session.completionPercent}%</strong>
                </div>
                <div class="stat">
                  <span class="helper-note">${copy.currentFocus}</span>
                  <strong style="font-size:18px;">${escapeHtml(
                    getSectionTitle(session.currentSectionId),
                  )}</strong>
                </div>
                <div class="stat">
                  <span class="helper-note">${copy.nextStep}</span>
                  <strong style="font-size:18px;">${escapeHtml(
                    nextSection ? getSectionTitle(nextSection) : copy.finishInterview,
                  )}</strong>
                </div>
              </div>
              <div class="button-row" style="margin-top:18px;">
                <button class="button full" data-action="finish-interview">${copy.finishInterview}</button>
              </div>
              <p class="footer-note">${copy.saveNotice}</p>
            </section>
          </aside>
        </div>
      </div>
    `;
  }

  function renderManager(route) {
    const copy = dictionary();
    ensureManagerDemo();
    const session = route.sessionId ? getSessionById(route.sessionId) : null;

    if (!session) {
      const items = [...appState.sessions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      return `
        <div class="page-stack">
          <div class="document-header">
            <div>
              <p class="eyebrow">${copy.managerArea}</p>
              <h1 class="section-title" style="margin-top:14px;font-size:52px;">${copy.managerTitle}</h1>
              <p class="subtitle" style="font-size:22px;margin-top:14px;">${copy.managerSubtitle}</p>
            </div>
            <div class="header-actions">
              ${renderLanguageToggle(false)}
              <a class="button-subtle" href="${routeLabels.home}">${copy.backHome}</a>
            </div>
          </div>
          ${
            appState.showDemoNotice
              ? `<div class="demo-note"><strong>${copy.demoLoaded}</strong><div class="helper-note" style="margin-top:8px;">${copy.demoBody}</div></div>`
              : ""
          }
          <div class="dashboard-list">
            ${
              items.length
                ? items
                    .map((item) => {
                      const doneSections = item.sections.filter((section) => section.status === "complete").length;
                      const statusLabel =
                        item.completionPercent >= 100
                          ? copy.statusDone
                          : item.answeredPromptCount > 0
                            ? copy.statusProgress
                            : copy.statusNotStarted;
                      return `
                        <button class="list-item" data-action="open-document" data-session-id="${item.id}">
                          <div class="split-line">
                            <div>
                              <h2 class="card-title">${escapeHtml(
                                `${item.firstName} ${item.lastName}`.trim() || item.roleTitle,
                              )}</h2>
                              <p class="card-text" style="margin-top:8px;">${escapeHtml(item.roleTitle)}</p>
                            </div>
                            <span class="status-pill">${statusLabel}</span>
                          </div>
                          <div class="list-metrics">
                            <div class="stat">
                              <span class="helper-note">${copy.progressLabel}</span>
                              <strong>${item.completionPercent}%</strong>
                            </div>
                            <div class="stat">
                              <span class="helper-note">${copy.sectionsDone}</span>
                              <strong>${doneSections}/${item.sections.length}</strong>
                            </div>
                            <div class="stat">
                              <span class="helper-note">${copy.lastUpdated}</span>
                              <strong style="font-size:18px;">${escapeHtml(formatDate(item.updatedAt))}</strong>
                            </div>
                            <div class="stat">
                              <span class="helper-note">${copy.openFile}</span>
                              <strong style="font-size:18px;">→</strong>
                            </div>
                          </div>
                        </button>
                      `;
                    })
                    .join("")
                : `<div class="empty-state card"><p>${copy.managerEmpty}</p><div class="card-actions" style="justify-content:center;margin-top:16px;"><button class="button" data-action="load-sample">${copy.managerEmptyAction}</button></div></div>`
            }
          </div>
        </div>
      `;
    }

    const document = loadDocument(session.id) || generateDocument(session);
    saveDocument(document);
    const activeSectionId = appState.currentDocId && document.sections.some((item) => item.id === appState.currentDocId)
      ? appState.currentDocId
      : document.sections[0].id;
    appState.currentDocId = activeSectionId;
    const activeSection = document.sections.find((item) => item.id === activeSectionId);

    return `
      <div class="page-stack">
        <div class="document-header">
          <div>
            <p class="eyebrow">${copy.managerArea}</p>
            <h1 class="section-title" style="margin-top:14px;font-size:52px;">${copy.docTitle}</h1>
            <p class="subtitle" style="font-size:22px;margin-top:14px;">${escapeHtml(
              `${session.firstName} ${session.lastName}`.trim() || document.subtitle,
            )}</p>
            <p class="helper-note" style="margin-top:8px;">${copy.docSubtitle}</p>
          </div>
          <div class="header-actions">
            ${renderLanguageToggle(false)}
            <a class="button-subtle" href="${routeLabels.home}">${copy.backHome}</a>
            <a class="button-subtle" href="${routeLabels.manager}">${copy.backToDashboard}</a>
            <button class="button" data-action="export-pdf">${copy.exportPdf}</button>
          </div>
        </div>
        <div class="doc-layout">
          <aside class="stack">
            <section class="panel">
              <p class="eyebrow">${copy.sessionSummary}</p>
              <h2 class="section-title" style="margin-top:14px;">${escapeHtml(document.sessionSummary.mainRole)}</h2>
              <div class="stats-grid" style="margin-top:16px;">
                <div class="stat"><span class="helper-note">${copy.responsibilities}</span><strong>${document.sessionSummary.responsibilities.length}</strong></div>
                <div class="stat"><span class="helper-note">${copy.issues}</span><strong>${document.sessionSummary.issues.length}</strong></div>
                <div class="stat"><span class="helper-note">${copy.tools}</span><strong>${document.sessionSummary.tools.length}</strong></div>
              </div>
              <div class="document-field">
                <p class="doc-key">${copy.keyContacts}</p>
                <p class="doc-value">${escapeHtml(
                  document.sessionSummary.contacts.length
                    ? document.sessionSummary.contacts.join(", ")
                    : copy.noContacts,
                )}</p>
              </div>
            </section>
            <section class="panel">
              <p class="eyebrow">${copy.people}</p>
              <div class="section-nav" style="margin-top:14px;">
                ${document.sections
                  .map(
                    (section) => `
                      <button class="nav-item ${section.id === activeSection.id ? "active" : ""}" data-action="open-doc-section" data-section-id="${section.id}">
                        <span>${escapeHtml(section.title)}</span>
                        <span>${escapeHtml(getConfidenceLabel(section.status))}</span>
                      </button>`,
                  )
                  .join("")}
              </div>
            </section>
          </aside>
          <section class="section-card">
            <p class="eyebrow">${escapeHtml(getConfidenceLabel(activeSection.status))}</p>
            <h2 class="section-title" style="margin-top:14px;">${escapeHtml(activeSection.title)}</h2>
            ${activeSection.fields
              .map((field) => {
                const content = Array.isArray(field.value)
                  ? `<ul class="doc-list">${field.value.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
                  : `<p class="doc-value">${escapeHtml(field.value)}</p>`;
                return `<div class="document-field"><p class="doc-key">${escapeHtml(field.key)}</p>${content}</div>`;
              })
              .join("")}
            <div class="document-field">
              <p class="doc-key">${copy.editableDraft}</p>
              <p class="helper-note" style="margin-bottom:12px;">${copy.editableHelp}</p>
              <textarea class="textarea doc-text" id="doc-edit">${escapeHtml(activeSection.editableText || "")}</textarea>
            </div>
          </section>
        </div>
      </div>
    `;
  }

  function getConfidenceLabel(status) {
    const copy = dictionary();
    switch (status) {
      case "strong":
        return copy.confidenceStrong;
      case "partial":
        return copy.confidencePartial;
      default:
        return copy.confidenceNeeds;
    }
  }

  function getInterviewHints(sectionId) {
    if (appState.language === "fr") {
      switch (sectionId) {
        case "role-overview":
          return ["Expliquez le poste simplement", "Donnez un exemple réel"];
        case "recurring-responsibilities":
          return ["Dites ce qui revient souvent", "Mentionnez ce qui déclenche l’action"];
        case "step-by-step-tasks":
          return ["Décrivez les étapes", "Ajoutez les contrôles avant de promettre"];
        case "problem-solving":
          return ["Parlez des signaux d’alerte", "Dites ce que vous vérifiez d’abord"];
        case "tools-files-contacts":
          return ["Précisez où c’est stocké", "Dites qui dépend de cette information"];
        default:
          return ["Ce qu’un remplaçant doit comprendre", "Ce qui ne s’apprend qu’avec l’expérience"];
      }
    }

    switch (sectionId) {
      case "role-overview":
        return ["Explain the role simply", "Give a real example"];
      case "recurring-responsibilities":
        return ["Say what comes back often", "Mention what triggers the work"];
      case "step-by-step-tasks":
        return ["Describe the steps", "Add the checks before committing"];
      case "problem-solving":
        return ["Talk about warning signs", "Say what you check first"];
      case "tools-files-contacts":
        return ["Be specific about location", "Say who depends on it"];
      default:
        return ["What a replacement must understand", "What only comes with experience"];
    }
  }

  function getSpeechStatusLabel() {
    const copy = dictionary();
    switch (appState.speech.status) {
      case "listening":
        return copy.speechListening;
      case "stopped":
        return copy.speechStopped;
      case "unavailable":
        return copy.speechUnavailable;
      case "denied":
        return copy.speechDenied;
      case "error":
        return copy.speechError;
      default:
        return copy.speechHint;
    }
  }

  function bindCommonEvents() {
    document.querySelectorAll("[data-action='set-language']").forEach((button) => {
      button.addEventListener("click", () => {
        const nextLanguage = button.getAttribute("data-language");
        if (nextLanguage !== "fr" && nextLanguage !== "en") {
          return;
        }

        appState.language = nextLanguage;
        resetSpeechForLanguage();
        persist();
        render();
      });
    });

    document.querySelectorAll("[data-action='go-interview']").forEach((button) => {
      button.addEventListener("click", () => {
        appState.activeSessionId = null;
        appState.draftAnswer = "";
        persist();
        setHash(routeLabels.interview);
      });
    });

    document.querySelectorAll("[data-action='go-manager']").forEach((button) => {
      button.addEventListener("click", () => setHash(routeLabels.manager));
    });
  }

  function bindViewEvents(route) {
    if (route.name === "interview") {
      bindInterviewEvents(route);
    }

    if (route.name === "manager") {
      bindManagerEvents(route);
    }
  }

  function bindInterviewEvents(route) {
    const startButton = document.querySelector("[data-action='start-interview']");
    if (startButton) {
      startButton.addEventListener("click", () => {
        const firstName = document.getElementById("first-name").value.trim();
        const lastName = document.getElementById("last-name").value.trim();
        const session = createBlankSession(firstName, lastName);
        saveSession(session);
        saveDocument(generateDocument(session));
        appState.draftAnswer = "";
        setHash(`#/interview/${session.id}`);
      });
      return;
    }

    const session = route.sessionId ? getSessionById(route.sessionId) : getActiveSession();
    const textarea = document.getElementById("answer-input");
    if (textarea) {
      textarea.addEventListener("input", (event) => {
        appState.draftAnswer = event.target.value;
      });
      textarea.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          submitCurrentAnswer(session);
        }
      });
    }

    document.querySelectorAll("[data-action='answer-mode']").forEach((button) => {
      button.addEventListener("click", () => {
        appState.answerMode = button.getAttribute("data-mode") === "speak" ? "speak" : "type";
        if (appState.answerMode === "type") {
          stopSpeechIfNeeded();
        }
        render();
      });
    });

    const micButton = document.querySelector("[data-action='toggle-microphone']");
    if (micButton) {
      micButton.addEventListener("click", () => {
        if (!appState.speech.supported || !appState.speech.recognition) {
          appState.speech.status = "unavailable";
          render();
          return;
        }

        if (appState.speech.listening) {
          appState.speech.recognition.stop();
          return;
        }

        appState.speech.transcriptBase = appState.draftAnswer.trim();
        appState.speech.recognition.lang = appState.language === "fr" ? "fr-FR" : "en-AU";
        try {
          appState.speech.recognition.start();
        } catch {
          appState.speech.status = "error";
          render();
        }
      });
    }

    document.querySelectorAll("[data-action='submit-answer']").forEach((button) => {
      button.addEventListener("click", () => submitCurrentAnswer(session));
    });

    document.querySelectorAll("[data-action='reset-session']").forEach((button) => {
      button.addEventListener("click", () => {
        if (!session) return;
        const nextSession = createBlankSession(session.firstName, session.lastName);
        nextSession.id = session.id;
        saveSession(nextSession);
        removeDocument(session.id);
        saveDocument(generateDocument(nextSession));
        appState.draftAnswer = "";
        render();
      });
    });

    document.querySelectorAll("[data-action='finish-interview']").forEach((button) => {
      button.addEventListener("click", () => {
        if (!session) return;
        const finalDocument = generateDocument(session);
        saveDocument(finalDocument);
        appState.activeSessionId = null;
        appState.draftAnswer = "";
        persist();
        setHash(routeLabels.home);
      });
    });
  }

  function submitCurrentAnswer(session) {
    if (!session) {
      return;
    }

    const value = appState.draftAnswer.trim();
    if (!value) {
      return;
    }

    stopSpeechIfNeeded();
    const nextSession = advanceInterview(session, value);
    saveSession(nextSession);
    saveDocument(generateDocument(nextSession));
    appState.draftAnswer = "";
    render();
  }

  function bindManagerEvents(route) {
    document.querySelectorAll("[data-action='load-sample']").forEach((button) => {
      button.addEventListener("click", () => {
        const sample = seedSampleSession(appState.language);
        saveSession(sample, false);
        saveDocument(generateDocument(sample));
        appState.showDemoNotice = true;
        render();
      });
    });

    document.querySelectorAll("[data-action='open-document']").forEach((button) => {
      button.addEventListener("click", () => {
        const sessionId = button.getAttribute("data-session-id");
        if (sessionId) {
          setHash(`#/manager/${sessionId}`);
        }
      });
    });

    document.querySelectorAll("[data-action='open-doc-section']").forEach((button) => {
      button.addEventListener("click", () => {
        const sectionId = button.getAttribute("data-section-id");
        if (sectionId) {
          appState.currentDocId = sectionId;
          render();
        }
      });
    });

    document.querySelectorAll("[data-action='export-pdf']").forEach((button) => {
      button.addEventListener("click", () => window.print());
    });

    const docEdit = document.getElementById("doc-edit");
    if (docEdit && route.sessionId) {
      docEdit.addEventListener("input", (event) => {
        const sessionId = route.sessionId;
        const document = loadDocument(sessionId);
        if (!document) return;

        document.updatedAt = new Date().toISOString();
        document.sections = document.sections.map((section) =>
          section.id === appState.currentDocId
            ? { ...section, editableText: event.target.value }
            : section,
        );
        saveDocument(document);
      });
    }
  }
})();
