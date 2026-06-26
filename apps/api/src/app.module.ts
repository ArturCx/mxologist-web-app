import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ClerkAuthModule } from './auth/clerk-auth.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { RecipesModule } from './recipes/recipes.module';
import { RatingsModule } from './ratings/ratings.module';
import { RecommendationsModule } from './recommendations/recommendations.module';

@Module({
  imports: [
    PrismaModule,
    ClerkAuthModule,
    IngredientsModule,
    RecipesModule,
    RatingsModule,
    RecommendationsModule,
  ],
})
export class AppModule {}
