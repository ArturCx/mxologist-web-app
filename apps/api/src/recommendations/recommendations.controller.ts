import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(ClerkAuthGuard)
@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get()
  getRecommendations(
    @CurrentUser() userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.recommendationsService.getRecommendations(
      userId,
      limit ? Number.parseInt(limit, 10) : undefined,
    );
  }
}
