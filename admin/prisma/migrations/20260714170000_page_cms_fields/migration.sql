ALTER TABLE "Page"
  ADD COLUMN "path" TEXT,
  ADD COLUMN "template" TEXT NOT NULL DEFAULT 'standard',
  ADD COLUMN "showInNavigation" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "ogImageId" TEXT,
  ADD COLUMN "scheduledAt" TIMESTAMP(3);
