-- CreateEnum
CREATE TYPE "StockState" AS ENUM ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK');

-- AlterTable: Product commerce/display fields
ALTER TABLE "Product"
  ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "stockState" "StockState" NOT NULL DEFAULT 'IN_STOCK',
  ADD COLUMN "price" TEXT,
  ADD COLUMN "weightKg" DOUBLE PRECISION,
  ADD COLUMN "exportCountries" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "swatch" TEXT,
  ADD COLUMN "videoMediaId" TEXT,
  ADD COLUMN "documentId" TEXT,
  ADD COLUMN "ogImageMediaId" TEXT,
  ADD COLUMN "relatedProductIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- AlterTable: ProductTranslation SEO fields
ALTER TABLE "ProductTranslation"
  ADD COLUMN "metaTitle" TEXT,
  ADD COLUMN "metaDescription" TEXT;
