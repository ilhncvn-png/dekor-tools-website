CREATE TABLE "ExportCountry" (
  "id" TEXT NOT NULL, "country" TEXT NOT NULL, "region" TEXT NOT NULL DEFAULT 'Diğer',
  "dealerCount" INTEGER NOT NULL DEFAULT 0, "exportVolume" TEXT NOT NULL DEFAULT '$0',
  "active" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, "deletedAt" TIMESTAMP(3),
  CONSTRAINT "ExportCountry_pkey" PRIMARY KEY ("id")
);
