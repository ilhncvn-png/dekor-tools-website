import type { PrismaClient } from '@prisma/client';
import { FAMILIES, SUBCATEGORIES, CATEGORY_PRODUCTS, DETAIL_PRODUCT, IMPORT_SOURCE } from './public-catalog-data';

/**
 * Idempotent importer that seeds Neon with the EXISTING public product system
 * (see public-catalog-data.ts). Safe to re-run: every entity is upserted by its
 * stable natural key (ProductCategory.key, Product.sku), and child rows
 * (variants/features/specs/translations) are replaced in place — never
 * duplicated. Nothing here touches the public site; imported rows are stamped
 * importSource = "LIVE_IMPORTED" and get an initial revision snapshot + one
 * import audit record. Status is PUBLISHED to mirror the live public state, but
 * the public site keeps reading its static source until an explicit cutover.
 */

function slugifyTr(input: string): string {
  const map: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', İ: 'i' };
  return (
    input.trim().replace(/[çğıöşüİ]/g, (c) => map[c] ?? c).toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'kayit'
  );
}

export interface ImportSummary {
  families: { created: number; updated: number };
  subcategories: { created: number; updated: number };
  products: { created: number; updated: number };
  variants: number;
  features: number;
  specs: number;
  documentsLogged: number;
  revisions: number;
}

export async function importCatalog(prisma: PrismaClient, authorId: string): Promise<ImportSummary> {
  const s: ImportSummary = {
    families: { created: 0, updated: 0 },
    subcategories: { created: 0, updated: 0 },
    products: { created: 0, updated: 0 },
    variants: 0, features: 0, specs: 0, documentsLogged: 0, revisions: 0,
  };

  const familyIdByCode = new Map<string, string>();
  const subIdByKey = new Map<string, string>();

  // ── 1. Product families → top-level ProductCategory ─────────────────────
  for (let i = 0; i < FAMILIES.length; i++) {
    const f = FAMILIES[i];
    const key = `fam-${f.code.replace('FAM-', '')}`;
    const slug = slugifyTr(f.name);
    const existing = await prisma.productCategory.findUnique({ where: { key } });
    const cat = await prisma.productCategory.upsert({
      where: { key },
      create: {
        key, slug, parentId: null, code: f.code, sortOrder: i + 1, isVisible: true,
        status: 'PUBLISHED', publishedAt: new Date(), showInNavigation: true,
        showOnHomepage: f.showOnHomepage, importSource: IMPORT_SOURCE,
      },
      update: { code: f.code, sortOrder: i + 1, showOnHomepage: f.showOnHomepage, importSource: IMPORT_SOURCE },
    });
    familyIdByCode.set(f.code, cat.id);
    await prisma.productCategoryTranslation.upsert({
      where: { categoryId_languageCode: { categoryId: cat.id, languageCode: 'tr' } },
      create: { categoryId: cat.id, languageCode: 'tr', name: f.name, slug, description: f.description, cardDescription: f.description },
      update: { name: f.name, description: f.description, cardDescription: f.description },
    });
    if (existing) s.families.updated++; else s.families.created++;
    await snapshot(prisma, 'product_category', cat.id, existing ? 'UPDATE' : 'CREATE', authorId, { key, code: f.code, name: f.name });
    s.revisions++;
  }

  // ── 2. Subcategories → child ProductCategory ────────────────────────────
  const subCounters = new Map<string, number>();
  for (const sub of SUBCATEGORIES) {
    const familyId = familyIdByCode.get(sub.familyCode);
    if (!familyId) continue;
    const idx = (subCounters.get(sub.familyCode) ?? 0) + 1;
    subCounters.set(sub.familyCode, idx);
    const key = `${sub.familyCode.toLowerCase().replace('-', '')}-${slugifyTr(sub.name)}`;
    const slug = `${slugifyTr(FAMILIES.find((f) => f.code === sub.familyCode)!.name)}-${slugifyTr(sub.name)}`;
    const code = `${sub.familyCode}-S${String(idx).padStart(2, '0')}`;
    const existing = await prisma.productCategory.findUnique({ where: { key } });
    const cat = await prisma.productCategory.upsert({
      where: { key },
      create: { key, slug, parentId: familyId, code, sortOrder: idx, isVisible: true, status: 'PUBLISHED', publishedAt: new Date(), showInNavigation: true, importSource: IMPORT_SOURCE },
      update: { parentId: familyId, code, sortOrder: idx, importSource: IMPORT_SOURCE },
    });
    subIdByKey.set(`${sub.familyCode}:${sub.name}`, cat.id);
    await prisma.productCategoryTranslation.upsert({
      where: { categoryId_languageCode: { categoryId: cat.id, languageCode: 'tr' } },
      create: { categoryId: cat.id, languageCode: 'tr', name: sub.name, slug },
      update: { name: sub.name },
    });
    if (existing) s.subcategories.updated++; else s.subcategories.created++;
    s.revisions++;
  }

  // ── 3. Category products → Product (+ material/size specs) ───────────────
  for (let i = 0; i < CATEGORY_PRODUCTS.length; i++) {
    const p = CATEGORY_PRODUCTS[i];
    const categoryId = subIdByKey.get(`${p.familyCode}:${p.subName}`) ?? familyIdByCode.get(p.familyCode) ?? null;
    const featured = p.tag === 'ÇOK SATAN' || p.tag === 'PRO';
    await upsertProduct(prisma, s, authorId, {
      sku: p.code, name: p.name, categoryId, featured,
      shortDescription: `${p.material} · ${p.sizes}`,
      sortOrder: i + 1,
      specs: [
        { label: 'Malzeme', value: p.material },
        { label: 'Ölçüler', value: p.sizes },
        { label: 'Boyut', value: p.dim },
      ],
      variants: [], features: [],
    });
  }

  // ── 4. Detailed product (Profesyonel Spatula) with full structure ───────
  const d = DETAIL_PRODUCT;
  await upsertProduct(prisma, s, authorId, {
    sku: d.code, name: d.name, categoryId: familyIdByCode.get(d.familyCode) ?? null, featured: true,
    shortDescription: d.shortDescription, sortOrder: 0,
    specs: [
      { label: 'Malzeme', value: d.materialSummary },
      { label: 'Genişlik Aralığı', value: '60–150 mm' },
      { label: 'Varyant Sayısı', value: String(d.variants.length) },
    ],
    variants: d.variants.map((v, i) => ({
      sku: v.code, isDefault: v.code === d.code, sortOrder: i,
      attributes: { material: v.material, width: v.width, length: v.length, thickness: v.thickness, pack: v.pack },
    })),
    features: d.features.map((f) => ({ label: `${f.title} — ${f.desc}` })),
  });
  s.documentsLogged += d.documents.length;

  // ── 5. Import audit record ──────────────────────────────────────────────
  await prisma.auditLog.create({
    data: {
      actorId: authorId, action: 'catalog.import', entityType: 'catalog', entityId: 'public-import',
      newData: {
        source: IMPORT_SOURCE,
        families: FAMILIES.length, subcategories: SUBCATEGORIES.length,
        products: CATEGORY_PRODUCTS.length + 1, variants: d.variants.length,
      },
    },
  });

  return s;
}

