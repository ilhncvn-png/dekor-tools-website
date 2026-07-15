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
export interface SnapshotApplication { title: string; line: string; imgLabel: string; imgUrl: string }
export interface SnapshotGalleryItem { code: string; label: string; caption: string; short: string; url: string; thumbUrl: string }
export interface SnapshotDocument { title: string; fmt: string; size: string; url: string }
export interface SnapshotOverview { label: string; paras: string[]; points: string[]; }
export interface SnapshotCrumb { label: string; href: string; }
export interface SnapshotVideo { provider: string; url: string; embedUrl: string; title: string; description: string; durationLabel: string }
export interface SnapshotDrawing { title: string; drawingCode: string; revisionCode: string; widthLabel: string; heightLabel: string; notes: string; url: string }

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
  applicationGallery: SnapshotGalleryItem[];
  features: SnapshotFeature[];
  specs: SnapshotSpec[];
  applications: SnapshotApplication[];
  overview: SnapshotOverview[];
  documents: SnapshotDocument[];
  video: SnapshotVideo | null;
  drawing: SnapshotDrawing | null;
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
  img: string;          // primary product photo URL ('' = placeholder)
}

export interface SnapshotCategory {
  key: string;
  name: string;
  slug: string;
  eyebrow: string;
  description: string;
  subs: string[];       // real published subcategory labels (empty = no public subcategory filters)
  productCount: number;
  productCodes: string[]; // ordered product codes for this listing (primary + collection members)
}

export interface ProductSnapshotManifest {
  schema: number;
  version: string;
  generatedAt: string;
  count: number;
  products: Record<string, SnapshotProduct>;
  index: SnapshotIndexCard[];
  categories: Record<string, SnapshotCategory>;
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
  const [variants, features, specs, apps, docs, media, videos, drawings] = await Promise.all([
    prisma.productVariant.findMany({ where: { productId: { in: ids } }, orderBy: { sortOrder: 'asc' } }),
    prisma.productFeature.findMany({ where: { productId: { in: ids }, languageCode: LANG }, orderBy: { sortOrder: 'asc' } }),
    prisma.productTechnicalSpecification.findMany({ where: { productId: { in: ids }, languageCode: LANG }, orderBy: { sortOrder: 'asc' } }),
    prisma.productApplicationArea.findMany({ where: { productId: { in: ids }, languageCode: LANG }, orderBy: { sortOrder: 'asc' } }),
    prisma.productDocument.findMany({ where: { productId: { in: ids } }, orderBy: { sortOrder: 'asc' } }),
    prisma.productMedia.findMany({ where: { productId: { in: ids } }, orderBy: { sortOrder: 'asc' } }),
    prisma.productVideo.findMany({ where: { productId: { in: ids } }, orderBy: { sortOrder: 'asc' } }),
    prisma.productTechnicalDrawing.findMany({ where: { productId: { in: ids } }, orderBy: { sortOrder: 'asc' } }),
  ]);

  // Collection memberships: a canonical product shown in an additional listing
  // (Yeni Ürünler / DKR) beyond its primary category, with a per-collection order.
  const collections = await prisma.productCollection.findMany({ where: { productId: { in: ids } }, orderBy: { sortOrder: 'asc' } });
  const idToSku = new Map(products.map((p) => [p.id, p.sku]));
  // familyKey -> [{ code, order }] accumulated during the primary loop.
  const famPrimary: Record<string, { code: string; order: number }[]> = {};

  // Resolve every referenced MediaAsset id -> public URL once.
  const mediaAssetIds = Array.from(new Set([
    ...media.map((m) => m.mediaId),
    ...apps.map((a) => a.mediaId).filter((x): x is string => Boolean(x)),
    ...docs.map((d) => d.mediaId).filter((x): x is string => Boolean(x)),
    ...drawings.map((d) => d.mediaId).filter((x): x is string => Boolean(x)),
  ]));
  const assets = mediaAssetIds.length
    ? await prisma.mediaAsset.findMany({ where: { id: { in: mediaAssetIds }, deletedAt: null }, select: { id: true, url: true, fileName: true } })
    : [];
  const urlOf = (id: string | null | undefined): string => (id ? assets.find((a) => a.id === id)?.url ?? '' : '');

