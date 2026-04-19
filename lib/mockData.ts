import { Language } from "@/lib/i18n";
import { InterviewMessage, InterviewSectionId } from "@/lib/types";

export const STORAGE_KEYS = {
  activeSessionId: "knowledge-capture.v3.active-session-id",
  sessions: "knowledge-capture.v3.sessions",
  documents: "knowledge-capture.v3.documents",
} as const;

export function getOpeningPrompt(language: Language) {
  return language === "fr"
    ? "Commençons simplement. Pouvez-vous m’expliquer votre poste comme si je venais d’arriver ?"
    : "Let’s start simply. Can you explain your job as if I’m brand new here?";
}

export function getSectionOrder(language: Language): Array<{
  id: InterviewSectionId;
  title: string;
  completionHint: string;
}> {
  if (language === "fr") {
    return [
      {
        id: "role-overview",
        title: "Vue d’ensemble du poste",
        completionHint: "Expliquez le rôle, ce qu’on attend de vous et où votre expérience fait la différence.",
      },
      {
        id: "recurring-responsibilities",
        title: "Responsabilités récurrentes",
        completionHint: "Décrivez ce qui revient chaque jour ou chaque semaine pour que l’activité tienne.",
      },
      {
        id: "step-by-step-tasks",
        title: "Tâche détaillée",
        completionHint: "Prenez une tâche importante et déroulez-la étape par étape.",
      },
      {
        id: "problem-solving",
        title: "Gestion des problèmes",
        completionHint: "Notez les incidents fréquents, les signaux d’alerte et les premiers contrôles.",
      },
      {
        id: "tools-files",
        title: "Outils, dossiers et contacts",
        completionHint: "Listez les outils, les fichiers, les dossiers partagés et les personnes-clés.",
      },
      {
        id: "wrap-up",
        title: "Passation finale",
        completionHint: "Ajoutez ce qu’une personne qui reprend le poste doit absolument savoir dès le début.",
      },
    ];
  }

  return [
    {
      id: "role-overview",
      title: "Role overview",
      completionHint: "Explain the role, what people rely on, and where judgement matters most.",
    },
    {
      id: "recurring-responsibilities",
      title: "Recurring responsibilities",
      completionHint: "Describe the responsibilities that return every day or week.",
    },
    {
      id: "step-by-step-tasks",
      title: "Step-by-step task",
      completionHint: "Choose one important task and break it down clearly.",
    },
    {
      id: "problem-solving",
      title: "Problem solving",
      completionHint: "Capture common issues, warning signs, and first checks.",
    },
    {
      id: "tools-files",
      title: "Tools, files, and contacts",
      completionHint: "List the systems, files, shared folders, and key people involved.",
    },
    {
      id: "wrap-up",
      title: "Wrap-up",
      completionHint: "Record what someone new should know in their first days in the role.",
    },
  ];
}

export function getSectionOpeners(language: Language): Record<InterviewSectionId, string> {
  const opening = getOpeningPrompt(language);

  if (language === "fr") {
    return {
      "role-overview": opening,
      "recurring-responsibilities":
        "Très bien. Maintenant, qu’est-ce qui revient chaque jour ou chaque semaine et qui repose sur vous ?",
      "step-by-step-tasks":
        "Choisissons une tâche importante. Pouvez-vous me la dérouler du déclencheur jusqu’au passage de relais ?",
      "problem-solving":
        "Quels sont les problèmes ou imprévus qui reviennent le plus souvent dans ce poste ?",
      "tools-files":
        "Sur quels outils, dossiers, fichiers ou contacts vous appuyez-vous pour faire tourner l’activité ?",
      "wrap-up":
        "Pour finir, qu’est-ce qu’une personne qui reprend le poste doit savoir dès la première semaine ?",
    };
  }

  return {
    "role-overview": opening,
    "recurring-responsibilities":
      "Good. What returns every day or every week and depends on you?",
    "step-by-step-tasks":
      "Let’s pick one important task. Can you walk me through it from trigger to handoff?",
    "problem-solving":
      "What problems or exceptions come up most often in this role?",
    "tools-files":
      "Which tools, folders, files, or key contacts do you rely on to keep the work moving?",
    "wrap-up":
      "To finish, what should a replacement understand in their first week?",
  };
}

export function getWrapUpClosingPrompt(language: Language) {
  return language === "fr"
    ? "Parfait. Quand vous êtes prêt, cliquez sur Générer la documentation pour transformer cet entretien en dossier de passation."
    : "Great. When you’re ready, choose Generate documentation to turn this interview into a handover draft.";
}

