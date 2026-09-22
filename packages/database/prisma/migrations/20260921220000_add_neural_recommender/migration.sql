-- CreateEnum
CREATE TYPE "RecommendationEngine" AS ENUM ('BASELINE', 'NEURAL');

-- CreateTable
CREATE TABLE "model_versions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "synthetic" BOOLEAN NOT NULL DEFAULT false,
    "ratingsCount" INTEGER NOT NULL,
    "usersCount" INTEGER NOT NULL,
    "metrics" JSONB NOT NULL,
    "vocab" JSONB NOT NULL,
    "topology" JSONB NOT NULL,
    "weightSpecs" JSONB NOT NULL,
    "weights" BYTEA NOT NULL,

    CONSTRAINT "model_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "engine" "RecommendationEngine" NOT NULL,
    "modelVersionId" TEXT,
    "score" DOUBLE PRECISION NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendation_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "model_versions_active_idx" ON "model_versions"("active");

-- CreateIndex
CREATE INDEX "recommendation_events_userId_createdAt_idx" ON "recommendation_events"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "recommendation_events_recipeId_idx" ON "recommendation_events"("recipeId");

-- AddForeignKey
ALTER TABLE "recommendation_events" ADD CONSTRAINT "recommendation_events_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_events" ADD CONSTRAINT "recommendation_events_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "model_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

