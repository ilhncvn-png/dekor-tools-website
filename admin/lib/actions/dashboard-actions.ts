'use server';

import { prisma } from '@/lib/db/prisma';
import { resolveCurrentUser } from '@/lib/auth/current-user';
import { requirePermission } from '@/lib/permissions';

export interface DashboardStats {
  products: { total: number; published: number; draft: number; archived: number; featured: number; withMedia: number };
  categories: { total: number; visible: number };
  news: { total: number; published: number; draft: number };
  dealers: { total: number; approved: number; pending: number };
  pages: { total: number; published: number; draft: number };
  media: { total: number; totalBytes: number; images: number; videos: number };
  banners: { total: number; active: number };
  users: { total: number; active: number };
  menus: { total: number };
  redirects: { total: number };
  seo: { metadataRows: number };
  revisions: { total: number; last7Days: number };
  scheduled: { pending: number };
  // Aggregate publishing pipeline across every content type.
  publishing: { draft: number; inReview: number; scheduled: number; published: number; unpublished: number; archived: number };
  recentActivity: { id: string; action: string; entityType: string; actorName: string | null; at: string }[];
  websiteHealth: number;
  system: { database: 'operational' | 'degraded'; blob: 'connected' | 'unconfigured'; generatedAt: string };
  currentUser: { name: string; lastLogin: string | null };
}

const NOT_DELETED = { deletedAt: null };

export async function getDashboardStats(): Promise<DashboardStats> {
  const user = await resolveCurrentUser();
  requirePermission(user, 'dashboard.view');

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    productsTotal, productsPublished, productsDraft, productsArchived, productsFeatured, productsWithMedia,
    categoriesTotal, categoriesVisible,
    newsTotal, newsPublished, newsDraft,
    dealersTotal, dealersApproved, dealersPending,
    pagesTotal, pagesPublished, pagesDraft,
    mediaTotal, mediaImages, mediaVideos, mediaBytes,
    bannersTotal, bannersActive,
    usersTotal, usersActive,
    menusTotal, redirectsTotal, seoRows,
    revisionsTotal, revisionsRecent, scheduledPending,
    activity, currentUserRow,
    pipeline,
  ] = await Promise.all([
    prisma.product.count({ where: NOT_DELETED }),
    prisma.product.count({ where: { ...NOT_DELETED, status: 'PUBLISHED' } }),
    prisma.product.count({ where: { ...NOT_DELETED, status: { in: ['DRAFT', 'IN_REVIEW', 'SCHEDULED', 'UNPUBLISHED'] } } }),
    prisma.product.count({ where: { ...NOT_DELETED, status: 'ARCHIVED' } }),
    prisma.product.count({ where: { ...NOT_DELETED, featured: true } }),
    prisma.product.count({ where: { ...NOT_DELETED, media: { some: {} } } }),
    prisma.productCategory.count({ where: NOT_DELETED }),
    prisma.productCategory.count({ where: { ...NOT_DELETED, isVisible: true } }),
    prisma.newsArticle.count({ where: NOT_DELETED }),
    prisma.newsArticle.count({ where: { ...NOT_DELETED, status: 'PUBLISHED' } }),
    prisma.newsArticle.count({ where: { ...NOT_DELETED, status: { in: ['DRAFT', 'IN_REVIEW', 'SCHEDULED'] } } }),
    prisma.dealer.count({ where: NOT_DELETED }),
    prisma.dealer.count({ where: { ...NOT_DELETED, status: 'PUBLISHED' } }),
    prisma.dealer.count({ where: { ...NOT_DELETED, status: { in: ['DRAFT', 'IN_REVIEW'] } } }),
    prisma.page.count({ where: NOT_DELETED }),
    prisma.page.count({ where: { ...NOT_DELETED, status: 'PUBLISHED' } }),
    prisma.page.count({ where: { ...NOT_DELETED, status: { in: ['DRAFT', 'IN_REVIEW', 'SCHEDULED'] } } }),
    prisma.mediaAsset.count({ where: NOT_DELETED }),
    prisma.mediaAsset.count({ where: { ...NOT_DELETED, mimeType: { startsWith: 'image/' } } }),
    prisma.mediaAsset.count({ where: { ...NOT_DELETED, mimeType: { startsWith: 'video/' } } }),
    prisma.mediaAsset.aggregate({ where: NOT_DELETED, _sum: { sizeBytes: true } }),
    prisma.banner.count({ where: NOT_DELETED }),
    prisma.banner.count({ where: { ...NOT_DELETED, status: 'PUBLISHED' } }),
    prisma.user.count({ where: NOT_DELETED }),
    prisma.user.count({ where: { ...NOT_DELETED, status: 'ACTIVE' } }),
    prisma.menu.count(),
    prisma.redirect.count(),
    prisma.seoMetadata.count(),
    prisma.contentRevision.count(),
    prisma.contentRevision.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.scheduledPublication.count({ where: { status: 'PENDING' } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 12, include: { actor: { select: { name: true } } } }),
    user ? prisma.user.findUnique({ where: { id: user.id }, select: { name: true, lastLoginAt: true } }).catch(() => null) : null,
    aggregatePipeline(),
  ]);

  const websiteHealth = computeWebsiteHealth({
    totalContent: productsTotal + newsTotal + pagesTotal + categoriesTotal,
    published: productsPublished + newsPublished + pagesPublished,
    productsTotal,
    productsWithMedia,
    seoRows,
  });

  return {
    products: { total: productsTotal, published: productsPublished, draft: productsDraft, archived: productsArchived, featured: productsFeatured, withMedia: productsWithMedia },
    categories: { total: categoriesTotal, visible: categoriesVisible },
    news: { total: newsTotal, published: newsPublished, draft: newsDraft },
    dealers: { total: dealersTotal, approved: dealersApproved, pending: dealersPending },
    pages: { total: pagesTotal, published: pagesPublished, draft: pagesDraft },
    media: { total: mediaTotal, totalBytes: mediaBytes._sum.sizeBytes ?? 0, images: mediaImages, videos: mediaVideos },
    banners: { total: bannersTotal, active: bannersActive },
    users: { total: usersTotal, active: usersActive },
    menus: { total: menusTotal },
    redirects: { total: redirectsTotal },
    seo: { metadataRows: seoRows },
    revisions: { total: revisionsTotal, last7Days: revisionsRecent },
    scheduled: { pending: scheduledPending },
    publishing: pipeline,
    recentActivity: activity.map((a) => ({
      id: a.id,
      action: a.action,
      entityType: a.entityType ?? '',
      actorName: a.actor?.name ?? null,
      at: a.createdAt.toISOString(),
    })),
    websiteHealth,
    system: {
      database: 'operational',
      blob: process.env.BLOB_READ_WRITE_TOKEN ? 'connected' : 'unconfigured',
      generatedAt: new Date().toISOString(),
    },
    currentUser: {
      name: currentUserRow?.name ?? user?.name ?? 'Yönetici',
      lastLogin: currentUserRow?.lastLoginAt ? currentUserRow.lastLoginAt.toISOString() : null,
    },
  };
}

