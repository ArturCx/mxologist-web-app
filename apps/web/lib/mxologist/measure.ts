// Renders a recipe ingredient's measure in the user's preferred system.
// Source amounts are normalised at ingest into `quantityMl` (a canonical
// volume) + `note` (the verbatim remainder for non-volumes). See
// packages/database/scripts/backfill-amounts.mjs.

import type { Lang } from "../i18n";

export type Unit = "OZ" | "ML";

// 1 oz is treated as a round 30 ml (kept in sync with backfill-amounts.mjs)
// for cleaner, more practical measures than the exact 29.5735.
const OZ_ML = 30;

// ml -> oz, rounded to the nearest quarter (jigger markings), e.g.
// 45 -> "1 1/2 oz", 15 -> "1/2 oz", 30 -> "1 oz".
function toOz(ml: number): string {
  const q = Math.round((ml / OZ_ML) * 4) / 4;
  if (q === 0) return "splash";
  const whole = Math.floor(q);
  const frac = q - whole;
  const fracStr =
    frac === 0.25 ? "1/4" : frac === 0.5 ? "1/2" : frac === 0.75 ? "3/4" : "";
  if (whole === 0) return `${fracStr} oz`;
  return fracStr ? `${whole} ${fracStr} oz` : `${whole} oz`;
}

// ml rounded to the nearest 5, e.g. 45 -> "45 ml", 30 -> "30 ml".
function toMl(ml: number): string {
  return `${Math.round(ml / 5) * 5} ml`;
}

// In ML mode, units the ingest parser left in a note as ranges it couldn't
// reduce to a single volume (e.g. "2-3 cl", "1-2 shot") are shown in ml.
// 1 cl = 10 ml; 1 shot/dose = 40 ml.
function rangeUnitToMl(text: string, unit: RegExp, mlPerUnit: number): string {
  return text.replace(unit, (_m, a, b, single) =>
    single != null
      ? `${Number(single) * mlPerUnit} ml`
      : `${Number(a) * mlPerUnit}-${Number(b) * mlPerUnit} ml`,
  );
}

