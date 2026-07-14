'use server';

import { prisma } from '@/lib/db/prisma';
import { resolveCurrentUser } from '@/lib/auth/current-user';
import { requirePermission } from '@/lib/permissions';
import { recordAuditLog, recordActivity } from '@/lib/audit';
import { revalidatePath, revalidateTag } from 'next/cache';
import type { ActionResult } from './category-actions';
import { CAT_WIZARD_LANGUAGES, emptyCatTr, type CatWizardTranslation, type WizardCategory } from '@/lib/wizard/category-wizard-types';

function slugifyTr(input: string): string {
  const map: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', İ: 'i' };
  return input.trim().replace(/[çğıöşüİ]/g, (c) => map[c] ?? c).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'kategori';
}

const DB_TO_UI: Record<string, WizardCategory['status']> = { PUBLISHED: 'yayinda', DRAFT: 'taslak', IN_REVIEW: 'inceleme', UNPUBLISHED: 'taslak', ARCHIVED: 'arsiv', SCHEDULED: 'taslak' };
const UI_TO_DB: Record<WizardCategory['status'], 'PUBLISHED' | 'DRAFT' | 'IN_REVIEW' | 'ARCHIVED'> = { yayinda: 'PUBLISHED', taslak: 'DRAFT', inceleme: 'IN_REVIEW', arsiv: 'ARCHIVED' };

export async function getCategoryWizard(id: string): Promise<WizardCategory> {
  const user = await resolveCurrentUser();
  requirePermission(user, 'categories.manage');
  const emptyTranslations: Record<string, CatWizardTranslation> = Object.fromEntries(CAT_WIZARD_LANGUAGES.map((l) => [l, emptyCatTr()]));
  if (id === 'new') {
    return { id: null, code: '', parentId: null, status: 'taslak', isVisible: true, showInNavigation: true, showOnHomepage: false, icon: '', sortOrder: 0, translations: emptyTranslations, stats: [], filters: [] };
  }

  const [c, stats, groups] = await Promise.all([
    prisma.productCategory.findUnique({ where: { id }, include: { translations: true } }),
    prisma.categoryStat.findMany({ where: { categoryId: id }, orderBy: { sortOrder: 'asc' } }),
    prisma.categoryFilterGroup.findMany({ where: { categoryId: id }, orderBy: { sortOrder: 'asc' } }),
  ]);
  if (!c) throw new Error('Kategori bulunamadı');
  const options = groups.length ? await prisma.categoryFilterOption.findMany({ where: { filterGroupId: { in: groups.map((g) => g.id) } }, orderBy: { sortOrder: 'asc' } }) : [];

  const translations = { ...emptyTranslations };
  for (const t of c.translations) {
    translations[t.languageCode] = {
      name: t.name ?? '', slug: t.slug ?? '', shortDescription: t.cardDescription ?? '', longDescription: t.description ?? '',
      heroTitle: t.heroTitle ?? '', heroDescription: t.heroDescription ?? '', metaTitle: t.metaTitle ?? '', metaDescription: t.metaDescription ?? '',
    };
  }
  return {
    id: c.id, code: c.code ?? '', parentId: c.parentId, status: DB_TO_UI[c.status] ?? 'taslak',
    isVisible: c.isVisible, showInNavigation: c.showInNavigation, showOnHomepage: c.showOnHomepage, icon: c.icon ?? '', sortOrder: c.sortOrder,
    translations,
    stats: stats.map((s, i) => ({ value: s.value, label: s.label, sortOrder: s.sortOrder || i })),
    filters: groups.map((g, i) => ({ key: g.key, label: g.label, type: g.type, active: g.active, sortOrder: g.sortOrder || i, options: options.filter((o) => o.filterGroupId === g.id).map((o, j) => ({ value: o.value, label: o.label, sortOrder: o.sortOrder || j })) })),
  };
}

