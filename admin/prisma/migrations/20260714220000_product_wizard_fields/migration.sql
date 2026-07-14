ALTER TABLE "Product" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0, ADD COLUMN "materialSummary" TEXT, ADD COLUMN "flags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "ProductTranslation" ADD COLUMN "eyebrow" TEXT, ADD COLUMN "heroSubtitle" TEXT, ADD COLUMN "materialLabel" TEXT, ADD COLUMN "badgeText" TEXT, ADD COLUMN "ogTitle" TEXT, ADD COLUMN "ogDescription" TEXT;
