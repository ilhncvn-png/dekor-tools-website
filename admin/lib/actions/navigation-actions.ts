'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { resolveCurrentUser } from '@/lib/auth/current-user';
import { requirePermission } from '@/lib/permissions';
import { recordAuditLog } from '@/lib/audit';
import type { NavMenuItem } from '@/lib/mock-data';
import { revalidatePath, revalidateTag } from 'next/cache';
import type { ActionResult } from './category-actions';

const MENU_KEY = 'main-nav';

const navItemSchema: z.ZodType<NavMenuItem> = z.lazy(() =>
  z.object({
    id: z.string(),
    label: z.string().max(200),
    href: z.string().max(500),
    icon: z.string().nullable(),
    external: z.boolean(),
    order: z.number().int(),
    visible: z.boolean().optional(),
    children: z.array(navItemSchema).optional(),
  })
);

const menuSchema = z.array(navItemSchema);

type DbItem = {
  id: string;
  parentId: string | null;
  href: string | null;
  icon: string | null;
  isExternal: boolean;
  sortOrder: number;
  isVisible: boolean;
  translations: { languageCode: string; label: string }[];
};

function buildTree(items: DbItem[], parentId: string | null): NavMenuItem[] {
  return items
    .filter((i) => i.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((i) => {
      const label = i.translations.find((t) => t.languageCode === 'tr')?.label ?? i.translations[0]?.label ?? '';
      const children = buildTree(items, i.id);
      const node: NavMenuItem = {
        id: i.id, label, href: i.href ?? '', icon: i.icon, external: i.isExternal,
        order: i.sortOrder, visible: i.isVisible,
      };
      if (children.length) node.children = children;
      return node;
    });
}

export async function getNavigationMenu(): Promise<NavMenuItem[]> {
  const user = await resolveCurrentUser();
  requirePermission(user, 'pages.manage');

  const menu = await prisma.menu.findUnique({
    where: { key: MENU_KEY },
    include: { items: { include: { translations: true } } },
  });
  if (!menu) return [];
  return buildTree(menu.items as DbItem[], null);
}

/** Persist the whole navigation tree (replace-all — simple and correct for a small menu). */
export async function saveNavigationMenu(items: NavMenuItem[]): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, 'pages.manage');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }

  const parsed = menuSchema.safeParse(items);
  if (!parsed.success) return { success: false, error: 'Doğrulama hatası.' };

  try {
    await prisma.$transaction(async (tx) => {
      const menu = await tx.menu.upsert({ where: { key: MENU_KEY }, update: {}, create: { key: MENU_KEY } });
      // Replace-all: drop existing items (translations cascade) then recreate.
      await tx.menuItem.deleteMany({ where: { menuId: menu.id } });

      const insertLevel = async (nodes: NavMenuItem[], parentId: string | null) => {
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          const created = await tx.menuItem.create({
            data: {
              menuId: menu.id, parentId, href: n.href || null, icon: n.icon ?? null,
              isExternal: n.external, sortOrder: i, isVisible: n.visible ?? true,
              translations: { create: [{ languageCode: 'tr', label: n.label }] },
            },
          });
          if (n.children && n.children.length) await insertLevel(n.children, created.id);
        }
      };
      await insertLevel(parsed.data, null);
    });

    await recordAuditLog({ actorId: user!.id, action: 'navigation.update', entityType: 'menu', entityId: MENU_KEY });
    revalidatePath('/navigasyon-yonetimi');
    revalidateTag('navigation');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Kaydetme başarısız oldu.' };
  }
}
