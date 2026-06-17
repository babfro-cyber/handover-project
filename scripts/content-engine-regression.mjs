import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const expectedThemeTitles = [
  "Bloc foré — conception et spécificité NumerHyd",
  "Choix des matériaux",
  "Traitements de surface",
  "Analyse du dysfonctionnement d’une installation hydraulique avec bloc foré",
  "Usinabilité et contraintes atelier",
  "Schéma hydraulique et modélisation",
  "Dimensionnement, sécurité et durée de vie",
  "Ordre des vérifications et contrôle qualité",
  "Pilotage de l’entreprise et signaux faibles",
  "Transmission finale",
];

const forbiddenStandaloneThemes = [
  "Composants hydrauliques",
  "Erreurs fréquentes",
  "Cas clients",
];

const { themes } = JSON.parse(readFileSync("interviewThemes.json", "utf8"));
assert.deepEqual(
  themes.map((theme) => theme.title),
  expectedThemeTitles,
  "Create-interview selectable themes must stay on the 10 V2 themes.",
);
for (const forbidden of forbiddenStandaloneThemes) {
  assert(
    !themes.some((theme) => theme.title.toLowerCase() === forbidden.toLowerCase()),
    `${forbidden} must not be a standalone selectable theme.`,
  );
}

const appSource = readFileSync("app.js", "utf8");
assert(appSource.includes("const SECTION_ORDER = INTERVIEW_THEMES.map((theme) => theme.id);"));
assert(!appSource.includes('<details class="correction-review" open>'));
assert(!appSource.includes("<details open"));
assert(appSource.includes("renderTranscriptCorrectionReview()"));
assert(appSource.includes("applyTranscriptToDraft(session, correctedTranscript || rawTranscript)"));

const decisionSource = readFileSync("supabase/functions/decide-next-question/index.ts", "utf8");
const usinabilityTheme = themes.find((theme) => theme.id === "usinabilite_contraintes_atelier");
assert(usinabilityTheme, "Usinabilité theme must exist.");
const usinabilityPrompts = [
  ...usinabilityTheme.followUps,
  ...usinabilityTheme.realCasePrompts,
].join(" ");
for (const expectedProbe of [
  /cas|bloc/i,
  /longueur des forets/i,
  /encombrement machine|accès aux faces/i,
  /trous inclinés/i,
  /épaisseur minimum/i,
  /cavités/i,
]) {
  assert(expectedProbe.test(usinabilityPrompts), `Usinabilité prompts must cover ${expectedProbe}.`);
}

const weakUsinabilityAnswer = "Il faut faire attention aux perçages, aux forets et aux cavités.";
assert(weakUsinabilityAnswer.split(/\s+/).length <= 24);
assert(decisionSource.includes("isWeakUsinabiliteAnswer"));
assert(decisionSource.includes("Pouvez-vous raconter un cas concret de bloc difficile à usiner"));
for (const phrase of [
  "longueur des forets",
  "l’accès machine",
  "les trous inclinés",
  "l’épaisseur de matière",
  "les contraintes de cavités",
]) {
  assert(decisionSource.includes(phrase), `Expected Usinabilité follow-up must probe: ${phrase}`);
}

const ficheSource = readFileSync("supabase/functions/generate-fiches/index.ts", "utf8");
const normalizedFicheSource = ficheSource.toLowerCase();
for (const requiredSection of [
  "understanding",
  "method_reasoning",
  "practical_rules",
  "vigilance_points",
  "mistakes_to_avoid",
  "cases_or_examples",
  "technical_vocabulary",
  "to_complete",
  "useful_raw_extracts",
]) {
  assert(ficheSource.includes(requiredSection), `Fiche schema must include ${requiredSection}.`);
}
for (const requiredRule of [
  "fiches métier NumerHyd pratiques",
  "La réponse validée est la source de vérité",
  "Le glossaire sert uniquement à clarifier le vocabulaire",
  "tu ne produis pas un cours hydraulique générique",
  "Marque une règle implicite comme 'à confirmer'",
]) {
  assert(
    normalizedFicheSource.includes(requiredRule.toLowerCase()),
    `Fiche prompt must include rule: ${requiredRule}`,
  );
}
for (const requiredLabel of [
  "Ce qu’il faut comprendre",
  "Méthode ou raisonnement métier",
  "Règles pratiques à retenir",
  "Points de vigilance",
  "Erreurs à éviter",
  "Cas ou exemples racontés",
  "Vocabulaire technique associé",
  "À compléter",
  "Extraits bruts utiles",
]) {
  assert(appSource.includes(requiredLabel), `Manager fiche UI must render section: ${requiredLabel}`);
}

console.log("content engine regression checks passed");
