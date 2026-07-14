'use server';

import { prisma } from '@/lib/db/prisma';
import { resolveCurrentUser } from '@/lib/auth/current-user';
import { requirePermission } from '@/lib/permissions';
import { recordAuditLog, recordActivity } from '@/lib/audit';
import { revalidatePath, revalidateTag } from 'next/cache';
import type { ActionResult } from './category-actions';
import { WIZARD_LANGUAGES, type WizardTranslation, type WizardProduct } from '@/lib/wizard/product-wizard-types';

const emptyTr = (): WizardTranslation => ({
  name: '', slug: '', eyebrow: '', heroSubtitle: '', shortDescription: '', description: '',
  materialLabel: '', badgeText: '', metaTitle: '', metaDescription: '', ogTitle: '', ogDescription: '',
});

function slugifyTr(input: string): string {
  const map: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', İ: 'i' };
  return input.trim().replace(/[çğıöşüİ]/g, (c) => map[c] ?? c).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'urun';
}

const DB_TO_UI: Record<string, WizardProduct['status']> = { PUBLISHED: 'yayinda', DRAFT: 'taslak', IN_REVIEW: 'inceleme', UNPUBLISHED: 'taslak', ARCHIVED: 'arsiv', SCHEDULED: 'taslak' };

export async function getProductWizard(id: string): Promise<WizardProduct> {
  const user = await resolveCurrentUser();
  requirePermission(user, 'products.view');

  const emptyTranslations: Record<string, WizardTranslation> = Object.fromEntries(WIZARD_LANGUAGES.map((l) => [l, emptyTr()]));
  if (id === 'new') {
    return { id: null, sku: '', categoryId: null, status: 'taslak', featured: false, flags: [], materialSummary: '', sortOrder: 0, translations: emptyTranslations, variants: [], features: [], specs: [], applications: [], gallery: [], documents: [], videos: [], drawing: null, relatedProductIds: [] };
  }

  const [p, variants, features, specs, apps, docs, vids, draw, gallery] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { translations: true } }),
    prisma.productVariant.findMany({ where: { productId: id }, orderBy: { sortOrder: 'asc' } }),
    prisma.productFeature.findMany({ where: { productId: id, languageCode: 'tr' }, orderBy: { sortOrder: 'asc' } }),
    prisma.productTechnicalSpecification.findMany({ where: { productId: id, languageCode: 'tr' }, orderBy: { sortOrder: 'asc' } }),
    prisma.productApplicationArea.findMany({ where: { productId: id, languageCode: 'tr' }, orderBy: { sortOrder: 'asc' } }),
    prisma.productDocument.findMany({ where: { productId: id }, orderBy: { sortOrder: 'asc' } }),
    prisma.productVideo.findMany({ where: { productId: id }, orderBy: { sortOrder: 'asc' } }),
    prisma.productTechnicalDrawing.findFirst({ where: { productId: id }, orderBy: { sortOrder: 'asc' } }),
    prisma.productMedia.findMany({ where: { productId: id }, orderBy: { sortOrder: 'asc' } }),
  ]);
  if (!p) throw new Error('Ürün bulunamadı');

  const translations = { ...emptyTranslations };
  for (const t of p.translations) {
    translations[t.languageCode] = {
      name: t.name ?? '', slug: t.slug ?? '', eyebrow: t.eyebrow ?? '', heroSubtitle: t.heroSubtitle ?? '',
      shortDescription: t.shortDescription ?? '', description: t.description ?? '', materialLabel: t.materialLabel ?? '',
      badgeText: t.badgeText ?? '', metaTitle: t.metaTitle ?? '', metaDescription: t.metaDescription ?? '',
      ogTitle: t.ogTitle ?? '', ogDescription: t.ogDescription ?? '',
    };
  }

  return {
    id: p.id, sku: p.sku, categoryId: p.categoryId, status: DB_TO_UI[p.status] ?? 'taslak',
    featured: p.featured, flags: p.flags, materialSummary: p.materialSummary ?? '', sortOrder: p.sortOrder,
    translations,
    variants: variants.map((v, i) => {
      const a = (v.attributes ?? {}) as Record<string, string>;
      return { sku: v.sku, material: a.material ?? '', width: a.width ?? '', length: a.length ?? '', thickness: a.thickness ?? '', pack: a.pack ?? '', isDefault: v.isDefault, sortOrder: v.sortOrder || i };
    }),
    features: features.map((f, i) => ({ label: f.label, sortOrder: f.sortOrder || i })),
    specs: specs.map((s, i) => ({ label: s.label, value: s.value, sortOrder: s.sortOrder || i })),
    applications: apps.map((a, i) => ({ title: a.title, description: a.description ?? '', eyebrow: a.eyebrow ?? '', iconMediaId: a.iconMediaId, mediaId: a.mediaId, sortOrder: a.sortOrder || i })),
    gallery: gallery.map((g, i) => ({ mediaId: g.mediaId, itemType: g.itemType ?? 'CUSTOM', altText: g.altText ?? '', caption: g.caption ?? '', sortOrder: g.sortOrder || i })),
    documents: docs.map((d, i) => ({ mediaId: d.mediaId, type: d.type, title: d.title, fileSizeLabel: d.fileSizeLabel ?? '', isActive: d.isActive, sortOrder: d.sortOrder || i })),
    videos: vids.map((v, i) => ({ provider: v.provider, url: v.url ?? '', blobMediaId: v.blobMediaId, posterMediaId: v.posterMediaId, durationLabel: v.durationLabel ?? '', title: v.title ?? '', description: v.description ?? '', isPrimary: v.isPrimary, sortOrder: v.sortOrder || i })),
    drawing: draw ? { mediaId: draw.mediaId, title: draw.title ?? '', drawingCode: draw.drawingCode ?? '', revisionCode: draw.revisionCode ?? '', widthLabel: draw.widthLabel ?? '', heightLabel: draw.heightLabel ?? '', notes: draw.notes ?? '' } : null,
    relatedProductIds: p.relatedProductIds,
  };
}

