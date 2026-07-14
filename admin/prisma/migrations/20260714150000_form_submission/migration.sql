-- CreateTable
CREATE TABLE "FormSubmission" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL DEFAULT '',
  "sourceForm" TEXT NOT NULL DEFAULT '',
  "sourcePage" TEXT NOT NULL DEFAULT '',
  "status" TEXT NOT NULL DEFAULT 'yeni',
  "priority" TEXT NOT NULL DEFAULT 'orta',
  "assignedTo" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "FormSubmission_status_idx" ON "FormSubmission"("status");
CREATE INDEX "FormSubmission_type_idx" ON "FormSubmission"("type");
