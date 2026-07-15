-- CreateTable
CREATE TABLE "ProductSnapshot" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "manifest" JSONB NOT NULL,
    "count" INTEGER NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "isPrevious" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductSnapshot_version_key" ON "ProductSnapshot"("version");
CREATE INDEX "ProductSnapshot_isCurrent_idx" ON "ProductSnapshot"("isCurrent");
CREATE INDEX "ProductSnapshot_isPrevious_idx" ON "ProductSnapshot"("isPrevious");
CREATE INDEX "ProductSnapshot_createdAt_idx" ON "ProductSnapshot"("createdAt");
