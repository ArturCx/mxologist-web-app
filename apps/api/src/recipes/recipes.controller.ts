import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(ClerkAuthGuard)
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  findAll() {
    return this.recipesService.findAll();
  }

  @Get('matches')
  findMatches(@CurrentUser() userId: string) {
    return this.recipesService.findMatchesForUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recipesService.findOne(id);
  }
}
