import 'server-only';
import { prisma } from '@/lib/db/prisma';

interface AuditEntryInput {
  actorId: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  previousData?: unknown;
  newData?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/** Writes the immutable audit trail entry. Never call .update()/.delete() on AuditLog rows anywhere else. */
export async function recordAuditLog(entry: AuditEntryInput): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorId: entry.actorId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      previousData: entry.previousData === undefined ? undefined : (entry.previousData as object),
      newData: entry.newData === undefined ? undefined : (entry.newData as object),
      ipAddress: entry.ipAddress ?? undefined,
      userAgent: entry.userAgent ?? undefined,
    },
  });
}

interface ActivityEntryInput {
  actorId: string | null;
  actorName: string;
  summary: string;
  entityType?: string;
  entityId?: string;
}

/** Writes the denormalized dashboard feed entry. Call alongside recordAuditLog, not instead of it. */
export async function recordActivity(entry: ActivityEntryInput): Promise<void> {
  await prisma.activityLog.create({
    data: {
      actorId: entry.actorId,
      actorName: entry.actorName,
      summary: entry.summary,
      entityType: entry.entityType,
      entityId: entry.entityId,
    },
  });
}
