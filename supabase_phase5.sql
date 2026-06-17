-- NumerHyd Phase 5 content engine upgrade.
-- Adds V2 interview themes and glossary-assisted transcript metadata while keeping
-- the existing tables, routes, and prototype flow intact.

alter table public.text_answers
  add column if not exists raw_transcript text,
  add column if not exists corrected_transcript text,
  add column if not exists corrections_applied jsonb not null default '[]'::jsonb,
  add column if not exists uncertain_corrections jsonb not null default '[]'::jsonb,
  add column if not exists detected_technical_terms jsonb not null default '[]'::jsonb,
  add column if not exists answer_quality jsonb not null default '{}'::jsonb;

alter table public.transcripts
  add column if not exists raw_transcript_text text,
  add column if not exists corrected_transcript_text text,
  add column if not exists corrections_applied jsonb not null default '[]'::jsonb,
  add column if not exists uncertain_corrections jsonb not null default '[]'::jsonb,
  add column if not exists detected_technical_terms jsonb not null default '[]'::jsonb;

insert into public.interview_plans (slug, version, title, themes)
values (
  'numerhyd-v2',
  'content-engine-v2',
  'NumerHyd V2 - Capture métier blocs forés hydrauliques',
  '[
  {
    "id": "bloc_fore_conception_numerhyd",
    "title": "Bloc foré — conception et spécificité NumerHyd",
    "objective": "Comprendre ce qui fait qu’un bloc foré est bien conçu, bien fabriqué, et ce qui distingue la manière NumerHyd de concevoir et produire ces blocs.",
    "mainQuestion": "Quand vous regardez un bloc foré, comment savez-vous qu’il est bien conçu et bien fabriqué ?",
    "followUps": [
      "Qu’est-ce qui vous fait dire qu’un bloc est propre, fiable ou bien pensé ?",
      "Qu’est-ce qui fait la spécificité des blocs NumerHyd par rapport à d’autres fabricants ?",
      "Quels choix de conception ont le plus d’impact sur la performance ou la fiabilité du bloc ?",
      "Quels signes vous alertent immédiatement quand vous voyez un plan ou un bloc physique ?",
      "Pouvez-vous raconter un exemple de bloc bien conçu, et ce qui le rendait bon ?",
      "Pouvez-vous raconter un exemple de bloc mal conçu, et ce qu’il aurait fallu faire autrement ?"
    ],
    "weakAnswerSignals": [
      "Réponse générale du type « il faut que ce soit propre » sans expliquer pourquoi.",
      "Pas d’exemple concret de bloc ou de client.",
      "Pas de lien entre conception, fabrication, usinage et usage final.",
      "Pas de mention des contraintes de pression, encombrement, composants ou maintenance."
    ],
    "goodAnswerCriteria": [
      "Explique les critères concrets d’un bon bloc : circulation interne, accessibilité, compacité, tenue pression, usinabilité, maintenance.",
      "Donne des exemples de décisions de conception.",
      "Fait le lien entre schéma hydraulique, choix des composants, canaux internes et fabrication.",
      "Distingue ce qui est théoriquement correct de ce qui fonctionne vraiment en atelier et chez le client.",
      "Décrit ce qui est spécifique à NumerHyd."
    ],
    "realCasePrompts": [
      "Racontez un bloc dont vous étiez particulièrement satisfait.",
      "Racontez un bloc qui avait l’air simple mais qui était en réalité compliqué.",
      "Racontez un cas où le client demandait quelque chose et où il a fallu adapter la conception."
    ],
    "avoid": [
      "Ne pas rester sur une définition scolaire d’un bloc foré.",
      "Ne pas transformer la réponse en catalogue de composants.",
      "Ne pas parler uniquement du dessin 3D sans parler fabrication et usage."
    ],
    "expectedOutput": "Fiche métier : critères d’un bon bloc foré NumerHyd, réflexes de conception, signaux d’alerte et exemples concrets.",
    "transversalRelanceTypes": [
      "erreur_frequente",
      "cas_client",
      "critere_numerhyd",
      "decision_metier"
    ],
    "question": "Quand vous regardez un bloc foré, comment savez-vous qu’il est bien conçu et bien fabriqué ?"
  },
  {
    "id": "choix_materiaux",
    "title": "Choix des matériaux",
    "objective": "Capturer les règles de décision pour choisir entre acier, fonte, aluminium et nuances spécifiques selon pression, usinabilité, coût, disponibilité et usage final.",
    "mainQuestion": "Quand vous devez choisir le matériau d’un bloc foré, comment raisonnez-vous ?",
    "followUps": [
      "Dans quels cas choisissez-vous l’acier, la fonte ou l’aluminium ?",
      "Pourquoi choisir plutôt l’acier que la fonte ? Et dans quels cas la fonte reste pertinente ?",
      "Comment arbitrez-vous entre C45, S250PB et HYT60 ?",
      "Quels autres aciers peuvent être utilisés, et dans quels cas ?",
      "Parmi les aluminiums 2017, 5083 et 7075, comment choisissez-vous ?",
      "La pression de service change-t-elle votre choix de matière ? Si oui, comment ?",
      "Qu’est-ce qui s’usine le mieux en pratique ? Et qu’est-ce qui pose problème ?",
      "Quels matériaux évitez-vous, même s’ils semblent acceptables sur le papier ?"
    ],
    "weakAnswerSignals": [
      "Liste de matériaux sans règles de choix.",
      "Pas de seuil ou d’ordre de grandeur de pression.",
      "Pas de lien avec l’usinage.",
      "Pas de mention coût / délai / disponibilité.",
      "Pas d’exemple d’arbitrage réel."
    ],
    "goodAnswerCriteria": [
      "Explique une méthode de choix étape par étape.",
      "Distingue pression, environnement, usinabilité, corrosion, poids, coût et disponibilité.",
      "Donne des cas d’usage typiques par matière.",
      "Mentionne les limites ou risques par matière.",
      "Donne au moins un exemple client ou bloc réel."
    ],
    "realCasePrompts": [
      "Racontez un cas où le choix de matière a changé pendant l’étude.",
      "Racontez un cas où l’aluminium était tentant mais pas adapté.",
      "Racontez un cas où le coût ou le délai matière a influencé la solution."
    ],
    "avoid": [
      "Ne pas se contenter des propriétés théoriques des matériaux.",
      "Ne pas inventer de valeurs précises si l’expert n’en donne pas.",
      "Ne pas confondre usinabilité, tenue en pression et résistance à la corrosion."
    ],
    "expectedOutput": "Fiche de décision : choix matière pour blocs forés, avec règles pratiques, cas typiques et précautions.",
    "transversalRelanceTypes": [
      "ordre_grandeur",
      "contre_exemple",
      "cas_client",
      "risque_securite"
    ],
    "question": "Quand vous devez choisir le matériau d’un bloc foré, comment raisonnez-vous ?"
  },
  {
    "id": "traitements_surface",
    "title": "Traitements de surface",
    "objective": "Comprendre quand appliquer un traitement de surface, lequel choisir, et quelles épaisseurs ou précautions sont importantes.",
    "mainQuestion": "Quand vous concevez ou fabriquez un bloc foré, comment décidez-vous s’il faut un traitement de surface ?",
    "followUps": [
      "Dans quels cas utilisez-vous le nickel chimique ?",
      "Dans quels cas utilisez-vous l’anodisation ? Quelle épaisseur recommandez-vous en pratique ?",
      "Dans quels cas la phosphatation peut-elle être utile ?",
      "Quels traitements évitez-vous sur certains matériaux ou certaines géométries ?",
      "Quels risques un traitement peut-il créer sur les dimensions, cavités, portées ou filetages ?",
      "Comment vérifiez-vous que le traitement ne gênera pas le montage des composants ?"
    ],
    "weakAnswerSignals": [
      "Réponse limitée à une liste de traitements.",
      "Pas de lien avec matériau, environnement ou fonction du bloc.",
      "Pas de mention des impacts dimensionnels.",
      "Pas d’exemple de problème lié à un traitement."
    ],
    "goodAnswerCriteria": [
      "Explique le raisonnement entre corrosion, environnement, esthétique, frottement, montage et coût.",
      "Mentionne les interactions avec cavités, taraudages, plans de pose et tolérances.",
      "Donne des cas où il faut protéger ou masquer certaines zones.",
      "Donne un exemple d’erreur ou de précaution sur traitement."
    ],
    "realCasePrompts": [
      "Racontez un cas où un traitement a créé un problème au montage.",
      "Racontez un cas où le traitement était imposé par le client.",
      "Racontez un cas où vous avez refusé ou déconseillé un traitement."
    ],
    "avoid": [
      "Ne pas transformer la fiche en cours général sur les traitements.",
      "Ne pas donner d’épaisseur ferme si l’expert ne l’a pas validée.",
      "Ne pas oublier l’impact sur les tolérances."
    ],
    "expectedOutput": "Fiche pratique : choix des traitements de surface, précautions et impacts sur fabrication / montage.",
    "transversalRelanceTypes": [
      "precaution_atelier",
      "impact_dimensionnel",
      "cas_client"
    ],
    "question": "Quand vous concevez ou fabriquez un bloc foré, comment décidez-vous s’il faut un traitement de surface ?"
  },
  {
    "id": "analyse_dysfonctionnement_installation",
    "title": "Analyse du dysfonctionnement d’une installation hydraulique avec bloc foré",
    "objective": "Remplacer le thème trop étroit du diagnostic de fuite par une méthode complète d’analyse de panne sur une installation hydraulique intégrant un bloc foré.",
    "mainQuestion": "Quand une installation hydraulique avec un bloc foré dysfonctionne, quelle méthode suivez-vous pour identifier la panne ?",
    "followUps": [
      "Par quelle vérification élémentaire commencez-vous toujours ?",
      "Comment remontez-vous le diagnostic étape par étape ?",
      "Comment distinguez-vous un problème de bloc, de composant, de réglage, de montage ou de circuit externe ?",
      "Quels symptômes vous orientent vers une erreur de conception du bloc ?",
      "Quels symptômes vous orientent plutôt vers un composant défectueux ou mal réglé ?",
      "Quels contrôles faites-vous avant de conclure que le bloc est en cause ?",
      "Quelles erreurs de diagnostic voyez-vous souvent chez les clients ou techniciens ?"
    ],
    "weakAnswerSignals": [
      "Réponse non séquencée.",
      "Diagnostic direct sans vérifications de base.",
      "Pas de distinction entre pression, débit, réglage, fuite interne, fuite externe, composant et bloc.",
      "Pas d’exemple de panne réelle."
    ],
    "goodAnswerCriteria": [
      "Donne une méthode étape par étape.",
      "Commence par les vérifications simples avant les hypothèses complexes.",
      "Explique comment utiliser pression, débit, bruit, échauffement, mouvement ou absence de mouvement comme indices.",
      "Distingue causes probables et tests de confirmation.",
      "Donne au moins un cas réel de panne."
    ],
    "realCasePrompts": [
      "Racontez une panne où le client pensait que le bloc était fautif mais ce n’était pas le cas.",
      "Racontez une panne difficile à diagnostiquer.",
      "Racontez un cas où la méthode de diagnostic a évité de refaire un bloc inutilement."
    ],
    "avoid": [
      "Ne pas réduire le sujet à la fuite.",
      "Ne pas sauter directement à une conclusion.",
      "Ne pas produire une procédure trop théorique qui ignore les réflexes terrain."
    ],
    "expectedOutput": "Fiche méthode : diagnostic structuré d’un dysfonctionnement hydraulique autour d’un bloc foré.",
    "transversalRelanceTypes": [
      "methode_etape_par_etape",
      "test_confirmation",
      "erreur_frequente",
      "cas_client"
    ],
    "question": "Quand une installation hydraulique avec un bloc foré dysfonctionne, quelle méthode suivez-vous pour identifier la panne ?"
  },
  {
    "id": "usinabilite_contraintes_atelier",
    "title": "Usinabilité et contraintes atelier",
    "objective": "Capturer les règles concrètes qui permettent de savoir si un bloc conçu est réellement usinable, au-delà de la modélisation théorique.",
    "mainQuestion": "Quand vous concevez un bloc foré, comment vérifiez-vous qu’il sera réellement usinable ?",
    "followUps": [
      "Quels problèmes apparaissent souvent entre la conception 3D et l’usinage réel ?",
      "Comment tenez-vous compte de la longueur des forets ?",
      "Comment vérifiez-vous l’encombrement machine et l’accès aux faces ?",
      "Quels trous inclinés ou perçages sur face posent problème ?",
      "Comment décidez-vous de l’épaisseur minimum de matière entre deux orifices ou canaux ?",
      "Quelles formes de cavités sont difficiles ou risquées à usiner ?",
      "Quels détails rendent un bloc impossible, cher ou risqué à fabriquer ?"
    ],
    "weakAnswerSignals": [
      "Réponse limitée à « vérifier le plan ».",
      "Pas de mention des contraintes machine.",
      "Pas de mention de longueur de foret, accès, inclinaisons ou épaisseurs.",
      "Pas de distinction entre possible en CAO et réalisable en atelier.",
      "Pas d’exemple concret."
    ],
    "goodAnswerCriteria": [
      "Liste les contraintes atelier principales.",
      "Explique comment vérifier chaque contrainte.",
      "Donne des règles pratiques ou ordres de grandeur lorsque possible.",
      "Décrit un cas où la conception a dû être modifiée pour usinage.",
      "Explique comment anticiper plutôt que corriger après coup."
    ],
    "realCasePrompts": [
      "Racontez un bloc qui semblait bon en 3D mais posait problème en atelier.",
      "Racontez un cas de perçage trop long, trop incliné ou inaccessible.",
      "Racontez un cas où une cavité ou un composant a forcé à repenser tout le bloc."
    ],
    "avoid": [
      "Ne pas rester sur la théorie CAO.",
      "Ne pas faire une liste vague de contraintes.",
      "Ne pas oublier l’impact coût / délai / risque rebut."
    ],
    "expectedOutput": "Fiche atelier : règles d’usinabilité des blocs forés NumerHyd, contrôles à faire et erreurs à éviter.",
    "transversalRelanceTypes": [
      "contrainte_machine",
      "ordre_grandeur",
      "cas_rebut",
      "cout_delai"
    ],
    "question": "Quand vous concevez un bloc foré, comment vérifiez-vous qu’il sera réellement usinable ?"
  },
  {
    "id": "schema_hydraulique_modelisation",
    "title": "Schéma hydraulique et modélisation",
    "objective": "Comprendre comment lire le schéma hydraulique, identifier les points de vigilance, choisir et placer les composants, puis dimensionner le bloc.",
    "mainQuestion": "Quand vous partez d’un schéma hydraulique pour concevoir un bloc foré, dans quel ordre procédez-vous ?",
    "followUps": [
      "Quels sont les premiers points de vigilance sur le schéma hydraulique ?",
      "Comment identifiez-vous les fonctions principales du bloc ?",
      "Quelles cavités ou composants reviennent régulièrement ?",
      "Quels composants sont piégeux ou demandent une attention particulière ?",
      "Comment dimensionnez-vous le bloc en fonction des composants ?",
      "Commencez-vous par le plus grand composant ? Si oui, dans quels cas ?",
      "Comment décidez-vous sur quelle face placer chaque composant ?",
      "Comment arbitrez-vous entre compacité, lisibilité, usinabilité et maintenance ?"
    ],
    "weakAnswerSignals": [
      "Réponse non séquencée.",
      "Pas de méthode de lecture du schéma.",
      "Pas de mention du placement des composants.",
      "Pas de mention des cavités, plans de pose ou contraintes internes.",
      "Pas d’exemple de composant piège."
    ],
    "goodAnswerCriteria": [
      "Explique une méthode claire de passage schéma → bloc.",
      "Identifie les points de vigilance sur composants et fonctions.",
      "Explique l’ordre de placement et les arbitrages.",
      "Mentionne les standards utiles : CETOP, cavités SUN, brides, BSP/NPT, P/T/A/B lorsque pertinent.",
      "Donne un cas concret de modélisation ou de placement difficile."
    ],
    "realCasePrompts": [
      "Racontez un schéma hydraulique qui paraissait simple mais qui a créé un bloc compliqué.",
      "Racontez un cas où un composant a dicté toute l’architecture du bloc.",
      "Racontez un cas où le placement sur une face a posé problème."
    ],
    "avoid": [
      "Ne pas transformer la réponse en cours général d’hydraulique.",
      "Ne pas lister les composants sans expliquer leur impact sur la conception.",
      "Ne pas oublier la maintenance et l’accès aux réglages."
    ],
    "expectedOutput": "Fiche méthode : passage du schéma hydraulique à la modélisation d’un bloc foré.",
    "transversalRelanceTypes": [
      "ordre_de_conception",
      "composant_piege",
      "arbitrage",
      "cas_client"
    ],
    "question": "Quand vous partez d’un schéma hydraulique pour concevoir un bloc foré, dans quel ordre procédez-vous ?"
  },
  {
    "id": "dimensionnement_securite_duree_vie",
    "title": "Dimensionnement, sécurité et durée de vie",
    "objective": "Extraire les règles de dimensionnement liées aux épaisseurs de paroi, pression, sécurité, fatigue, durée de vie et normes éventuelles.",
    "mainQuestion": "Comment définissez-vous les épaisseurs et les marges de sécurité pour qu’un bloc foré dure dans le temps ?",
    "followUps": [
      "Comment décidez-vous de l’épaisseur de paroi entre deux canaux internes ?",
      "Comment la matière, la pression et la taille des composants changent-elles vos marges ?",
      "Quels risques de sécurité cherchez-vous à éviter en priorité ?",
      "Y a-t-il des normes, standards ou règles internes à respecter ?",
      "Comment estimez-vous la durée de vie d’un bloc ?",
      "Quels signes montrent qu’un bloc risque de mal vieillir ?",
      "Dans quels cas ajoutez-vous une marge par prudence ?"
    ],
    "weakAnswerSignals": [
      "Réponse vague sur la sécurité.",
      "Pas de lien entre pression, matière, géométrie et épaisseur.",
      "Pas de méthode de vérification.",
      "Pas de mention des normes ou règles internes.",
      "Pas d’exemple réel."
    ],
    "goodAnswerCriteria": [
      "Explique les facteurs qui influencent les marges.",
      "Distingue règles calculées, expérience terrain et prudence métier.",
      "Mentionne les cas à risque : forte pression, canaux proches, gros composants, perçages croisés, traitement, fatigue.",
      "Donne des ordres de grandeur si l’expert les connaît.",
      "Signale clairement ce qui doit être vérifié par calcul ou norme."
    ],
    "realCasePrompts": [
      "Racontez un cas où vous avez volontairement épaissi ou agrandi un bloc pour sécurité.",
      "Racontez un cas où une contrainte de pression a changé la conception.",
      "Racontez un cas où une règle empirique vous a évité un risque."
    ],
    "avoid": [
      "Ne pas inventer une norme ou une valeur si elle n’est pas donnée.",
      "Ne pas masquer les incertitudes.",
      "Ne pas confondre durée de vie théorique et retour d’expérience."
    ],
    "expectedOutput": "Fiche sécurité : règles de dimensionnement, marges, risques et points à valider.",
    "transversalRelanceTypes": [
      "risque_securite",
      "ordre_grandeur",
      "norme",
      "retour_experience"
    ],
    "question": "Comment définissez-vous les épaisseurs et les marges de sécurité pour qu’un bloc foré dure dans le temps ?"
  },
  {
    "id": "ordre_verifications_controle_qualite",
    "title": "Ordre des vérifications et contrôle qualité",
    "objective": "Formaliser le regard extérieur à poser sur un bloc : vérifications de conception, usinabilité, cohérence hydraulique, fabrication et erreurs fréquentes.",
    "mainQuestion": "Avant de valider un bloc foré, quelles vérifications faites-vous, et dans quel ordre ?",
    "followUps": [
      "Quelle est votre checklist mentale avant validation ?",
      "Que vérifiez-vous sur le schéma hydraulique ?",
      "Que vérifiez-vous sur le modèle ou le plan du bloc ?",
      "Que vérifiez-vous pour confirmer que le bloc est usinable ?",
      "Quel regard extérieur faut-il poser avant lancement ?",
      "Quelles erreurs fréquentes retrouvez-vous dans les conceptions ?",
      "Quels détails semblent mineurs mais peuvent créer un gros problème ?"
    ],
    "weakAnswerSignals": [
      "Réponse non ordonnée.",
      "Pas de checklist claire.",
      "Pas de distinction entre contrôle hydraulique, contrôle usinage et contrôle montage.",
      "Pas d’exemples d’erreurs fréquentes.",
      "Pas de méthode de double-check."
    ],
    "goodAnswerCriteria": [
      "Décrit un ordre logique de vérification.",
      "Sépare les contrôles : schéma, composants, canaux, usinage, plans de pose, raccordements, sécurité, montage.",
      "Explique les erreurs fréquentes et comment les détecter.",
      "Mentionne le rôle du regard extérieur ou de la revue par une autre personne.",
      "Donne une checklist exploitable."
    ],
    "realCasePrompts": [
      "Racontez une erreur détectée juste avant fabrication.",
      "Racontez une erreur passée malgré les contrôles.",
      "Racontez ce qu’un jeune concepteur oublie souvent de vérifier."
    ],
    "avoid": [
      "Ne pas créer une checklist trop abstraite.",
      "Ne pas lister uniquement les erreurs sans expliquer comment les éviter.",
      "Ne pas oublier la logique de revue par un tiers."
    ],
    "expectedOutput": "Checklist de validation d’un bloc foré avant fabrication.",
    "transversalRelanceTypes": [
      "checklist",
      "erreur_frequente",
      "revue_pair",
      "controle_final"
    ],
    "question": "Avant de valider un bloc foré, quelles vérifications faites-vous, et dans quel ordre ?"
  },
  {
    "id": "pilotage_entreprise_signaux_faibles",
    "title": "Pilotage de l’entreprise et signaux faibles",
    "objective": "Capturer les signaux faibles utilisés pour piloter NumerHyd : stock, commandes, non-conformités, investissement, marché, clients et informations terrain.",
    "mainQuestion": "Quels signaux faibles regardez-vous pour savoir comment se porte l’entreprise ?",
    "followUps": [
      "Quels indicateurs regardez-vous régulièrement : stock, commandes, devis, délais, non-conformités, trésorerie, atelier ?",
      "Qu’est-ce qui vous alerte avant qu’un problème devienne visible dans les chiffres ?",
      "Comment décidez-vous qu’il faut investir ?",
      "Comment sentez-vous le marché ?",
      "Quelles informations terrain ou client sont les plus utiles ?",
      "Comment récoltez-vous ces informations ?",
      "Qu’est-ce qu’un repreneur ou successeur risque de ne pas voir au début ?"
    ],
    "weakAnswerSignals": [
      "Réponse uniquement financière.",
      "Pas de signaux faibles concrets.",
      "Pas de lien avec clients, atelier, fournisseurs ou marché.",
      "Pas d’exemple de décision d’investissement.",
      "Pas de mention de transmission au successeur."
    ],
    "goodAnswerCriteria": [
      "Identifie des signaux concrets et observables.",
      "Explique comment ces signaux influencent les décisions.",
      "Donne des exemples de décisions prises grâce à ces signaux.",
      "Fait le lien entre activité commerciale, atelier, qualité, stock et marché.",
      "Explique ce qu’un nouveau dirigeant doit apprendre à surveiller."
    ],
    "realCasePrompts": [
      "Racontez un moment où un signal faible vous a fait anticiper un problème.",
      "Racontez un investissement décidé grâce à une observation terrain.",
      "Racontez un changement de marché que vous avez senti avant les autres."
    ],
    "avoid": [
      "Ne pas limiter le sujet à un dashboard KPI.",
      "Ne pas chercher une précision financière excessive si ce n’est pas l’objet.",
      "Ne pas oublier le côté intuition / expérience dirigeant."
    ],
    "expectedOutput": "Fiche de pilotage : signaux faibles, réflexes de décision et points de vigilance pour la reprise.",
    "transversalRelanceTypes": [
      "decision_dirigeant",
      "intuition_marche",
      "signal_faible",
      "exemple_investissement"
    ],
    "question": "Quels signaux faibles regardez-vous pour savoir comment se porte l’entreprise ?"
  },
  {
    "id": "transmission_finale",
    "title": "Transmission finale",
    "objective": "Laisser l’expert ajouter ce qui n’a pas été couvert, notamment l’expertise difficile à formaliser, les conseils au successeur et les sujets à creuser.",
    "mainQuestion": "Qu’est-ce qui vous paraît important de transmettre et dont on n’a pas encore parlé ?",
    "followUps": [
      "Quelle expertise est la plus difficile à mettre sur papier ?",
      "Qu’est-ce qu’un successeur risque de sous-estimer ?",
      "Quels réflexes avez-vous acquis avec l’expérience mais que vous n’avez jamais vraiment formalisés ?",
      "Quels sujets faudrait-il absolument creuser dans un deuxième entretien ?",
      "Quels conseils donneriez-vous à quelqu’un qui reprend votre rôle ?",
      "Y a-t-il une erreur importante que vous voulez aider le successeur à éviter ?"
    ],
    "weakAnswerSignals": [
      "Réponse très courte ou polie sans contenu concret.",
      "Pas de conseil actionnable.",
      "Pas de sujet de suivi.",
      "Pas de mise en garde ou de priorité."
    ],
    "goodAnswerCriteria": [
      "Fait ressortir des conseils pratiques.",
      "Identifie des zones d’expertise tacite.",
      "Priorise les sujets à approfondir.",
      "Mentionne ce qui n’est pas documenté ailleurs.",
      "Donne une transmission humaine, pas seulement technique."
    ],
    "realCasePrompts": [
      "Racontez une chose que vous avez apprise tard et que vous auriez aimé savoir plus tôt.",
      "Racontez une erreur qui vous a marqué.",
      "Racontez une situation où l’expérience compte plus que la procédure."
    ],
    "avoid": [
      "Ne pas finir trop vite.",
      "Ne pas se contenter d’un remerciement.",
      "Ne pas transformer ce thème en bilan RH."
    ],
    "expectedOutput": "Fiche finale : savoirs tacites, conseils au successeur, sujets à compléter et prochaines interviews à prévoir.",
    "transversalRelanceTypes": [
      "savoir_tacite",
      "conseil_successeur",
      "priorite_suivi"
    ],
    "question": "Qu’est-ce qui vous paraît important de transmettre et dont on n’a pas encore parlé ?"
  }
]'::jsonb
)
on conflict (slug) do update
set
  version = excluded.version,
  title = excluded.title,
  themes = excluded.themes;