function noteToMl(text: string): string {
  let out = rangeUnitToMl(
    text,
    /\b(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*cl\b|\b(\d+(?:\.\d+)?)\s*cl\b/gi,
    10,
  );
  out = rangeUnitToMl(
    out,
    /\b(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*shots?\b|\b(\d+(?:\.\d+)?)\s*shots?\b/gi,
    40,
  );
  return out;
}

// Whole-note exact matches (case-insensitive, trimmed) translated first.
// ("1/2 shot" is no longer here — the ingest parser converts it to 20 ml.)
const NOTE_EXACT: Record<string, string> = {
  "to taste": "A gosto",
  "1/8 tsp grated": "1/8 de colher de chá (ralado)",
};

// Numeric value of a leading quantity string ("1 1/2" -> 1.5, "1/2" -> 0.5,
// "1-2" -> 2 upper bound). Used to pick singular/plural for "dose".
function qtyValue(q: string): number {
  const range = q.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/);
  if (range) return Number(range[2]);
  const mixed = q.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const frac = q.match(/^(\d+)\/(\d+)$/);
  if (frac) return Number(frac[1]) / Number(frac[2]);
  const n = Number(q);
  return Number.isNaN(n) ? 1 : n;
}

// "1 shot" -> "1 dose", "2 shots" -> "2 doses", "1 1/2 shot" -> "1 1/2 doses".
// Most shots are converted to ml by the ingest parser; this only catches what
// stays a note (e.g. the "1-2 shot" range) in OZ mode.
function translateShot(s: string): string {
  return s
    .replace(
      /(\d+\s+\d+\/\d+|\d+-\d+|\d+\/\d+|\d+(?:\.\d+)?)\s+shots?\b/gi,
      (_m, qty: string) => `${qty} ${qtyValue(qty) > 1 ? "doses" : "dose"}`,
    )
    .replace(/\bshots\b/gi, "doses")
    .replace(/\bshot\b/gi, "dose");
}

// "1 tsp" -> "1 Colher de Chá", "2 tsp" -> "2 Colheres de Chá",
// "1 1/2 tblsp" -> "1 1/2 Colheres de Chá". Plural when quantity > 1.
// (tsp/tbsp/tblsp are all rendered as "Colher(es) de Chá" per the catalogue.)
function translateSpoon(s: string): string {
  return s
    .replace(
      /(\d+\s+\d+\/\d+|\d+-\d+|\d+\/\d+|\d+(?:\.\d+)?)\s+(?:tblsp|tbsp|tsp)\b/gi,
      (_m, qty: string) =>
        `${qty} colher${qtyValue(qty) > 1 ? "es" : ""} de chá`,
    )
    .replace(/\b(?:tblsp|tbsp|tsp)\b/gi, "colher de chá");
}

// Mixed numbers read better as Brazilian decimals: "1 1/2" -> "1,5",
// "2 1/2" -> "2,5", "1 3/4" -> "1,75". Bare fractions ("1/2") are left as-is.
function mixedToDecimal(s: string): string {
  return s.replace(/(\d+)\s+(\d+)\/(\d+)/g, (_m, w, n, d) => {
    const v = Number(w) + Number(n) / Number(d);
    return String(Math.round(v * 100) / 100).replace(".", ",");
  });
}

// English descriptors the dataset bundles into the measure text (states,
// containers, actions). Longest/multi-word phrases first; brand and bar-unit
// words (Bacardi, oz, cl, jigger…) are intentionally left untranslated.
const NOTE_DESC: [RegExp, string][] = [
  [/seltzer water/gi, "água com gás"],
  [/fill to top with/gi, "encher até a borda com"],
  [/top up with/gi, "completar com"],
  [/\btop up\b/gi, "completar"],
  [/fill with/gi, "encher com"],
  [/garnish with/gi, "decorar com"],
  [/around rim put/gi, "ao redor da borda colocar"],
  [/\bif needed\b/gi, "se necessário"],
  [/fresh leaves/gi, "folhas frescas"],
  [/juice of/gi, "Suco de"],
  [/\babout\b/gi, "cerca de"],
  // adjective-noun order / gender agreement (PT puts the adjective last)
  [/large sprig/gi, "ramo grande"],
  [/large bottle/gi, "garrafa grande"],
  [/small bottle/gi, "garrafa pequena"],
  [/long strip/gi, "tira longa"],
  [/turkish apple/gi, "maçã turca"],
  [/black pods/gi, "vagens pretas"],
  [/can frozen/gi, "lata congelada"],
  [/full Copo \(240ml\)/gi, "Copo (240ml) cheio"],
  // states / adjectives
  [/\bcold\b/gi, "gelado"],
  [/\bhot\b/gi, "quente"],
  [/\biced\b/gi, "gelado"],
  [/\bboiling\b/gi, "fervente"],
  [/\bfrozen\b/gi, "congelado"],
  [/\bchilled\b/gi, "gelado"],
  [/\bcrushed\b/gi, "triturado"],
  [/\bchopped\b/gi, "picado"],
  [/\bground\b/gi, "moído"],
  [/\bdried\b/gi, "seco"],
  [/\bfresh\b/gi, "fresco"],
  [/\bwhole\b/gi, "inteiro"],
  [/\binstant\b/gi, "instantâneo"],
  [/\bsuperfine\b/gi, "extrafino"],
  [/\bplain\b/gi, "natural"],
  [/\bskimmed\b/gi, "desnatado"],
  [/\broasted\b/gi, "torrado"],
  [/\bunsweetened\b/gi, "sem açúcar"],
  [/\bsweetened\b/gi, "adoçado"],
  [/\bvery sweet\b/gi, "bem doce"],
  [/\bstrong\b/gi, "forte"],
  [/\bblack\b/gi, "preto"],
  [/\bwhite\b/gi, "branco"],
  [/\bgreen\b/gi, "verde"],
  [/\blong\b/gi, "longo"],
  [/\blarge\b/gi, "grande"],
  [/\bsmall\b/gi, "pequeno"],
  [/\bfull\b/gi, "cheio"],
  [/\bthai\b/gi, "tailandês"],
  [/\bjamaican\b/gi, "jamaicano"],
  [/\bturkish\b/gi, "turco"],
  [/\bfruit\b/gi, "fruta"],
  [/\bapple\b/gi, "maçã"],
  [/\blime\b/gi, "limão"],
  [/\borange\b/gi, "laranja"],
  [/\bwater\b/gi, "água"],
  // containers / portions
  [/\bbottles\b/gi, "garrafas"],
  [/\bbottle\b/gi, "garrafa"],
  [/\bcans\b/gi, "latas"],
  [/\bcan\b/gi, "lata"],
  [/\bcubes\b/gi, "cubos"],
  [/\bcube\b/gi, "cubo"],
  [/\bchunks\b/gi, "pedaços"],
  [/\bchunk\b/gi, "pedaço"],
  [/\bpieces\b/gi, "pedaços"],
  [/\bpiece\b/gi, "pedaço"],
  [/\bslices\b/gi, "fatias"],
  [/\bslice\b/gi, "fatia"],
  [/\bwedges\b/gi, "fatias"],
  [/\bwedge\b/gi, "fatia"],
  [/\bsplashes\b/gi, "respingos"],
  [/\bsplash\b/gi, "respingo"],
  [/\bdrops\b/gi, "gotas"],
  [/\bdrop\b/gi, "gota"],
  [/\bpinches\b/gi, "pitadas"],
  [/\bpinch\b/gi, "pitada"],
  [/\bsprigs\b/gi, "ramos"],
  [/\bsprig\b/gi, "ramo"],
  [/\bleaves\b/gi, "folhas"],
  [/\bpods\b/gi, "vagens"],
  [/\bpackages\b/gi, "pacotes"],
  [/\bpackage\b/gi, "pacote"],
  [/\bscoops\b/gi, "bolas"],
  [/\bscoop\b/gi, "bola"],
  [/\bsticks\b/gi, "paus"],
  [/\bstick\b/gi, "pau"],
  [/\bstrips\b/gi, "tiras"],
  [/\bstrip\b/gi, "tira"],
  [/\bmeasures\b/gi, "medidas"],
  [/\bmeasure\b/gi, "medida"],
  [/\bhandful\b/gi, "punhado"],
  [/\binch\b/gi, "polegada"],
  [/\brim\b/gi, "borda"],
  [/\bgr\b/gi, "g"],
  // actions
  [/\bgarnish\b/gi, "decorar"],
  [/\btop\b/gi, "completar"],
  [/\bfill\b/gi, "encher"],
  [/\bsqueeze\b/gi, "espremer"],
  [/\bfloat\b/gi, "flutuar"],
  [/\badd\b/gi, "adicionar"],
  [/\bover\b/gi, "por cima"],
  [/\brimmed\b/gi, "com borda"],
  [/\bput\b/gi, "colocar"],
  [/\bwith\b/gi, "com"],
  [/\bor\b/gi, "ou"],
  [/\bvery\b/gi, "bem"],
];

// Token/phrase substitutions applied to the remaining notes, longest-first so
// multi-word phrases win before the single units they contain.
const NOTE_TOKENS: [RegExp, string][] = [
  [/can sweetened/gi, "lata"],
  [/twist of/gi, "pitada de"],
  [/\bdashes\b/gi, "gotas"],
  [/\bdash\b/gi, "gota"],
  [/\bparts\b/gi, "partes"],
  [/\bpart\b/gi, "parte"],
  [/\bcups\b/gi, "xícaras"],
  [/\bcup\b/gi, "xícara"],
  [/\bglass\b/gi, "copo (240ml)"],
];

// Translates a verbatim measure note (e.g. "2 dashes", "1 cup") into the
// active language. Only the units the catalogue uses are translated; anything
// else (counts, "Top", "splash", …) is left as-is.
function translateNote(note: string, lang: Lang): string {
  if (lang !== "PT") return note;
  const exact = NOTE_EXACT[note.trim().toLowerCase()];
  if (exact) return exact;
  let out = translateShot(note);
  out = translateSpoon(out);
  for (const [re, pt] of NOTE_TOKENS) out = out.replace(re, pt);
  for (const [re, pt] of NOTE_DESC) out = out.replace(re, pt);
  return mixedToDecimal(out);
}

export function formatMeasure(
  quantityMl: number | null,
  note: string | null,
  fallback: string,
  unit: Unit,
  lang: Lang = "EN",
): string {
  if (quantityMl == null) {
    let text = note ?? fallback ?? "";
    if (unit === "ML") text = noteToMl(text);
    return translateNote(text, lang);
  }
  return unit === "ML" ? toMl(quantityMl) : toOz(quantityMl);
}