  const by = <T extends { productId: string }>(rows: T[], pid: string) => rows.filter((r) => r.productId === pid);

  const productMap: Record<string, SnapshotProduct> = {};
  const index: SnapshotIndexCard[] = [];
  const categoryMap: Record<string, SnapshotCategory> = {};

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

    // Accumulate per-family metadata for the public category listing (title,
    // description, count, and the real subcategory filters — empty when the
    // family's products sit directly under it, which removes stale filters).
    if (familyKey) {
      const famCat = isSubcategory ? parent : cat;
      const famTr = isSubcategory ? parentTr : catTr;
      if (!categoryMap[familyKey]) {
        categoryMap[familyKey] = {
          key: familyKey,
          name: familyLabel,
          slug: famCat?.slug ?? slugify(familyLabel),
          eyebrow: trUpper(famTr?.name ?? familyLabel),
          description: famTr?.description ?? famTr?.cardDescription ?? '',
          subs: [],
          productCount: 0,
          productCodes: [],
        };
      }
      (famPrimary[familyKey] ??= []).push({ code: p.sku, order: p.sortOrder });
      if (subLabel && !categoryMap[familyKey].subs.includes(subLabel)) categoryMap[familyKey].subs.push(subLabel);
    }
    const slug = tr?.slug || slugify(name);

    const pVariants = by(variants, p.id);
    const snapSpecs: SnapshotSpec[] = pVariants.map((v) => {
      const a = (v.attributes ?? {}) as Record<string, string>;
      return {
        code: a.code ?? v.sku, // display code (attributes.code) decouples from the globally-unique sku
        material: a.material ?? '',
        a: a.width ?? '',
        b: a.length ?? '',
        c: a.thickness ?? '',
        pack: a.pack ?? '',
      };
    });

    const snapFeatures: SnapshotFeature[] = by(features, p.id).map((f, i) => {
      const [head, ...restParts] = f.label.split(' — ');
      return {
        num: String(i + 1).padStart(2, '0'),
        title: restParts.length ? head : f.label,
        desc: restParts.length ? restParts.join(' — ') : '',
        code: 'ÖZELLİK',
      };
    });

    const snapApps: SnapshotApplication[] = by(apps, p.id).map((a) => ({
      title: a.title,
      line: a.description ?? '',
      imgLabel: trUpper(a.eyebrow ?? a.title ?? ''),
      imgUrl: urlOf(a.mediaId),
    }));

    const snapDocs: SnapshotDocument[] = by(docs, p.id)
      .filter((d) => d.isActive)
      .map((d) => ({ title: d.title, fmt: (d.type ?? 'PDF').toUpperCase(), size: d.fileSizeLabel ?? '', url: urlOf(d.mediaId) }));

    // Real gallery from ProductMedia: product photos (non-APPLICATION) drive the
    // main gallery; APPLICATION items drive the "Her detayı yakından" section.
    const pMedia = by(media, p.id);
    const mediaToItem = (m: (typeof media)[number]): SnapshotGalleryItem => {
      const url = urlOf(m.mediaId);
      return { code: p.sku, label: (m.itemType ?? 'GÖRSEL').replace(/_/g, ' '), caption: m.caption ?? name, short: (m.itemType ?? 'GÖRSEL').replace(/_/g, '\n'), url, thumbUrl: url };
    };
    const productPhotos = pMedia.filter((m) => (m.itemType ?? '') !== 'APPLICATION').map(mediaToItem).filter((g) => g.url);
    const applicationGallery = pMedia.filter((m) => (m.itemType ?? '') === 'APPLICATION').map(mediaToItem).filter((g) => g.url);

    const pVideo = by(videos, p.id)[0];
    const ytId = pVideo?.url ? (pVideo.url.match(/[?&]v=([^&]+)/)?.[1] ?? pVideo.url.match(/youtu\.be\/([^?]+)/)?.[1] ?? '') : '';
    const snapVideo: SnapshotVideo | null = pVideo ? {
      provider: pVideo.provider ?? 'youtube',
      url: pVideo.url ?? '',
      embedUrl: ytId ? `https://www.youtube.com/embed/${ytId}` : (pVideo.url ?? ''),
      title: pVideo.title ?? '',
      description: pVideo.description ?? '',
      durationLabel: pVideo.durationLabel ?? '',
    } : null;

