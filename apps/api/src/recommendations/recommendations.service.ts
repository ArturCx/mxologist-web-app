// Similarity-based recommender:
// 1. Build the user's "flavor profile" from their highly-rated recipes
//    (average the flavorTags weighted by score)
// 2. Score every recipe the user HASN'T rated by flavor tag overlap
//    with that profile
// 3. Return top matches, optionally filtered to ones they can actually make
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FlavorTag } from '@mxologist/database';

@Injectable()
export class RecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecommendations(userId: string, limit = 5) {
    const ratings = await this.prisma.rating.findMany({
      where: { userId },
      include: { recipe: true },
    });

    // Cold start: no ratings yet — just return highest-rated recipes overall
    if (ratings.length === 0) {
      return this.getFallbackRecommendations(limit);
    }

    const flavorProfile = this.buildFlavorProfile(ratings);
    const ratedRecipeIds = new Set(ratings.map((r) => r.recipeId));

    const candidates = await this.prisma.recipe.findMany({
      where: { id: { notIn: Array.from(ratedRecipeIds) } },
      include: { ingredients: { include: { ingredient: true } } },
    });

    const scored = candidates
      .map((recipe) => ({
        recipe,
        score: this.scoreRecipeAgainstProfile(recipe.flavorTags, flavorProfile),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored;
  }

  private buildFlavorProfile(
    ratings: { score: number; recipe: { flavorTags: FlavorTag[] } }[],
  ): Map<FlavorTag, number> {
    const profile = new Map<FlavorTag, number>();

    for (const rating of ratings) {
      // Center score around 0: a 5 contributes +2, a 1 contributes -2,
      // a 3 contributes 0 — so disliked flavors actively get pushed down
      const weight = rating.score - 3;

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
