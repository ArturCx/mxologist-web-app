import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { RateRecipeDto } from './dto/rate-recipe.dto';

@UseGuards(ClerkAuthGuard)
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Get('mine')
  findMine(@CurrentUser() userId: string) {
    return this.ratingsService.findUserRatings(userId);
  }

  @Post()
  rate(@CurrentUser() userId: string, @Body() dto: RateRecipeDto) {
    return this.ratingsService.upsertRating(userId, dto.recipeId, dto.score);
  }
}
