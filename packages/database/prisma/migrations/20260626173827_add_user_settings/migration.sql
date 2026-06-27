-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "MeasurementUnit" AS ENUM ('OZ', 'ML');

-- CreateEnum
CREATE TYPE "ScoreType" AS ENUM ('FIVE_STARS', 'ONE_TO_TEN');

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "age" INTEGER,
    "sex" "Sex",
    "measurementUnit" "MeasurementUnit" NOT NULL DEFAULT 'OZ',
    "scoreType" "ScoreType" NOT NULL DEFAULT 'FIVE_STARS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_userId_key" ON "user_settings"("userId");
