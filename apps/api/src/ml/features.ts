// Feature encoding for the neural recommender. Pure functions, no TensorFlow:
// the same code turns DB rows into vectors at training time and at inference
// time, always against the vocabulary stored with the model (ModelVersion.vocab).

export const FLAVOR_TAGS = [
  'SOUR',
  'SWEET',
  'BITTER',
  'BOOZY',
  'REFRESHING',
  'CREAMY',
  'SPICY',
  'FRUITY',
  'HERBAL',
] as const;

const SEXES = ['MALE', 'FEMALE', 'OTHER'] as const;

// Canonical ratings are 1–10 (see RateRecipeDto); the model works on a
// centered [-1, 1] target so "neutral" sits at 0.
export const SCORE_MID = 5.5;
export const SCORE_HALF_RANGE = 4.5;
export const normalizeScore = (score: number) =>
  (score - SCORE_MID) / SCORE_HALF_RANGE;
export const denormalizeScore = (t: number) =>
  Math.min(10, Math.max(1, t * SCORE_HALF_RANGE + SCORE_MID));

export type Vocab = {
  flavorTags: string[];
  ingredientIds: string[];
  glassTypes: string[];
  alcoholic: string[];
};

export type RecipeSource = {
  id: string;
  flavorTags: string[];
  glassType: string | null;
  alcoholic: string | null;
  ingredients: { ingredientId: string }[];
};

export type Demographics = { age: number | null; sex: string | null };

export type HistoryEntry = { recipeId: string; score: number };

// The dataset mixes "Highball glass" / "Highball Glass".
const norm = (s: string | null) => (s ?? '').trim().toLowerCase();

export function buildVocab(recipes: RecipeSource[]): Vocab {
  const ingredientIds = new Set<string>();
  const glassTypes = new Set<string>();
  const alcoholic = new Set<string>();
  for (const r of recipes) {
    r.ingredients.forEach((i) => ingredientIds.add(i.ingredientId));
    if (r.glassType) glassTypes.add(norm(r.glassType));
    if (r.alcoholic) alcoholic.add(norm(r.alcoholic));
  }
  return {
    flavorTags: [...FLAVOR_TAGS],
    ingredientIds: [...ingredientIds].sort(),
    glassTypes: [...glassTypes].sort(),
    alcoholic: [...alcoholic].sort(),
  };
}

export const itemDim = (v: Vocab) =>
  v.flavorTags.length +
  v.ingredientIds.length +
  v.glassTypes.length +
  v.alcoholic.length;

// age, age-known flag, sex one-hot, history size
const USER_EXTRA_DIM = 2 + SEXES.length + 1;
export const userDim = (v: Vocab) => itemDim(v) + USER_EXTRA_DIM;

// Index lookups are built once per vocab and reused across every recipe.
export type Encoder = {
  vocab: Vocab;
  encodeRecipe: (r: RecipeSource) => Float32Array;
};

export function createEncoder(vocab: Vocab): Encoder {
  const index = (list: string[], offset: number) =>
    new Map(list.map((k, i) => [k, offset + i]));
  let offset = 0;
  const tagIdx = index(vocab.flavorTags, offset);
  offset += vocab.flavorTags.length;
  const ingIdx = index(vocab.ingredientIds, offset);
  offset += vocab.ingredientIds.length;
  const glassIdx = index(vocab.glassTypes, offset);
  offset += vocab.glassTypes.length;
  const alcIdx = index(vocab.alcoholic, offset);
  const dim = itemDim(vocab);

  return {
    vocab,
    // Multi-hot over tags + ingredients, one-hot glass and alcoholic. Values
    // unseen at training time (new ingredients, new glasses) are just skipped.
    encodeRecipe(r) {
      const x = new Float32Array(dim);
      const set = (i: number | undefined) => {
        if (i !== undefined) x[i] = 1;
      };
      r.flavorTags.forEach((t) => set(tagIdx.get(t)));
      r.ingredients.forEach((i) => set(ingIdx.get(i.ingredientId)));
      set(glassIdx.get(norm(r.glassType)));
      set(alcIdx.get(norm(r.alcoholic)));
      return x;
    },
  };
}

// A user is represented by what they rated, not by an id: the score-weighted
// average of their rated recipes' feature vectors (liked features positive,
// disliked negative) plus demographics. This is what lets a brand-new user get
// neural recommendations without retraining.
export function encodeUser(
  history: HistoryEntry[],
  recipeVectors: Map<string, Float32Array>,
  demo: Demographics,
  vocab: Vocab,
): Float32Array {
  const iDim = itemDim(vocab);
  const x = new Float32Array(userDim(vocab));

  let weightSum = 0;
  let used = 0;
  for (const h of history) {
    const vec = recipeVectors.get(h.recipeId);
    if (!vec) continue;
    const w = normalizeScore(h.score);
    for (let i = 0; i < iDim; i++) x[i] += w * vec[i];
    weightSum += Math.abs(w);
    used++;
  }
  if (weightSum > 0) for (let i = 0; i < iDim; i++) x[i] /= weightSum;

  let o = iDim;
  x[o++] = demo.age ? Math.min(demo.age, 100) / 100 : 0;
  x[o++] = demo.age ? 1 : 0;
  for (const s of SEXES) x[o++] = demo.sex === s ? 1 : 0;
  x[o++] = Math.log1p(used) / 5;
  return x;
}
