-- AlterTable: Dealer application/directory fields
ALTER TABLE "Dealer"
  ADD COLUMN "region" TEXT,
  ADD COLUMN "contactName" TEXT,
  ADD COLUMN "volume" TEXT,
  ADD COLUMN "assignedTo" TEXT,
  ADD COLUMN "listedOnWebsite" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "contractSigned" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "notes" TEXT,
  ADD COLUMN "logoMediaId" TEXT,
  ADD COLUMN "source" TEXT NOT NULL DEFAULT 'manuel',
  ADD COLUMN "categories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "partnerSince" TEXT,
  ADD COLUMN "directoryStatus" TEXT;
