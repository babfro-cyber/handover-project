(function () {
  const STORAGE_KEYS = {
    language: "knowledge-capture.static.language",
    activeSessionId: "knowledge-capture.static.active-session",
    sessions: "knowledge-capture.static.sessions",
    documents: "knowledge-capture.static.documents",
    demoVersion: "knowledge-capture.static.demo-version",
    managerTokens: "knowledge-capture.static.manager-tokens",
  };

  const DEMO_VERSION = "cockpit-v9";

  const SECTION_ORDER = [
    "drilled-block-design",
    "schematics-client-need",
    "material-choices",
    "pressure-safety",
    "surface-treatments",
    "hydraulic-components",
    "leak-diagnosis",
    "troubleshooting-order",
    "machining-feasibility",
    "frequent-errors",
    "weak-signals",
    "customer-cases",
    "experience-transfer",
  ];

  const routeLabels = {
    home: "#/",
    interview: "#/interview",
    manager: "#/manager",
  };

  const SUPABASE_CDN_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
  const AUDIO_MIME_CANDIDATES = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/mpeg",
    "audio/wav",
  ];

  const dictionaries = {
    fr: {
      appName: "NumerHyd",
      landingEyebrow: "Démo UX",
      landingTitle: "NumerHyd — Capture d’expertise hydraulique",
      landingSubtitle:
        "Un dictaphone métier qui aide un expert senior à transmettre ses diagnostics, ses réflexes terrain et ses cas clients.",
      interviewSurface: "Une question à la fois, une réponse orale, une transcription corrigible.",
      managerSurface: "Créer un entretien technique, suivre la progression et relire les fiches d’expertise.",
      startInterview: "Commencer un entretien technique",
      openManager: "Accéder au pilotage NumerHyd",
      interviewLinkHint: "Lien de démonstration discret pour vérifier le parcours cédant.",
      manualInterview: "Prévisualiser le parcours expert",
      backHome: "Retour à l’accueil",
      languageFr: "Français",
      languageEn: "English",
      interviewArea: "Entretien technique",
      managerArea: "Pilotage NumerHyd",
      captureNote: "Vous pouvez faire cet entretien en plusieurs fois. Vos réponses sont sauvegardées automatiquement.",
      resumeNotice: "Vous reprenez là où vous vous étiez arrêté.",
      expertIntroTitle: "Entretien de transmission technique",
      expertIntroBody:
        "Cet entretien sert à transmettre votre expertise technique. Vous pouvez parler naturellement, corriger le texte si besoin, faire une pause à tout moment et reprendre plus tard.",
      expertIntroReassurance: "Il n’est pas nécessaire de tout faire en une seule fois.",
      startExpertInterview: "Commencer l’entretien",
      resumeExpertInterview: "Reprendre l’entretien",
      pauseSavedTitle: "Vos réponses ont été sauvegardées.",
      pauseSavedBody: "Vous pourrez reprendre cet entretien plus tard avec le même lien.",
      resumeNow: "Reprendre maintenant",
      questionCount: "Question",
      themeLabel: "Thème",
      micRecording: "Enregistrement en cours…",
      micStopped: "Arrêté",
      managerLinkHelp: "Envoyez ce lien au cédant. Il arrivera directement dans son entretien, sans passer par l’espace NumerHyd.",
      testExpertPath: "Prévisualiser le parcours expert",
      viewExpertiseSheets: "Voir la synthèse",
      subject: "Sujet",
      expertName: "Nom de la personne interviewée",
      createInterview: "Créer un entretien",
      createInterviewTitle: "Nouvel entretien",
      expertiseSubject: "Sujet / expertise",
      profileLabel: "Rôle / profil",
      profileSeller: "Cédant / dirigeant",
      profileWorkshop: "Chef d’atelier",
      profileOther: "Autre",
      topicsLabel: "Sujets à aborder",
      allTopics: "Tous les thèmes",
      selectedTopics: "thèmes sélectionnés",
      optionalContext: "Contexte optionnel",
      optionalContextPlaceholder: "Exemple : départ à la retraite, domaine prioritaire, points à couvrir...",
      createAndShowLink: "Créer et afficher le lien",
      createdLinkTitle: "Lien prêt à envoyer",
      createdLinkHelp: "Envoyez ce lien à la personne concernée. Elle arrivera directement dans son entretien.",
      cancel: "Annuler",
      answeredQuestions: "questions répondues",
      topicsCovered: "thèmes abordés",
      topicsRemaining: "thèmes restants",
      totalTime: "temps total passé",
      sessionsCount: "sessions",
      expertiseSheetsArea: "Fiches d’expertise technique",
      expertiseSheetsIntro: "Consultez les connaissances capturées, organisées par thème.",
      learned: "Ce qu’on a appris",
      qa: "Questions / réponses",
      keyPoints: "Points clés",
      sources: "Sources",
      notCovered: "Ce thème n’a pas encore été abordé.",
      statusPaused: "En pause",
      statusPartial: "Partiellement transmis",
      continueLater: "Continuer plus tard",
      partialSubmitTitle: "Vous n’avez pas encore répondu à toutes les questions",
      partialSubmitBody: "Vous pouvez continuer l’entretien plus tard, ou transmettre maintenant les réponses déjà enregistrées.",
      submitPartial: "Transmettre mes réponses maintenant",
      completedThanksTitle: "Merci, l’entretien est terminé.",
      completedThanksBody: "Vos réponses ont été transmises. Gatien pourra les relire dans l’espace NumerHyd.",
      partialThanksTitle: "Merci, vos réponses ont été transmises.",
      partialThanksBody: "L’entretien est partiel, mais les réponses déjà enregistrées restent utiles et consultables.",
      localDemoNotice: "Démo locale : la reprise fonctionne sur ce navigateur. Le lien multi-appareil viendra en Phase 2.",
      firstName: "Prénom",
      lastName: "Nom",
      begin: "Démarrer l’entretien",
      currentQuestion: "Question en cours",
      yourAnswer: "Votre réponse",
      answerPlaceholder: "Parlez naturellement. Vous pourrez corriger le texte avant de valider.",
      answerMode: "Mode de réponse",
      typeResponse: "Écrire",
      speakResponse: "Parler",
      startMicrophone: "Démarrer le dictaphone",
      stopMicrophone: "Arrêter le dictaphone",
      speechListening: "Écoute en cours",
      speechStopped: "Dictaphone arrêté",
      speechUnavailable: "La saisie vocale n’est pas disponible dans ce navigateur.",
      speechDenied: "Accès au micro refusé. Vous pouvez continuer par écrit.",
      speechError: "La saisie vocale n’a pas pu démarrer. Vous pouvez continuer par écrit.",
      speechHint: "Parlez, puis corrigez la transcription si nécessaire avant de valider.",
      recordingStatus: "Enregistrement",
      recordingIdle: "Prêt à enregistrer",
      recordingActive: "Enregistrement en cours",
      uploadingAudio: "Audio en cours de sauvegarde",
      transcribingAudio: "Transcription en cours",
      transcriptReady: "Transcription prête. Relisez et corrigez si besoin avant de valider.",
      transcriptionFailed: "La transcription a échoué, mais l’audio est sauvegardé. Vous pouvez continuer par écrit.",
      recordingUnsupported: "L’enregistrement audio n’est pas disponible dans ce navigateur. Vous pouvez continuer par écrit.",
      sendAnswer: "Valider la réponse",
      submitHint: "Le texte reste éditable si la transcription est imparfaite.",
      hintsTitle: "Repères utiles",
      latestResponse: "Dernière réponse",
      progress: "Avancement",
      currentFocus: "Thème en cours",
      nextStep: "Ensuite",
      reset: "Recommencer",
      finishInterview: "Terminer l’entretien",
      pauseInterview: "Faire une pause",
      interviewSteps: "Thèmes de l’entretien",
      noInterviewYet: "Aucun entretien technique en cours",
      startTitle: "Identifier l’expert",
      managerTitle: "Entretiens techniques",
      managerSubtitle: "Suivi simple des captures d’expertise et accès aux fiches générées.",
      managerCreateLink: "Créer un entretien",
      interviewLink: "Lien expert",
      copyLink: "Copier le lien",
      sendInvite: "Envoyer l’invitation",
      invalidTokenTitle: "Lien invalide",
      invalidTokenBody: "Ce lien d’entretien n’est pas reconnu ou n’est plus disponible sur cet appareil.",
      people: "Fiches",
      openFile: "Voir la synthèse",
      progressLabel: "Progression",
      sectionsDone: "thèmes couverts",
      lastUpdated: "Dernière activité",
      statusDone: "Terminé",
      statusProgress: "En cours",
      statusNotStarted: "Non commencé",
      interviewee: "Expert",
      docTitle: "Fiches d’expertise technique",
      docSubtitle: "Relire, corriger et transformer les réponses en capital technique exploitable.",
      backToDashboard: "Retour à la liste",
      exportPdf: "Exporter en PDF",
      sessionSummary: "Synthèse technique",
      responsibilities: "Raisonnements",
      issues: "Risques",
      tools: "Contrôles",
      gaps: "Questions ouvertes",
      keyContacts: "Cas clients",
      noContacts: "Aucun cas client précis n’a encore été repéré.",
      editableDraft: "Fiche éditable",
      editableHelp:
        "Vous pouvez ajuster cette fiche directement. Les modifications restent enregistrées dans ce navigateur.",
      demoLoaded: "Exemple chargé automatiquement",
      demoBody:
        "Aucune donnée locale n’a été trouvée. Un exemple NumerHyd a été chargé pour montrer le rendu côté pilotage.",
      openQuestions: "Questions ouvertes",
      procedures: "Contrôles et vérifications",
      troubleshooting: "Troubleshooting",
      toolsFilesContacts: "Composants, machines et moyens",
      roleOverview: "Synthèse par thème",
      technicalReasoning: "Raisonnements techniques clés",
      customerCases: "Cas clients mentionnés",
      commonMistakes: "Erreurs fréquentes",
      weakSignals: "Signaux faibles",
      goodPractices: "Bonnes pratiques",
      confidenceStrong: "renseigné",
      confidencePartial: "réponse partielle",
      confidenceNeeds: "à compléter",
      saveNotice: "Sauvegardé",
      savedAt: "Sauvegardé à",
      sectionDrilledBlock: "Blocs forés",
      sectionSchematics: "Schémas et besoin client",
      sectionMaterials: "Matériaux",
      sectionPressure: "Pression et sécurité",
      sectionSurface: "Traitements de surface",
      sectionComponents: "Composants hydrauliques",
      sectionLeaks: "Diagnostic de fuites",
      sectionTroubleshooting: "Ordre des vérifications",
      sectionMachining: "Usinage et faisabilité",
      sectionErrors: "Erreurs fréquentes",
      sectionWeakSignals: "Signaux faibles",
      sectionCases: "Cas clients",
      sectionTransfer: "Transmission",
      qDrilledBlock: "Quand vous démarrez la conception d’un bloc foré, par quoi commencez-vous ?",
      qSchematics: "Quand vous lisez un schéma ou un besoin client, qu’est-ce que vous cherchez à comprendre en premier ?",
      qMaterials: "Comment choisissez-vous le matériau d’un bloc ou d’un composant selon l’usage prévu ?",
      qPressure: "Quels contrôles faites-vous pour sécuriser la pression, la résistance et les risques associés ?",
      qSurface: "Dans quels cas recommandez-vous un traitement de surface, et qu’est-ce qui guide votre choix ?",
      qComponents: "Comment choisissez-vous les composants hydrauliques à intégrer dans une solution ?",
      qLeaks: "Quand un client vous dit que ça fuit, quelle est votre première réaction ?",
      qTroubleshooting: "Dans quel ordre faites-vous vos vérifications quand le diagnostic n’est pas évident ?",
      qMachining: "Comment évaluez-vous si une pièce ou un bloc est réellement usinable et industriellement faisable ?",
      qErrors: "Qu’est-ce qu’un débutant aurait tendance à oublier ou à mal interpréter ici ?",
      qWeakSignals: "Quels signes faibles vous mettent en alerte avant que le problème soit évident ?",
      qCases: "Pouvez-vous raconter un cas client atypique qui vous a appris quelque chose d’important ?",
      qTransfer: "Si vous deviez transmettre vos réflexes terrain à quelqu’un, que faudrait-il absolument lui faire comprendre ?",
      followShort: "Pouvez-vous donner plus de détail ou un exemple concret ?",
      followAmbiguous: "Dans quel cas changeriez-vous d’avis ?",
      followTask: "Qu’est-ce que vous vérifiez en premier dans ce cas ?",
      followProblem: "Comment savez-vous que le problème vient de là ?",
      followTools: "Quel composant, quelle matière ou quel moyen d’usinage ferait varier votre décision ?",
      followAbstract: "Avez-vous déjà rencontré un cas client similaire ?",
      followRisk: "Qu’est-ce qui peut mal se passer si on se trompe ?",
      followBeginner: "Qu’est-ce qu’un débutant risquerait de mal interpréter ?",
      closingPrompt:
        "Parfait. Vous pouvez terminer l’entretien. Les fiches d’expertise seront mises à jour automatiquement.",
      managerEmpty: "Aucune capture d’expertise n’est encore disponible.",
      managerEmptyAction: "Charger un exemple",
    },
    en: {
      appName: "Knowledge transfer",
      landingEyebrow: "Prototype",
      landingTitle: "Capture the operational know-how behind key roles",
      landingSubtitle:
        "An interview space for the employee, then a manager space to review and structure that know-how.",
      interviewSurface: "Ask the right questions and capture answers with minimal friction.",
      managerSurface: "Track technical interviews and open expertise sheets.",
      startInterview: "Start an interview",
      openManager: "Open manager area",
      interviewLinkHint: "Received an interview link? Open it directly.",
      manualInterview: "Manual start",
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
      recordingStatus: "Recording",
      recordingIdle: "Ready to record",
      recordingActive: "Recording",
      uploadingAudio: "Saving audio",
      transcribingAudio: "Transcribing",
      transcriptReady: "Transcript ready. You can edit it before sending.",
      transcriptionFailed: "Transcription failed, but the audio is saved. You can keep typing.",
      recordingUnsupported: "Audio recording is not available in this browser. You can keep typing.",
      sendAnswer: "Send",
      submitHint: "Enter to send. Shift + Enter for a new line.",
      hintsTitle: "Helpful cues",
      latestResponse: "Latest answer",
      progress: "Progress",
      currentFocus: "Current step",
      nextStep: "Next",
      reset: "Start over",
      finishInterview: "Finish interview",
      interviewSteps: "Interview steps",
      noInterviewYet: "No active interview",
      startTitle: "Start",
      managerTitle: "Interviewed people",
      managerSubtitle: "Simple technical interview tracking and access to expertise sheets.",
      managerCreateLink: "Create interview link",
      interviewLink: "Interview link",
      copyLink: "Copy link",
      sendInvite: "Send invitation",
      invalidTokenTitle: "Invalid link",
      invalidTokenBody: "This interview link is not recognised or is no longer available on this device.",
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
      saveNotice: "Saved",
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
    answerMode: "speak",
    draftAnswer: "",
    pauseConfirmationSessionId: null,
    finishConfirmationSessionId: null,
    createdSessionId: null,
    selectedDashboardSessionId: null,
    activeThemeId: "drilled-block-design",
    lastRouteKey: "",
    speech: {
      supported: false,
      listening: false,
      status: "idle",
      recognition: null,
      transcriptBase: "",
    },
    audio: {
      supported: false,
      recorder: null,
      stream: null,
      chunks: [],
      status: "idle",
      mimeType: "",
      startedAt: null,
      durationMs: 0,
      error: "",
      transcriptBase: "",
      lastAudioAssetId: "",
    },
    currentDocId: null,
    showDemoNotice: false,
    showCreateInterview: false,
    backend: {
      configured: false,
      client: null,
      clientPromise: null,
      managerLoaded: false,
      managerLoading: false,
      managerError: "",
      publicLoads: {},
    },
  };

  initializeBackend();
  initializeSpeech();
  initializeAudioRecording();
  normalizeSeedState();
  window.addEventListener("hashchange", render);
  window.addEventListener("popstate", render);
  window.addEventListener("beforeunload", stopCaptureIfNeeded);
  render();

  function dictionary() {
    return dictionaries[appState.language];
  }

  function getBackendConfig() {
    const config = window.NUMERHYD_CONFIG || {};
    return {
      supabaseUrl: String(config.SUPABASE_URL || config.supabaseUrl || "").trim(),
      supabaseAnonKey: String(config.SUPABASE_ANON_KEY || config.supabaseAnonKey || "").trim(),
      managerToken: String(config.NUMERHYD_MANAGER_TOKEN || config.MANAGER_TOKEN || config.managerToken || "").trim(),
    };
  }

  function initializeBackend() {
    const config = getBackendConfig();
    appState.backend.configured = Boolean(config.supabaseUrl && config.supabaseAnonKey);
  }

  function backendAvailable() {
    return appState.backend.configured;
  }

  function getTranscriptionEndpoint() {
    const config = getBackendConfig();
    if (!config.supabaseUrl) {
      return "";
    }
    return `${config.supabaseUrl.replace(/\/$/, "")}/functions/v1/transcribe-answer`;
  }

  function getStoredManagerTokens() {
    const tokens = loadJson(STORAGE_KEYS.managerTokens, []);
    const fromConfig = getBackendConfig().managerToken;
    return uniqueStrings([fromConfig].concat(Array.isArray(tokens) ? tokens : []));
  }

  function rememberManagerToken(token) {
    if (!token) return;
    const tokens = uniqueStrings(getStoredManagerTokens().concat(token));
    try {
      window.localStorage.setItem(STORAGE_KEYS.managerTokens, JSON.stringify(tokens));
    } catch {
      // Ignore localStorage write failures for this prototype.
    }
  }

  function uniqueStrings(values) {
    return values
      .map((value) => String(value || "").trim())
      .filter(Boolean)
      .filter((value, index, list) => list.indexOf(value) === index);
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
      const localSessions = appState.sessions.filter((session) => session?.source !== "supabase");
      const localSessionIds = new Set(localSessions.map((session) => session.id));
      const localDocuments = appState.documents.filter((document) => localSessionIds.has(document?.sessionId));
      window.localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(localSessions));
      window.localStorage.setItem(STORAGE_KEYS.documents, JSON.stringify(localDocuments));

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
    return "fr";
  }

  function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function encodeDemoPayload(payload) {
    try {
      const json = JSON.stringify(payload);
      return btoa(unescape(encodeURIComponent(json)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
    } catch {
      return "";
    }
  }

  function decodeDemoPayload() {
    const value = new URLSearchParams(window.location.search).get("demo");
    if (!value) return null;

    try {
      const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
      return JSON.parse(decodeURIComponent(escape(atob(padded))));
    } catch {
      return null;
    }
  }

  function createToken() {
    return createId();
  }

  function isValidTokenFormat(token) {
    return typeof token === "string" && /^[a-z0-9-]{20,}$/i.test(token);
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

  function formatTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return new Intl.DateTimeFormat("fr-FR", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  function getRoute() {
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    if (pathParts[0] === "interview" && pathParts[1]) {
      return {
        name: "interview",
        sessionId: null,
        token: decodeURIComponent(pathParts.slice(1).join("/")),
        mode: "token",
      };
    }

    if ((pathParts[0] === "manager" || pathParts[0] === "synthesis") && pathParts[1]) {
      return {
        name: "manager",
        sessionId: decodeURIComponent(pathParts[1]),
        token: null,
        mode: "path",
      };
    }

    const hash = window.location.hash || routeLabels.home;
    const cleaned = hash.replace(/^#\/?/, "");
    const parts = cleaned ? cleaned.split("/") : [];
    const root = parts[0] || "";

    if (root === "interview") {
      return { name: "interview", sessionId: parts[1] || null, token: null, mode: "legacy", preview: parts[2] === "preview" };
    }

    if (root === "manager") {
      return { name: "manager", sessionId: parts[1] || null, token: null, mode: "legacy" };
    }

    return { name: "home", sessionId: null, token: null, mode: "legacy" };
  }

  function setHash(hash) {
    if (window.location.hash === hash) {
      render();
      return;
    }

    window.location.hash = hash;
  }

  function setPath(pathname) {
    const nextUrl = `${pathname}${window.location.search || ""}`;
    if (`${window.location.pathname}${window.location.search}` === nextUrl) {
      render();
      return;
    }

    window.history.pushState({}, "", nextUrl);
    render();
  }

  function buildInterviewLink(token) {
    return `${window.location.origin}/interview/${encodeURIComponent(token)}`;
  }

  function buildLocalExpertLink(session) {
    if (session?.source === "supabase") {
      return buildInterviewLink(session.token || session.id);
    }

    const link = new URL(`/interview/${encodeURIComponent(session.token || session.id)}`, window.location.origin);
    const payload = {
      firstName: session.firstName || "",
      lastName: session.lastName || "",
      profile: session.profile || "",
      roleTitle: session.roleTitle || "",
      selectedThemeIds: getSessionThemeIds(session),
    };
    link.searchParams.set("demo", encodeDemoPayload(payload));
    return link.toString();
  }

  function goHome() {
    setPath("/");
  }

  function getSectionTitle(sectionId) {
    const copy = dictionary();
    switch (sectionId) {
      case "drilled-block-design":
        return copy.sectionDrilledBlock;
      case "schematics-client-need":
        return copy.sectionSchematics;
      case "material-choices":
        return copy.sectionMaterials;
      case "pressure-safety":
        return copy.sectionPressure;
      case "surface-treatments":
        return copy.sectionSurface;
      case "hydraulic-components":
        return copy.sectionComponents;
      case "leak-diagnosis":
        return copy.sectionLeaks;
      case "troubleshooting-order":
        return copy.sectionTroubleshooting;
      case "machining-feasibility":
        return copy.sectionMachining;
      case "frequent-errors":
        return copy.sectionErrors;
      case "weak-signals":
        return copy.sectionWeakSignals;
      case "customer-cases":
        return copy.sectionCases;
      case "experience-transfer":
        return copy.sectionTransfer;
      default:
        return sectionId;
    }
  }

  function normalizeThemeIds(themeIds) {
    const clean = Array.isArray(themeIds)
      ? themeIds.filter((id) => SECTION_ORDER.includes(id))
      : [];
    return clean.length ? clean : [...SECTION_ORDER];
  }

  function getSessionThemeIds(session) {
    return normalizeThemeIds(session?.selectedThemeIds);
  }

  function createSections(currentSectionId, themeIds = SECTION_ORDER) {
    const orderedThemeIds = normalizeThemeIds(themeIds);
    return orderedThemeIds.map((sectionId) => ({
      id: sectionId,
      title: getSectionTitle(sectionId),
      status:
        sectionId === currentSectionId
          ? "current"
          : orderedThemeIds.indexOf(sectionId) < orderedThemeIds.indexOf(currentSectionId)
            ? "complete"
            : "upcoming",
    }));
  }

  function getSectionQuestion(sectionId) {
    const copy = dictionary();
    switch (sectionId) {
      case "drilled-block-design":
        return copy.qDrilledBlock;
      case "schematics-client-need":
        return copy.qSchematics;
      case "material-choices":
        return copy.qMaterials;
      case "pressure-safety":
        return copy.qPressure;
      case "surface-treatments":
        return copy.qSurface;
      case "hydraulic-components":
        return copy.qComponents;
      case "leak-diagnosis":
        return copy.qLeaks;
      case "troubleshooting-order":
        return copy.qTroubleshooting;
      case "machining-feasibility":
        return copy.qMachining;
      case "frequent-errors":
        return copy.qErrors;
      case "weak-signals":
        return copy.qWeakSignals;
      case "customer-cases":
        return copy.qCases;
      case "experience-transfer":
      default:
        return copy.qTransfer;
    }
  }

  function createBlankSession(firstName, lastName, token, selectedThemeIds) {
    const createdAt = new Date().toISOString();
    const themeIds = normalizeThemeIds(selectedThemeIds);
    const firstSectionId = themeIds[0];
    return {
      id: createId(),
      token: token || createToken(),
      tokenExpiresAt: null,
      firstName,
      lastName,
      language: appState.language,
      roleTitle: "Expertise hydraulique NumerHyd",
      profile: "",
      source: "live",
      selectedThemeIds: themeIds,
      currentSectionId: firstSectionId,
      completionPercent: 0,
      answeredPromptCount: 0,
      updatedAt: createdAt,
      startedAt: null,
      sessionCount: 0,
      durationMinutes: 0,
      draftAnswer: "",
      draftUpdatedAt: createdAt,
      pausedAt: null,
      partialSubmittedAt: null,
      completedAt: null,
      contextNote: "",
      messages: [
        {
          id: createId(),
          role: "assistant",
          content: getSectionQuestion(firstSectionId),
          sectionId: firstSectionId,
          createdAt,
        },
      ],
      sections: createSections(firstSectionId, themeIds),
    };
  }

  function seedSampleSession(language) {
    const now = Date.now();
    const messages = [
      assistantMsg(language, "drilled-block-design", getSectionQuestion("drilled-block-design"), now - 58 * 60000),
      userMsg(
        "Je commence toujours par comprendre ce que le bloc doit faire dans la machine. Je regarde les fonctions à intégrer, les débits, les pressions, les encombrements et surtout les zones où le client ne dit pas tout. Si le besoin est flou, je ne pars pas directement en perçage, je reviens au schéma et au cycle machine.",
        "drilled-block-design",
        now - 55 * 60000,
      ),
      assistantMsg(language, "schematics-client-need", getSectionQuestion("schematics-client-need"), now - 52 * 60000),
      userMsg(
        "Sur un schéma, je cherche d’abord la logique de sécurité et les états de repos. Beaucoup d’erreurs viennent du fait qu’on lit les composants un par un sans comprendre la séquence. Je vérifie aussi si le client parle d’un symptôme réel ou d’une solution qu’il a déjà imaginée.",
        "schematics-client-need",
        now - 49 * 60000,
      ),
      assistantMsg(language, "material-choices", getSectionQuestion("material-choices"), now - 45 * 60000),
      userMsg(
        "Pour un bloc foré, l’aluminium peut être très bien si la pression, le fluide et l’environnement sont maîtrisés. Mais dès qu’il y a choc, vibration, corrosion ou serrage critique, je reviens sur l’acier ou sur un traitement adapté. Le piège, c’est de choisir la matière seulement au prix.",
        "material-choices",
        now - 42 * 60000,
      ),
      assistantMsg(language, "leak-diagnosis", getSectionQuestion("leak-diagnosis"), now - 38 * 60000),
      userMsg(
        "Quand un client dit que ça fuit, je demande où, quand et dans quelles conditions. Une fuite à froid au repos n’a pas la même signification qu’une fuite à chaud en montée en pression. Je regarde les plans de joint, les états de surface, le montage des joints et les reprises d’usinage.",
        "leak-diagnosis",
        now - 35 * 60000,
      ),
      assistantMsg(language, "troubleshooting-order", getSectionQuestion("troubleshooting-order"), now - 31 * 60000),
      userMsg(
        "Je commence par les choses simples et visibles : pression réelle, sens de montage, pollution, température, réglage des limiteurs. Ensuite seulement je vais vers les hypothèses plus complexes. Un débutant veut souvent démonter trop vite alors qu’il n’a pas confirmé la condition de panne.",
        "troubleshooting-order",
        now - 28 * 60000,
      ),
      assistantMsg(language, "customer-cases", getSectionQuestion("customer-cases"), now - 24 * 60000),
      userMsg(
        "On a eu un cas client où le bloc était accusé alors que le problème venait du cycle machine. Le signal faible, c’était une fuite annoncée uniquement après plusieurs minutes de fonctionnement. En réalité, la température faisait évoluer la viscosité et révélait un mauvais réglage en amont.",
        "customer-cases",
        now - 20 * 60000,
      ),
      assistantMsg(language, "experience-transfer", getSectionQuestion("experience-transfer"), now - 16 * 60000),
      userMsg(
        "Il faut apprendre à ne pas croire la première formulation du problème. Il faut faire parler le client sur le contexte réel, regarder les contraintes de fabrication et vérifier les hypothèses dans l’ordre. L’expérience, c’est surtout savoir quand une information manque.",
        "experience-transfer",
        now - 12 * 60000,
      ),
      assistantMsg(language, "experience-transfer", dictionaries[language].closingPrompt, now - 10 * 60000),
    ];

    const session = {
      id: createId(),
      token: createToken(),
      tokenExpiresAt: null,
      firstName: "Expert",
      lastName: "NumerHyd",
      language,
      roleTitle: "Expert senior hydraulique",
      source: "sample",
      currentSectionId: "experience-transfer",
      completionPercent: 100,
      answeredPromptCount: 7,
      updatedAt: new Date(now - 10 * 60000).toISOString(),
      startedAt: new Date(now - 58 * 60000).toISOString(),
      draftAnswer: "",
      draftUpdatedAt: new Date(now - 10 * 60000).toISOString(),
      pausedAt: null,
      completedAt: new Date(now - 10 * 60000).toISOString(),
      partialSubmittedAt: null,
      contextNote: "Exemple de démonstration chargé localement.",
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

  function buildDemoSession({ firstName, lastName, profile, roleTitle, selectedThemeIds, answers, status, sessionCount, durationMinutes, offsetMinutes }) {
    const now = Date.now();
    const session = createBlankSession(firstName, lastName, createToken(), selectedThemeIds);
    const themeIds = getSessionThemeIds(session);
    const messages = [];
    themeIds.forEach((sectionId, index) => {
      const time = now - (offsetMinutes - index * 6) * 60000;
      messages.push(assistantMsg("fr", sectionId, getSectionQuestion(sectionId), time));
      if (answers[sectionId]) {
        messages.push(userMsg(answers[sectionId], sectionId, time + 2 * 60000));
      }
    });
    const answeredIds = Object.keys(answers).filter((id) => themeIds.includes(id));
    const lastAnsweredId = answeredIds[answeredIds.length - 1] || themeIds[0];
    const nextTheme = themeIds.find((id) => !answeredIds.includes(id)) || lastAnsweredId;
    const updatedAt = new Date(now - Math.max(4, offsetMinutes - answeredIds.length * 6) * 60000).toISOString();

    return {
      ...session,
      firstName,
      lastName,
      profile,
      roleTitle,
      source: "demo-v2",
      selectedThemeIds: themeIds,
      currentSectionId: nextTheme,
      completionPercent: Math.round((answeredIds.length / themeIds.length) * 100),
      answeredPromptCount: answeredIds.length,
      updatedAt,
      startedAt: new Date(now - offsetMinutes * 60000).toISOString(),
      sessionCount,
      durationMinutes,
      pausedAt: status === "paused" ? updatedAt : null,
      partialSubmittedAt: status === "partial" ? updatedAt : null,
      completedAt: status === "done" ? updatedAt : null,
      finishedAt: status === "done" || status === "partial" ? updatedAt : null,
      messages,
      sections: createSections(nextTheme, themeIds),
    };
  }

  function seedCockpitDemo() {
    const sellerThemes = [...SECTION_ORDER];
    const workshopThemes = [
      "leak-diagnosis",
      "troubleshooting-order",
      "machining-feasibility",
      "frequent-errors",
      "weak-signals",
      "customer-cases",
    ];
    const seller = buildDemoSession({
      firstName: "Le",
      lastName: "cédant",
      profile: "Cédant / dirigeant",
      roleTitle: "Transmission d’expérience hydraulique",
      selectedThemeIds: sellerThemes,
      status: "partial",
      sessionCount: 2,
      durationMinutes: 74,
      offsetMinutes: 140,
      answers: {
        "drilled-block-design": "Je commence par comprendre ce que le bloc doit faire dans la machine : fonctions, débits, pression, encombrement et contraintes de montage.",
        "schematics-client-need": "Sur un schéma, je cherche d’abord les états de repos et la logique de sécurité. Il faut comprendre le besoin réel avant de dessiner une solution.",
        "material-choices": "L’acier devient préférable quand il y a choc, pression élevée, serrage critique ou risque de déformation. Le piège est de choisir seulement au prix.",
        "leak-diagnosis": "Pour une fuite, je demande où, quand et à quelle température. Une fuite à chaud n’a pas la même cause probable qu’une fuite à froid.",
      },
    });
    const workshop = buildDemoSession({
      firstName: "Le chef",
      lastName: "d’atelier",
      profile: "Chef d’atelier",
      roleTitle: "Réflexes atelier et troubleshooting",
      selectedThemeIds: workshopThemes,
      status: "paused",
      sessionCount: 1,
      durationMinutes: 32,
      offsetMinutes: 90,
      answers: {
        "leak-diagnosis": "Je commence par nettoyer, localiser précisément la fuite et vérifier si elle vient du joint, du plan de joint ou d’une reprise d’usinage.",
        "troubleshooting-order": "Je vérifie d’abord les choses simples : sens de montage, réglage des limiteurs, pollution, pression réelle et température.",
        "frequent-errors": "Un débutant démonte souvent trop vite. Il faut d’abord confirmer la condition de panne et reproduire le symptôme.",
      },
    });

    appState.sessions = [seller, workshop];
    appState.documents = appState.sessions.map(generateDocument);
    appState.activeSessionId = null;
    appState.showDemoNotice = false;
    try {
      window.localStorage.setItem(STORAGE_KEYS.demoVersion, DEMO_VERSION);
    } catch {
      // Ignore localStorage write failures for this prototype.
    }
    persist();
  }

  function normalizeSeedState() {
    let changed = false;

    try {
      const currentVersion = window.localStorage.getItem(STORAGE_KEYS.demoVersion);
      if (currentVersion !== DEMO_VERSION && !backendAvailable()) {
        seedCockpitDemo();
        return;
      }
    } catch {
      // Continue with existing in-memory state.
    }

    if (!Array.isArray(appState.sessions)) {
      appState.sessions = [];
    }

    if (!Array.isArray(appState.documents)) {
      appState.documents = [];
    }

    const oldDocumentCount = appState.documents.length;
    appState.documents = appState.documents.filter(
      (document) => document && document.title === dictionary().docTitle,
    );
    if (appState.documents.length !== oldDocumentCount) {
      changed = true;
    }

    appState.sessions = appState.sessions.map((session) => {
      if (!session) {
        changed = true;
        return createBlankSession("", "");
      }

      let nextSession = session.token ? session : { ...session, token: createToken() };
      if (!session.token) {
        changed = true;
      }

      if (!SECTION_ORDER.includes(nextSession.currentSectionId)) {
        changed = true;
        const themeIds = getSessionThemeIds(nextSession);
        nextSession = {
          ...nextSession,
          selectedThemeIds: themeIds,
          currentSectionId: themeIds[0],
          completionPercent: nextSession.completionPercent || 0,
          sections: createSections(themeIds[0], themeIds),
        };
      }

      const sessionThemeIds = getSessionThemeIds(nextSession);
      if (
        !Array.isArray(nextSession.sections) ||
        nextSession.sections.length !== sessionThemeIds.length ||
        nextSession.sections.some((section) => !sessionThemeIds.includes(section.id))
      ) {
        changed = true;
        nextSession = {
          ...nextSession,
          selectedThemeIds: sessionThemeIds,
          sections: createSections(nextSession.currentSectionId, sessionThemeIds),
        };
      }

      if (!nextSession.draftUpdatedAt) {
        changed = true;
        nextSession = {
          ...nextSession,
          draftAnswer: nextSession.draftAnswer || "",
          draftUpdatedAt: nextSession.updatedAt || new Date().toISOString(),
        };
      }

      if (nextSession.finishedAt && !nextSession.completedAt && !nextSession.partialSubmittedAt) {
        changed = true;
        nextSession = isInterviewComplete(nextSession)
          ? { ...nextSession, completedAt: nextSession.finishedAt }
          : { ...nextSession, partialSubmittedAt: nextSession.finishedAt };
      }

      if (!nextSession.roleTitle || /poste|interview/i.test(nextSession.roleTitle)) {
        changed = true;
        nextSession = { ...nextSession, roleTitle: "Expertise hydraulique NumerHyd" };
      }

      return nextSession;
    });

    if (changed) {
      persist();
    }
  }

  function getSessionById(id) {
    return appState.sessions.find((item) => item.id === id) || null;
  }

  function getActiveSession() {
    return appState.activeSessionId ? getSessionById(appState.activeSessionId) : null;
  }

  function getAnsweredThemeCount(session) {
    if (!session || !Array.isArray(session.messages)) return 0;
    const themeIds = getSessionThemeIds(session);
    return new Set(
      session.messages
        .filter((message) => message.role === "user" && themeIds.includes(message.sectionId))
        .map((message) => message.sectionId),
    ).size;
  }

  function isInterviewComplete(session) {
    return getAnsweredThemeCount(session) >= getSessionThemeIds(session).length || session.completionPercent >= 100;
  }

  function getSessionStatus(session) {
    const copy = dictionary();
    if (session.completedAt || (session.finishedAt && isInterviewComplete(session))) return copy.statusDone;
    if (session.partialSubmittedAt || (session.finishedAt && !isInterviewComplete(session))) return copy.statusPartial;
    if (session.pausedAt) return copy.statusPaused;
    if (session.startedAt || getAnsweredThemeCount(session) > 0) return copy.statusProgress;
    return copy.statusNotStarted;
  }

  function getDashboardStatus(session) {
    const copy = dictionary();
    if (session.completedAt || (session.finishedAt && isInterviewComplete(session))) return copy.statusDone;
    if (session.startedAt || session.pausedAt || session.partialSubmittedAt || getAnsweredThemeCount(session) > 0) {
      return copy.statusProgress;
    }
    return copy.statusNotStarted;
  }

  function getProgressText(session) {
    const answered = getAnsweredThemeCount(session);
    return `${answered}/${getSessionThemeIds(session).length} ${dictionary().answeredQuestions}`;
  }

  function getSessionByToken(token) {
    return appState.sessions.find((item) => item.token === token) || null;
  }

  function getOrCreateSessionByToken(token) {
    if (!isValidTokenFormat(token)) {
      return null;
    }

    const existing = getSessionByToken(token);
    if (existing) {
      return existing;
    }

    const demoPayload = decodeDemoPayload();
    const selectedThemeIds = normalizeThemeIds(demoPayload?.selectedThemeIds || SECTION_ORDER);
    const session = createBlankSession(
      demoPayload?.firstName || "",
      demoPayload?.lastName || "",
      token,
      selectedThemeIds,
    );
    session.profile = demoPayload?.profile || "";
    session.roleTitle = demoPayload?.roleTitle || "Entretien technique à démarrer";
    session.contextNote = "Entretien recréé depuis un lien de démonstration public.";
    saveSession(session, false);
    saveDocument(generateDocument(session));
    return session;
  }

  function saveSession(session, makeActive = true) {
    if (session?.source === "supabase") {
      upsertSessionInMemory(session);
      if (makeActive) {
        appState.activeSessionId = session.id;
      }
      return;
    }

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

  function saveDraftForSession(session, value) {
    if (!session) return null;
    const now = new Date().toISOString();
    const nextSession = {
      ...session,
      draftAnswer: value,
      draftUpdatedAt: now,
      updatedAt: now,
    };

    if (session.source === "supabase") {
      upsertSessionInMemory(nextSession);
      patchSaveStatus(now);
      return nextSession;
    }

    saveSession(nextSession);
    patchSaveStatus(now);
    return nextSession;
  }

  function patchSaveStatus(value) {
    const target = document.querySelector("#save-status");
    if (target) {
      target.textContent = `${dictionary().savedAt} ${formatTime(value)} · ${dictionary().saveNotice}`;
    }
  }

  function getCurrentRouteSession() {
    const route = getRoute();
    if (route.name !== "interview") {
      return null;
    }

    if (route.token) {
      return getSessionByToken(route.token);
    }

    if (route.sessionId) {
      return getSessionById(route.sessionId);
    }

    return getActiveSession();
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

  function loadSupabaseClient() {
    if (!backendAvailable()) {
      return Promise.resolve(null);
    }

    if (appState.backend.client) {
      return Promise.resolve(appState.backend.client);
    }

    if (appState.backend.clientPromise) {
      return appState.backend.clientPromise;
    }

    appState.backend.clientPromise = new Promise((resolve, reject) => {
      const createClientFromGlobal = () => {
        if (!window.supabase?.createClient) {
          return false;
        }

        const config = getBackendConfig();
        appState.backend.client = window.supabase.createClient(
          config.supabaseUrl,
          config.supabaseAnonKey,
        );
        resolve(appState.backend.client);
        return true;
      };

      if (createClientFromGlobal()) {
        return;
      }

      const script = document.createElement("script");
      script.src = SUPABASE_CDN_URL;
      script.async = true;
      script.onload = () => {
        if (!createClientFromGlobal()) {
          reject(new Error("Supabase client did not load"));
        }
      };
      script.onerror = () => reject(new Error("Supabase client failed to load"));
      document.head.appendChild(script);
    }).catch((error) => {
      appState.backend.managerError = error.message || "Supabase indisponible";
      appState.backend.clientPromise = null;
      throw error;
    });

    return appState.backend.clientPromise;
  }

  async function callSupabaseRpc(functionName, params) {
    const client = await loadSupabaseClient();
    if (!client) {
      return null;
    }

    const { data, error } = await client.rpc(functionName, params);
    if (error) {
      throw error;
    }

    return data;
  }

  function getThemeQuestionFromPlan(plan, themeId) {
    const theme = getPlanThemes(plan).find((item) => item.id === themeId);
    return theme?.question || getSectionQuestion(themeId);
  }

  function getPlanThemes(plan) {
    return Array.isArray(plan?.themes) ? plan.themes : [];
  }

  function getDefaultPlanThemeIds(plan) {
    const planThemeIds = getPlanThemes(plan)
      .map((theme) => theme.id)
      .filter((id) => SECTION_ORDER.includes(id));
    return planThemeIds.length ? planThemeIds : SECTION_ORDER;
  }

  function convertSupabaseRowsToCurrentSessionShape(payload) {
    if (!payload?.interview) {
      return null;
    }

    const interview = payload.interview;
    const plan = payload.plan || {};
    const answers = Array.isArray(payload.answers) ? payload.answers : [];
    const themeIds = normalizeThemeIds(
      Array.isArray(interview.selected_theme_ids)
        ? interview.selected_theme_ids
        : getDefaultPlanThemeIds(plan),
    );
    const answeredThemeIds = themeIds.filter((themeId) =>
      answers.some((answer) => answer.theme_id === themeId && answer.answer_text),
    );
    const firstUnansweredThemeId = themeIds.find((themeId) => !answeredThemeIds.includes(themeId));
    const currentSectionId = firstUnansweredThemeId || interview.current_theme_id || themeIds[themeIds.length - 1];
    const completionPercent = Math.round((answeredThemeIds.length / Math.max(1, themeIds.length)) * 100);
    const expertNameParts = String(interview.expert_name || "Expert NumerHyd").trim().split(/\s+/).filter(Boolean);
    const firstName = expertNameParts[0] || "Expert";
    const lastName = expertNameParts.slice(1).join(" ") || "NumerHyd";
    const messages = [];

    themeIds.forEach((themeId) => {
      const answer = answers.find((item) => item.theme_id === themeId);
      const questionText = answer?.question_text || getThemeQuestionFromPlan(plan, themeId);
      messages.push({
        id: `question-${interview.id}-${themeId}`,
        role: "assistant",
        content: questionText,
        sectionId: themeId,
        createdAt: interview.created_at || new Date().toISOString(),
      });

      if (answer?.answer_text) {
        messages.push({
          id: answer.id,
          role: "user",
          content: answer.answer_text,
          sectionId: themeId,
          createdAt: answer.created_at || answer.updated_at || interview.updated_at,
        });
      }
    });

    return {
      id: interview.id,
      token: interview.public_token,
      tokenExpiresAt: null,
      firstName,
      lastName,
      language: appState.language,
      roleTitle: interview.profile || "Expertise hydraulique NumerHyd",
      profile: interview.profile || "",
      source: "supabase",
      selectedThemeIds: themeIds,
      currentSectionId,
      completionPercent,
      answeredPromptCount: answeredThemeIds.length,
      updatedAt: interview.updated_at || interview.created_at || new Date().toISOString(),
      startedAt: interview.started_at || null,
      sessionCount: interview.started_at ? 1 : 0,
      durationMinutes: Math.max(0, answeredThemeIds.length * 6),
      draftAnswer: "",
      draftUpdatedAt: interview.updated_at || interview.created_at || new Date().toISOString(),
      pausedAt: null,
      partialSubmittedAt: null,
      completedAt: interview.completed_at || (interview.status === "completed" ? interview.updated_at : null),
      contextNote: "Entretien sauvegardé dans Supabase.",
      messages,
      sections: createSections(currentSectionId, themeIds).map((section) => ({
        ...section,
        status:
          section.id === currentSectionId
            ? "current"
            : answeredThemeIds.includes(section.id)
              ? "complete"
              : "upcoming",
      })),
    };
  }

  function upsertSessionInMemory(session) {
    if (!session) return null;
    const index = appState.sessions.findIndex((item) => item.id === session.id || item.token === session.token);
    if (index >= 0) {
      appState.sessions[index] = session;
    } else {
      appState.sessions.unshift(session);
    }

    const document = generateDocument(session);
    const documentIndex = appState.documents.findIndex((item) => item.sessionId === session.id);
    if (documentIndex >= 0) {
      appState.documents[documentIndex] = document;
    } else {
      appState.documents.unshift(document);
    }

    return session;
  }

  function getNextThemeAfterSubmit(session) {
    const themeIds = getSessionThemeIds(session);
    const currentIndex = themeIds.indexOf(session.currentSectionId);
    if (currentIndex < 0 || currentIndex >= themeIds.length - 1) {
      return {
        nextThemeId: themeIds[themeIds.length - 1],
        status: "completed",
      };
    }

    return {
      nextThemeId: themeIds[currentIndex + 1],
      status: "in_progress",
    };
  }

  async function createRemoteInterview({ expertName, profile, selectedThemeIds }) {
    const config = getBackendConfig();
    const managerToken = config.managerToken || createToken();
    const publicToken = createToken();
    const payload = await callSupabaseRpc("create_interview", {
      p_manager_token: managerToken,
      p_public_token: publicToken,
      p_expert_name: expertName,
      p_profile: profile,
      p_selected_theme_ids: selectedThemeIds,
      p_plan_slug: "numerhyd-v1",
    });
    rememberManagerToken(managerToken);
    const session = convertSupabaseRowsToCurrentSessionShape(payload);
    appState.backend.managerError = "";
    return upsertSessionInMemory(session);
  }

  async function loadRemoteInterviewByToken(publicToken) {
    const payload = await callSupabaseRpc("get_public_interview", {
      p_public_token: publicToken,
    });
    const session = convertSupabaseRowsToCurrentSessionShape(payload);
    return upsertSessionInMemory(session);
  }

  async function submitRemoteTextAnswer(session, answerText) {
    const next = getNextThemeAfterSubmit(session);
    const questionText = getSectionQuestion(session.currentSectionId);
    const payload = await callSupabaseRpc("submit_text_answer", {
      p_public_token: session.token,
      p_theme_id: session.currentSectionId,
      p_question_text: questionText,
      p_answer_text: answerText,
      p_next_theme_id: next.nextThemeId,
      p_status: next.status,
    });
    const nextSession = convertSupabaseRowsToCurrentSessionShape(payload);
    appState.backend.managerError = "";
    return upsertSessionInMemory(nextSession);
  }

  async function loadRemoteManagerData() {
    const managerTokens = getStoredManagerTokens();
    if (!backendAvailable() || managerTokens.length === 0) {
      if (backendAvailable()) {
        appState.sessions = [];
        appState.documents = [];
      } else {
        appState.sessions = appState.sessions.filter((session) => session?.source !== "supabase");
      }
      appState.backend.managerLoaded = true;
      return [];
    }

    const payloads = [];
    for (const managerToken of managerTokens) {
      const data = await callSupabaseRpc("get_manager_interviews", {
        p_manager_token: managerToken,
      });
      if (Array.isArray(data)) {
        payloads.push(...data);
      }
    }

    const remoteSessions = payloads
      .map(convertSupabaseRowsToCurrentSessionShape)
      .filter(Boolean)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const seen = new Set();
    const dedupedSessions = remoteSessions.filter((session) => {
      if (seen.has(session.id)) return false;
      seen.add(session.id);
      return true;
    });

    appState.sessions = dedupedSessions;
    appState.documents = dedupedSessions.map(generateDocument);
    appState.backend.managerLoaded = true;
    appState.backend.managerError = "";
    return dedupedSessions;
  }

  async function loadRemoteManagerDetail(managerToken, interviewId) {
    const payload = await callSupabaseRpc("get_manager_interview_detail", {
      p_manager_token: managerToken,
      p_interview_id: interviewId,
    });
    const session = convertSupabaseRowsToCurrentSessionShape(payload);
    return upsertSessionInMemory(session);
  }

  function queueRemoteManagerLoad(force = false) {
    if (!backendAvailable()) return;
    if (appState.backend.managerLoading) return;
    if (appState.backend.managerLoaded && !force) return;

    appState.backend.managerLoading = true;
    loadRemoteManagerData()
      .catch((error) => {
        appState.backend.managerError = error.message || "Chargement Supabase impossible.";
      })
      .finally(() => {
        appState.backend.managerLoading = false;
        render();
      });
  }

  function queueRemotePublicLoad(token) {
    if (!backendAvailable() || !token) return;
    const state = appState.backend.publicLoads[token];
    if (state === "loading" || state === "loaded" || state === "missing") return;

    appState.backend.publicLoads[token] = "loading";
    loadRemoteInterviewByToken(token)
      .then((session) => {
        appState.backend.publicLoads[token] = session ? "loaded" : "missing";
      })
      .catch(() => {
        appState.backend.publicLoads[token] = "missing";
      })
      .finally(render);
  }

  function analyzeText(text) {
    const normalized = text.toLowerCase();
    const wordCount = normalized.trim().split(/\s+/).filter(Boolean).length;
    const hasAmbiguity = /\b(sometimes|depends|usually|often|parfois|ça dépend|souvent|généralement|selon|si)\b/.test(normalized);
    const hasProblem = /\b(issue|problem|error|failure|breakdown|mistake|panne|problème|erreur|blocage|dérive|fuite|casse|risque|défaut|pollution)\b/.test(normalized);
    const hasTool = /\b(folder|file|excel|erp|email|drive|software|mailbox|spreadsheet|shared|dossier|fichier|excel|erp|mail|boîte|tableau|réseau|machine|usinage|outil|foret|taraud|alésage|cnc|tour|fraiseuse)\b/.test(normalized);
    const hasTask = /\b(check|schedule|assign|call|prepare|launch|verify|quote|plan|triage|organise|vérifie|contrôle|mesure|choisis|choix|calcule|diagnostique|rappelle|ouvre|regarde|commence|valide)\b/.test(normalized);
    const hasExample = /\b(example|recent|last week|for example|par exemple|récemment|la semaine dernière|hier|cas client|client|chantier|machine)\b/.test(normalized);
    const hasSteps = /\b(first|then|after|before|ensuite|puis|d’abord|avant|après|premier|dans l’ordre|étape)\b/.test(normalized);
    const hasLocation = /\b(folder|drive|mailbox|shared|réseau|dossier|boîte|chemin|dans le dossier|dans le réseau|plan|schéma|atelier)\b/.test(normalized);
    const hasContacts = /\b(contact|supplier|sales|customer|technician|commercial|fournisseur|client|technicien|achat|usineur|atelier)\b/.test(normalized);

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

    if (messages.length >= 2) return true;
    if (sectionId === "customer-cases") return examples >= 1 && totalWords >= 30;
    if (sectionId === "troubleshooting-order") return steps >= 1 && totalWords >= 24;
    if (sectionId === "leak-diagnosis") return problems >= 1 && totalWords >= 24;
    if (sectionId === "machining-feasibility") return tools >= 1 && totalWords >= 24;
    if (sectionId === "experience-transfer") return totalWords >= 24;
    return substantial >= 1 || (tasks >= 1 && totalWords >= 24) || examples >= 1;
  }

  function buildFollowUp(text, sectionId) {
    const copy = dictionary();
    const analysis = analyzeText(text);

    if (analysis.wordCount < 20) {
      return copy.followShort;
    }

    if (sectionId === "frequent-errors") {
      return copy.followBeginner;
    }

    if (sectionId === "pressure-safety" || sectionId === "material-choices") {
      return copy.followRisk;
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

    if (analysis.hasTask || sectionId === "troubleshooting-order" || sectionId === "machining-feasibility") {
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
      const themeIds = getSessionThemeIds(session);
      const currentIndex = themeIds.indexOf(session.currentSectionId);
      nextSectionId = themeIds[Math.min(currentIndex + 1, themeIds.length - 1)];
      assistantContent =
        nextSectionId === session.currentSectionId
          ? dictionary().closingPrompt
          : getSectionQuestion(nextSectionId);
    } else if (followUp) {
      assistantContent = `J’aimerais préciser un point : ${followUp}`;
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
    const themeIds = getSessionThemeIds(session);
    const isLastSection = nextSectionId === themeIds[themeIds.length - 1];
    const answeredThemes = new Set(
      nextMessages
        .filter((message) => message.role === "user" && themeIds.includes(message.sectionId))
        .map((message) => message.sectionId),
    ).size;
    const completionPercent = Math.min(
      100,
      Math.round((answeredThemes / themeIds.length) * 100),
    );

    return {
      ...session,
      currentSectionId: nextSectionId,
      answeredPromptCount,
      completionPercent: isLastSection && sectionDone ? 100 : Math.max(session.completionPercent, completionPercent),
      updatedAt: new Date().toISOString(),
      messages: nextMessages,
      sections: createSections(nextSectionId, themeIds).map((section) => ({
        ...section,
        status:
          section.id === nextSectionId
            ? "current"
            : themeIds.indexOf(section.id) < themeIds.indexOf(nextSectionId)
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
        /\b(choix|choisis|vérifie|contrôle|diagnostic|schéma|pression|matière|matériau|bloc|foré|composant|usinage|traitement|client|sécurité|résistance)\b/i.test(
          clause,
        ),
      ),
    ).slice(0, 5);

    const issues = unique(
      clauses.filter((clause) =>
        /\b(problème|panne|erreur|fuite|risque|défaut|pression|pollution|casse|mal|oublier|interpréter|sécurité|débutant)\b/i.test(
          clause,
        ),
      ),
    ).slice(0, 5);

    const tools = unique(
      clauses.filter((clause) =>
        /\b(schéma|plan|bloc|joint|pression|débit|matière|aluminium|acier|usinage|machine|surface|composant|limiteur|pompe|vérin|valve)\b/i.test(
          clause,
        ),
      ),
    ).slice(0, 5);

    const contacts = unique(
      clauses
        .filter((clause) =>
          /\b(client|cas client|machine|chantier|atelier|fournisseur)\b/i.test(clause),
        )
        .map(compactSentence),
    ).slice(0, 4);

    const gaps = [];
    if (!combined.match(/\b(exemple|cas client|client|machine)\b/i)) {
      gaps.push(
        "Ajouter au moins un cas client concret.",
      );
    }
    if (!combined.match(/\b(d’abord|ensuite|puis|premier|ordre|avant|après)\b/i)) {
      gaps.push(
        "Préciser l’ordre des contrôles et des vérifications.",
      );
    }
    if (!combined.match(/\b(risque|sécurité|pression|trompe|erreur)\b/i)) {
      gaps.push(
        "Clarifier les risques en cas de mauvais diagnostic ou de mauvais choix technique.",
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
    const copy = dictionary();
    const userMessages = session.messages.filter((message) => message.role === "user");
    const allAnswers = userMessages.map((message) => compactSentence(message.content));
    const bySection = (sectionId) =>
      userMessages
        .filter((message) => message.sectionId === sectionId)
        .map((message) => compactSentence(message.content));
    const pick = (sectionIds, fallback) => {
      const values = sectionIds.flatMap(bySection).filter(Boolean);
      return values.length ? values : fallback;
    };
    const asList = (values, fallback) => (values.length ? values.slice(0, 6) : fallback);
    const openQuestions = unique(summary.gaps).slice(0, 4);
    const noData = ["À compléter après les prochaines réponses de l’expert."];
    const synthesisValues = asList(allAnswers.slice(0, 5), noData);
    const reasoningValues = asList(
      pick(
        [
          "drilled-block-design",
          "schematics-client-need",
          "material-choices",
          "pressure-safety",
          "surface-treatments",
          "hydraulic-components",
        ],
        [],
      ),
      noData,
    );
    const customerValues = asList(pick(["customer-cases", "leak-diagnosis"], []), [copy.noContacts]);
    const mistakeValues = asList(pick(["frequent-errors", "weak-signals"], []), noData);
    const checksValues = asList(pick(["leak-diagnosis", "troubleshooting-order", "pressure-safety"], []), noData);
    const practiceValues = asList(pick(["machining-feasibility", "experience-transfer"], []), noData);

    const sections = [
      {
        id: "synthesis",
        title: copy.roleOverview,
        status: summary.overallStatus,
        editableText: synthesisValues.map((item) => `- ${item}`).join("\n"),
        fields: [
          {
            key: "Expert",
            value: `${session.firstName} ${session.lastName}`.trim() || "Expert NumerHyd",
          },
          {
            key: "Synthèse par thème",
            value: synthesisValues,
          },
          {
            key: "Progression",
            value: getProgressText(session),
          },
        ],
      },
      {
        id: "technical-reasoning",
        title: copy.technicalReasoning,
        status: summary.responsibilities.length >= 3 ? "strong" : "partial",
        editableText: reasoningValues.map((item) => `- ${item}`).join("\n"),
        fields: [
          {
            key: "Choix et arbitrages",
            value: reasoningValues,
          },
          {
            key: "Points à transformer en règles",
            value: summary.responsibilities.length ? summary.responsibilities.map(compactSentence) : noData,
          },
        ],
      },
      {
        id: "customer-cases",
        title: copy.customerCases,
        status: customerValues[0] === copy.noContacts ? "needs clarification" : "partial",
        editableText: customerValues.map((item) => `- ${item}`).join("\n"),
        fields: [
          {
            key: "Cas clients mentionnés",
            value: customerValues,
          },
          {
            key: "Ce que le cas apprend",
            value: "Identifier le contexte réel, les conditions d’apparition et les hypothèses qui peuvent être fausses au départ.",
          },
        ],
      },
      {
        id: "common-mistakes",
        title: copy.commonMistakes,
        status: summary.issues.length >= 2 ? "strong" : "partial",
        editableText: mistakeValues.map((item) => `- ${item}`).join("\n"),
        fields: [
          {
            key: "Erreurs fréquentes",
            value: mistakeValues,
          },
          {
            key: "Risques associés",
            value: summary.issues.length ? summary.issues.map(compactSentence) : noData,
          },
        ],
      },
      {
        id: "checks",
        title: copy.procedures,
        status: summary.tools.length >= 2 ? "strong" : "partial",
        editableText: checksValues.map((item) => `- ${item}`).join("\n"),
        fields: [
          {
            key: "Contrôles / vérifications à faire",
            value: checksValues,
          },
          {
            key: "Signaux faibles",
            value: asList(pick(["weak-signals"], []), noData),
          },
        ],
      },
      {
        id: "good-practices",
        title: copy.goodPractices,
        status: practiceValues[0] === noData[0] ? "needs clarification" : "partial",
        editableText: practiceValues.map((item) => `- ${item}`).join("\n"),
        fields: [
          {
            key: "Bonnes pratiques",
            value: practiceValues,
          },
          {
            key: "Transmission d’expérience",
            value: asList(pick(["experience-transfer"], []), noData),
          },
        ],
      },
      {
        id: "raw-answers",
        title: "Réponses brutes",
        status: allAnswers.length ? "partial" : "needs clarification",
        editableText: allAnswers.map((item, index) => `${index + 1}. ${item}`).join("\n"),
        fields: [
          {
            key: "Transcription / réponses disponibles",
            value: allAnswers.length ? allAnswers : noData,
          },
        ],
      },
      {
        id: "open-questions",
        title: copy.openQuestions,
        status: openQuestions.length === 0 ? "strong" : "needs clarification",
        editableText: openQuestions.join("\n"),
        fields: [
          {
            key: "Questions encore ouvertes",
            value: openQuestions.length
              ? openQuestions
              : ["Aucune question ouverte prioritaire."],
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
    if (backendAvailable()) {
      return;
    }

    if (appState.sessions.length > 0) {
      return;
    }

    seedCockpitDemo();
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
      saveDraftForSession(getCurrentRouteSession(), appState.draftAnswer);
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

  function stopCaptureIfNeeded() {
    stopSpeechIfNeeded();
    stopAudioStream();
  }

  function resetSpeechForLanguage() {
    stopSpeechIfNeeded();
    initializeSpeech();
  }

  function initializeAudioRecording() {
    appState.audio.supported = Boolean(window.MediaRecorder && navigator.mediaDevices?.getUserMedia);
    appState.audio.mimeType = getSupportedAudioMimeType();
  }

  function getSupportedAudioMimeType() {
    if (!window.MediaRecorder?.isTypeSupported) {
      return "";
    }

    return AUDIO_MIME_CANDIDATES.find((mimeType) => window.MediaRecorder.isTypeSupported(mimeType)) || "";
  }

  function resetAudioRecordingState(nextStatus = "idle") {
    appState.audio.status = nextStatus;
    appState.audio.error = "";
    appState.audio.chunks = [];
    appState.audio.durationMs = 0;
    appState.audio.startedAt = null;
    appState.audio.lastAudioAssetId = "";
  }

  function isRemoteAudioSession(session) {
    return Boolean(session?.source === "supabase" && backendAvailable());
  }

  function isAudioBusy() {
    return ["recording", "uploading", "transcribing"].includes(appState.audio.status);
  }

  function getAudioStatusLabel() {
    const copy = dictionary();
    if (!appState.audio.supported) {
      return copy.recordingUnsupported;
    }

    switch (appState.audio.status) {
      case "recording":
        return copy.recordingActive;
      case "uploading":
        return copy.uploadingAudio;
      case "transcribing":
        return copy.transcribingAudio;
      case "ready":
        return copy.transcriptReady;
      case "failed":
        return appState.audio.error || copy.transcriptionFailed;
      case "denied":
        return copy.speechDenied;
      case "unsupported":
        return copy.recordingUnsupported;
      default:
        return copy.recordingIdle;
    }
  }

  function getAudioButtonLabel(session) {
    const copy = dictionary();
    if (!isRemoteAudioSession(session)) {
      return appState.speech.listening ? copy.stopMicrophone : copy.startMicrophone;
    }

    if (appState.audio.status === "recording") {
      return copy.stopMicrophone;
    }

    if (isAudioBusy()) {
      return copy.transcribingAudio;
    }

    return copy.startMicrophone;
  }

  function getAudioStatusClass() {
    return appState.audio.status === "recording" ? "live" : "";
  }

  function getCaptureStatusClass(session) {
    return isRemoteAudioSession(session)
      ? getAudioStatusClass()
      : appState.speech.listening
        ? "live"
        : "";
  }

  function isCaptureBusy(session) {
    return isRemoteAudioSession(session) && isAudioBusy();
  }

  async function toggleAudioCapture(session) {
    if (!isRemoteAudioSession(session)) {
      toggleLocalSpeechRecognition();
      return;
    }

    if (!appState.audio.supported) {
      appState.audio.status = "unsupported";
      appState.audio.error = dictionary().recordingUnsupported;
      render();
      return;
    }

    if (appState.audio.status === "recording") {
      stopRemoteAudioRecording();
      return;
    }

    if (isCaptureBusy(session)) {
      return;
    }

    await startRemoteAudioRecording(session);
  }

  function toggleLocalSpeechRecognition() {
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
  }

  async function startRemoteAudioRecording(session) {
    try {
      stopSpeechIfNeeded();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = appState.audio.mimeType || getSupportedAudioMimeType();
      const options = mimeType ? { mimeType } : undefined;
      const recorder = new MediaRecorder(stream, options);
      appState.audio.stream = stream;
      appState.audio.recorder = recorder;
      appState.audio.chunks = [];
      appState.audio.status = "recording";
      appState.audio.error = "";
      appState.audio.startedAt = Date.now();
      appState.audio.transcriptBase = appState.draftAnswer.trim();

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) {
          appState.audio.chunks.push(event.data);
        }
      };

      recorder.onerror = () => {
        appState.audio.status = "failed";
        appState.audio.error = dictionary().speechError;
        stopAudioStream();
        render();
      };

      recorder.onstop = () => {
        const durationMs = appState.audio.startedAt ? Date.now() - appState.audio.startedAt : 0;
        const chunks = [...appState.audio.chunks];
        const type = recorder.mimeType || mimeType || chunks[0]?.type || "audio/webm";
        stopAudioStream();
        if (!chunks.length) {
          appState.audio.status = "failed";
          appState.audio.error = dictionary().speechError;
          render();
          return;
        }

        const audioBlob = new Blob(chunks, { type });
        appState.audio.durationMs = durationMs;
        uploadRemoteAudioForTranscription(session, audioBlob, durationMs).catch((error) => {
          appState.audio.status = "failed";
          appState.audio.error = error.message || dictionary().transcriptionFailed;
          render();
        });
      };

      recorder.start();
      render();
    } catch (error) {
      appState.audio.status = error?.name === "NotAllowedError" ? "denied" : "failed";
      appState.audio.error = error?.name === "NotAllowedError" ? dictionary().speechDenied : dictionary().speechError;
      stopAudioStream();
      render();
    }
  }

  function stopRemoteAudioRecording() {
    const recorder = appState.audio.recorder;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      return;
    }

    stopAudioStream();
  }

  function stopAudioStream() {
    if (appState.audio.stream) {
      appState.audio.stream.getTracks().forEach((track) => track.stop());
    }
    appState.audio.stream = null;
    appState.audio.recorder = null;
  }

  async function uploadRemoteAudioForTranscription(session, audioBlob, durationMs) {
    const endpoint = getTranscriptionEndpoint();
    const config = getBackendConfig();
    if (!endpoint || !config.supabaseAnonKey) {
      throw new Error("Supabase transcription endpoint is not configured.");
    }

    appState.audio.status = "uploading";
    appState.audio.error = "";
    render();

    const statusTimer = window.setTimeout(() => {
      if (appState.audio.status === "uploading") {
        appState.audio.status = "transcribing";
        render();
      }
    }, 900);

    const formData = new FormData();
    formData.append("public_token", session.token || "");
    formData.append("theme_id", session.currentSectionId || "");
    formData.append("language", appState.language);
    formData.append("duration_ms", String(Math.max(0, Math.round(durationMs || 0))));
    formData.append("audio", audioBlob, `answer.${getAudioFileExtension(audioBlob.type)}`);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          apikey: config.supabaseAnonKey,
        },
        body: formData,
      });
      const payload = await response.json().catch(() => ({}));
      window.clearTimeout(statusTimer);

      if (!response.ok) {
        const message = payload?.audio_saved
          ? dictionary().transcriptionFailed
          : payload?.error || dictionary().speechError;
        appState.audio.lastAudioAssetId = payload?.audio_asset_id || "";
        throw new Error(message);
      }

      const transcript = String(payload?.transcript_text || "").trim();
      appState.audio.status = "ready";
      appState.audio.lastAudioAssetId = payload?.audio_asset_id || "";
      if (transcript) {
        applyTranscriptToDraft(session, transcript);
      }
      render();
    } catch (error) {
      window.clearTimeout(statusTimer);
      throw error;
    }
  }

  function getAudioFileExtension(mimeType) {
    const clean = String(mimeType || "").split(";")[0].trim().toLowerCase();
    switch (clean) {
      case "audio/mp4":
        return "mp4";
      case "audio/mpeg":
      case "audio/mp3":
        return "mp3";
      case "audio/wav":
      case "audio/x-wav":
        return "wav";
      case "audio/ogg":
        return "ogg";
      case "audio/m4a":
        return "m4a";
      case "audio/webm":
      default:
        return "webm";
    }
  }

  function applyTranscriptToDraft(session, transcript) {
    const base = appState.audio.transcriptBase || appState.draftAnswer.trim();
    appState.draftAnswer = base ? `${base}\n${transcript}` : transcript;
    patchTextareaValue();
    saveDraftForSession(session, appState.draftAnswer);
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
    const routeKey = `${route.name}:${route.sessionId || route.token || ""}`;
    const root = document.getElementById("app");
    root.innerHTML = `<div class="shell">${renderView(route)}</div>`;
    if (appState.lastRouteKey !== routeKey) {
      scrollPageTop();
      window.requestAnimationFrame(scrollPageTop);
      appState.lastRouteKey = routeKey;
    }
    bindCommonEvents();
    bindViewEvents(route);
  }

  function scrollPageTop() {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (typeof window.scrollTo === "function") {
      window.scrollTo(0, 0);
    }
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
    return "";
  }

  function formatDuration(minutes) {
    const value = Math.max(0, Math.round(minutes || 0));
    if (value < 60) return `${value} min`;
    const hours = Math.floor(value / 60);
    const rest = value % 60;
    return rest ? `${hours} h ${rest} min` : `${hours} h`;
  }

  function getThemeAnswerItems(themeId) {
    return appState.sessions.flatMap((session) =>
      (session.messages || [])
        .filter((message) => message.role === "user" && message.sectionId === themeId)
        .map((message) => ({
          source: `${session.firstName} ${session.lastName}`.trim() || "Expert",
          profile: session.profile || session.roleTitle,
          text: compactSentence(message.content),
        })),
    );
  }

  function getThemeStatus(themeId) {
    const answers = getThemeAnswerItems(themeId);
    if (!answers.length) return "Non abordé";
    if (answers.length === 1) return "Réponse partielle";
    return "Renseigné";
  }

  function formatThemeList(themeIds) {
    if (!themeIds.length) return "Aucun";
    const titles = themeIds.map(getSectionTitle);
    if (titles.length <= 3) return titles.join(", ");
    return `${titles.slice(0, 3).join(", ")} + ${titles.length - 3}`;
  }

  function formatSessionCount(count) {
    const value = Math.max(0, Number(count || 0));
    return `${value} ${value > 1 ? "sessions" : "session"}`;
  }

  function renderThemeKnowledgeCard(themeId) {
    const answers = getThemeAnswerItems(themeId);
    const isActive = appState.activeThemeId === themeId;
    return `
      <button class="theme-card ${isActive ? "active" : ""}" data-action="open-theme-fiche" data-theme-id="${escapeHtml(themeId)}">
        <span>${escapeHtml(getSectionTitle(themeId))}</span>
        <strong>${escapeHtml(getThemeStatus(themeId))}</strong>
      </button>
    `;
  }

  function renderActiveThemeFiche() {
    const copy = dictionary();
    const themeId = SECTION_ORDER.includes(appState.activeThemeId) ? appState.activeThemeId : SECTION_ORDER[0];
    const answers = getThemeAnswerItems(themeId);
    const sources = unique(answers.map((item) => item.source));
    const learned = answers.slice(0, 3).map((item) => item.text);
    const openItems = answers.length
      ? ["Préciser les exceptions et les cas où la règle change.", "Ajouter un exemple client ou atelier supplémentaire si disponible."]
      : [copy.notCovered];

    return `
      <section class="section-card theme-fiche">
        <p class="eyebrow">${copy.expertiseSheetsArea}</p>
        <h2 class="section-title" style="margin-top:12px;">${escapeHtml(getSectionTitle(themeId))}</h2>
        <div class="document-field">
          <p class="doc-key">${copy.learned}</p>
          ${
            learned.length
              ? `<ul class="doc-list">${learned.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
              : `<p class="doc-value">${copy.notCovered}</p>`
          }
        </div>
        <div class="document-field">
          <p class="doc-key">${copy.qa}</p>
          ${
            answers.length
              ? answers
                  .slice(0, 3)
                  .map(
                    (item) => `
                      <div class="qa-block">
                        <p><strong>Question :</strong> ${escapeHtml(getSectionQuestion(themeId))}</p>
                        <p><strong>Réponse :</strong> ${escapeHtml(item.text)}</p>
                      </div>
                    `,
                  )
                  .join("")
              : `<p class="doc-value">${copy.notCovered}</p>`
          }
        </div>
        <div class="document-field">
          <p class="doc-key">${copy.keyPoints}</p>
          ${
            answers.length
              ? `<ul class="doc-list">${answers.slice(0, 4).map((item) => `<li>${escapeHtml(item.text)}</li>`).join("")}</ul>`
              : `<p class="doc-value">${copy.notCovered}</p>`
          }
        </div>
        <div class="document-field">
          <p class="doc-key">${copy.sources}</p>
          <p class="doc-value">${sources.length ? escapeHtml(sources.join(", ")) : copy.notCovered}</p>
        </div>
        <div class="document-field">
          <p class="doc-key">${copy.openQuestions}</p>
          <ul class="doc-list">${openItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
      </section>
    `;
  }

  function renderCockpit() {
    const copy = dictionary();
    ensureManagerDemo();
    queueRemoteManagerLoad();
    const items = [...appState.sessions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const createdSession = appState.createdSessionId ? getSessionById(appState.createdSessionId) : null;
    const selectedSession = appState.selectedDashboardSessionId ? getSessionById(appState.selectedDashboardSessionId) : null;
    const selectedThemeIds = selectedSession ? getSessionThemeIds(selectedSession) : [];
    const selectedAnsweredThemeIds = selectedSession ? getAnsweredThemeIds(selectedSession) : [];
    const selectedRemainingThemeIds = selectedThemeIds.filter((themeId) => !selectedAnsweredThemeIds.includes(themeId));
    return `
      <div class="page-stack cockpit">
        <div class="topbar">
          <div>
            <p class="eyebrow">${copy.appName}</p>
            <h1 class="title">${copy.landingTitle}</h1>
            <p class="subtitle">${copy.landingSubtitle}</p>
          </div>
        </div>
        <div class="cockpit-grid">
          <section class="panel cockpit-panel action-card create-action-card ${!appState.showCreateInterview && !createdSession ? "clickable" : ""}" ${
            !appState.showCreateInterview && !createdSession ? `data-action="show-create-interview"` : ""
          }>
            <p class="eyebrow">Action principale</p>
            <h2 class="section-title" style="margin-top:10px;">${copy.createInterview}</h2>
            <p class="helper-note" style="margin-top:8px;">Créez un lien à envoyer à un expert pour capturer son savoir-faire.</p>
            ${
              createdSession
                ? `<div class="created-link-box">
                    <p class="eyebrow">${copy.createdLinkTitle}</p>
                    <h3 class="card-title" style="margin-top:8px;">${copy.createdLinkTitle}</h3>
                    <p class="doc-value created-link-value">${escapeHtml(buildLocalExpertLink(createdSession))}</p>
                    <p class="helper-note">${copy.createdLinkHelp}</p>
                    <div class="button-row" style="margin-top:14px;">
                      <button class="button-secondary" data-action="copy-link" data-link="${escapeHtml(buildLocalExpertLink(createdSession))}">${copy.copyLink}</button>
                      <button class="button-secondary" data-action="test-expert" data-session-id="${escapeHtml(createdSession.id)}">${copy.testExpertPath}</button>
                      <button class="button" data-action="clear-created-session">Retour au tableau de bord</button>
                    </div>
                  </div>`
                : appState.showCreateInterview
                ? `<div class="create-interview-form">
                    <div class="field-grid manager-create-grid">
                      <div>
                        <label class="label" for="expert-name">${copy.expertName}</label>
                        <input id="expert-name" class="field" placeholder="Exemple : Jean Dupont" />
                      </div>
                      <div>
                        <label class="label" for="expert-profile">${copy.profileLabel}</label>
                        <select id="expert-profile" class="field">
                          <option>${copy.profileSeller}</option>
                          <option>${copy.profileWorkshop}</option>
                          <option>${copy.profileOther}</option>
                        </select>
                      </div>
                    </div>
                    <div class="topic-picker">
                      <p class="label">${copy.topicsLabel}</p>
                      <label class="check-row strong"><input type="checkbox" id="all-themes" checked /> ${copy.allTopics}</label>
                      <div class="topic-grid">
                        ${SECTION_ORDER.map(
                          (id) => `<label class="check-row"><input type="checkbox" class="theme-checkbox" value="${escapeHtml(id)}" checked /> ${escapeHtml(getSectionTitle(id))}</label>`,
                        ).join("")}
                      </div>
                    </div>
                    <div class="button-row" style="margin-top:18px;">
                      <button class="button" data-action="submit-create-interview">${copy.createAndShowLink}</button>
                      <button class="button-secondary" data-action="cancel-create-interview">${copy.cancel}</button>
                    </div>
                  </div>`
                : `<button class="button action-card-button">${copy.createInterview}</button>`
            }
          </section>
          <section class="panel cockpit-panel action-card">
            <p class="eyebrow">Tableau de bord</p>
            <h2 class="section-title" style="margin-top:10px;">Entretiens en cours</h2>
            <p class="helper-note" style="margin-top:8px;">Suivez les entretiens déjà démarrés et consultez les synthèses.</p>
            ${
              backendAvailable() && appState.backend.managerLoading
                ? `<p class="resume-banner">Chargement Supabase en cours...</p>`
                : ""
            }
            ${
              backendAvailable() && appState.backend.managerError
                ? `<p class="helper-note" style="margin-top:10px;">${escapeHtml(appState.backend.managerError)}</p>`
                : ""
            }
            <div class="interview-row-list">
              ${items.map((item) => {
                const expertName = `${item.firstName} ${item.lastName}`.trim() || "Expert";
                const isSelected = selectedSession && selectedSession.id === item.id;
                return `
                  <button class="interview-row ${isSelected ? "active" : ""}" data-action="select-dashboard-interview" data-session-id="${escapeHtml(item.id)}">
                    <span>
                      <strong>${escapeHtml(expertName)}</strong>
                      <small>${escapeHtml(item.profile || item.roleTitle)}</small>
                    </span>
                    <span class="status-pill">${escapeHtml(getDashboardStatus(item))}</span>
                    <span class="row-progress">${escapeHtml(formatDuration(item.durationMinutes))} · ${escapeHtml(formatSessionCount(item.sessionCount))}</span>
                  </button>
                `;
              }).join("")}
            </div>
            ${
              selectedSession
                ? `<div class="selected-interview-detail">
                    <div class="split-line">
                      <div>
                        <p class="eyebrow">Entretien sélectionné</p>
                        <h3 class="card-title" style="margin-top:8px;">${escapeHtml(`${selectedSession.firstName} ${selectedSession.lastName}`.trim() || "Expert")}</h3>
                        <p class="card-text" style="margin-top:6px;">${escapeHtml(selectedSession.profile || selectedSession.roleTitle)}</p>
                      </div>
                      <span class="status-pill">${escapeHtml(getDashboardStatus(selectedSession))}</span>
                    </div>
                    <div class="list-metrics">
                      <div class="stat"><span class="helper-note">${copy.totalTime}</span><strong>${escapeHtml(formatDuration(selectedSession.durationMinutes))}</strong></div>
                      <div class="stat"><span class="helper-note">${copy.sessionsCount}</span><strong>${selectedSession.sessionCount || 0}</strong></div>
                      <div class="stat"><span class="helper-note">${copy.lastUpdated}</span><strong style="font-size:18px;">${escapeHtml(formatDate(selectedSession.updatedAt))}</strong></div>
                    </div>
                    <p class="manager-link-help"><strong>Thèmes abordés :</strong> ${escapeHtml(formatThemeList(selectedAnsweredThemeIds))}</p>
                    <p class="manager-link-help"><strong>Thèmes restants :</strong> ${escapeHtml(formatThemeList(selectedRemainingThemeIds))}</p>
                    <div class="button-row manager-card-actions">
                      <button class="button-secondary" data-action="copy-link" data-link="${escapeHtml(buildLocalExpertLink(selectedSession))}">${copy.copyLink}</button>
                      <button class="button-secondary" data-action="test-expert" data-session-id="${escapeHtml(selectedSession.id)}">${copy.testExpertPath}</button>
                      <button class="button" data-action="open-document" data-session-id="${escapeHtml(selectedSession.id)}">${copy.viewExpertiseSheets}</button>
                    </div>
                  </div>`
                : `<p class="helper-note selection-hint">Cliquez sur un entretien pour afficher les détails et les actions.</p>`
            }
          </section>
        </div>
      </div>
    `;
  }

  function renderHome() {
    return renderCockpit();
  }

  function renderExpertInterview(route) {
    const copy = dictionary();
    if (route.token && backendAvailable()) {
      const remoteSession = getSessionByToken(route.token);
      const loadState = appState.backend.publicLoads[route.token];
      if (!remoteSession && loadState !== "missing") {
        queueRemotePublicLoad(route.token);
        return `
          <div class="expert-shell">
            <section class="expert-card centered">
              <p class="eyebrow">${copy.interviewArea}</p>
              <h1 class="expert-title">Chargement de l’entretien</h1>
              <p class="expert-copy">Nous récupérons les questions et les réponses déjà sauvegardées.</p>
            </section>
          </div>
        `;
      }

      if (!remoteSession && loadState === "missing") {
        return `
          <div class="expert-shell">
            <section class="expert-card centered">
              <p class="eyebrow">${copy.invalidTokenTitle}</p>
              <p class="expert-copy">${copy.invalidTokenBody}</p>
            </section>
          </div>
        `;
      }
    }

    const session = route.token
      ? getOrCreateSessionByToken(route.token)
      : route.sessionId
        ? getSessionById(route.sessionId)
        : getActiveSession();
    const previewBanner = route.preview
      ? `<div class="preview-banner">
          <div>
            <p class="eyebrow">Prévisualisation du parcours expert</p>
            <p class="helper-note">Ceci est l’écran que verra la personne à qui vous envoyez le lien.</p>
          </div>
          <a class="button-subtle" href="${routeLabels.home}">Retour au tableau de bord</a>
        </div>`
      : "";

    if (!session) {
      return `
        <div class="expert-shell">
          ${previewBanner}
          <section class="expert-card centered">
            <p class="eyebrow">${copy.invalidTokenTitle}</p>
            <p class="expert-copy">${copy.invalidTokenBody}</p>
          </section>
        </div>
      `;
    }

    if (session.completedAt) {
      return `
        <div class="expert-shell">
          ${previewBanner}
          <section class="expert-card centered">
            <p class="eyebrow">${copy.interviewArea}</p>
            <h1 class="expert-title">${copy.completedThanksTitle}</h1>
            <p class="expert-copy">${copy.completedThanksBody}</p>
          </section>
        </div>
      `;
    }

    if (session.partialSubmittedAt) {
      return `
        <div class="expert-shell">
          ${previewBanner}
          <section class="expert-card centered">
            <p class="eyebrow">${copy.interviewArea}</p>
            <h1 class="expert-title">${copy.partialThanksTitle}</h1>
            <p class="expert-copy">${copy.partialThanksBody}</p>
          </section>
        </div>
      `;
    }

    if (appState.finishConfirmationSessionId === session.id) {
      return `
        <div class="expert-shell">
          ${previewBanner}
          <section class="expert-card centered">
            <p class="eyebrow">${copy.interviewArea}</p>
            <h1 class="expert-title">${copy.partialSubmitTitle}</h1>
            <p class="expert-copy">${copy.partialSubmitBody}</p>
            <div class="expert-actions">
              <button class="button-secondary expert-secondary" data-action="continue-later">${copy.continueLater}</button>
              <button class="button expert-primary" data-action="submit-partial">${copy.submitPartial}</button>
            </div>
          </section>
        </div>
      `;
    }

    if (appState.pauseConfirmationSessionId === session.id) {
      return `
        <div class="expert-shell">
          ${previewBanner}
          <section class="expert-card centered">
            <p class="eyebrow">${copy.interviewArea}</p>
            <h1 class="expert-title">${copy.pauseSavedTitle}</h1>
            <p class="expert-copy">${copy.pauseSavedBody}</p>
            <div class="expert-actions single">
              <button class="button expert-primary" data-action="resume-now">${copy.resumeNow}</button>
            </div>
            <p class="footer-note">${copy.savedAt} ${escapeHtml(formatTime(session.pausedAt || session.updatedAt))}</p>
          </section>
        </div>
      `;
    }

    if (!session.startedAt || session.pausedAt) {
      return `
        <div class="expert-shell">
          ${previewBanner}
          <section class="expert-card centered">
            <p class="eyebrow">${copy.interviewArea}</p>
            <h1 class="expert-title">${copy.expertIntroTitle}</h1>
            <p class="expert-copy">${copy.expertIntroBody}</p>
            <p class="resume-banner">${session.pausedAt || session.answeredPromptCount > 0 ? copy.resumeNotice : copy.expertIntroReassurance}</p>
            <div class="expert-actions single">
              <button class="button expert-primary" data-action="start-interview">
                ${session.pausedAt || session.answeredPromptCount > 0 ? copy.resumeExpertInterview : copy.startExpertInterview}
              </button>
            </div>
          </section>
        </div>
      `;
    }

    if (session.draftAnswer && !appState.draftAnswer) {
      appState.draftAnswer = session.draftAnswer;
    }

    const themeIds = getSessionThemeIds(session);
    const activeQuestion = [...session.messages]
      .reverse()
      .find((item) => item.role === "assistant" && item.sectionId === session.currentSectionId);
    const currentIndex = Math.max(0, themeIds.indexOf(session.currentSectionId));
    const totalQuestions = themeIds.length;
    const questionNumber = Math.min(totalQuestions, currentIndex + 1);
    const answeredCount = getAnsweredThemeCount(session);
    const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

    return `
      <div class="expert-shell">
        ${previewBanner}
        <section class="expert-card question-focus">
          <div class="expert-progress-line">
            <span>${copy.questionCount} ${questionNumber} sur ${totalQuestions}</span>
            <span>${answeredCount}/${totalQuestions} ${copy.answeredQuestions}</span>
          </div>
          <div class="progress-meter expert-meter"><span style="width:${Math.max(6, progressPercent)}%;"></span></div>
          <p class="question-meta">${copy.themeLabel} : ${escapeHtml(getSectionTitle(session.currentSectionId))}</p>
          <h1 class="expert-question">${escapeHtml(activeQuestion ? activeQuestion.content : getSectionQuestion(session.currentSectionId))}</h1>
          <div class="dictaphone-panel simple">
            <button class="${getCaptureStatusClass(session) ? "button microphone-button live" : "button microphone-button"}" data-action="toggle-microphone" ${isCaptureBusy(session) && appState.audio.status !== "recording" ? "disabled" : ""}>
              ${escapeHtml(getAudioButtonLabel(session))}
            </button>
            <p class="micro-status">
              <span class="dot ${getCaptureStatusClass(session)}"></span>
              ${escapeHtml(isRemoteAudioSession(session) ? getAudioStatusLabel() : appState.speech.listening ? copy.micRecording : copy.micStopped)}
            </p>
          </div>
          <div class="transcription-block">
            <label class="label" for="answer-input">${copy.yourAnswer}</label>
            <textarea id="answer-input" class="textarea expert-textarea" placeholder="${escapeHtml(copy.speechHint)}">${escapeHtml(appState.draftAnswer)}</textarea>
            ${
              isRemoteAudioSession(session) && appState.audio.status === "ready"
                ? `<p class="transcript-review-note">${escapeHtml(copy.transcriptReady)}</p>`
                : ""
            }
            <p class="helper-note">${copy.submitHint}</p>
            ${
              backendAvailable() && session.source === "supabase" && appState.backend.managerError
                ? `<p class="helper-note" style="margin-top:10px;">${escapeHtml(appState.backend.managerError)}</p>`
                : ""
            }
          </div>
          <div class="expert-actions">
            <button class="button expert-primary" data-action="submit-answer" ${isCaptureBusy(session) ? "disabled" : ""}>${copy.sendAnswer}</button>
            <button class="button-secondary expert-secondary" data-action="pause-interview">${copy.pauseInterview}</button>
          </div>
          <p class="footer-note" id="save-status">${copy.savedAt} ${escapeHtml(formatTime(session.draftUpdatedAt || session.updatedAt))} · ${copy.saveNotice}</p>
          <button class="text-link expert-finish" data-action="finish-interview">${copy.finishInterview}</button>
        </section>
      </div>
    `;
  }

  function getAnsweredThemeIds(session) {
    const themeIds = getSessionThemeIds(session);
    return themeIds.filter((themeId) =>
      (session.messages || []).some((message) => message.role === "user" && message.sectionId === themeId),
    );
  }

  function renderSimpleList(values, fallback) {
    const items = values && values.length ? values : [fallback];
    return `<ul class="doc-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function getThemeAnswersForSession(session, themeId) {
    return (session.messages || [])
      .filter((message) => message.role === "user" && message.sectionId === themeId)
      .map((message) => compactSentence(message.content))
      .filter(Boolean);
  }

  function getThemeFicheStatus(session, themeId) {
    const answers = getThemeAnswersForSession(session, themeId);
    if (!answers.length) return "Non abordé";
    const totalLength = answers.join(" ").length;
    return answers.length > 1 || totalLength > 260 ? "Enrichi" : "Réponse partielle";
  }

  function getThemePreview(session, themeId) {
    const answer = getThemeAnswersForSession(session, themeId)[0];
    if (!answer) return "Cette fiche sera complétée avec les prochaines réponses.";
    return answer.length > 132 ? `${answer.slice(0, 129)}...` : answer;
  }

  function renderFullAnswerDisclosure(answer) {
    if (!answer || answer.length <= 132) return "";
    return `
      <details class="answer-disclosure">
        <summary>Voir la réponse complète</summary>
        <p>${escapeHtml(answer)}</p>
      </details>
    `;
  }

  function getThemeOpenQuestions(answers) {
    const combined = answers.join(" ");
    const gaps = [];
    if (!answers.length) {
      return ["Attendre une première réponse de l’expert sur ce thème."];
    }
    if (!combined.match(/\b(exemple|cas client|client|machine|atelier)\b/i)) {
      gaps.push("Ajouter un exemple concret ou un cas client si possible.");
    }
    if (!combined.match(/\b(d’abord|premier|ensuite|puis|ordre|avant|après)\b/i)) {
      gaps.push("Préciser l’ordre des vérifications ou du raisonnement.");
    }
    if (!combined.match(/\b(erreur|risque|sécurité|pression|alerte|trompe)\b/i)) {
      gaps.push("Clarifier les erreurs ou risques à éviter.");
    }
    return gaps.length ? gaps : ["Aucune question ouverte prioritaire pour le moment."];
  }

  function getThemeExamples(answers) {
    return answers.filter((answer) => /\b(exemple|cas client|client|machine|atelier|fuite)\b/i.test(answer));
  }

  function getThemeNotes(document, themeId) {
    return document?.themeNotes?.[themeId] || "";
  }

  function renderThemeFicheCard(session, themeId) {
    const firstAnswer = getThemeAnswersForSession(session, themeId)[0] || "";
    return `
      <article class="theme-card synthesis-fiche-card">
        <div>
          <span>${escapeHtml(getSectionTitle(themeId))}</span>
          <p class="helper-note fiche-preview">${escapeHtml(getThemePreview(session, themeId))}</p>
          ${renderFullAnswerDisclosure(firstAnswer)}
        </div>
        <strong>${escapeHtml(getThemeFicheStatus(session, themeId))}</strong>
        <button class="button-secondary" data-action="open-doc-section" data-section-id="${escapeHtml(themeId)}">Ouvrir la fiche</button>
      </article>
    `;
  }

  function renderThemeFicheDetail(session, document, themeId) {
    const copy = dictionary();
    const status = getThemeFicheStatus(session, themeId);
    const answers = getThemeAnswersForSession(session, themeId);
    const examples = getThemeExamples(answers);
    const openQuestions = getThemeOpenQuestions(answers);
    const notes = getThemeNotes(document, themeId);
    const hasContent = answers.length > 0;

    return `
      <div class="page-stack">
        <div class="document-header">
          <div>
            <p class="eyebrow">Fiche technique</p>
            <h1 class="section-title" style="margin-top:14px;font-size:48px;">${escapeHtml(getSectionTitle(themeId))}</h1>
            <p class="helper-note" style="margin-top:8px;">${escapeHtml(`${session.firstName} ${session.lastName}`.trim() || "Expert NumerHyd")}</p>
          </div>
          <div class="header-actions">
            <button class="button-subtle" data-action="back-synthesis">Retour à la synthèse</button>
            <button class="button-secondary" data-action="copy-link" data-link="${escapeHtml(buildLocalExpertLink(session))}">${copy.copyLink}</button>
            <button class="button" data-action="export-pdf">${copy.exportPdf}</button>
          </div>
        </div>
        <section class="section-card synthesis-card">
          <p class="eyebrow">${escapeHtml(status)}</p>
          <h2 class="section-title" style="margin-top:12px;">${escapeHtml(getSectionTitle(themeId))}</h2>
          ${
            hasContent
              ? `
                <div class="document-field">
                  <p class="doc-key">Connaissances capturées</p>
                  ${renderSimpleList(answers, "Cette fiche sera complétée lorsque l’expert aura répondu à plus de questions sur ce thème.")}
                </div>
                <div class="document-field">
                  <p class="doc-key">Raisonnement / heuristiques</p>
                  ${renderSimpleList(answers, "À compléter.")}
                </div>
                <div class="document-field">
                  <p class="doc-key">Exemples ou cas mentionnés</p>
                  ${renderSimpleList(examples, "Aucun exemple précis n’a encore été repéré dans cette fiche.")}
                </div>
                <div class="document-field">
                  <p class="doc-key">Questions ouvertes</p>
                  ${renderSimpleList(openQuestions, "Aucune question ouverte prioritaire pour le moment.")}
                </div>
              `
              : `<div class="empty-inline">Cette fiche sera complétée lorsque l’expert aura répondu à plus de questions sur ce thème.</div>`
          }
          <div class="document-field">
            <p class="doc-key">Notes éditables</p>
            <p class="helper-note" style="margin-bottom:12px;">Ajoutez une précision ou une correction interne si nécessaire.</p>
            <textarea class="textarea doc-text" id="doc-edit" data-theme-id="${escapeHtml(themeId)}">${escapeHtml(notes)}</textarea>
          </div>
        </section>
      </div>
    `;
  }

  function renderThemeFicheCards(session) {
    return `
      <div class="theme-card-list synthesis-fiche-list">
        ${getSessionThemeIds(session).map((themeId) => renderThemeFicheCard(session, themeId)).join("")}
      </div>
    `;
  }

  function renderInterview(route) {
    return renderExpertInterview(route);

    const copy = dictionary();
    const session = route.token
      ? getOrCreateSessionByToken(route.token)
      : route.sessionId
        ? getSessionById(route.sessionId)
        : getActiveSession();
    const invalidToken = Boolean(route.token) && !session;
    const needsIdentity =
      Boolean(route.token) &&
      session &&
      !session.firstName &&
      !session.lastName &&
      session.answeredPromptCount === 0;

    if (invalidToken) {
      return `
        <div class="page-stack">
          <div class="split-topbar">
            <div>
              <a href="${route.token ? "/" : routeLabels.home}" class="small-link">${copy.backHome}</a>
              <p class="eyebrow" style="margin-top:12px;">${copy.interviewArea}</p>
            </div>
            ${renderLanguageToggle(true)}
          </div>
          <section class="card form-card">
            <p class="eyebrow">${copy.invalidTokenTitle}</p>
            <p class="card-text" style="margin-top:14px;">${copy.invalidTokenBody}</p>
          </section>
        </div>
      `;
    }

    if (!session || needsIdentity) {
      return `
        <div class="page-stack">
          <div class="split-topbar">
            <div>
              <a href="${route.token ? "/" : routeLabels.home}" class="small-link">${copy.backHome}</a>
              <p class="eyebrow" style="margin-top:12px;">${copy.interviewArea}</p>
            </div>
            ${renderLanguageToggle(true)}
          </div>
          <section class="card form-card">
            <p class="eyebrow">${copy.startTitle}</p>
            <div style="margin-top:22px;" class="field-grid">
              <div>
                <label class="label" for="first-name">${copy.firstName}</label>
                <input id="first-name" class="field" value="${escapeHtml(session?.firstName || "")}" />
              </div>
              <div>
                <label class="label" for="last-name">${copy.lastName}</label>
                <input id="last-name" class="field" value="${escapeHtml(session?.lastName || "")}" />
              </div>
            </div>
            <div class="card-actions" style="margin-top:24px;">
              <button class="button full" data-action="start-interview">${copy.begin}</button>
            </div>
          </section>
        </div>
      `;
    }

    if (session.draftAnswer && !appState.draftAnswer) {
      appState.draftAnswer = session.draftAnswer;
    }

    const activeQuestion = [...session.messages].reverse().find((item) => item.role === "assistant");
    const latestUser = [...session.messages].reverse().find((item) => item.role === "user");
    const nextSection = SECTION_ORDER[SECTION_ORDER.indexOf(session.currentSectionId) + 1] || null;
    const hints = getInterviewHints(session.currentSectionId);

    return `
      <div class="page-stack">
        <div class="split-topbar">
          <div>
            <a href="${route.token ? "/" : routeLabels.home}" class="small-link">${copy.backHome}</a>
            <p class="eyebrow" style="margin-top:12px;">${copy.interviewArea}</p>
            <p class="helper-note" style="margin-top:10px;">${copy.captureNote}</p>
            ${
              session.answeredPromptCount > 0 || session.pausedAt
                ? `<p class="resume-banner">${copy.resumeNotice}</p>`
                : ""
            }
          </div>
          ${renderLanguageToggle(true)}
        </div>
        <div class="two-col">
          <div class="stack">
            <section class="tracker-panel">
              <div class="tracker-head">
                <p class="eyebrow">${copy.interviewSteps}</p>
                <span class="helper-note">${session.completionPercent}%</span>
              </div>
              <div class="section-tracker">
                ${session.sections
                  .map(
                    (section) => `<span class="tracker-pill ${section.status}">${escapeHtml(
                      getSectionTitle(section.id),
                    )}</span>`,
                  )
                  .join("")}
              </div>
            </section>
            <section class="question-card">
              <p class="eyebrow">${copy.currentQuestion}</p>
              <h1 class="question-title" style="margin-top:18px;">${escapeHtml(
                activeQuestion ? activeQuestion.content : getSectionQuestion(session.currentSectionId),
              )}</h1>
              <p class="question-meta">${copy.currentFocus} : ${escapeHtml(
                getSectionTitle(session.currentSectionId),
              )}</p>
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
              <div class="dictaphone-panel">
                <div>
                  <p class="eyebrow">Dictaphone métier</p>
                  <p class="helper-note" style="margin-top:8px;">${copy.speechHint}</p>
                </div>
                <button class="${appState.speech.listening ? "button microphone-button live" : "button microphone-button"}" data-action="toggle-microphone">
                  ${appState.speech.listening ? copy.stopMicrophone : copy.startMicrophone}
                </button>
              </div>
              <div class="mode-row" style="justify-content:space-between;align-items:center;margin-top:18px;">
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
                        <span class="dot ${appState.speech.listening ? "live" : ""}"></span>
                        <strong>${appState.speech.listening ? copy.speechListening : copy.speechStopped}</strong>
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
                  <button class="button" data-action="submit-answer">${copy.sendAnswer}</button>
                </div>
              </div>
            </section>
            <div class="hint-row">
              ${hints.map((hint) => `<span class="hint-chip">${escapeHtml(hint)}</span>`).join("")}
            </div>
          </div>
          <aside class="stack">
            <section class="panel panel-compact">
              <p class="eyebrow">${copy.progress}</p>
              <div class="progress-meter" style="margin-top:14px;"><span style="width:${Math.max(
                6,
                session.completionPercent,
              )}%;"></span></div>
              <div class="summary-list">
                <div class="summary-row">
                  <span class="helper-note">${copy.progress}</span>
                  <strong>${session.completionPercent}%</strong>
                </div>
                <div class="summary-row">
                  <span class="helper-note">${copy.currentFocus}</span>
                  <strong>${escapeHtml(getSectionTitle(session.currentSectionId))}</strong>
                </div>
                <div class="summary-row">
                  <span class="helper-note">${copy.nextStep}</span>
                  <strong>${escapeHtml(
                    nextSection ? getSectionTitle(nextSection) : copy.finishInterview,
                  )}</strong>
                </div>
              </div>
              <div class="panel-divider"></div>
              <div class="button-row stacked flush">
                <button class="button full" data-action="finish-interview">${copy.finishInterview}</button>
                <button class="button-secondary full" data-action="pause-interview">${copy.pauseInterview}</button>
                <button class="button-secondary full" data-action="reset-session">${copy.reset}</button>
              </div>
              <p class="footer-note" id="save-status">${copy.savedAt} ${escapeHtml(formatTime(session.draftUpdatedAt || session.updatedAt))} · ${copy.saveNotice}</p>
              <p class="footer-note">${copy.localDemoNotice}</p>
            </section>
          </aside>
        </div>
      </div>
    `;
  }

  function renderManager(route) {
    const copy = dictionary();
    ensureManagerDemo();
    queueRemoteManagerLoad();
    const session = route.sessionId ? getSessionById(route.sessionId) : null;

    if (!session) {
      return renderCockpit();
    }

    const expertiseDoc = loadDocument(session.id) || generateDocument(session);
    saveDocument(expertiseDoc);
    const selectedThemeIds = getSessionThemeIds(session);
    const activeThemeId = appState.currentDocId && selectedThemeIds.includes(appState.currentDocId)
      ? appState.currentDocId
      : null;

    if (activeThemeId) {
      return renderThemeFicheDetail(session, expertiseDoc, activeThemeId);
    }

    return `
      <div class="page-stack">
        <div class="document-header">
          <div>
            <p class="eyebrow">${copy.managerArea}</p>
            <h1 class="section-title" style="margin-top:14px;font-size:52px;">Synthèse de l’entretien — ${escapeHtml(
              `${session.firstName} ${session.lastName}`.trim() || expertiseDoc.subtitle,
            )}</h1>
            <p class="subtitle" style="font-size:22px;margin-top:14px;">${escapeHtml(session.profile || session.roleTitle)}</p>
            <p class="helper-note" style="margin-top:8px;">${escapeHtml(getSessionStatus(session))}</p>
          </div>
          <div class="header-actions">
            ${renderLanguageToggle(false)}
            <a class="button-subtle" href="${routeLabels.home}">Retour au tableau de bord</a>
            <button class="button-secondary" data-action="copy-link" data-link="${escapeHtml(buildLocalExpertLink(session))}">${copy.copyLink}</button>
            <button class="button" data-action="export-pdf">${copy.exportPdf}</button>
          </div>
        </div>
        <div class="stats-grid synthesis-stats">
          <div class="stat"><span class="helper-note">Statut</span><strong>${escapeHtml(getSessionStatus(session))}</strong></div>
          <div class="stat"><span class="helper-note">Fiches commencées</span><strong>${getAnsweredThemeCount(session)}/${selectedThemeIds.length}</strong></div>
          <div class="stat"><span class="helper-note">${copy.sessionsCount}</span><strong>${session.sessionCount || 0}</strong></div>
          <div class="stat"><span class="helper-note">${copy.totalTime}</span><strong>${escapeHtml(formatDuration(session.durationMinutes))}</strong></div>
          <div class="stat"><span class="helper-note">${copy.lastUpdated}</span><strong style="font-size:20px;">${escapeHtml(formatDate(session.updatedAt))}</strong></div>
        </div>
        <section class="section-card synthesis-card">
          <p class="eyebrow">${copy.docTitle}</p>
          <h2 class="section-title" style="margin-top:12px;">Fiches techniques</h2>
          <p class="helper-note" style="margin-top:8px;">Chaque fiche correspond à un thème abordé pendant l’entretien.</p>
          ${renderThemeFicheCards(session)}
        </section>
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
    switch (sectionId) {
      case "drilled-block-design":
        return ["Décrivez votre premier réflexe", "Mentionnez les contraintes qui changent tout"];
      case "schematics-client-need":
        return ["Distinguez besoin réel et solution demandée", "Parlez de la séquence machine"];
      case "material-choices":
        return ["Expliquez le critère de choix", "Dites quand vous refusez une option"];
      case "pressure-safety":
        return ["Parlez des risques", "Dites ce que vous contrôlez en premier"];
      case "leak-diagnosis":
        return ["Localisez la fuite", "Précisez froid, chaud, repos ou pression"];
      case "troubleshooting-order":
        return ["Donnez l’ordre des vérifications", "Commencez par le plus simple"];
      case "customer-cases":
        return ["Racontez un cas réel", "Dites ce que ce cas vous a appris"];
      case "frequent-errors":
        return ["Pensez à un débutant", "Nommez les pièges classiques"];
      default:
        return ["Donnez un exemple concret", "Expliquez votre raisonnement terrain"];
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
        const session = createBlankSession("Expert", "NumerHyd");
        session.roleTitle = "Expertise hydraulique NumerHyd";
        saveSession(session);
        saveDocument(generateDocument(session));
        appState.draftAnswer = "";
        persist();
        setHash(`#/interview/${session.id}`);
      });
    });

    document.querySelectorAll("[data-action='resume-active']").forEach((button) => {
      button.addEventListener("click", () => {
        const sessionId = button.getAttribute("data-session-id");
        if (sessionId) {
          appState.activeSessionId = sessionId;
          persist();
          setHash(`#/interview/${sessionId}`);
        }
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

    if (route.name === "manager" || route.name === "home") {
      bindManagerEvents(route);
    }
  }

  function bindInterviewEvents(route) {
    const resolveInterviewSession = () =>
      route.token
        ? getOrCreateSessionByToken(route.token)
        : route.sessionId
          ? getSessionById(route.sessionId)
          : getActiveSession();

    document.querySelectorAll("[data-action='resume-now']").forEach((button) => {
      button.addEventListener("click", () => {
        const session = resolveInterviewSession();
        if (!session) return;
        appState.pauseConfirmationSessionId = null;
        appState.finishConfirmationSessionId = null;
        saveSession({
          ...session,
          startedAt: session.startedAt || new Date().toISOString(),
          sessionCount: session.pausedAt ? (session.sessionCount || 1) + 1 : Math.max(1, session.sessionCount || 0),
          pausedAt: null,
          updatedAt: new Date().toISOString(),
        });
        render();
      });
    });

    document.querySelectorAll("[data-action='continue-later']").forEach((button) => {
      button.addEventListener("click", () => {
        const session = resolveInterviewSession();
        if (!session) return;
        const now = new Date().toISOString();
        appState.finishConfirmationSessionId = null;
        appState.pauseConfirmationSessionId = session.id;
        saveSession({
          ...session,
          pausedAt: now,
          updatedAt: now,
        });
        render();
      });
    });

    document.querySelectorAll("[data-action='submit-partial']").forEach((button) => {
      button.addEventListener("click", () => {
        const session = resolveInterviewSession();
        if (!session) return;
        const now = new Date().toISOString();
        const submittedSession = {
          ...session,
          draftAnswer: "",
          pausedAt: null,
          partialSubmittedAt: now,
          finishedAt: now,
          updatedAt: now,
        };
        appState.finishConfirmationSessionId = null;
        appState.pauseConfirmationSessionId = null;
        appState.draftAnswer = "";
        saveSession(submittedSession);
        saveDocument(generateDocument(submittedSession));
        render();
      });
    });

    const startButton = document.querySelector("[data-action='start-interview']");
    if (startButton) {
      startButton.addEventListener("click", () => {
        const firstNameField = document.getElementById("first-name");
        const lastNameField = document.getElementById("last-name");
        const firstName = firstNameField ? firstNameField.value.trim() : "";
        const lastName = lastNameField ? lastNameField.value.trim() : "";
        let session;

        if (route.token) {
          session = getOrCreateSessionByToken(route.token);
          if (!session) {
            return;
          }

          if (session.source !== "supabase") {
            session = {
              ...session,
              firstName,
              lastName,
              roleTitle: "Expertise hydraulique NumerHyd",
              updatedAt: new Date().toISOString(),
            };
            saveSession(session, false);
          }
        } else {
          session = route.sessionId
            ? getSessionById(route.sessionId)
            : getActiveSession() || createBlankSession("Expert", "NumerHyd");
          if (!session) {
            session = createBlankSession("Expert", "NumerHyd");
          }
        }

        session = {
          ...session,
          firstName: firstName || session.firstName || "Expert",
          lastName: lastName || session.lastName || "NumerHyd",
          roleTitle: session.roleTitle || "Expertise hydraulique NumerHyd",
          startedAt: session.startedAt || new Date().toISOString(),
          sessionCount: session.startedAt && session.pausedAt ? (session.sessionCount || 1) + 1 : Math.max(1, session.sessionCount || 0),
          pausedAt: null,
          updatedAt: new Date().toISOString(),
        };
        appState.pauseConfirmationSessionId = null;
        saveSession(session);
        saveDocument(generateDocument(session));
        appState.draftAnswer = "";
        if (route.token) {
          render();
        } else {
          setHash(`#/interview/${session.id}`);
        }
      });
      return;
    }

    const session = route.token
      ? getOrCreateSessionByToken(route.token)
      : route.sessionId
        ? getSessionById(route.sessionId)
        : getActiveSession();
    const textarea = document.getElementById("answer-input");
    if (textarea) {
      textarea.addEventListener("input", (event) => {
        appState.draftAnswer = event.target.value;
        saveDraftForSession(session, appState.draftAnswer);
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
        toggleAudioCapture(session);
      });
    }

    document.querySelectorAll("[data-action='submit-answer']").forEach((button) => {
      button.addEventListener("click", () => submitCurrentAnswer(session));
    });

    document.querySelectorAll("[data-action='reset-session']").forEach((button) => {
      button.addEventListener("click", () => {
        if (!session) return;
        const nextSession = createBlankSession(session.firstName, session.lastName, session.token);
        nextSession.id = session.id;
        saveSession(nextSession);
        removeDocument(session.id);
        saveDocument(generateDocument(nextSession));
        appState.draftAnswer = "";
        render();
      });
    });

    document.querySelectorAll("[data-action='pause-interview']").forEach((button) => {
      button.addEventListener("click", () => {
        if (!session) return;
        stopSpeechIfNeeded();
        const savedSession = saveDraftForSession(session, appState.draftAnswer);
        const pausedSession = {
          ...(savedSession || session),
          pausedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        saveSession(pausedSession);
        appState.pauseConfirmationSessionId = pausedSession.id;
        render();
      });
    });

    document.querySelectorAll("[data-action='finish-interview']").forEach((button) => {
      button.addEventListener("click", () => {
        if (!session) return;
        if (!isInterviewComplete(session)) {
          stopSpeechIfNeeded();
          appState.finishConfirmationSessionId = session.id;
          appState.pauseConfirmationSessionId = null;
          render();
          return;
        }

        const now = new Date().toISOString();
        const finishedSession = {
          ...session,
          draftAnswer: "",
          pausedAt: null,
          completedAt: now,
          finishedAt: now,
          updatedAt: now,
        };
        saveSession(finishedSession);
        const finalDocument = generateDocument(finishedSession);
        saveDocument(finalDocument);
        appState.activeSessionId = null;
        appState.draftAnswer = "";
        persist();
        render();
      });
    });
  }

  async function submitCurrentAnswer(session) {
    if (!session) {
      return;
    }

    if (isCaptureBusy(session)) {
      return;
    }

    const value = appState.draftAnswer.trim();
    if (!value) {
      return;
    }

    stopSpeechIfNeeded();
    if (session.source === "supabase") {
      try {
        const nextSession = await submitRemoteTextAnswer(session, value);
        appState.draftAnswer = "";
        if (nextSession) {
          nextSession.draftAnswer = "";
          nextSession.draftUpdatedAt = new Date().toISOString();
          upsertSessionInMemory(nextSession);
        }
        resetAudioRecordingState();
        render();
      } catch (error) {
        appState.backend.managerError = error.message || "La réponse n’a pas pu être sauvegardée.";
        render();
      }
      return;
    }

    const nextSession = {
      ...advanceInterview(session, value),
      draftAnswer: "",
      draftUpdatedAt: new Date().toISOString(),
      pausedAt: null,
      durationMinutes: (session.durationMinutes || 0) + 6,
    };
    saveSession(nextSession);
    saveDocument(generateDocument(nextSession));
    appState.draftAnswer = "";
    resetAudioRecordingState();
    render();
  }

  function bindManagerEvents(route) {
    document.querySelectorAll("[data-action='show-create-interview']").forEach((button) => {
      button.addEventListener("click", () => {
        appState.showCreateInterview = true;
        appState.createdSessionId = null;
        appState.selectedDashboardSessionId = null;
        render();
      });
    });

    document.querySelectorAll("[data-action='cancel-create-interview']").forEach((button) => {
      button.addEventListener("click", () => {
        appState.showCreateInterview = false;
        render();
      });
    });

    document.querySelectorAll("[data-action='clear-created-session']").forEach((button) => {
      button.addEventListener("click", () => {
        appState.createdSessionId = null;
        appState.showCreateInterview = false;
        render();
      });
    });

    document.querySelectorAll("[data-action='submit-create-interview']").forEach((button) => {
      button.addEventListener("click", async () => {
        const expertName = document.getElementById("expert-name")?.value.trim() || "Expert NumerHyd";
        const profile = document.getElementById("expert-profile")?.value.trim() || dictionary().profileSeller;
        const selectedThemeIds = Array.from(document.querySelectorAll(".theme-checkbox:checked"))
          .map((input) => input.value)
          .filter((value) => SECTION_ORDER.includes(value));
        const themeIds = selectedThemeIds.length ? selectedThemeIds : SECTION_ORDER;

        if (backendAvailable()) {
          try {
            const session = await createRemoteInterview({
              expertName,
              profile,
              selectedThemeIds: themeIds,
            });
            appState.showCreateInterview = false;
            appState.createdSessionId = session?.id || null;
            appState.selectedDashboardSessionId = null;
            appState.currentDocId = null;
            appState.backend.managerLoaded = false;
            queueRemoteManagerLoad(true);
            render();
          } catch (error) {
            appState.backend.managerError = error.message || "La création Supabase a échoué.";
            render();
          }
          return;
        }

        const parts = expertName.split(/\s+/).filter(Boolean);
        const session = createBlankSession(parts[0] || "Expert", parts.slice(1).join(" ") || "NumerHyd", createToken(), themeIds);
        session.profile = profile;
        session.roleTitle = profile;
        session.contextNote = `Thèmes sélectionnés : ${themeIds.map(getSectionTitle).join(", ")}`;
        session.updatedAt = new Date().toISOString();
        appState.showCreateInterview = false;
        appState.createdSessionId = session.id;
        appState.selectedDashboardSessionId = null;
        saveSession(session, false);
        saveDocument(generateDocument(session));
        appState.currentDocId = null;
        render();
      });
    });

    document.querySelectorAll("[data-action='select-dashboard-interview']").forEach((button) => {
      button.addEventListener("click", () => {
        const sessionId = button.getAttribute("data-session-id");
        appState.selectedDashboardSessionId = appState.selectedDashboardSessionId === sessionId ? null : sessionId;
        appState.createdSessionId = null;
        appState.showCreateInterview = false;
        render();
      });
    });

    const allThemes = document.getElementById("all-themes");
    if (allThemes) {
      allThemes.addEventListener("change", () => {
        document.querySelectorAll(".theme-checkbox").forEach((input) => {
          input.checked = allThemes.checked;
        });
      });

      document.querySelectorAll(".theme-checkbox").forEach((input) => {
        input.addEventListener("change", () => {
          const checkedCount = document.querySelectorAll(".theme-checkbox:checked").length;
          allThemes.checked = checkedCount === SECTION_ORDER.length;
        });
      });
    }

    document.querySelectorAll("[data-action='open-theme-fiche']").forEach((button) => {
      button.addEventListener("click", () => {
        const themeId = button.getAttribute("data-theme-id");
        if (themeId && SECTION_ORDER.includes(themeId)) {
          appState.activeThemeId = themeId;
          render();
        }
      });
    });

    document.querySelectorAll("[data-action='create-invite-link']").forEach((button) => {
      button.addEventListener("click", async () => {
        const session = createBlankSession("", "", createToken());
        session.roleTitle = "Entretien technique à démarrer";
        saveSession(session, false);
        saveDocument(generateDocument(session));
        appState.currentDocId = null;
        setHash(`#/manager/${session.id}`);
      });
    });

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
          appState.currentDocId = null;
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

    document.querySelectorAll("[data-action='back-synthesis']").forEach((button) => {
      button.addEventListener("click", () => {
        appState.currentDocId = null;
        render();
      });
    });

    document.querySelectorAll("[data-action='export-pdf']").forEach((button) => {
      button.addEventListener("click", () => window.print());
    });

    document.querySelectorAll("[data-action='copy-link']").forEach((button) => {
      button.addEventListener("click", async () => {
        const link = button.getAttribute("data-link") || "";
        const token = button.getAttribute("data-token");
        const value = link || (token ? buildInterviewLink(token) : "");
        if (!value) {
          return;
        }

        if (navigator.clipboard?.writeText) {
          try {
            await navigator.clipboard.writeText(value);
            return;
          } catch {
            // fall through to prompt fallback
          }
        }

        window.prompt(dictionary().copyLink, value);
      });
    });

    document.querySelectorAll("[data-action='send-invite']").forEach((button) => {
      button.addEventListener("click", () => {
        const link = button.getAttribute("data-link") || "";
        const token = button.getAttribute("data-token");
        const value = link || (token ? buildInterviewLink(token) : "");
        if (!value) {
          return;
        }

        const subject =
          appState.language === "fr"
            ? "Lien d’entretien"
            : "Interview link";
        const body =
          appState.language === "fr"
            ? `Bonjour,%0D%0A%0D%0AVoici le lien pour commencer ou reprendre l’entretien :%0D%0A${encodeURIComponent(value)}`
            : `Hello,%0D%0A%0D%0AHere is the link to start or resume the interview:%0D%0A${encodeURIComponent(value)}`;

        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
      });
    });

    document.querySelectorAll("[data-action='test-expert']").forEach((button) => {
      button.addEventListener("click", () => {
        const sessionId = button.getAttribute("data-session-id");
        if (sessionId) {
          appState.pauseConfirmationSessionId = null;
          setHash(`#/interview/${sessionId}/preview`);
        }
      });
    });

    const docEdit = document.getElementById("doc-edit");
    if (docEdit && route.sessionId) {
      docEdit.addEventListener("input", (event) => {
        const sessionId = route.sessionId;
        const document = loadDocument(sessionId);
        if (!document) return;

        document.updatedAt = new Date().toISOString();
        const themeId = event.target.getAttribute("data-theme-id");
        if (themeId && SECTION_ORDER.includes(themeId)) {
          document.themeNotes = {
            ...(document.themeNotes || {}),
            [themeId]: event.target.value,
          };
        } else {
          document.sections = document.sections.map((section) =>
            section.id === appState.currentDocId
              ? { ...section, editableText: event.target.value }
              : section,
          );
        }
        saveDocument(document);
      });
    }
  }
})();