export function getInterviewHintsForLanguage(
  language: Language,
): Record<InterviewSectionId, string[]> {
  if (language === "fr") {
    return {
      "role-overview": [
        "Décrivez un exemple concret.",
        "Dites ce qui dépend vraiment de vous.",
        "Expliquez ce qui ne se voit pas dans une fiche de poste.",
      ],
      "recurring-responsibilities": [
        "Précisez à quelle fréquence cela revient.",
        "Indiquez ce qui déclenche l’action.",
        "Mentionnez qui d’autre est concerné.",
      ],
      "step-by-step-tasks": [
        "Déroulez les étapes dans l’ordre.",
        "Ajoutez les contrôles avant de transmettre.",
        "Utilisez un vrai cas si possible.",
      ],
      "problem-solving": [
        "Expliquez comment vous repérez le problème.",
        "Notez les premiers contrôles.",
        "Ajoutez la solution habituelle ou l’escalade.",
      ],
      "tools-files": [
        "Donnez l’emplacement exact.",
        "Précisez qui s’en sert ou le met à jour.",
        "Ajoutez les contacts utiles.",
      ],
      "wrap-up": [
        "Partagez les réflexes à garder.",
        "Citez les erreurs fréquentes.",
        "Concentrez-vous sur la première semaine.",
      ],
    };
  }

  return {
    "role-overview": [
      "Use a real example.",
      "Say what genuinely depends on you.",
      "Explain what would not appear in a job description.",
    ],
    "recurring-responsibilities": [
      "Mention how often it happens.",
      "Say what usually triggers it.",
      "Name who else is involved.",
    ],
    "step-by-step-tasks": [
      "Walk through the steps in order.",
      "Include the checks before handoff.",
      "Use a real job if possible.",
    ],
    "problem-solving": [
      "Explain how you spot the issue.",
      "List the first checks.",
      "Add the usual fix or escalation.",
    ],
    "tools-files": [
      "Give the exact location.",
      "Say who uses or updates it.",
      "Mention the useful contact person.",
    ],
    "wrap-up": [
      "Share the habits worth keeping.",
      "Call out common mistakes.",
      "Focus on the first week.",
    ],
  };
}

