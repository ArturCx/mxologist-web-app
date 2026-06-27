import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  findUserFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        recipe: { include: { ingredients: { include: { ingredient: true } } } },
      },
    });
  }

  // Idempotent — favouriting an already-favourited recipe is a no-op.
  async addFavorite(userId: string, recipeId: string) {
    return this.prisma.favorite.upsert({
      where: { userId_recipeId: { userId, recipeId } },
      update: {},
      create: { userId, recipeId },
    });
  }

  async removeFavorite(userId: string, recipeId: string) {
    await this.prisma.favorite.deleteMany({ where: { userId, recipeId } });
  }
}
