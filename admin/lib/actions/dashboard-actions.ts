'use server';

import { prisma } from '@/lib/db/prisma';
import { resolveCurrentUser } from '@/lib/auth/current-user';
import { requirePermission } from '@/lib/permissions';

export interface DashboardStats {
  products: { total: number; published: number; draft: number; archived: number };
  categories: { total: number; visible: number };
  media: { total: number };
  banners: { total: number; active: number };
  users: { total: number };
  recentActivity: { id: string; action: string; entityType: string; actorName: string | null; at: string }[];
}

/**
 * Live production statistics for the dashboard — every number is a real
 * COUNT against Neon (no fixtures). Modules that are not yet DB-backed are
 * intentionally omitted rather than faked, so the numbers shown are always
 * true. Extend this as more modules become real.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const user = await resolveCurrentUser();
  requirePermission(user, 'dashboard.view');

  const [
    productsTotal,
    productsPublished,
    productsDraft,
    productsArchived,
    categoriesTotal,
    categoriesVisible,
    mediaTotal,
    bannersTotal,
    bannersActive,
    usersTotal,
    activity,
  ] = await Promise.all([
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { deletedAt: null, status: 'PUBLISHED' } }),
    prisma.product.count({ where: { deletedAt: null, status: { in: ['DRAFT', 'IN_REVIEW', 'SCHEDULED', 'UNPUBLISHED'] } } }),
    prisma.product.count({ where: { deletedAt: null, status: 'ARCHIVED' } }),
    prisma.productCategory.count({ where: { deletedAt: null } }),
    prisma.productCategory.count({ where: { deletedAt: null, isVisible: true } }),
    prisma.mediaAsset.count({ where: { deletedAt: null } }),
    prisma.banner.count({ where: { deletedAt: null } }),
    prisma.banner.count({ where: { deletedAt: null, status: 'PUBLISHED' } }),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { actor: { select: { name: true } } },
    }),
  ]);

  return {
    products: { total: productsTotal, published: productsPublished, draft: productsDraft, archived: productsArchived },
    categories: { total: categoriesTotal, visible: categoriesVisible },
    media: { total: mediaTotal },
    banners: { total: bannersTotal, active: bannersActive },
    users: { total: usersTotal },
    recentActivity: activity.map((a) => ({
      id: a.id,
      action: a.action,
      entityType: a.entityType,
      actorName: a.actor?.name ?? null,
      at: a.createdAt.toISOString(),
    })),
  };
}
