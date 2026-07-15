/**
 * Product snapshot generator (plain module — NOT 'use server', NOT a component).
 *
 * Reads the CURRENTLY-PUBLISHED products from Neon and projects them into the
 * exact data shapes the static public product templates already consume
 * (`Decor Product Detail.dc.html`'s renderVals arrays + `Decor Category.dc.html`'s
 * product cards). The output is a plain JSON manifest that gets promoted to
 * Vercel Blob and fetched by the static pages at runtime, with the pages'
 * existing hardcoded arrays kept as the fallback.
 *
 * DRAFT SAFETY: only status === 'PUBLISHED' products are ever included, and
 * only published fields are read — a draft edit can never enter the snapshot.
 */
import type { PrismaClient } from '@prisma/client';

export const SNAPSHOT_SCHEMA_VERSION = 1;

export interface SnapshotSpec { code: string; material: string; a: string; b: string; c: string; pack: string; }
export interface SnapshotFeature { num: string; title: string; desc: string; code: string; }
export interface SnapshotApplication { title: string; line: string; imgLabel: string; }
export interface SnapshotGalleryItem { code: string; label: string; caption: string; short: string; }
export interface SnapshotDocument { title: string; fmt: string; size: string; }
export interface SnapshotOverview { label: string; paras: string[]; points: string[]; }
export interface SnapshotCrumb { label: string; href: string; }

export interface SnapshotProduct {
  code: string;
  slug: string;
  name: string;
  eyebrow: string;          // family label shown above the H1 (e.g. "ALÇI / SPATULA ALETLERİ")
  familyLabel: string;      // breadcrumb family
  subLabel: string;         // breadcrumb subcategory (may equal familyLabel)
  breadcrumb: SnapshotCrumb[];
  heroDescription: string;
  materialSummary: string;
  gallery: SnapshotGalleryItem[];
  features: SnapshotFeature[];
  specs: SnapshotSpec[];
  applications: SnapshotApplication[];
  overview: SnapshotOverview[];
  documents: SnapshotDocument[];
  seoTitle: string;
  seoDescription: string;
  canonical: string;
}

export interface SnapshotIndexCard {
  code: string;
  name: string;
  slug: string;
  sub: string;          // subcategory label (Category.dc.html groups by this)
  family: string;
  familyKey: string;
  material: string;
  sizes: string;
  dim: string;
  tag: string;
  link: string;         // unique product route
}

export interface ProductSnapshotManifest {
  schema: number;
  version: string;
  generatedAt: string;
  count: number;
  products: Record<string, SnapshotProduct>;
  index: SnapshotIndexCard[];
}

const LANG = 'tr';

function firstTr<T extends { languageCode: string }>(rows: T[], lang = LANG): T | undefined {
  return rows.find((r) => r.languageCode === lang) ?? rows[0];
}

function slugify(input: string): string {
  const map: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', İ: 'i' };
  return (input || '')
    .trim()
    .replace(/[çğıöşüİ]/g, (c) => map[c] ?? c)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'urun';
}

/** Turkish-aware uppercase so "aletleri" -> "ALETLERİ" (dotted İ), not "ALETLERI". */
function trUpper(input: string): string {
  return (input || '').replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase();
}

/** Clean product route: /urunler/urun/<slug>-<lowercased-code>. Additive; the
 * bare /urunler/urun route is preserved as the static-fallback default. */
export function productRoute(slug: string, code: string): string {
  const s = slug || slugify(code);
  return `/urunler/urun/${s}-${code.toLowerCase()}`;
}

