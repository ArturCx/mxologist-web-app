import { Injectable, Logger } from '@nestjs/common';
import type { LayersModel } from '@tensorflow/tfjs-layers';
import { Prisma } from '@mxologist/database';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildVocab,
  type Demographics,
  type HistoryEntry,
  type RecipeSource,
  type Vocab,
} from './features';
import {
  deserializeModel,
  scoreRecipes,
  serializeModel,
  trainModel,
  type RatingRow,
} from './model';
import { generateSyntheticRatings } from './synthetic';

export type TrainRequest = {
  // Train on generated users instead of the ratings table (pipeline tests).
  synthetic?: boolean;
  // Force the result (in)active. Default: real models go live only when they
  // beat the predict-the-mean baseline on held-out ratings; synthetic never.
  activate?: boolean;
};

type LoadedModel = { id: string; model: LayersModel; vocab: Vocab };

const RECIPE_SELECT = {
  id: true,
  flavorTags: true,
  glassType: true,
  alcoholic: true,
  ingredients: { select: { ingredientId: true } },
} as const;

@Injectable()
export class MlService {
  private readonly logger = new Logger(MlService.name);
  // Survives across warm invocations of the same Function instance.
  private loaded: LoadedModel | null = null;

  constructor(private readonly prisma: PrismaService) {}

  // Below this there is nothing to learn from; the cron run is a no-op.
  private get minRatings() {
    return Number.parseInt(process.env.ML_MIN_RATINGS ?? '', 10) || 50;
  }

  async train({ synthetic = false, activate }: TrainRequest = {}) {
    const recipes: RecipeSource[] = await this.prisma.recipe.findMany({
      select: RECIPE_SELECT,
    });

    let ratings: RatingRow[];
    let demographics: Map<string, Demographics>;
    if (synthetic) {
      ({ ratings, demographics } = generateSyntheticRatings(recipes));
    } else {
      ratings = await this.prisma.rating.findMany({
        select: { userId: true, recipeId: true, score: true },
      });
      const settings = await this.prisma.userSettings.findMany({
        select: { userId: true, age: true, sex: true },
      });
      demographics = new Map(settings.map((s) => [s.userId, s]));
    }

    const usersCount = new Set(ratings.map((r) => r.userId)).size;
    if (ratings.length < this.minRatings) {
      return {
        trained: false as const,
        reason: `Only ${ratings.length} ratings (need ${this.minRatings})`,
        ratingsCount: ratings.length,
        usersCount,
      };
    }

    const vocab = buildVocab(recipes);
    const { model, metrics } = await trainModel(
      recipes,
      ratings,
      demographics,
      vocab,
    );
    const serialized = await serializeModel(model);
    model.dispose();

    const beatsBaseline =
      metrics.valMae !== null &&
      metrics.meanBaselineMae !== null &&
      metrics.valMae < metrics.meanBaselineMae;
    const active = activate ?? (!synthetic && beatsBaseline);

    const version = await this.prisma.$transaction(async (tx) => {
      if (active) {
        await tx.modelVersion.updateMany({
          where: { active: true },
          data: { active: false },
        });
      }
      return tx.modelVersion.create({
        data: {
          active,
          synthetic,
          ratingsCount: ratings.length,
          usersCount,
          metrics,
          vocab,
          topology: serialized.topology as Prisma.InputJsonValue,
          weightSpecs: serialized.weightSpecs as Prisma.InputJsonValue,
          weights: serialized.weights,
        },
        select: { id: true, createdAt: true },
      });
    });

    this.logger.log(
      `Trained model ${version.id} (active=${active}, valMae=${metrics.valMae}, baseline=${metrics.meanBaselineMae})`,
    );
    return {
      trained: true as const,
      id: version.id,
      active,
      synthetic,
      ratingsCount: ratings.length,
      usersCount,
      metrics,
    };
  }

  status() {
    return this.prisma.modelVersion.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        createdAt: true,
        active: true,
        synthetic: true,
        ratingsCount: true,
        usersCount: true,
        metrics: true,
      },
    });
  }

  // The active model, reloaded only when a different version went live.
  private async getActive(): Promise<LoadedModel | null> {
    const current = await this.prisma.modelVersion.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
    if (!current) return null;
    if (this.loaded?.id === current.id) return this.loaded;

    const row = await this.prisma.modelVersion.findUniqueOrThrow({
      where: { id: current.id },
    });
    const model = await deserializeModel({
      topology: row.topology,
      weightSpecs: row.weightSpecs,
      weights: row.weights,
    });
    this.loaded?.model.dispose();
    this.loaded = {
      id: row.id,
      model,
      vocab: row.vocab as unknown as Vocab,
    };
    return this.loaded;
  }

  // Predicted 1–10 score per candidate, or null when no model is live.
  async score(
    userId: string,
    history: (HistoryEntry & { recipe: RecipeSource })[],
    candidates: RecipeSource[],
  ): Promise<{ modelVersionId: string; scores: number[] } | null> {
    const active = await this.getActive();
    if (!active) return null;

    const settings = await this.prisma.userSettings.findUnique({
      where: { userId },
      select: { age: true, sex: true },
    });
    const scores = scoreRecipes(
      active.model,
      active.vocab,
      history,
      history.map((h) => h.recipe),
      settings ?? { age: null, sex: null },
      candidates,
    );
    return { modelVersionId: active.id, scores };
  }
}
