CREATE TABLE "Certificate" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "issuer" TEXT NOT NULL DEFAULT '',
  "status" TEXT NOT NULL DEFAULT 'gecerli', "issuedAt" TEXT, "validUntil" TEXT, "scope" TEXT,
  "reminder" TEXT NOT NULL DEFAULT 'yok', "showOnHomepage" BOOLEAN NOT NULL DEFAULT false,
  "showOnProductPages" BOOLEAN NOT NULL DEFAULT false, "fileId" TEXT, "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "downloadEnabled" BOOLEAN NOT NULL DEFAULT true, "category" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "FileDoc" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "category" TEXT, "format" TEXT NOT NULL DEFAULT 'PDF',
  "sizeLabel" TEXT, "url" TEXT, "downloads" INTEGER NOT NULL DEFAULT 0,
  "accessLevel" TEXT NOT NULL DEFAULT 'herkese-acik', "version" TEXT NOT NULL DEFAULT '1.0',
  "language" TEXT NOT NULL DEFAULT 'tr', "linkedTo" TEXT, "uploadedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, "deletedAt" TIMESTAMP(3),
  CONSTRAINT "FileDoc_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Popup" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "type" TEXT NOT NULL DEFAULT 'duyuru',
  "trigger" TEXT NOT NULL DEFAULT 'sayfa-yuklenince', "delaySeconds" INTEGER,
  "pages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[], "active" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Popup_pkey" PRIMARY KEY ("id")
);