async function upsertProduct(
  prisma: PrismaClient,
  s: ImportSummary,
  authorId: string,
  input: {
    sku: string; name: string; categoryId: string | null; featured: boolean;
    shortDescription: string; sortOrder: number;
    specs: { label: string; value: string }[];
    variants: { sku: string; isDefault: boolean; sortOrder: number; attributes: Record<string, string> }[];
    features: { label: string }[];
  }
) {
  const slug = slugifyTr(input.name);
  const existing = await prisma.product.findFirst({ where: { sku: input.sku } });
  const product = await prisma.product.upsert({
    where: { sku: input.sku },
    create: {
      sku: input.sku, slug, categoryId: input.categoryId, authorId, featured: input.featured,
      status: 'PUBLISHED', publishedAt: new Date(), importSource: IMPORT_SOURCE,
    },
    update: { categoryId: input.categoryId, featured: input.featured, importSource: IMPORT_SOURCE, editorId: authorId },
  });

  await prisma.productTranslation.upsert({
    where: { productId_languageCode: { productId: product.id, languageCode: 'tr' } },
    create: { productId: product.id, languageCode: 'tr', name: input.name, slug, shortDescription: input.shortDescription },
    update: { name: input.name, shortDescription: input.shortDescription },
  });

  // Replace-in-place child rows (idempotent).
  await prisma.productTechnicalSpecification.deleteMany({ where: { productId: product.id } });
  if (input.specs.length) {
    await prisma.productTechnicalSpecification.createMany({
      data: input.specs.map((sp, i) => ({ productId: product.id, languageCode: 'tr', label: sp.label, value: sp.value, sortOrder: i })),
    });
    s.specs += input.specs.length;
  }

  await prisma.productFeature.deleteMany({ where: { productId: product.id } });
  if (input.features.length) {
    await prisma.productFeature.createMany({
      data: input.features.map((f, i) => ({ productId: product.id, languageCode: 'tr', label: f.label, sortOrder: i })),
    });
    s.features += input.features.length;
  }

  await prisma.productVariant.deleteMany({ where: { productId: product.id } });
  for (const v of input.variants) {
    await prisma.productVariant.create({
      data: { productId: product.id, sku: v.sku, isDefault: v.isDefault, sortOrder: v.sortOrder, attributes: v.attributes },
    });
    s.variants++;
  }

  if (existing) s.products.updated++; else s.products.created++;
  await snapshot(prisma, 'product', product.id, existing ? 'UPDATE' : 'CREATE', authorId, { sku: input.sku, name: input.name });
  s.revisions++;
}

async function snapshot(
  prisma: PrismaClient, entityType: string, entityId: string,
  action: 'CREATE' | 'UPDATE', authorId: string, newData: Record<string, unknown>
) {
  await prisma.contentRevision.create({
    data: { entityType, entityId, action, authorId, note: 'LIVE_IMPORTED', newData: JSON.parse(JSON.stringify(newData)) },
  });
}