create or replace function public.submit_text_answer(
  p_public_token text,
  p_theme_id text,
  p_question_text text,
  p_answer_text text,
  p_next_theme_id text default null,
  p_status text default 'in_progress',
  p_raw_transcript text default null,
  p_corrected_transcript text default null,
  p_corrections_applied jsonb default '[]'::jsonb,
  p_uncertain_corrections jsonb default '[]'::jsonb,
  p_detected_technical_terms jsonb default '[]'::jsonb,
  p_answer_quality jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_interview public.interviews%rowtype;
  next_status text;
  next_theme text;
begin
  select * into target_interview
  from public.interviews
  where public_token = trim(p_public_token);

  if target_interview.id is null then
    return null;
  end if;

  if not (p_theme_id = any(target_interview.selected_theme_ids)) then
    raise exception 'theme is not part of this interview';
  end if;

  if nullif(trim(p_answer_text), '') is null then
    raise exception 'answer text is required';
  end if;

  next_status := case
    when p_status = 'completed' then 'completed'
    else 'in_progress'
  end;

  next_theme := nullif(trim(coalesce(p_next_theme_id, '')), '');
  if next_theme is not null and not (next_theme = any(target_interview.selected_theme_ids)) then
    next_theme := target_interview.current_theme_id;
  end if;

  insert into public.text_answers (
    interview_id,
    theme_id,
    question_text,
    answer_text,
    raw_transcript,
    corrected_transcript,
    corrections_applied,
    uncertain_corrections,
    detected_technical_terms,
    answer_quality
  )
  values (
    target_interview.id,
    p_theme_id,
    p_question_text,
    trim(p_answer_text),
    coalesce(p_raw_transcript, p_answer_text),
    coalesce(p_corrected_transcript, p_answer_text),
    coalesce(p_corrections_applied, '[]'::jsonb),
    coalesce(p_uncertain_corrections, '[]'::jsonb),
    coalesce(p_detected_technical_terms, '[]'::jsonb),
    coalesce(p_answer_quality, '{}'::jsonb)
  )
  on conflict (interview_id, theme_id) do update
  set
    question_text = excluded.question_text,
    answer_text = excluded.answer_text,
    raw_transcript = excluded.raw_transcript,
    corrected_transcript = excluded.corrected_transcript,
    corrections_applied = excluded.corrections_applied,
    uncertain_corrections = excluded.uncertain_corrections,
    detected_technical_terms = excluded.detected_technical_terms,
    answer_quality = excluded.answer_quality,
    updated_at = now();

  update public.interviews
  set
    status = next_status,
    started_at = coalesce(started_at, now()),
    current_theme_id = coalesce(next_theme, current_theme_id),
    updated_at = now(),
    completed_at = case when next_status = 'completed' then now() else completed_at end
  where id = target_interview.id;

  return public.numerhyd_interview_payload(target_interview.id);
end;
$$;

create or replace function public.insert_transcript_for_public_interview(
  p_public_token text,
  p_audio_asset_id uuid,
  p_transcript_text text,
  p_language text,
  p_model text,
  p_status text,
  p_error_message text default null,
  p_raw_transcript_text text default null,
  p_corrected_transcript_text text default null,
  p_corrections_applied jsonb default '[]'::jsonb,
  p_uncertain_corrections jsonb default '[]'::jsonb,
  p_detected_technical_terms jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_audio public.audio_assets%rowtype;
  inserted_id uuid;
begin
  select aa.* into target_audio
  from public.audio_assets aa
  join public.interviews i on i.id = aa.interview_id
  where i.public_token = trim(p_public_token)
    and aa.id = p_audio_asset_id;

  if target_audio.id is null then
    raise exception 'audio asset not found';
  end if;

  insert into public.transcripts (
    interview_id,
    audio_asset_id,
    theme_id,
    transcript_text,
    raw_transcript_text,
    corrected_transcript_text,
    corrections_applied,
    uncertain_corrections,
    detected_technical_terms,
    language,
    model,
    status,
    error_message
  )
  values (
    target_audio.interview_id,
    target_audio.id,
    target_audio.theme_id,
    coalesce(p_corrected_transcript_text, p_transcript_text, ''),
    coalesce(p_raw_transcript_text, p_transcript_text, ''),
    coalesce(p_corrected_transcript_text, p_transcript_text, ''),
    coalesce(p_corrections_applied, '[]'::jsonb),
    coalesce(p_uncertain_corrections, '[]'::jsonb),
    coalesce(p_detected_technical_terms, '[]'::jsonb),
    nullif(trim(coalesce(p_language, '')), ''),
    nullif(trim(coalesce(p_model, '')), ''),
    p_status,
    p_error_message
  )
  returning id into inserted_id;

  return jsonb_build_object('transcript_id', inserted_id);
end;
$$;

grant execute on function public.submit_text_answer(text, text, text, text, text, text, text, text, jsonb, jsonb, jsonb, jsonb) to anon, authenticated;
grant execute on function public.insert_transcript_for_public_interview(text, uuid, text, text, text, text, text, text, text, jsonb, jsonb, jsonb) to anon, authenticated;
