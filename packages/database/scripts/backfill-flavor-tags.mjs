// Backfills Recipe.flavorTags by inferring a flavor profile from each
// recipe's ingredients. The source cocktail dataset has no flavor data, so
// we derive it with a keyword rule engine tuned with cocktail knowledge.
//
// Usage:
//   node --env-file=.env scripts/backfill-flavor-tags.mjs           # dry run (no writes)
//   node --env-file=.env scripts/backfill-flavor-tags.mjs --apply   # write to DB
//
// Re-runnable and idempotent: tags are fully recomputed each time.
import { PrismaClient } from '../generated/client/client.js';

const APPLY = process.argv.includes('--apply');
const prisma = new PrismaClient();

// Valid FlavorTag enum values.
const TAGS = [
  'SOUR',
  'SWEET',
  'BITTER',
  'BOOZY',
  'REFRESHING',
  'CREAMY',
  'SPICY',
  'FRUITY',
  'HERBAL',
];

const has = (ings, re) => ings.some((i) => re.test(i));
const count = (ings, re) => ings.filter((i) => re.test(i)).length;

// Per-ingredient keyword rules. Each returns how many ingredients contribute
// to that tag (used as a weight when ranking).
const RULES = {
  SOUR: (ings) =>
    count(
      ings,
      /\b(lemon|lime|grapefruit)\b(?!.*(peel|twist|wedge|slice))|sour mix|sweet and sour|sweet & sour|citrus|lime cordial/i,
    ),
  SWEET: (ings) =>
    count(
      ings,
      /sugar|syrup|grenadine|honey|triple sec|liqueur|schnapps|amaretto|kahlua|bailey|grand marnier|cointreau|curacao|maraschino|cr[eè]me de|galliano|sambuca|vanilla|chocolate|caramel|agave|cola|coca-cola|ginger ale|lemonade|sprite|7-?up|drambuie|frangelico|midori|chambord|nectar|condensed milk|marshmallow|sweet vermouth|amaro|aperol/i,
    ),
  BITTER: (ings) =>
    count(
      ings,
      /bitters|campari|aperol|\bamaro\b|fernet|tonic|coffee|espresso|dry vermouth|grapefruit|cynar|quinine/i,
    ),
  REFRESHING: (ings) =>
    count(
      ings,
      /soda water|carbonated water|club soda|\btonic\b|ginger ale|ginger beer|sparkling|champagne|prosecco|\bmint\b|cucumber|lemonade|sprite|7-?up|lemon-lime|seltzer|perrier/i,
    ),
  CREAMY: (ings) =>
    count(ings, /(?<!ice )cream(?! of tartar| soda| sherry)|milk|\begg\b|bailey|coconut cream|coconut milk|ice cream|yogh?urt|half-and-half|custard/i) +
    // "creme de X" is a liqueur, not creamy — subtract those false hits.
    -count(ings, /cr[eè]me de/i),
  SPICY: (ings) =>
    count(
      ings,
      /ginger beer|ginger root|fresh ginger|chili|chilli|jalape|pepper(?!mint)|tabasco|cinnamon|nutmeg|clove|cayenne|horseradish|hot sauce|wasabi/i,
    ),
  FRUITY: (ings) =>
    count(
      ings,
      /orange juice|pineapple|cranberry|peach|apple|banana|mango|passion|strawberr|raspberr|blueberr|blackberr|cherry|grape(?!fruit)|melon|apricot|coconut|guava|\bpear\b|nectar|currant|watermelon|lychee|kiwi|pomegranate|grenadine|midori|chambord|cassis|\bfruit\b|\borange\b(?!.*(bitters|peel))/i,
    ),
  HERBAL: (ings) =>
    count(
      ings,
      /\bgin\b|\bmint\b|basil|rosemary|thyme|\bsage\b|chartreuse|benedictine|absinthe|pernod|ouzo|sambuca|vermouth|\bamaro\b|campari|aperol|fernet|galliano|drambuie|elderflower|st\.? germain|anise|fennel|\btea\b|kummel|j[aä]germeister|angostura/i,
    ),
};

const SPIRIT =
  /\b(gin|vodka|rum|tequila|whisky|whiskey|bourbon|scotch|\brye\b|brandy|cognac|applejack|mezcal|cacha[cç]a|pisco|grappa|aquavit|absinthe)\b|proof rum|wild turkey|absolut|bacardi|jack daniels|jim beam|southern comfort|everclear/i;

