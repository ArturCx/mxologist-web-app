import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AddIngredientDto } from './dto/add-ingredient.dto';

@UseGuards(ClerkAuthGuard)
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  // Public catalog of all known ingredients (still requires login,
  // since the whole controller is guarded — change if you want this public)
  @Get('catalog')
  findCatalog() {
    return this.ingredientsService.findAllCatalog();
  }

  @Get('my-inventory')
  findMyInventory(@CurrentUser() userId: string) {
    return this.ingredientsService.findUserInventory(userId);
  }

  @Post('my-inventory')
  addToInventory(@CurrentUser() userId: string, @Body() dto: AddIngredientDto) {
    return this.ingredientsService.addToInventory(userId, dto.ingredientId);
  }

  @Delete('my-inventory/:ingredientId')
  removeFromInventory(
    @CurrentUser() userId: string,
    @Param('ingredientId') ingredientId: string,
  ) {
    return this.ingredientsService.removeFromInventory(userId, ingredientId);
  }
}
