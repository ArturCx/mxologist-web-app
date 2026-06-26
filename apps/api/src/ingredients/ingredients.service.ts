import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IngredientsService {
  constructor(private readonly prisma: PrismaService) {}

  // Full catalog — all possible ingredients a user could pick from
  findAllCatalog() {
    return this.prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
    });
  }

  // What THIS user currently has in their inventory
  findUserInventory(userId: string) {
    return this.prisma.userIngredient.findMany({
      where: { userId },
      include: { ingredient: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addToInventory(userId: string, ingredientId: string) {
    const existing = await this.prisma.userIngredient.findUnique({
      where: { userId_ingredientId: { userId, ingredientId } },
    });

    if (existing) {
      throw new ConflictException('Ingredient already in inventory');
    }

    return this.prisma.userIngredient.create({
      data: { userId, ingredientId },
      include: { ingredient: true },
    });
  }

  removeFromInventory(userId: string, ingredientId: string) {
    return this.prisma.userIngredient.delete({
      where: { userId_ingredientId: { userId, ingredientId } },
    });
  }
}
