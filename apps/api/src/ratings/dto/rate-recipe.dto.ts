import { IsUUID, IsInt, Min, Max } from 'class-validator';

export class RateRecipeDto {
  @IsUUID()
  recipeId: string;

  // Canonical 1–10 scale. The 5-star UI maps each star to score = star * 2;
  // the 1–10 UI sends the value directly.
  @IsInt()
  @Min(1)
  @Max(10)
  score: number;
}
