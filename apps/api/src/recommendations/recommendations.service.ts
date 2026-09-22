// Similarity-based recommender:
// 1. Build the user's "flavor profile" from their highly-rated recipes
//    (average the flavorTags weighted by score)
// 2. Score every recipe the user HASN'T rated by flavor tag overlap
//    with that profile
// 3. Return top matches, optionally filtered to ones they can actually make
//
// That is the BASELINE engine. When a trained neural model is live (see
// ../ml), candidates are ranked by its predicted score instead; the baseline
// stays as the fallback and as the comparison arm.
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FlavorTag, RecommendationEngine } from '@mxologist/database';
import { MlService } from '../ml/ml.service';

export type EngineChoice = 'auto' | 'baseline' | 'neural';

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ml: MlService,
  ) {}

  async getRecommendations(
    userId: string,
    limit = 5,
    engine: EngineChoice = 'auto',
  ) {
    const ratings = await this.prisma.rating.findMany({
      where: { userId },
      include: {
        recipe: {
          include: { ingredients: { select: { ingredientId: true } } },
        },
      },
    });

    // Cold start: no ratings yet — just return highest-rated recipes overall
    if (ratings.length === 0) {
      const fallback = await this.getFallbackRecommendations(limit);
      return this.logAndTag(userId, fallback, RecommendationEngine.BASELINE);
    }

    const flavorProfile = this.buildFlavorProfile(ratings);
    const ratedRecipeIds = new Set(ratings.map((r) => r.recipeId));

    const candidates = await this.prisma.recipe.findMany({
      where: { id: { notIn: Array.from(ratedRecipeIds) } },
      include: { ingredients: { include: { ingredient: true } } },
    });

    const neural =
      engine === 'baseline'
        ? null
        : await this.scoreNeural(userId, ratings, candidates);

    const scored = candidates
      .map((recipe, i) => ({
        recipe,
        score: neural
          ? neural.scores[i]
          : this.scoreRecipeAgainstProfile(recipe.flavorTags, flavorProfile),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return this.logAndTag(
      userId,
      scored,
      neural ? RecommendationEngine.NEURAL : RecommendationEngine.BASELINE,
      neural?.modelVersionId,
    );
  }

  // A broken or missing model must never take recommendations down — any
  // failure here just means the baseline answers instead.
  private async scoreNeural(
    ...args: Parameters<MlService['score']>
  ): ReturnType<MlService['score']> {
    try {
      return await this.ml.score(...args);
    } catch (error) {
      this.logger.error('Neural scoring failed, using baseline', error);
      return null;
    }
  }

  // Records what was shown (and by which engine) so the two can be compared
  // against the ratings/favorites that follow.
  private async logAndTag<T extends { recipe: { id: string }; score: number }>(
    userId: string,
    items: T[],
    engine: RecommendationEngine,
    modelVersionId?: string,
  ) {
    try {
      await this.prisma.recommendationEvent.createMany({
        data: items.map((item, position) => ({
          userId,
          recipeId: item.recipe.id,
          engine,
          modelVersionId,
          score: item.score,
          position,
        })),
      });
    } catch (error) {
      this.logger.error('Failed to log recommendation events', error);
    }
    return items.map((item) => ({ ...item, engine }));
  }

  private buildFlavorProfile(
    ratings: { score: number; recipe: { flavorTags: FlavorTag[] } }[],
  ): Map<FlavorTag, number> {
    const profile = new Map<FlavorTag, number>();

    for (const rating of ratings) {
      // Center the 1–10 canonical score around 0: a 10 contributes +4.5,
      // a 1 contributes -4.5, ~5.5 is neutral — so disliked flavors get
      // actively pushed down.
      const weight = rating.score - 5.5;

      for (const tag of rating.recipe.flavorTags) {
        profile.set(tag, (profile.get(tag) ?? 0) + weight);
      }
    }

    return profile;
  }

  private scoreRecipeAgainstProfile(
    tags: FlavorTag[],
    profile: Map<FlavorTag, number>,
  ): number {
    return tags.reduce((sum, tag) => sum + (profile.get(tag) ?? 0), 0);
  }

  private async getFallbackRecommendations(limit: number) {
    const recipes = await this.prisma.recipe.findMany({
      include: {
        ratings: true,
        ingredients: { include: { ingredient: true } },
      },
    });

    return recipes
      .map((recipe) => ({
        recipe,
        score:
          recipe.ratings.length > 0
            ? recipe.ratings.reduce((sum, r) => sum + r.score, 0) /
              recipe.ratings.length
            : 0,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}
