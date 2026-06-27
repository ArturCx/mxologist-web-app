import { IsUUID } from 'class-validator';

export class FavoriteRecipeDto {
  @IsUUID()
  recipeId: string;
}
