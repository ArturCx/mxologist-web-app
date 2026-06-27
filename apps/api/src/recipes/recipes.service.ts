import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));

// Slices a list into a page envelope with the metadata the UI needs to
// render pagination controls.
function paginate<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    total,
    totalPages,
  };
}

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
  // right now, plus near-misses (missing exactly 1-2 ingredients).
  // Each section (canMake / almostThere) is paginated independently.
  async findMatchesForUser(
    userId: string,
    opts: { readyPage?: number; almostPage?: number; pageSize?: number } = {},
  ) {
    const pageSize = clamp(opts.pageSize ?? 6, 1, 50);
    const readyPage = Math.max(1, opts.readyPage ?? 1);
    const almostPage = Math.max(1, opts.almostPage ?? 1);

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

    const canMake = scored.filter((s) => s.canMake);
    // "Almost there" = the user already owns at least 50% of the ingredients,
    // i.e. missing no more than half (floored). 2-ingredient drink → missing 1,
    // 4-ingredient → missing 2, 3-ingredient → missing 1 (owns 2/3).
    const almostThere = scored
      .filter(
        (s) =>
          !s.canMake &&
          s.missingCount <= Math.floor(s.totalIngredients / 2),
      )
      .sort((a, b) => a.missingCount - b.missingCount);

    return {
      canMake: paginate(canMake, readyPage, pageSize),
      almostThere: paginate(almostThere, almostPage, pageSize),
    };
  }
}
