-- AlterTable: NewsArticle editorial fields
ALTER TABLE "NewsArticle"
  ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "categoryKey" TEXT NOT NULL DEFAULT 'News',
  ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "readingTime" TEXT,
  ADD COLUMN "displayDate" TIMESTAMP(3),
  ADD COLUMN "galleryMediaIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- AlterTable: NewsArticleTranslation SEO fields
ALTER TABLE "NewsArticleTranslation"
  ADD COLUMN "metaTitle" TEXT,
  ADD COLUMN "metaDescription" TEXT;