    const pDraw = by(drawings, p.id)[0];
    const snapDrawing: SnapshotDrawing | null = pDraw ? {
      title: pDraw.title ?? '', drawingCode: pDraw.drawingCode ?? '', revisionCode: pDraw.revisionCode ?? '',
      widthLabel: pDraw.widthLabel ?? '', heightLabel: pDraw.heightLabel ?? '', notes: pDraw.notes ?? '', url: urlOf(pDraw.mediaId),
    } : null;

    const pSpecs = by(specs, p.id);
    const overview: SnapshotOverview[] = [];
    const longDesc = tr?.description ?? '';
    if (longDesc) overview.push({ label: 'GENEL BAKIŞ', paras: longDesc.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean), points: [] });
    if (pSpecs.length) overview.push({ label: 'TEKNİK ÖZELLİKLER', paras: [], points: pSpecs.map((s) => `${s.label}: ${s.value}`) });

    const heroDescription = tr?.heroSubtitle || tr?.shortDescription || '';
    const materialSummary = tr?.materialLabel || p.materialSummary || '';

    const route = productRoute(slug, p.sku);
    const canonical = `https://dekor-tools.com${route}`;

    // Real product photos when present; otherwise a neutral, product-specific
    // placeholder (honest empty state that never leaks another product's imagery).
    const gallery: SnapshotGalleryItem[] = productPhotos.length ? productPhotos : [
      { code: p.sku, label: 'ÜRÜN GÖRSELİ', caption: name, short: 'ÜRÜN\nGÖRSELİ', url: '', thumbUrl: '' },
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
      applicationGallery,
      features: snapFeatures,
      specs: snapSpecs,
      applications: snapApps,
      overview,
      documents: snapDocs,
      video: snapVideo,
      drawing: snapDrawing,
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
      img: gallery[0]?.url ?? '',
    });
  }

  // Build each family's ordered listing = primary products + collection members.
  // Collection-only families (e.g. Yeni Ürünler) get created here too.
  const allFamilyKeys = new Set<string>([...Object.keys(famPrimary), ...collections.map((c) => c.collectionKey)]);
  const famCats = allFamilyKeys.size
    ? await prisma.productCategory.findMany({ where: { key: { in: [...allFamilyKeys] }, deletedAt: null }, include: { translations: { where: { languageCode: LANG } } } })
    : [];
  const famCatByKey = new Map(famCats.map((c) => [c.key, c]));
  for (const key of allFamilyKeys) {
    const fc = famCatByKey.get(key);
    const ftr = fc ? firstTr(fc.translations) : undefined;
    if (!categoryMap[key]) {
      categoryMap[key] = { key, name: ftr?.name ?? key, slug: fc?.slug ?? key, eyebrow: trUpper(ftr?.name ?? key), description: ftr?.description ?? ftr?.cardDescription ?? '', subs: [], productCount: 0, productCodes: [] };
    } else if (ftr) {
      categoryMap[key].name = ftr.name; // keep the authoritative (renamed) family name
      categoryMap[key].eyebrow = trUpper(ftr.name);
    }
    // primary products use their product sortOrder; collection members use the
    // collection sortOrder — for a pure collection both are the list position, so
    // a single sort by order yields the correct listing.
    const merged = [
      ...(famPrimary[key] ?? []),
      ...collections.filter((c) => c.collectionKey === key).map((c) => ({ code: idToSku.get(c.productId) ?? '', order: c.sortOrder })),
    ].filter((e) => e.code).sort((a, b) => a.order - b.order);
    const seen = new Set<string>();
    const codes: string[] = [];
    for (const e of merged) { if (!seen.has(e.code)) { seen.add(e.code); codes.push(e.code); } }
    categoryMap[key].productCodes = codes;
    categoryMap[key].productCount = codes.length;
  }

  return {
    schema: SNAPSHOT_SCHEMA_VERSION,
    version: `v${Date.now()}`,
    generatedAt: new Date().toISOString(),
    count: products.length,
    products: productMap,
    index,
    categories: categoryMap,
  };
}
