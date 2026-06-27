// Renders a recipe ingredient's measure in the user's preferred system.
// Source amounts are normalised at ingest into `quantityMl` (a canonical
// volume) + `note` (the verbatim remainder for non-volumes). See
// packages/database/scripts/backfill-amounts.mjs.

export type Unit = "OZ" | "ML";

const OZ_ML = 29.5735;

// ml -> oz, rounded to the nearest quarter (jigger markings), e.g.
// 44.36 -> "1 1/2 oz", 14.79 -> "1/2 oz", 29.57 -> "1 oz".
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

// ml rounded to the nearest 5, e.g. 44.36 -> "45 ml", 29.57 -> "30 ml".
function toMl(ml: number): string {
  return `${Math.round(ml / 5) * 5} ml`;
}

export function formatMeasure(
  quantityMl: number | null,
  note: string | null,
  fallback: string,
  unit: Unit,
): string {
  if (quantityMl == null) return note ?? fallback ?? "";
  return unit === "ML" ? toMl(quantityMl) : toOz(quantityMl);
}