export async function saveCategoryWizard(w: WizardCategory): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, 'categories.manage');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }
  const tr = w.translations.tr;
  if (!tr?.name.trim()) return { success: false, error: 'Türkçe kategori adı zorunludur.' };
  const trSlug = tr.slug.trim() || slugifyTr(tr.name);
  const key = w.id ? undefined : `wz-${slugifyTr(tr.name)}-${Date.now().toString(36)}`;

  // Slug collision (TR), excluding self
  const dup = await prisma.productCategoryTranslation.findFirst({ where: { languageCode: 'tr', slug: trSlug, categoryId: w.id ? { not: w.id } : undefined } });
  if (dup) return { success: false, error: `"${trSlug}" slug'ı zaten kullanılıyor.` };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = w.id ? await tx.productCategory.findUnique({ where: { id: w.id } }) : null;
      const core = {
        parentId: w.parentId ?? null, code: w.code || null, sortOrder: w.sortOrder, isVisible: w.isVisible,
        showInNavigation: w.showInNavigation, showOnHomepage: w.showOnHomepage, icon: w.icon || null,
        status: UI_TO_DB[w.status], publishedAt: w.status === 'yayinda' ? (existing?.publishedAt ?? new Date()) : existing?.publishedAt ?? null,
      };
      const cat = w.id
        ? await tx.productCategory.update({ where: { id: w.id }, data: core })
        : await tx.productCategory.create({ data: { key: key!, slug: trSlug, ...core } });

      for (const lang of CAT_WIZARD_LANGUAGES) {
        const t = w.translations[lang];
        if (!t || (!t.name.trim() && lang !== 'tr')) continue;
        const slug = t.slug.trim() || (lang === 'tr' ? trSlug : `${slugifyTr(t.name || tr.name)}-${lang}`);
        const data = {
          name: t.name || tr.name, slug, description: t.longDescription || null, cardDescription: t.shortDescription || null,
          heroTitle: t.heroTitle || null, heroDescription: t.heroDescription || null,
          metaTitle: t.metaTitle || null, metaDescription: t.metaDescription || null,
        };
        await tx.productCategoryTranslation.upsert({
          where: { categoryId_languageCode: { categoryId: cat.id, languageCode: lang } },
          update: data, create: { categoryId: cat.id, languageCode: lang, ...data },
        });
      }

      // Replace stats + filters in place.
      await tx.categoryStat.deleteMany({ where: { categoryId: cat.id } });
      if (w.stats.length) await tx.categoryStat.createMany({ data: w.stats.filter((s) => s.value.trim() || s.label.trim()).map((s, i) => ({ categoryId: cat.id, value: s.value, label: s.label, sortOrder: i })) });

      const oldGroups = await tx.categoryFilterGroup.findMany({ where: { categoryId: cat.id }, select: { id: true } });
      if (oldGroups.length) await tx.categoryFilterOption.deleteMany({ where: { filterGroupId: { in: oldGroups.map((g) => g.id) } } });
      await tx.categoryFilterGroup.deleteMany({ where: { categoryId: cat.id } });
      for (let i = 0; i < w.filters.length; i++) {
        const f = w.filters[i];
        if (!f.label.trim()) continue;
        const g = await tx.categoryFilterGroup.create({ data: { categoryId: cat.id, key: f.key || slugifyTr(f.label), label: f.label, type: f.type, active: f.active, sortOrder: i } });
        if (f.options.length) await tx.categoryFilterOption.createMany({ data: f.options.filter((o) => o.label.trim()).map((o, j) => ({ filterGroupId: g.id, value: o.value || o.label, label: o.label, sortOrder: j })) });
      }

      await tx.contentRevision.create({ data: { entityType: 'product_category', entityId: cat.id, action: w.id ? 'UPDATE' : 'CREATE', authorId: user!.id, note: 'wizard' } });
      return cat;
    });

    await recordAuditLog({ actorId: user!.id, action: w.id ? 'category.update' : 'category.create', entityType: 'product_category', entityId: result.id, newData: { name: tr.name } });
    await recordActivity({ actorId: user!.id, actorName: user!.name, summary: `${user!.name} "${tr.name}" kategorisini ${w.id ? 'düzenledi' : 'oluşturdu'}.`, entityType: 'product_category', entityId: result.id });
    revalidatePath('/kategori-yonetimi');
    revalidateTag('categories');
    return { success: true, data: { id: result.id } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Kaydetme başarısız oldu.' };
  }
}
