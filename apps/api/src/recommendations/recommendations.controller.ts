import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  RecommendationsService,
  type EngineChoice,
} from './recommendations.service';
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
    // `baseline` forces the flavor-tag recommender; anything else uses the
    // neural model when one is live.
    @Query('engine') engine?: string,
  ) {
    const choice: EngineChoice =
      engine === 'baseline' || engine === 'neural' ? engine : 'auto';
    return this.recommendationsService.getRecommendations(
      userId,
      limit ? Number.parseInt(limit, 10) : undefined,
      choice,
    );
  }
}