export function getSampleMessages(
  language: Language,
): Array<Pick<InterviewMessage, "role" | "content" | "sectionId" | "detectedSignals">> {
  const opening = getOpeningPrompt(language);
  const closing = getWrapUpClosingPrompt(language);

  if (language === "fr") {
    return [
      {
        role: "assistant",
        content: opening,
        sectionId: "role-overview",
        detectedSignals: [],
      },
      {
        role: "user",
        content:
          "Je suis responsable atelier dans une PME de réparation hydraulique industrielle. Je reçois les demandes urgentes, je décide ce qui peut rentrer tout de suite, ce qui doit passer par un démontage avant devis et ce qu’il faut remonter au dirigeant avant de promettre quoi que ce soit. Le vrai travail, c’est de tenir un planning crédible quand un client a une machine immobilisée, sans laisser une fausse urgence casser trois dossiers déjà engagés sur les bancs.",
        sectionId: "role-overview",
        detectedSignals: ["tasks captured", "examples captured"],
      },
      {
        role: "assistant",
        content:
          "Très bien. Maintenant, qu’est-ce qui revient chaque jour ou chaque semaine et qui repose sur vous ?",
        sectionId: "recurring-responsibilities",
        detectedSignals: [],
      },
      {
        role: "user",
        content:
          "Chaque matin avant 8h, j’ouvre HydTrack, je reprends les ordres ouverts, je mets à jour le planning atelier, je regarde quel technicien est disponible sur quel banc, quels dossiers ont une fiche exploitable et quelles machines client sont complètement à l’arrêt. Ensuite j’appelle le technicien référent sur les urgences du jour et les achats sur les dossiers qui risquent de bloquer avant midi.",
        sectionId: "recurring-responsibilities",
        detectedSignals: [
          "tasks captured",
          "tools mentioned",
          "contacts mentioned",
          "examples captured",
        ],
      },
      {
        role: "assistant",
        content:
          "Et qu’est-ce qui déclenche ce réajustement du planning, et quels contrôles faites-vous avant de bouger quoi que ce soit ?",
        sectionId: "recurring-responsibilities",
        detectedSignals: [],
      },
      {
        role: "user",
        content:
          "Je replanifie dès qu’une machine immobilise réellement la production d’un client, qu’un technicien clé manque, qu’un fournisseur glisse sur un kit joints critique ou qu’un dossier arrive sans symptôme clair. Une vraie urgence, ce n’est pas juste un client qui appelle fort: c’est un arrêt machine avec un impact réel et une chance raisonnable d’agir vite. Avant de bouger le planning, je vérifie le niveau de blocage client, la charge réelle des bancs, l’état d’avancement des dossiers déjà ouverts, la dispo pièces et la compétence du technicien à qui je pense confier le job.",
        sectionId: "recurring-responsibilities",
        detectedSignals: [
          "tasks captured",
          "problems captured",
          "tools mentioned",
          "contacts mentioned",
          "examples captured",
        ],
      },
      {
        role: "assistant",
        content:
          "Choisissons une tâche importante. Pouvez-vous me la dérouler du déclencheur jusqu’au passage de relais ?",
        sectionId: "step-by-step-tasks",
        detectedSignals: [],
      },
      {
        role: "user",
        content:
          "Quand une réparation urgente arrive, je crée l’affaire dans HydTrack, je qualifie la machine, le symptôme, le niveau d’arrêt client et les photos reçues, puis je décide si on la fait rentrer directement, si on l’attend pour un devis après démontage ou s’il faut une validation dirigeant avant d’aller plus loin. Si la panne est plausible et qu’on a le créneau, je réserve un banc, j’affecte le technicien, je fais compléter la fiche et je rappelle le client avec une fourchette prudente. Si le symptôme est flou ou si le prix peut exploser après ouverture, je bloque la promesse tant que la machine n’a pas été vue.",
        sectionId: "step-by-step-tasks",
        detectedSignals: [
          "tasks captured",
          "problems captured",
          "tools mentioned",
          "contacts mentioned",
          "examples captured",
        ],
      },
      {
        role: "assistant",
        content:
          "Quels sont les problèmes ou imprévus qui reviennent le plus souvent dans ce poste ?",
        sectionId: "problem-solving",
        detectedSignals: [],
      },
      {
        role: "user",
        content:
          "Les cas qui reviennent tout le temps, c’est la fiche incomplète, le client qui dit urgent sans expliquer l’impact réel, la pièce critique annoncée disponible puis repoussée par le fournisseur, et le chiffrage impossible avant démontage. Si on lance l’atelier sans nettoyer ça, on bloque un banc, on perd une journée de technicien et on se retrouve à rappeler le client sans base sérieuse.",
        sectionId: "problem-solving",
        detectedSignals: ["problems captured", "tasks captured", "examples captured"],
      },
      {
        role: "assistant",
        content:
          "Comment repérez-vous ces écarts, quels sont vos premiers contrôles et à quel moment escaladez-vous ?",
        sectionId: "problem-solving",
        detectedSignals: [],
      },
      {
        role: "user",
        content:
          "Je vois qu’on va droit au mur quand la fiche ne décrit pas vraiment le symptôme, quand la référence pièce a déjà changé plusieurs fois dans l’historique, quand le délai promis ne tient plus avec la charge banc ou quand le client veut un prix ferme avant même qu’on ouvre. Mes trois premiers contrôles sont toujours les mêmes: relire la fiche, comparer avec l’historique réparation, appeler le technicien qui prendra le job. Si le risque pièces ou prix reste trop ouvert, j’appelle les achats ou le dirigeant avant de m’engager. Le raccourci utile, c’est d’appeler le fournisseur tout de suite si la machine immobilise la prod du client, pas après démontage. L’erreur d’un junior, c’est de croire qu’une urgence bruyante est forcément prioritaire.",
        sectionId: "problem-solving",
        detectedSignals: [
          "problems captured",
          "tasks captured",
          "tools mentioned",
          "contacts mentioned",
          "examples captured",
        ],
      },
      {
        role: "assistant",
        content:
          "Sur quels outils, dossiers, fichiers ou contacts vous appuyez-vous pour faire tourner l’activité ?",
        sectionId: "tools-files",
        detectedSignals: [],
      },
      {
        role: "user",
        content:
          "Je travaille avec HydTrack pour le statut des ordres, Outlook pour les clients et fournisseurs, le dossier partagé des affaires en cours pour les photos et notes atelier, Planning Atelier.xlsx pour la charge des bancs, Tarifs Fournisseurs.xlsx pour le dernier prix connu, et un suivi délais critiques quand un client est immobilisé. Sans ces supports, on promet trop vite, on démonte sans savoir si la pièce suivra et on donne des priorités fausses. Les techniciens, les achats, la boîte atelier@ et parfois le dirigeant s’appuient dessus.",
        sectionId: "tools-files",
        detectedSignals: ["tools mentioned", "contacts mentioned", "examples captured"],
      },
      {
        role: "assistant",
        content:
          "Pouvez-vous me donner l’emplacement exact de ces éléments, et dire qui en dépend au quotidien ?",
        sectionId: "tools-files",
        detectedSignals: [],
      },
      {
        role: "user",
        content:
          "Le planning est dans Réseau partagé > Atelier > Pilotage quotidien > Planning Atelier.xlsx, revu tous les matins avec le technicien référent. Les tarifs fournisseurs sont dans Réseau partagé > Atelier > Achats > Tarifs Fournisseurs.xlsx et l’équipe achats les met à jour. Les photos et notes sont dans Réseau partagé > Atelier > Dossiers en cours. HydTrack est la base ERP atelier et les mails passent par atelier@ dans Outlook. Le suivi délais critiques existe bien, mais il est encore surtout tenu par habitude et il faudrait le formaliser proprement pour que quelqu’un d’autre le reprenne sans trou.",
        sectionId: "tools-files",
        detectedSignals: ["tools mentioned", "contacts mentioned", "examples captured"],
      },
      {
        role: "assistant",
        content:
          "Pour finir, qu’est-ce qu’une personne qui reprend le poste doit savoir dès la première semaine ?",
        sectionId: "wrap-up",
        detectedSignals: [],
      },
      {
        role: "user",
        content:
          "Quelqu’un qui reprend doit comprendre qu’on ne promet jamais un délai ou un prix ferme sur une hydraulique lourde sans avoir sécurisé au moins le symptôme, le technicien et la piste pièces. Il faut savoir dire non à une fausse urgence, rappeler vite un client vraiment immobilisé et remonter au dirigeant dès qu’un démontage peut faire exploser le devis. Ce qui ne se voit pas dans un process, c’est qu’un dossier à moitié bon coûte plus cher qu’un dossier honnêtement mis en attente.",
        sectionId: "wrap-up",
        detectedSignals: ["tasks captured", "tools mentioned", "examples captured"],
      },
      {
        role: "assistant",
        content: closing,
        sectionId: "wrap-up",
        detectedSignals: [],
      },
    ];
  }

  return [
    {
      role: "assistant",
      content: opening,
      sectionId: "role-overview",
      detectedSignals: [],
    },
    {
      role: "user",
      content:
        "I run the workshop for a small industrial hydraulics repair business. I decide what can come straight in, what needs strip-down before we quote, and what has to be escalated before we promise anything. The real job is keeping a believable workshop plan when one customer has a machine down, without letting a loud but weak urgency wreck three jobs already on the benches.",
      sectionId: "role-overview",
      detectedSignals: ["tasks captured", "examples captured"],
    },
    {
      role: "assistant",
      content:
        "Good. What returns every day or every week and depends on you?",
      sectionId: "recurring-responsibilities",
      detectedSignals: [],
    },
    {
      role: "user",
      content:
        "Every morning before 8am I open HydTrack, review the open work, update the live workshop plan, check which technician is free on which bench, and flag which jobs still do not have a usable job sheet. Then I call the lead technician on the urgent work and purchasing on anything likely to stall before midday.",
      sectionId: "recurring-responsibilities",
      detectedSignals: [
        "tasks captured",
        "tools mentioned",
        "contacts mentioned",
        "examples captured",
      ],
    },
    {
      role: "assistant",
      content:
        "What usually triggers that reshuffle, and what checks do you make before you move the plan?",
      sectionId: "recurring-responsibilities",
      detectedSignals: [],
    },
    {
      role: "user",
      content:
        "I reshuffle when a customer is genuinely down, a key technician is absent, a supplier slips on a critical seal kit, or a file arrives with no clear failure symptom. A real urgency is not just a noisy phone call: it is customer downtime with a realistic chance that we can move fast. Before I move the plan, I check customer impact, live bench loading, how far the current jobs have already gone, whether parts are available, and whether the technician I have in mind is the right fit.",
      sectionId: "recurring-responsibilities",
      detectedSignals: [
        "tasks captured",
        "problems captured",
        "tools mentioned",
        "contacts mentioned",
        "examples captured",
      ],
    },
    {
      role: "assistant",
      content:
        "Let’s choose one important task. Can you walk me through it from trigger to handoff?",
      sectionId: "step-by-step-tasks",
      detectedSignals: [],
    },
    {
      role: "user",
      content:
        "When an urgent repair lands, I create the HydTrack job, qualify the machine, failure symptom, downtime level, and any photos received, then decide whether it comes straight in, waits for quote after strip-down, or needs owner approval before we go further. If the failure looks plausible and we have a real slot, I reserve a bench, assign the technician, force the job sheet to be completed, and call the customer back with a cautious first expectation. If the symptom is vague or the price could blow out once opened, I do not let anyone promise a hard number before the unit is seen.",
      sectionId: "step-by-step-tasks",
      detectedSignals: [
        "tasks captured",
        "problems captured",
        "tools mentioned",
        "contacts mentioned",
        "examples captured",
      ],
    },
    {
      role: "assistant",
      content:
        "What problems or exceptions come up most often in this role?",
      sectionId: "problem-solving",
      detectedSignals: [],
    },
    {
      role: "user",
      content:
        "The recurring ones are incomplete job sheets, customers calling something urgent without stating the real impact, critical parts that slip after being said to be available, and jobs where we cannot price cleanly before strip-down. If we start the workshop without cleaning that up, we lose a bench, waste technician hours, and end up calling the customer back with no solid basis.",
      sectionId: "problem-solving",
      detectedSignals: ["problems captured", "tasks captured", "examples captured"],
    },
    {
      role: "assistant",
      content:
        "How do you recognise those issues, what do you check first, and when do you escalate them?",
      sectionId: "problem-solving",
      detectedSignals: [],
    },
    {
      role: "user",
      content:
        "I know we are heading into trouble when the paperwork does not really describe the symptom, when the part reference has already changed twice in the history, when the promised finish date no longer fits the bench loading, or when the customer wants a firm price before we even open the unit. My first three checks are always the same: reread the job sheet, compare it with repair history, and call the technician taking the job. If parts or price risk still looks too open, I call purchasing or the owner before committing. The useful shortcut is calling the supplier straight away if the customer machine is stopping production, not after strip-down. The junior mistake is thinking a loud urgency is automatically the top priority.",
      sectionId: "problem-solving",
      detectedSignals: [
        "problems captured",
        "tasks captured",
        "tools mentioned",
        "contacts mentioned",
        "examples captured",
      ],
    },
    {
      role: "assistant",
      content:
        "Which tools, folders, files, or key contacts do you rely on to keep the work moving?",
      sectionId: "tools-files",
      detectedSignals: [],
    },
    {
      role: "user",
      content:
        "I rely on HydTrack for live job status, Outlook for supplier and customer traffic, the live-jobs shared folder for photos and workshop notes, Workshop Schedule.xlsx for bench loading, Supplier Pricing.xlsx for the last known price, and a critical lead-time tracker when a customer machine is down. Without those, we promise too fast, strip down without knowing whether parts will follow, and push the wrong jobs up the queue. The technicians, purchasing, the workshop@ inbox, and sometimes the owner all depend on those records.",
      sectionId: "tools-files",
      detectedSignals: ["tools mentioned", "contacts mentioned", "examples captured"],
    },
    {
      role: "assistant",
      content:
        "Can you give the exact location for those items, and say who relies on them day to day?",
      sectionId: "tools-files",
      detectedSignals: [],
    },
    {
      role: "user",
      content:
        "The schedule sits in Shared Drive > Workshop > Daily Control > Workshop Schedule.xlsx and gets reviewed every morning with the lead technician. Supplier pricing sits in Shared Drive > Workshop > Purchasing > Supplier Pricing.xlsx and purchasing updates it. Photos and notes sit under Shared Drive > Workshop > Live Jobs. HydTrack is the workshop ERP, and email runs through the workshop@ inbox in Outlook. The critical lead-time tracker does exist, but it is still maintained more by habit than by clean ownership, so that is something a replacement would need formalised quickly.",
      sectionId: "tools-files",
      detectedSignals: ["tools mentioned", "contacts mentioned", "examples captured"],
    },
    {
      role: "assistant",
      content:
        "To finish, what should a replacement understand in their first week?",
      sectionId: "wrap-up",
      detectedSignals: [],
    },
    {
      role: "user",
      content:
        "A replacement needs to understand that you never promise a hard delivery date or firm price on a heavy hydraulic repair until the symptom, technician, and parts path are at least believable. They need to say no to false urgency, call back quickly when a customer machine is genuinely down, and escalate early when strip-down could blow the quote open. What is not written anywhere is that a half-ready file costs more than a file you honestly hold back.",
      sectionId: "wrap-up",
      detectedSignals: ["tasks captured", "tools mentioned", "examples captured"],
    },
    {
      role: "assistant",
      content: closing,
      sectionId: "wrap-up",
      detectedSignals: [],
    },
  ];
}
