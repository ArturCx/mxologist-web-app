import { IsUUID, IsInt, Min, Max } from 'class-validator';

export class RateRecipeDto {
  @IsUUID()
  recipeId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  score: number;
}
