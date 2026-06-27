// Shapes returned by the NestJS API (see apps/api). Kept separate from the
// prototype's mock `Drink` model in data.ts.

export type ApiIngredient = {
  id: string;
  name: string;
  namePt: string | null; // PT translation; null for brands/proper nouns (falls back to name)
  category: string; // IngredientCategory enum
};

export type ApiUserIngredient = {
  id: string;
  ingredientId: string;
  ingredient: ApiIngredient;
};

export type ApiRecipeIngredient = {
  amount: string;
  quantityMl: number | null;
  note: string | null;
  ingredientId: string;
  ingredient: ApiIngredient;
};

export type ApiRecipe = {
  id: string;
  name: string;
  namePt: string | null; // PT drink name; null falls back to name
  instructions: string;
  instructionsPt: string | null; // PT translation (falls back to instructions)
  imageUrl: string | null;
  glassType: string | null;
  alcoholic: string | null;
  flavorTags: string[];
  ingredients: ApiRecipeIngredient[];
};

export type ApiRating = {
  id: string;
  recipeId: string;
  score: number;
  recipe: ApiRecipe;
};

// One entry from GET /favorites/mine (recipe the user starred).
export type ApiFavorite = {
  id: string;
  recipeId: string;
  recipe: ApiRecipe;
};

// One entry from GET /recommendations (recipe + raw overlap score).
export type ApiRecommendation = {
  recipe: ApiRecipe;
  score: number;
};

export type ApiMatch = {
  recipe: ApiRecipe;
  missingCount: number;
  missingIngredients: ApiIngredient[];
  canMake: boolean;
  totalIngredients: number;
};

// Mirrors the backend `paginate()` envelope.
export type Page<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type MatchesResponse = {
  canMake: Page<ApiMatch>;
  almostThere: Page<ApiMatch>;
};