// Aggregate content status across every publishable content type into one pipeline.
async function aggregatePipeline(): Promise<DashboardStats['publishing']> {
  const models = [
    prisma.product.groupBy({ by: ['status'], where: NOT_DELETED, _count: true }),
    prisma.productCategory.groupBy({ by: ['status'], where: NOT_DELETED, _count: true }),
    prisma.newsArticle.groupBy({ by: ['status'], where: NOT_DELETED, _count: true }),
    prisma.page.groupBy({ by: ['status'], where: NOT_DELETED, _count: true }),
    prisma.banner.groupBy({ by: ['status'], where: NOT_DELETED, _count: true }),
    prisma.dealer.groupBy({ by: ['status'], where: NOT_DELETED, _count: true }),
  ];
  const results = await Promise.all(models);
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

function computeWebsiteHealth(input: {
  totalContent: number;
  published: number;
  productsTotal: number;
  productsWithMedia: number;
  seoRows: number;
}): number {
  // A real, honest composite: how much content is published, how much product
  // media coverage exists, and how much SEO metadata is filled in. When there
  // is no content yet, report 100 (nothing is broken) rather than a fake score.
  if (input.totalContent === 0) return 100;
  const publishedRatio = input.published / Math.max(input.totalContent, 1);
  const mediaCoverage = input.productsTotal > 0 ? input.productsWithMedia / input.productsTotal : 1;
  const seoCoverage = Math.min(input.seoRows / Math.max(input.totalContent, 1), 1);
  return Math.round(((publishedRatio + mediaCoverage + seoCoverage) / 3) * 100);
}
