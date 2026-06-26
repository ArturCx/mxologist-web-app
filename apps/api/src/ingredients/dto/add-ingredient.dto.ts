import { IsUUID } from 'class-validator';

export class AddIngredientDto {
  @IsUUID()
  ingredientId: string;
}
