// Adapts a DB recipe (ApiRecipe) into the visual "card" model the prototype's
// components expect. The source dataset has no monogram/colour fields, so we
// synthesise them deterministically from the recipe's name and flavour tags.
import type { ApiRecipe } from "./api-types";
import type { Lang } from "../i18n";

export type CardIngredient = {
  id: string;
  n: string;
  m: string; // original amount text (fallback)
  quantityMl: number | null;
  note: string | null;
};

export type CardDrink = {
  id: string;
  name: string;
  mono: string;
  imageUrl: string | null;
  glass: string;
  base: string;
  accent: string;
  rgb: string;
  tags: string[];
  ingredients: CardIngredient[];
  steps: string[];
};

// Accent/glow colour keyed by the recipe's primary flavour tag.
const FLAVOR_COLOR: Record<string, { accent: string; rgb: string }> = {
  BOOZY: { accent: "#d9933a", rgb: "217,147,58" },
  BITTER: { accent: "#d57f6a", rgb: "213,127,106" },
  SOUR: { accent: "#d6d873", rgb: "214,216,115" },
  SWEET: { accent: "#e3c987", rgb: "227,201,135" },
  REFRESHING: { accent: "#7ac6c2", rgb: "122,198,194" },
  CREAMY: { accent: "#e8d8bb", rgb: "232,216,187" },
  SPICY: { accent: "#df6f43", rgb: "223,111,67" },
  FRUITY: { accent: "#e487a4", rgb: "228,135,164" },
  HERBAL: { accent: "#9cc873", rgb: "156,200,115" },
};
const DEFAULT_COLOR = { accent: "#e3c987", rgb: "227,201,135" };

// Glass types are a small, near-enum set of English strings in the dataset.
// Rather than a DB column we translate them here, keyed by lowercased value
// (the source mixes "Highball glass" / "Highball Glass"). Unknown values keep
// their English text.
const GLASS_PT: Record<string, string> = {
  "balloon glass": "Taça balão",
  "beer glass": "Copo de cerveja",
  "beer mug": "Caneca de cerveja",
  "beer pilsner": "Copo pilsner",
  "brandy snifter": "Taça de conhaque",
  "champagne flute": "Taça flute de champanhe",
  "cocktail glass": "Taça de coquetel",
  "coffee mug": "Caneca de café",
  "collins glass": "Copo Collins",
  "copper mug": "Caneca de cobre",
  "cordial glass": "Cálice",
  "coupe glass": "Taça coupe",
  "highball glass": "Copo highball",
  "hurricane glass": "Copo hurricane",
  "irish coffee cup": "Xícara de Irish coffee",
  jar: "Pote",
  "margarita glass": "Taça de margarita",
  "margarita/coupette glass": "Taça de margarita/coupette",
  "martini glass": "Taça de martíni",
  "mason jar": "Pote de vidro",
  "nick and nora glass": "Taça Nick and Nora",
  "old-fashioned glass": "Copo old-fashioned",
  "pint glass": "Copo pint",
  pitcher: "Jarra",
  "pousse cafe glass": "Cálice pousse-café",
  "punch bowl": "Tigela de ponche",
  "shot glass": "Copo de dose",
  "whiskey glass": "Copo de uísque",
  "whiskey sour glass": "Copo de whiskey sour",
  "white wine glass": "Taça de vinho branco",
  "wine glass": "Taça de vinho",
};

// "Old Fashioned" -> "OF"; "Negroni" -> "NE".
function monogram(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return (words[0] ?? "?").slice(0, 2).toUpperCase();
}

// Free-text instructions -> discrete steps for the "Method" list.
function toSteps(instructions: string): string[] {
  return (instructions || "")
    .split(/(?:\r?\n)+|(?<=\.)\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Picks the PT field when the user is in Portuguese, falling back to the
// English source when no translation exists (brands, untranslated rows).
const pt = (
  lang: Lang,
  en: string,
  ptVal: string | null | undefined,
): string => (lang === "PT" && ptVal ? ptVal : en);

export function recipeToCard(r: ApiRecipe, lang: Lang = "EN"): CardDrink {
  const color = FLAVOR_COLOR[r.flavorTags?.[0]] ?? DEFAULT_COLOR;
  const ingName = (i: ApiRecipe["ingredients"][number]) =>
    pt(lang, i.ingredient.name, i.ingredient.namePt);
  const baseIng =
    (() => {
      const spirit = r.ingredients.find(
        (i) => i.ingredient.category === "SPIRIT",
      );
      return spirit ? ingName(spirit) : undefined;
    })() ??
    (r.ingredients[0] ? ingName(r.ingredients[0]) : undefined) ??
    "Cocktail";

  // Most drink names are proper nouns kept as-is, but some have an accepted
  // Portuguese name (filled into Recipe.namePt manually); fall back to English.
  const drinkName = pt(lang, r.name, r.namePt);
  return {
    id: r.id,
    name: drinkName,
    mono: monogram(drinkName),
    imageUrl: r.imageUrl,
    glass:
      lang === "PT" && r.glassType
        ? (GLASS_PT[r.glassType.toLowerCase()] ?? r.glassType)
        : (r.glassType ?? "Coupe"),
    base: baseIng,
    accent: color.accent,
    rgb: color.rgb,
    // Raw FlavorTag enum keys (e.g. "BOOZY"); screens translate via i18n.
    tags: r.flavorTags ?? [],
    ingredients: r.ingredients.map((i) => ({
      id: i.ingredientId,
      n: ingName(i),
      m: i.amount,
      quantityMl: i.quantityMl,
      note: i.note,
    })),
    steps: toSteps(pt(lang, r.instructions, r.instructionsPt)),
  };
}
