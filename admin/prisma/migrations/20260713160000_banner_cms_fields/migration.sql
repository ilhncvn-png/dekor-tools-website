-- AlterTable: Banner admin display/placement fields
ALTER TABLE "Banner"
  ADD COLUMN "name" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "bannerType" TEXT NOT NULL DEFAULT 'Banner',
  ADD COLUMN "placements" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
