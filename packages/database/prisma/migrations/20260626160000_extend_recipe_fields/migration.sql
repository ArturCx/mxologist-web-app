-- AlterTable
ALTER TABLE "recipes" ADD COLUMN     "alcoholic" TEXT,
ADD COLUMN     "glassType" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "recipes_name_key" ON "recipes"("name");