const UI_TO_DB: Record<WizardProduct['status'], 'PUBLISHED' | 'DRAFT' | 'IN_REVIEW' | 'ARCHIVED'> = { yayinda: 'PUBLISHED', taslak: 'DRAFT', inceleme: 'IN_REVIEW', arsiv: 'ARCHIVED' };

/** Persist the whole wizard state. Draft-safe: never publishes unless status is 'yayinda'. */
export async function saveProductWizard(w: WizardProduct): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, w.id ? 'products.update' : 'products.create');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }
  if (!w.sku.trim()) return { success: false, error: 'Ürün kodu (SKU) zorunludur.' };
  const tr = w.translations.tr;
  if (!tr?.name.trim()) return { success: false, error: 'Türkçe ürün adı zorunludur.' };
  const trSlug = tr.slug.trim() || slugifyTr(tr.name);

  // SKU uniqueness (excluding self)
  const skuOwner = await prisma.product.findFirst({ where: { sku: w.sku, id: w.id ? { not: w.id } : undefined } });
  if (skuOwner) return { success: false, error: `"${w.sku}" ürün kodu zaten kullanılıyor.` };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = w.id ? await tx.product.findUnique({ where: { id: w.id } }) : null;
      const core = {
        sku: w.sku, categoryId: w.categoryId ?? null, featured: w.featured, flags: w.flags,
        materialSummary: w.materialSummary || null, sortOrder: w.sortOrder, status: UI_TO_DB[w.status],
        publishedAt: w.status === 'yayinda' ? (existing?.publishedAt ?? new Date()) : existing?.publishedAt ?? null,
      };
      const product = w.id
        ? await tx.product.update({ where: { id: w.id }, data: { ...core, editorId: user!.id } })
        : await tx.product.create({ data: { ...core, slug: trSlug, authorId: user!.id } });

      // Translations (only languages that have a name)
      for (const lang of WIZARD_LANGUAGES) {
        const t = w.translations[lang];
        if (!t || (!t.name.trim() && lang !== 'tr')) continue;
        const slug = t.slug.trim() || (lang === 'tr' ? trSlug : `${slugifyTr(t.name || tr.name)}-${lang}`);
        const data = {
          name: t.name || tr.name, slug, eyebrow: t.eyebrow || null, heroSubtitle: t.heroSubtitle || null,
          shortDescription: t.shortDescription || null, description: t.description || null,
          materialLabel: t.materialLabel || null, badgeText: t.badgeText || null,
          metaTitle: t.metaTitle || null, metaDescription: t.metaDescription || null,
          ogTitle: t.ogTitle || null, ogDescription: t.ogDescription || null,
        };
        await tx.productTranslation.upsert({
          where: { productId_languageCode: { productId: product.id, languageCode: lang } },
          update: data, create: { productId: product.id, languageCode: lang, ...data },
        });
      }
      await tx.product.update({ where: { id: product.id }, data: { relatedProductIds: w.relatedProductIds } });

      // Replace child collections in place (idempotent).
      await tx.productVariant.deleteMany({ where: { productId: product.id } });
      for (let i = 0; i < w.variants.length; i++) {
        const v = w.variants[i];
        if (!v.sku.trim()) continue;
        await tx.productVariant.create({ data: { productId: product.id, sku: v.sku, isDefault: v.isDefault, sortOrder: i, attributes: { material: v.material, width: v.width, length: v.length, thickness: v.thickness, pack: v.pack } } });
      }
      await tx.productFeature.deleteMany({ where: { productId: product.id } });
      if (w.features.length) await tx.productFeature.createMany({ data: w.features.filter((f) => f.label.trim()).map((f, i) => ({ productId: product.id, languageCode: 'tr', label: f.label, sortOrder: i })) });

      await tx.productTechnicalSpecification.deleteMany({ where: { productId: product.id } });
      if (w.specs.length) await tx.productTechnicalSpecification.createMany({ data: w.specs.filter((s) => s.label.trim()).map((s, i) => ({ productId: product.id, languageCode: 'tr', label: s.label, value: s.value, sortOrder: i })) });

      await tx.productApplicationArea.deleteMany({ where: { productId: product.id } });
      if (w.applications.length) await tx.productApplicationArea.createMany({ data: w.applications.filter((a) => a.title.trim()).map((a, i) => ({ productId: product.id, languageCode: 'tr', slotIndex: i, title: a.title, description: a.description || null, eyebrow: a.eyebrow || null, iconMediaId: a.iconMediaId, mediaId: a.mediaId, sortOrder: i })) });

      await tx.productMedia.deleteMany({ where: { productId: product.id } });
      for (let i = 0; i < w.gallery.length; i++) {
        const g = w.gallery[i];
        if (!g.mediaId) continue;
        await tx.productMedia.create({ data: { productId: product.id, mediaId: g.mediaId, role: i === 0 ? 'primary' : 'gallery', sortOrder: i, itemType: g.itemType, altText: g.altText || null, caption: g.caption || null } });
      }

      await tx.productDocument.deleteMany({ where: { productId: product.id } });
      if (w.documents.length) await tx.productDocument.createMany({ data: w.documents.filter((d) => d.title.trim()).map((d, i) => ({ productId: product.id, mediaId: d.mediaId, type: d.type, title: d.title, fileSizeLabel: d.fileSizeLabel || null, isActive: d.isActive, sortOrder: i })) });

      await tx.productVideo.deleteMany({ where: { productId: product.id } });
      if (w.videos.length) await tx.productVideo.createMany({ data: w.videos.filter((v) => v.url || v.blobMediaId).map((v, i) => ({ productId: product.id, provider: v.provider, url: v.url || null, blobMediaId: v.blobMediaId, posterMediaId: v.posterMediaId, durationLabel: v.durationLabel || null, title: v.title || null, description: v.description || null, isPrimary: v.isPrimary, sortOrder: i })) });

      await tx.productTechnicalDrawing.deleteMany({ where: { productId: product.id } });
      if (w.drawing && (w.drawing.mediaId || w.drawing.drawingCode || w.drawing.title)) {
        const d = w.drawing;
        await tx.productTechnicalDrawing.create({ data: { productId: product.id, mediaId: d.mediaId, title: d.title || null, drawingCode: d.drawingCode || null, revisionCode: d.revisionCode || null, widthLabel: d.widthLabel || null, heightLabel: d.heightLabel || null, notes: d.notes || null } });
      }

      await tx.contentRevision.create({ data: { entityType: 'product', entityId: product.id, action: w.id ? 'UPDATE' : 'CREATE', authorId: user!.id, note: 'wizard' } });
      return product;
    });

    await recordAuditLog({ actorId: user!.id, action: w.id ? 'product.update' : 'product.create', entityType: 'product', entityId: result.id, newData: { sku: w.sku } });
    await recordActivity({ actorId: user!.id, actorName: user!.name, summary: `${user!.name} "${tr.name}" ürününü ${w.id ? 'düzenledi' : 'oluşturdu'}.`, entityType: 'product', entityId: result.id });
    revalidatePath('/urun-yonetimi');
    revalidateTag('products');
    return { success: true, data: { id: result.id } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Kaydetme başarısız oldu.' };
  }
}
