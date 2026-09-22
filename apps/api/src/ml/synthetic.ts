// Generated users for exercising the training pipeline before there is enough
// real data. Each fake user has a hidden taste (per flavor tag, plus a few
// loved/hated ingredients) and rates random recipes accordingly, with noise.
// Never written to the ratings table — it only ever exists in memory.
import { FLAVOR_TAGS, type Demographics, type RecipeSource } from './features';
import { mulberry32, type RatingRow } from './model';

export function generateSyntheticRatings(
  recipes: RecipeSource[],
  { users = 120, seed = 7 }: { users?: number; seed?: number } = {},
): { ratings: RatingRow[]; demographics: Map<string, Demographics> } {
  const rand = mulberry32(seed);
  // Box–Muller
  const gauss = () =>
    Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
  const pick = <T>(list: T[]) => list[Math.floor(rand() * list.length)];

  const ingredientIds = [
    ...new Set(
      recipes.flatMap((r) => r.ingredients.map((i) => i.ingredientId)),
    ),
  ];

  const ratings: RatingRow[] = [];
  const demographics = new Map<string, Demographics>();

  for (let u = 0; u < users; u++) {
    const userId = `synthetic_${u}`;
    demographics.set(userId, {
      age: 18 + Math.floor(rand() * 50),
      sex: pick(['MALE', 'FEMALE', 'OTHER', null]),
    });

    const tagTaste = new Map(FLAVOR_TAGS.map((t) => [t as string, gauss()]));
    const ingredientTaste = new Map<string, number>();
    for (let k = 0; k < 6; k++)
      ingredientTaste.set(pick(ingredientIds), gauss() * 1.5);

    const count = 10 + Math.floor(rand() * 30);
    const seen = new Set<string>();
    for (let k = 0; k < count; k++) {
      const recipe = pick(recipes);
      if (seen.has(recipe.id)) continue;
      seen.add(recipe.id);

      const tags = recipe.flavorTags;
      const tagPart =
        tags.reduce((s, t) => s + (tagTaste.get(t) ?? 0), 0) /
        Math.sqrt(tags.length || 1);
      const ingPart = recipe.ingredients.reduce(
        (s, i) => s + (ingredientTaste.get(i.ingredientId) ?? 0),
        0,
      );
      const raw = 5.5 + 1.8 * tagPart + ingPart + gauss() * 0.8;
      ratings.push({
        userId,
        recipeId: recipe.id,
        score: Math.min(10, Math.max(1, Math.round(raw))),
      });
    }
  }

  return { ratings, demographics };
}
