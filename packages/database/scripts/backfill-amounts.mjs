// Parses RecipeIngredient.amount (free text) into a canonical volume so the
// app can render measures in either US customary (oz) or metric (ml) per the
// user's Settings preference.
//
//   quantityMl: number  -> a convertible liquid volume (oz / ml / cl)
//   note:       string  -> the verbatim remainder for non-volumes
//                          (dashes, parts, "to taste", "1/2 shot", …)
//
// Only oz / ml / cl are converted — counts and spoon/dash units stay as text.
//
// Usage:
//   node --env-file=.env scripts/backfill-amounts.mjs           # dry run
//   node --env-file=.env scripts/backfill-amounts.mjs --apply   # write to DB
import { PrismaClient } from '../generated/client/client.js';

const APPLY = process.argv.includes('--apply');
const prisma = new PrismaClient();

const OZ_ML = 29.5735;
const round2 = (n) => Math.round(n * 100) / 100;

// "1 1/2" -> 1.5, "1/2" -> 0.5, "1.5" -> 1.5, "2" -> 2
function parseQty(str) {
  const mixed = str.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const frac = str.match(/^(\d+)\/(\d+)$/);
  if (frac) return Number(frac[1]) / Number(frac[2]);
  return Number(str);
}

export function parseAmount(raw) {
  if (!raw) return { quantityMl: null, note: null };

  // Strip the dataset's trailing junk: ', None  /  , None  /  stray quotes.
  let s = raw.replace(/['"]?\s*,?\s*None\s*$/i, '').trim();
  s = s.replace(/[,'"]+$/, '').trim();
  if (!s) return { quantityMl: null, note: null };

  // Leading quantity: mixed fraction, fraction, decimal, or integer.
  const qtyMatch = s.match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)/);
  let qty = null;
  let rest = s;
  if (qtyMatch) {
    qty = parseQty(qtyMatch[1]);
    rest = s.slice(qtyMatch[1].length).trim();
  }

  // Convertible liquid unit right after the quantity?
  const unit = rest.match(
    /^(oz|ounces?|ml|millilit(?:re|er)s?|cl|centilit(?:re|er)s?)\b\.?/i,
  );
  if (qty != null && unit) {
    const u = unit[1].toLowerCase();
    const factor = u.startsWith('oz') || u.startsWith('ounce')
      ? OZ_ML
      : u.startsWith('cl') || u.startsWith('centi')
        ? 10
        : 1; // ml
    return { quantityMl: round2(qty * factor), note: null };
  }

  // Everything else (dashes, parts, shot, tsp, to taste, bare number…)
  // stays as a verbatim note.
  return { quantityMl: null, note: s };
}

const ris = await prisma.recipeIngredient.findMany({
  select: { id: true, amount: true },
});

const parsed = ris.map((r) => ({ ...r, ...parseAmount(r.amount) }));

const volumes = parsed.filter((p) => p.quantityMl != null);
const notes = parsed.filter((p) => p.quantityMl == null);

console.log(`\n=== ${parsed.length} amounts | mode: ${APPLY ? 'APPLY' : 'DRY RUN'} ===`);
console.log(`  converted to ml: ${volumes.length}`);
console.log(`  kept as note:    ${notes.length}`);

console.log('\nSample conversions (original -> ml | as oz | as ml):');
const fmtOz = (ml) => {
  const q = Math.round((ml / OZ_ML) * 4) / 4;
  const w = Math.floor(q);
  const f = q - w;
  const fs = f === 0.25 ? '1/4' : f === 0.5 ? '1/2' : f === 0.75 ? '3/4' : '';
  return w === 0 && fs ? `${fs} oz` : fs ? `${w} ${fs} oz` : `${w} oz`;
};
const fmtMl = (ml) => `${Math.round(ml / 5) * 5} ml`;
const seen = new Set();
for (const p of parsed) {
  if (p.quantityMl == null) continue;
  const orig = ris.find((r) => r.id === p.id).amount;
  if (seen.has(orig)) continue;
  seen.add(orig);
  console.log(`  ${JSON.stringify(orig).padEnd(22)} -> ${String(p.quantityMl).padEnd(8)} | ${fmtOz(p.quantityMl).padEnd(10)} | ${fmtMl(p.quantityMl)}`);
  if (seen.size >= 16) break;
}

console.log('\nSample notes (kept verbatim):');
const seenN = new Set();
for (const p of notes) {
  if (!p.note || seenN.has(p.note)) continue;
  seenN.add(p.note);
  console.log(`  ${JSON.stringify(p.note)}`);
  if (seenN.size >= 14) break;
}

if (APPLY) {
  console.log('\nWriting to DB...');
  let n = 0;
  for (const p of parsed) {
    await prisma.recipeIngredient.update({
      where: { id: p.id },
      data: { quantityMl: p.quantityMl, note: p.note },
    });
    if (++n % 200 === 0) console.log(`  ${n}/${parsed.length}`);
  }
  console.log(`Done. Updated ${n} rows.`);
} else {
  console.log('\n(Dry run — no writes. Re-run with --apply to persist.)');
}

await prisma.$disconnect();
