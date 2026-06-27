// Import cocktails from the TheCocktailDB CSV export into Postgres.
//
// Usage:
//   node --env-file=.env scripts/import-cocktails.mjs [path/to/final_cocktails.csv]
//
// Idempotent: recipes and ingredients are upserted by their unique `name`,
// so re-running updates existing rows instead of creating duplicates.
//
// CSV columns: id, name, alcoholic, category, glassType, instructions,
//              drinkThumbnail, ingredients, ingredientMeasures, text
// `ingredients` / `ingredientMeasures` are Python-style list literals, e.g.
//   "['Gin', 'Lemon Juice']"   "['1 3/4 shot ', '1 Shot ']"

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "../generated/client/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const csvPath =
  process.argv[2] ?? resolve(__dirname, "../../../final_cocktails.csv");

const prisma = new PrismaClient();

// --- Parse the Python-style list literals -------------------------------
// The dataset has no apostrophes inside values (verified), so swapping single
// quotes for double quotes yields valid JSON. Falls back to a manual split.
function parsePyList(raw) {
  if (!raw || !raw.trim()) return [];
  try {
    return JSON.parse(raw.replace(/'/g, '"'));
  } catch {
    return raw
      .replace(/^\[|\]$/g, "")
      .split(/'\s*,\s*'/)
      .map((s) => s.replace(/^'|'$/g, ""));
  }
}

// --- Best-effort ingredient categoriser ---------------------------------
// The CSV has no per-ingredient category; the schema requires one. Rules are
// ordered (first match wins). Refine the keyword lists as needed.
const RULES = [
  ["BITTER", ["bitter", "angostura"]],
  ["SYRUP", ["syrup", "grenadine", "sugar", "honey", "agave", "orgeat", "gomme"]],
  [
    "MIXER",
    [
      "juice", "soda", "cola", "coke", "tonic", "water", "milk", "cream",
      "ginger ale", "ginger beer", "lemonade", "tea", "coffee", "sprite",
      "7-up", "tomato", "cranberry", "tonic water", "club soda", "lemon-lime",
      "energy drink", "pepper",
    ],
  ],
  [
    "GARNISH",
    [
      "peel", "twist", "slice", "wedge", "cherry", "olive", "mint", "salt",
      "nutmeg", "cinnamon", "zest", "garnish", "leaf", "sprig", "ice",
    ],
  ],
  [
    "LIQUEUR",
    [
      "liqueur", "triple sec", "cointreau", "curacao", "amaretto", "kahlua",
      "baileys", "schnapps", "vermouth", "campari", "aperol", "chambord",
      "frangelico", "drambuie", "midori", "sambuca", "grand marnier",
      "maraschino", "galliano", "chartreuse", "benedictine", "sloe gin",
      "advocaat", "creme de", "marnier", "dubonnet", "pernod", "ouzo",
    ],
  ],
  [
    "SPIRIT",
    [
      "gin", "vodka", "rum", "tequila", "whiskey", "whisky", "bourbon",
      "scotch", "brandy", "cognac", "mezcal", "cachaca", "absinthe",
      "aquavit", "pisco", "grappa", "sake", "wine", "champagne", "prosecco",
      "vermouth", "schnapps",
    ],
  ],
];

function categorize(name) {
  const n = name.toLowerCase();
  for (const [cat, kws] of RULES) {
    if (kws.some((kw) => n.includes(kw))) return cat;
  }
  return "OTHER";
}

async function main() {
  const records = parse(readFileSync(csvPath), {
    columns: true,
    skip_empty_lines: true,
  });
  console.log(`Read ${records.length} rows from ${csvPath}`);

  // Collect unique ingredients (case-insensitive), keeping first-seen spelling.
  const ingredientByKey = new Map(); // lowercased name -> canonical name
  for (const row of records) {
    for (const raw of parsePyList(row.ingredients)) {
      const name = (raw ?? "").trim();
      if (!name) continue;
      const key = name.toLowerCase();
      if (!ingredientByKey.has(key)) ingredientByKey.set(key, name);
    }
  }
  console.log(`Found ${ingredientByKey.size} unique ingredients`);

  // Upsert ingredients, build name(lowercase) -> id map.
  const idByKey = new Map();
  const catCount = {};
  for (const [key, name] of ingredientByKey) {
    const category = categorize(name);
    catCount[category] = (catCount[category] ?? 0) + 1;
    const ing = await prisma.ingredient.upsert({
      where: { name },
      update: { category },
      create: { name, category },
    });
    idByKey.set(key, ing.id);
  }
  console.log("Ingredient categories:", catCount);

  // Upsert recipes + their ingredient links.
  let recipeCount = 0;
  let linkCount = 0;
  for (const row of records) {
    const name = (row.name ?? "").trim();
    if (!name) continue;

    const recipe = await prisma.recipe.upsert({
      where: { name },
      update: {
        instructions: row.instructions ?? "",
        imageUrl: row.drinkThumbnail || null,
        glassType: row.glassType || null,
        alcoholic: row.alcoholic || null,
      },
      create: {
        name,
        instructions: row.instructions ?? "",
        imageUrl: row.drinkThumbnail || null,
        glassType: row.glassType || null,
        alcoholic: row.alcoholic || null,
        flavorTags: [], // no flavor data in this dataset
      },
    });
    recipeCount++;

    const ings = parsePyList(row.ingredients);
    const meas = parsePyList(row.ingredientMeasures);
    const seen = new Set(); // guard the [recipeId, ingredientId] unique constraint
    for (let i = 0; i < ings.length; i++) {
      const iname = (ings[i] ?? "").trim();
      if (!iname) continue;
      const ingredientId = idByKey.get(iname.toLowerCase());
      if (!ingredientId || seen.has(ingredientId)) continue;
      seen.add(ingredientId);
      const amount = (meas[i] ?? "").trim() || "to taste";
      await prisma.recipeIngredient.upsert({
        where: {
          recipeId_ingredientId: { recipeId: recipe.id, ingredientId },
        },
        update: { amount },
        create: { recipeId: recipe.id, ingredientId, amount },
      });
      linkCount++;
    }
  }

  console.log(
    `Imported ${recipeCount} recipes, ${linkCount} recipe-ingredient links.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
