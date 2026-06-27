-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'PT');

-- AlterTable
ALTER TABLE "user_settings" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'EN';