// Long/diluting or souring components that pull a drink away from "boozy".
// Citrus juice/fruit makes it a sour, not a spirit-forward sipper — but a
// lemon/lime *peel or twist* is just a garnish and shouldn't disqualify it.
const DILUTER =
  /soda|carbonated|club soda|\btonic\b|cola|coca-cola|ginger ale|lemonade|sprite|7-?up|seltzer|juice|cream|milk|\begg\b|coconut|champagne|prosecco|sour mix|sweet and sour|nectar|yogh?urt|\btea\b|coffee|lemon-lime|\b(lemon|lime|grapefruit)\b(?!.*(peel|twist|wedge|slice|zest))/i;

function tagsFor(recipe) {
  const ings = recipe.ings;
  const scores = {};
  for (const tag of TAGS) {
    if (tag === 'BOOZY') continue;
    const s = RULES[tag](ings);
    if (s > 0) scores[tag] = s;
  }

  // BOOZY is a recipe-level judgment: spirit-forward and not stretched by a
  // long mixer or citrus juice (a stirred Negroni/Manhattan, not a sour).
  const alcoholic = (recipe.alcoholic || '').toLowerCase().includes('alcohol') &&
    !(recipe.alcoholic || '').toLowerCase().includes('non');
  if (alcoholic && has(ings, SPIRIT) && !has(ings, DILUTER)) {
    scores.BOOZY = 2; // weight so it ranks alongside the strongest flavors
  }

  // Rank by weight, keep the top 4 most pronounced flavors.
  let chosen = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([t]) => t);

  // Guarantee at least one tag.
  if (chosen.length === 0) chosen = [alcoholic ? 'BOOZY' : 'SWEET'];

  // Stable enum order for tidy storage.
  return TAGS.filter((t) => chosen.includes(t));
}

const recipes = await prisma.recipe.findMany({
  select: {
    id: true,
    name: true,
    alcoholic: true,
    ingredients: { select: { ingredient: { select: { name: true } } } },
  },
  orderBy: { name: 'asc' },
});

const results = recipes.map((r) => ({
  id: r.id,
  name: r.name,
  alcoholic: r.alcoholic,
  ings: r.ingredients.map((i) => i.ingredient.name),
})).map((r) => ({ ...r, tags: tagsFor(r) }));

// --- Report ---
const dist = Object.fromEntries(TAGS.map((t) => [t, 0]));
results.forEach((r) => r.tags.forEach((t) => dist[t]++));
const tagCounts = results.map((r) => r.tags.length);
const avg = (tagCounts.reduce((a, b) => a + b, 0) / results.length).toFixed(2);

console.log(`\n=== ${results.length} recipes | avg ${avg} tags each | mode: ${APPLY ? 'APPLY' : 'DRY RUN'} ===`);
console.log('\nTag distribution:');
TAGS.forEach((t) => console.log(`  ${t.padEnd(11)} ${dist[t]}`));

const SAMPLE = [
  'Negroni', 'Margarita', 'Mojito', 'Whiskey Sour', 'Manhattan',
  'Pina Colada', 'Espresso Martini', 'Cosmopolitan', 'Old Fashioned',
  'Daiquiri', 'Moscow Mule', 'White Russian', 'Mai Tai', 'Dark and Stormy',
];
console.log('\nSample (well-known cocktails for sanity check):');
SAMPLE.forEach((name) => {
  const r = results.find((x) => x.name.toLowerCase() === name.toLowerCase());
  if (r) console.log(`  ${r.name.padEnd(20)} -> [${r.tags.join(', ')}]   {${r.ings.join(', ')}}`);
});

console.log('\nFirst 12 (alphabetical):');
results.slice(0, 12).forEach((r) =>
  console.log(`  ${r.name.padEnd(22)} -> [${r.tags.join(', ')}]`),
);

if (APPLY) {
  console.log('\nWriting to DB...');
  let n = 0;
  for (const r of results) {
    await prisma.recipe.update({ where: { id: r.id }, data: { flavorTags: r.tags } });
    if (++n % 50 === 0) console.log(`  ${n}/${results.length}`);
  }
  console.log(`Done. Updated ${n} recipes.`);
} else {
  console.log('\n(Dry run — no DB writes. Re-run with --apply to persist.)');
}

await prisma.$disconnect();
