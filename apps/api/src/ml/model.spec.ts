import { buildVocab, type RecipeSource } from './features';
import {
  deserializeModel,
  mulberry32,
  scoreRecipes,
  serializeModel,
  trainModel,
} from './model';
import { generateSyntheticRatings } from './synthetic';

// A small fake catalog: enough structure for taste to be learnable.
function catalog(n = 60): RecipeSource[] {
  const rand = mulberry32(1);
  const tags = ['SOUR', 'SWEET', 'BITTER', 'BOOZY', 'FRUITY'];
  return Array.from({ length: n }, (_, i) => ({
    id: `r${i}`,
    flavorTags: tags.filter(() => rand() < 0.4),
    glassType: rand() < 0.5 ? 'Highball glass' : 'Cocktail glass',
    alcoholic: 'Alcoholic',
    ingredients: Array.from({ length: 3 }, () => ({
      ingredientId: `ing${Math.floor(rand() * 20)}`,
    })),
  }));
}

describe('neural recommender', () => {
  jest.setTimeout(120_000);

  it('beats the predict-the-mean baseline and survives a save/load round trip', async () => {
    const recipes = catalog();
    const vocab = buildVocab(recipes);
    const { ratings, demographics } = generateSyntheticRatings(recipes, {
      users: 60,
    });

    const { model, metrics } = await trainModel(
      recipes,
      ratings,
      demographics,
      vocab,
    );
    expect(metrics.valMae).not.toBeNull();
    expect(metrics.valMae!).toBeLessThan(metrics.meanBaselineMae!);

    const restored = await deserializeModel(await serializeModel(model));
    const history = ratings
      .filter((r) => r.userId === 'synthetic_0')
      .map(({ recipeId, score }) => ({ recipeId, score }));
    const demo = { age: 30, sex: null };
    const before = scoreRecipes(model, vocab, history, recipes, demo, recipes);
    const after = scoreRecipes(
      restored,
      vocab,
      history,
      recipes,
      demo,
      recipes,
    );

    expect(after).toHaveLength(recipes.length);
    after.forEach((s, i) => {
      expect(s).toBeCloseTo(before[i], 4);
      expect(s).toBeGreaterThanOrEqual(1);
      expect(s).toBeLessThanOrEqual(10);
    });
  });
});
