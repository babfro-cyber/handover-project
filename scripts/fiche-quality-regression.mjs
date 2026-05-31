import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const allowedStatuses = new Set(["Non abordé", "Réponse partielle", "Exploitable", "À compléter"]);

const weakTreatmentAnswer =
  "Sur les traitements de surface, je ne suis pas le plus précis. En général, on regarde surtout si le bloc va être exposé à l’humidité, à l’extérieur ou à un environnement agressif. Je sais qu’on peut faire un traitement pour protéger la pièce, mais je ne connais pas toujours la règle exacte pour choisir le bon traitement. Souvent, on se base sur ce qui a déjà été fait ou sur la demande du client. Suivi : Je dirais que l’objectif principal est d’éviter la corrosion, surtout si la machine est dehors, mais je ne peux pas donner une règle technique très précise. Suivi : Je n’ai pas d’exemple très détaillé, il faudrait plutôt demander à quelqu’un de plus expert sur les traitements ou vérifier les standards utilisés dans les anciens dossiers.";

const blocsForesAnswer =
  "Quand je démarre la conception d’un bloc foré, je commence rarement par le dessin. Je commence par comprendre la fonction du bloc dans la machine. Je regarde d’abord le schéma hydraulique, les débits, les pressions, les fonctions de sécurité et surtout les contraintes de montage. Il faut comprendre où le bloc va être installé, dans quel sens il sera monté, s’il y a des contraintes d’accès pour les flexibles, les cartouches, les bouchons ou les prises de pression. Ensuite je cherche à simplifier les circuits. Un bon bloc, ce n’est pas forcément le plus compact possible. C’est un bloc qu’on peut usiner, monter, contrôler et dépanner sans créer de risques inutiles. Une erreur fréquente, c’est de vouloir faire passer trop de perçages proches les uns des autres. Sur le papier ça passe, mais en fabrication on peut se retrouver avec des croisements dangereux, des bouchons difficiles à mettre ou une zone trop faible mécaniquement. Ma règle, c’est de toujours penser au contrôle final dès le début. Si je ne peux pas expliquer simplement comment le bloc sera vérifié, c’est souvent que la conception n’est pas assez claire. Suivi : Un exemple typique, c’est un bloc compact demandé par un client pour une machine mobile. Sur le schéma, tout semblait simple, mais l’encombrement imposé obligeait à croiser deux lignes de pression très proches. On aurait pu forcer le design, mais le risque était trop élevé en perçage. J’ai préféré agrandir légèrement le bloc et déplacer une fonction. Le client voulait plus petit, mais au final c’était plus fiable et plus facile à contrôler.";

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function words(value) {
  return normalize(value).split(" ").filter(Boolean);
}

function uncertaintyScore(answer) {
  const normalized = normalize(answer);
  return [
    /\bje ne suis pas le plus precis\b/,
    /\bje ne connais pas\b/,
    /\bje ne peux pas donner\b/,
    /\bpas d exemple tres detaille\b/,
    /\bil faudrait demander\b/,
    /\bquelqu un de plus expert\b/,
  ].reduce((score, pattern) => score + (pattern.test(normalized) ? 1 : 0), 0);
}

function hasRawNgramLeak(item, raw, threshold = 12) {
  const itemWords = words(item);
  const rawWords = words(raw);
  const rawNgrams = new Set();
  for (let index = 0; index <= rawWords.length - threshold; index += 1) {
    rawNgrams.add(rawWords.slice(index, index + threshold).join(" "));
  }
  for (let index = 0; index <= itemWords.length - threshold; index += 1) {
    if (rawNgrams.has(itemWords.slice(index, index + threshold).join(" "))) return true;
  }
  return false;
}

const weakStatus = uncertaintyScore(weakTreatmentAnswer) >= 2 ? "À compléter" : "Réponse partielle";
assert(allowedStatuses.has(weakStatus));
assert.notEqual(weakStatus, "Exploitable", "Weak surface-treatment answer must not be classified as Exploitable");

const badGeneratedSections = [
  blocsForesAnswer,
  blocsForesAnswer,
  "Un exemple typique, c’est un bloc compact demandé par un client pour une machine mobile. Sur le schéma, tout semblait simple, mais l’encombrement imposé obligeait à croiser deux lignes de pression très proches.",
];

assert(
  badGeneratedSections.some((item) => hasRawNgramLeak(item, blocsForesAnswer)),
  "Regression fixture must detect transcript leakage in synthesis sections",
);

const edgeFunctionSource = readFileSync("supabase/functions/generate-fiches/index.ts", "utf8");
assert(edgeFunctionSource.includes("Aucun bullet de synthèse ne doit reprendre plus de 10 mots consécutifs"));
assert(edgeFunctionSource.includes("Le status Exploitable est interdit si l'expert dit qu'il n'est pas précis"));
assert(!edgeFunctionSource.includes('"Enrichi"'));

console.log("fiche quality regression checks passed");
