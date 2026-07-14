-- Category detail collections
CREATE TABLE "CategoryStat" ("id" TEXT NOT NULL, "categoryId" TEXT NOT NULL, "value" TEXT NOT NULL, "label" TEXT NOT NULL, "sortOrder" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "CategoryStat_pkey" PRIMARY KEY ("id"));
CREATE INDEX "CategoryStat_categoryId_idx" ON "CategoryStat"("categoryId");
CREATE TABLE "CategoryFilterGroup" ("id" TEXT NOT NULL, "categoryId" TEXT NOT NULL, "key" TEXT NOT NULL, "label" TEXT NOT NULL, "type" TEXT NOT NULL DEFAULT 'checkbox', "sortOrder" INTEGER NOT NULL DEFAULT 0, "active" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "CategoryFilterGroup_pkey" PRIMARY KEY ("id"));
CREATE INDEX "CategoryFilterGroup_categoryId_idx" ON "CategoryFilterGroup"("categoryId");
CREATE TABLE "CategoryFilterOption" ("id" TEXT NOT NULL, "filterGroupId" TEXT NOT NULL, "value" TEXT NOT NULL, "label" TEXT NOT NULL, "sortOrder" INTEGER NOT NULL DEFAULT 0, CONSTRAINT "CategoryFilterOption_pkey" PRIMARY KEY ("id"));
CREATE INDEX "CategoryFilterOption_filterGroupId_idx" ON "CategoryFilterOption"("filterGroupId");
-- Product detail collections
CREATE TABLE "ProductApplicationArea" ("id" TEXT NOT NULL, "productId" TEXT NOT NULL, "languageCode" TEXT NOT NULL DEFAULT 'tr', "slotIndex" INTEGER NOT NULL DEFAULT 0, "title" TEXT NOT NULL, "description" TEXT, "eyebrow" TEXT, "iconMediaId" TEXT, "mediaId" TEXT, "sortOrder" INTEGER NOT NULL DEFAULT 0, CONSTRAINT "ProductApplicationArea_pkey" PRIMARY KEY ("id"));
CREATE INDEX "ProductApplicationArea_productId_idx" ON "ProductApplicationArea"("productId");
CREATE TABLE "ProductDocument" ("id" TEXT NOT NULL, "productId" TEXT NOT NULL, "mediaId" TEXT, "type" TEXT NOT NULL DEFAULT 'OTHER', "title" TEXT NOT NULL, "fileSizeLabel" TEXT, "languageCode" TEXT NOT NULL DEFAULT 'tr', "isActive" BOOLEAN NOT NULL DEFAULT true, "sortOrder" INTEGER NOT NULL DEFAULT 0, CONSTRAINT "ProductDocument_pkey" PRIMARY KEY ("id"));
CREATE INDEX "ProductDocument_productId_idx" ON "ProductDocument"("productId");
CREATE TABLE "ProductVideo" ("id" TEXT NOT NULL, "productId" TEXT NOT NULL, "provider" TEXT NOT NULL DEFAULT 'youtube', "url" TEXT, "blobMediaId" TEXT, "posterMediaId" TEXT, "durationLabel" TEXT, "title" TEXT, "description" TEXT, "isPrimary" BOOLEAN NOT NULL DEFAULT false, "sortOrder" INTEGER NOT NULL DEFAULT 0, CONSTRAINT "ProductVideo_pkey" PRIMARY KEY ("id"));
CREATE INDEX "ProductVideo_productId_idx" ON "ProductVideo"("productId");
CREATE TABLE "ProductTechnicalDrawing" ("id" TEXT NOT NULL, "productId" TEXT NOT NULL, "mediaId" TEXT, "title" TEXT, "drawingCode" TEXT, "revisionCode" TEXT, "widthLabel" TEXT, "heightLabel" TEXT, "notes" TEXT, "sortOrder" INTEGER NOT NULL DEFAULT 0, CONSTRAINT "ProductTechnicalDrawing_pkey" PRIMARY KEY ("id"));
CREATE INDEX "ProductTechnicalDrawing_productId_idx" ON "ProductTechnicalDrawing"("productId");
-- ProductMedia gallery metadata
ALTER TABLE "ProductMedia" ADD COLUMN "altText" TEXT, ADD COLUMN "caption" TEXT, ADD COLUMN "itemType" TEXT;
