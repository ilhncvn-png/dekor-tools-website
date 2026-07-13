-- AlterTable
ALTER TABLE "ProductCategory" ADD COLUMN     "code" TEXT,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "showInNavigation" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showOnHomepage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "ProductCategoryTranslation" ADD COLUMN     "cardDescription" TEXT,
ADD COLUMN     "cardTitle" TEXT,
ADD COLUMN     "heroDescription" TEXT,
ADD COLUMN     "heroTitle" TEXT,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT;

-- CreateIndex
CREATE INDEX "ProductCategory_status_idx" ON "ProductCategory"("status");
