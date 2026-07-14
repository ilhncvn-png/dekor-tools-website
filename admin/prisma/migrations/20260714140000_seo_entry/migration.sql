-- CreateTable
CREATE TABLE "SeoEntry" (
  "id" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "title" TEXT,
  "metaDescription" TEXT,
  "canonicalUrl" TEXT,
  "ogImageId" TEXT,
  "robotsIndex" BOOLEAN NOT NULL DEFAULT true,
  "twitterCardEnabled" BOOLEAN NOT NULL DEFAULT true,
  "schemaPresent" BOOLEAN NOT NULL DEFAULT false,
  "keywords" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SeoEntry_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SeoEntry_path_key" ON "SeoEntry"("path");
