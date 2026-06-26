import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecipesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.recipe.findMany({
      include: { ingredients: { include: { ingredient: true } } },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.recipe.findUnique({
      where: { id },
      include: { ingredients: { include: { ingredient: true } } },
    });
  }

  // Core "what can I make" logic — recipes the user can fully make
  // right now, plus near-misses (missing exactly 1-2 ingredients)
  async findMatchesForUser(userId: string) {
    const [userInventory, allRecipes] = await Promise.all([
      this.prisma.userIngredient.findMany({
        where: { userId },
        select: { ingredientId: true },
      }),
      this.findAll(),
    ]);

    const ownedIds = new Set(userInventory.map((i) => i.ingredientId));

    const scored = allRecipes.map((recipe) => {
      const requiredIds = recipe.ingredients.map((ri) => ri.ingredientId);
      const missing = recipe.ingredients.filter(
        (ri) => !ownedIds.has(ri.ingredientId),
      );

      return {
        recipe,
        missingCount: missing.length,
        missingIngredients: missing.map((m) => m.ingredient),
        canMake: missing.length === 0,
        totalIngredients: requiredIds.length,
      };
    });

    return {
      canMake: scored.filter((s) => s.canMake),
      almostThere: scored
        .filter((s) => !s.canMake && s.missingCount <= 2)
        .sort((a, b) => a.missingCount - b.missingCount),
    };
  }
}
