-- CreateTable
CREATE TABLE "ProductCollection" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "collectionKey" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductCollection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductCollection_productId_collectionKey_key" ON "ProductCollection"("productId", "collectionKey");
CREATE INDEX "ProductCollection_collectionKey_idx" ON "ProductCollection"("collectionKey");
