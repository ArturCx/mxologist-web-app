// Adapts a DB recipe (ApiRecipe) into the visual "card" model the prototype's
// components expect. The source dataset has no monogram/colour fields, so we
// synthesise them deterministically from the recipe's name and flavour tags.
import type { ApiRecipe } from "./api-types";

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

export function recipeToCard(r: ApiRecipe): CardDrink {
  const color = FLAVOR_COLOR[r.flavorTags?.[0]] ?? DEFAULT_COLOR;
  const baseIng =
    r.ingredients.find((i) => i.ingredient.category === "SPIRIT")?.ingredient
      .name ??
    r.ingredients[0]?.ingredient.name ??
    "Cocktail";

  return {
    id: r.id,
    name: r.name,
    mono: monogram(r.name),
    glass: r.glassType ?? "Coupe",
    base: baseIng,
    accent: color.accent,
    rgb: color.rgb,
    // Raw FlavorTag enum keys (e.g. "BOOZY"); screens translate via i18n.
    tags: r.flavorTags ?? [],
    ingredients: r.ingredients.map((i) => ({
      id: i.ingredientId,
      n: i.ingredient.name,
      m: i.amount,
      quantityMl: i.quantityMl,
      note: i.note,
    })),
    steps: toSteps(r.instructions),
  };
}
