import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
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

  // Paginated independently per section, e.g.
  //   /recipes/matches?readyPage=2&almostPage=1&pageSize=6
  @Get('matches')
  findMatches(
    @CurrentUser() userId: string,
    @Query('readyPage') readyPage?: string,
    @Query('almostPage') almostPage?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.recipesService.findMatchesForUser(userId, {
      readyPage: readyPage ? Number.parseInt(readyPage, 10) : undefined,
      almostPage: almostPage ? Number.parseInt(almostPage, 10) : undefined,
      pageSize: pageSize ? Number.parseInt(pageSize, 10) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recipesService.findOne(id);
  }
}
