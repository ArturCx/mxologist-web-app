import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  findUserRatings(userId: string) {
    return this.prisma.rating.findMany({
      where: { userId },
      include: { recipe: true },
    });
  }

  // Upsert — rating again just updates the score
  upsertRating(userId: string, recipeId: string, score: number) {
    return this.prisma.rating.upsert({
      where: { userId_recipeId: { userId, recipeId } },
      update: { score },
      create: { userId, recipeId, score },
    });
  }
}
