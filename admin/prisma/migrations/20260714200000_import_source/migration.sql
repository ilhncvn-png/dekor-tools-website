-- Additive marker for content seeded from the existing public site (Phase 2 importer).
ALTER TABLE "ProductCategory" ADD COLUMN "importSource" TEXT;
ALTER TABLE "Product" ADD COLUMN "importSource" TEXT;