export async function buildProductSnapshot(prisma: PrismaClient): Promise<ProductSnapshotManifest> {
  // Only PUBLISHED, non-deleted products — the whole draft-privacy guarantee
  // lives in this single WHERE clause.
  const products = await prisma.product.findMany({
    where: { deletedAt: null, status: 'PUBLISHED' },
    include: {
      translations: true,
      category: { include: { translations: true, parent: { include: { translations: true } } } },
    },
    orderBy: [{ sortOrder: 'asc' }, { sku: 'asc' }],
  });

  const ids = products.map((p) => p.id);
  const [variants, features, specs, apps, docs] = await Promise.all([
    prisma.productVariant.findMany({ where: { productId: { in: ids } }, orderBy: { sortOrder: 'asc' } }),
    prisma.productFeature.findMany({ where: { productId: { in: ids }, languageCode: LANG }, orderBy: { sortOrder: 'asc' } }),
    prisma.productTechnicalSpecification.findMany({ where: { productId: { in: ids }, languageCode: LANG }, orderBy: { sortOrder: 'asc' } }),
    prisma.productApplicationArea.findMany({ where: { productId: { in: ids }, languageCode: LANG }, orderBy: { sortOrder: 'asc' } }),
    prisma.productDocument.findMany({ where: { productId: { in: ids } }, orderBy: { sortOrder: 'asc' } }),
  ]);

  const by = <T extends { productId: string }>(rows: T[], pid: string) => rows.filter((r) => r.productId === pid);

  const productMap: Record<string, SnapshotProduct> = {};
  const index: SnapshotIndexCard[] = [];

  for (const p of products) {
    const tr = firstTr(p.translations);
    const cat = p.category;
    const catTr = cat ? firstTr(cat.translations) : undefined;
    const parent = cat?.parent;
    const parentTr = parent ? firstTr(parent.translations) : undefined;

    // family = the top-level ancestor; sub = the immediate category if it has a parent.
    const isSubcategory = Boolean(parent);
    const familyLabel = (isSubcategory ? parentTr?.name : catTr?.name) ?? '';
    const familyKey = (isSubcategory ? parent?.key : cat?.key) ?? '';
    const subLabel = isSubcategory ? (catTr?.name ?? '') : '';
    const name = tr?.name ?? p.sku;
    const slug = tr?.slug || slugify(name);

    const pVariants = by(variants, p.id);
    const snapSpecs: SnapshotSpec[] = pVariants.map((v) => {
      const a = (v.attributes ?? {}) as Record<string, string>;
      return {
        code: v.sku,
        material: a.material ?? '',
        a: a.width ?? '',
        b: a.length ?? '',
        c: a.thickness ?? '',
        pack: a.pack ?? '',
      };
    });

    const snapFeatures: SnapshotFeature[] = by(features, p.id).map((f, i) => ({
      num: String(i + 1).padStart(2, '0'),
      title: f.label,
      desc: '',
      code: 'ÖZELLİK',
    }));

    const snapApps: SnapshotApplication[] = by(apps, p.id).map((a) => ({
      title: a.title,
      line: a.description ?? '',
      imgLabel: trUpper(a.eyebrow ?? a.title ?? ''),
    }));

    const snapDocs: SnapshotDocument[] = by(docs, p.id)
      .filter((d) => d.isActive)
      .map((d) => ({ title: d.title, fmt: (d.type ?? 'PDF').toUpperCase(), size: d.fileSizeLabel ?? '' }));

    const pSpecs = by(specs, p.id);
    const overview: SnapshotOverview[] = [];
    const longDesc = tr?.description ?? '';
    if (longDesc) overview.push({ label: 'GENEL BAKIŞ', paras: longDesc.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean), points: [] });
    if (pSpecs.length) overview.push({ label: 'TEKNİK ÖZELLİKLER', paras: [], points: pSpecs.map((s) => `${s.label}: ${s.value}`) });

    const heroDescription = tr?.heroSubtitle || tr?.shortDescription || '';
    const materialSummary = tr?.materialLabel || p.materialSummary || '';

    const route = productRoute(slug, p.sku);
    const canonical = `https://dekor-tools.com${route}`;

    // Neutral, product-specific gallery placeholder until real media is wired —
    // an honest empty state that never leaks another product's imagery.
    const gallery: SnapshotGalleryItem[] = [
      { code: p.sku, label: 'ÜRÜN GÖRSELİ', caption: name, short: 'ÜRÜN\nGÖRSELİ' },
    ];

    productMap[p.sku] = {
      code: p.sku,
      slug,
      name,
      eyebrow: trUpper(tr?.eyebrow || familyLabel || ''),
      familyLabel,
      subLabel: subLabel || familyLabel,
      breadcrumb: [
        { label: 'ANA SAYFA', href: '/' },
        { label: 'ÜRÜNLER', href: '/urunler' },
        { label: trUpper(subLabel || familyLabel || 'ÜRÜNLER'), href: '/urunler/kategori' },
        { label: trUpper(name), href: route },
      ],
      heroDescription,
      materialSummary,
      gallery,
      features: snapFeatures,
      specs: snapSpecs,
      applications: snapApps,
      overview,
      documents: snapDocs,
      seoTitle: tr?.metaTitle || `${name} — Dekor`,
      seoDescription: tr?.metaDescription || heroDescription,
      canonical,
    };

    // Listing card — the shape Category.dc.html's product array uses.
    const defVar = pVariants.find((v) => v.isDefault) ?? pVariants[0];
    const defAttr = (defVar?.attributes ?? {}) as Record<string, string>;
    index.push({
      code: p.sku,
      name,
      slug,
      sub: subLabel || familyLabel,
      family: familyLabel,
      familyKey,
      material: materialSummary || defAttr.material || '',
      sizes: pVariants.map((v) => ((v.attributes ?? {}) as Record<string, string>).width).filter(Boolean).join(' · ') || (defAttr.width ?? ''),
      dim: defAttr.width ?? '',
      tag: trUpper(tr?.badgeText || ''),
      link: route,
    });
  }

  return {
    schema: SNAPSHOT_SCHEMA_VERSION,
    version: `v${Date.now()}`,
    generatedAt: new Date().toISOString(),
    count: products.length,
    products: productMap,
    index,
  };
}
