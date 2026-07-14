'use server';

import { prisma } from '@/lib/db/prisma';
import { resolveCurrentUser } from '@/lib/auth/current-user';
import { requirePermission } from '@/lib/permissions';

export interface OperationsData {
  pipeline: { draft: number; inReview: number; scheduled: number; published: number; unpublished: number; archived: number };
  counts: { totalRevisions: number; revisions24h: number; pendingJobs: number; auditEvents: number; auditEvents24h: number };
  revisions: { id: string; entityType: string; entityId: string; action: string; author: string | null; at: string }[];
  jobs: { id: string; entityType: string; entityId: string; scheduledFor: string; status: string; createdAt: string }[];
  audit: { id: string; action: string; entityType: string | null; actor: string | null; ip: string | null; at: string }[];
}

const NOT_DELETED = { deletedAt: null };

export async function getOperationsData(): Promise<OperationsData> {
  const user = await resolveCurrentUser();
  requirePermission(user, 'audit.view');

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [pipeline, totalRevisions, revisions24h, pendingJobs, auditEvents, auditEvents24h, revisions, jobs, audit] =
    await Promise.all([
      aggregatePipeline(),
      prisma.contentRevision.count(),
      prisma.contentRevision.count({ where: { createdAt: { gte: dayAgo } } }),
      prisma.scheduledPublication.count({ where: { status: 'PENDING' } }),
      prisma.auditLog.count(),
      prisma.auditLog.count({ where: { createdAt: { gte: dayAgo } } }),
      prisma.contentRevision.findMany({
        orderBy: { createdAt: 'desc' },
        take: 25,
        include: { author: { select: { name: true } } },
      }),
      prisma.scheduledPublication.findMany({ orderBy: { scheduledFor: 'asc' }, take: 25 }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 30,
        include: { actor: { select: { name: true } } },
      }),
    ]);

  return {
    pipeline,
    counts: { totalRevisions, revisions24h, pendingJobs, auditEvents, auditEvents24h },
    revisions: revisions.map((r) => ({
      id: r.id, entityType: r.entityType, entityId: r.entityId, action: r.action,
      author: r.author?.name ?? null, at: r.createdAt.toISOString(),
    })),
    jobs: jobs.map((j) => ({
      id: j.id, entityType: j.entityType, entityId: j.entityId,
      scheduledFor: j.scheduledFor.toISOString(), status: j.status, createdAt: j.createdAt.toISOString(),
    })),
    audit: audit.map((a) => ({
      id: a.id, action: a.action, entityType: a.entityType,
      actor: a.actor?.name ?? null, ip: a.ipAddress, at: a.createdAt.toISOString(),
    })),
  };
}

async function aggregatePipeline(): Promise<OperationsData['pipeline']> {
  const results = await Promise.all([
    prisma.product.groupBy({ by: ['status'], where: NOT_DELETED, _count: true }),
    prisma.productCategory.groupBy({ by: ['status'], where: NOT_DELETED, _count: true }),
    prisma.newsArticle.groupBy({ by: ['status'], where: NOT_DELETED, _count: true }),
    prisma.page.groupBy({ by: ['status'], where: NOT_DELETED, _count: true }),
    prisma.banner.groupBy({ by: ['status'], where: NOT_DELETED, _count: true }),
    prisma.dealer.groupBy({ by: ['status'], where: NOT_DELETED, _count: true }),
  ]);
  const acc = { draft: 0, inReview: 0, scheduled: 0, published: 0, unpublished: 0, archived: 0 };
  const key: Record<string, keyof typeof acc> = {
    DRAFT: 'draft', IN_REVIEW: 'inReview', SCHEDULED: 'scheduled',
    PUBLISHED: 'published', UNPUBLISHED: 'unpublished', ARCHIVED: 'archived',
  };
  for (const groups of results) {
    for (const g of groups as { status: string; _count: number }[]) {
      const k = key[g.status];
      if (k) acc[k] += typeof g._count === 'number' ? g._count : 0;
    }
  }
  return acc;
}
