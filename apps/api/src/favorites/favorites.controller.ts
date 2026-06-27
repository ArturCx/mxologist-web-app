import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { FavoriteRecipeDto } from './dto/favorite-recipe.dto';

@UseGuards(ClerkAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get('mine')
  findMine(@CurrentUser() userId: string) {
    return this.favoritesService.findUserFavorites(userId);
  }

  @Post()
  add(@CurrentUser() userId: string, @Body() dto: FavoriteRecipeDto) {
    return this.favoritesService.addFavorite(userId, dto.recipeId);
  }

  @Delete(':recipeId')
  @HttpCode(204)
  remove(
    @CurrentUser() userId: string,
    @Param('recipeId') recipeId: string,
  ) {
    return this.favoritesService.removeFavorite(userId, recipeId);
  }
}
