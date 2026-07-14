'use server';

import { prisma } from '@/lib/db/prisma';
import { resolveCurrentUser } from '@/lib/auth/current-user';
import { requirePermission } from '@/lib/permissions';

// The canonical public routes (Turkish default locale). Real analysis fetches
// each of these from the live public site and inspects the returned HTML.
const PUBLIC_ROUTES = [
  '/', '/urunler', '/urunler/kategori', '/urunler/urun', '/hakkimizda', '/hikayemiz',
  '/vizyon-misyon', '/kalite-surdurulebilirlik', '/ar-ge-merkezi', '/uretim', '/ihracat',
  '/satis', '/satis/bayi-profili', '/bayi-ol', '/bayi-kaynaklari', '/b2b-portal',
  '/haberler', '/haberler/detay', '/kariyer', '/iletisim', '/destek', '/online-odeme',
  '/fikrim-var', '/sikayet-bildir', '/site-haritasi', '/cerez-politikasi',
  '/gizlilik-politikasi', '/kullanim-kosullari',
];

const NAMES: Record<string, string> = {
  '/': 'Ana Sayfa', '/urunler': 'Ürünler', '/hakkimizda': 'Hakkımızda', '/uretim': 'Üretim',
  '/ihracat': 'İhracat', '/haberler': 'Haberler', '/kariyer': 'Kariyer', '/iletisim': 'İletişim',
  '/destek': 'Destek', '/bayi-ol': 'Bayi Ol', '/satis': 'Satış',
};

export interface PageHealth {
  path: string;
  name: string;
  status: number;
  ok: boolean;
  bytes: number;
  ms: number;
  hasTitle: boolean;
  hasDescription: boolean;
  hasCanonical: boolean;
  ogTags: number;
  jsonLd: number;
  images: number;
  imagesMissingAlt: number;
  internalLinks: number;
  seoScore: number;
}

export interface WebsiteHealthReport {
  generatedAt: string;
  pagesChecked: number;
  pagesOk: number;
  pagesWithErrors: number;
  avgResponseMs: number;
  totalBytes: number;
  seo: { avgScore: number; missingTitle: number; missingDescription: number; missingCanonical: number; missingJsonLd: number };
  images: { total: number; missingAlt: number };
  links: { checked: number; broken: number; brokenList: { url: string; status: number }[] };
  cmsIntegrity: {
    publishedProductsWithoutMedia: number;
    productsWithoutSeo: number;
    categoriesWithoutTr: number;
    emptyCategories: number;
    orphanRedirects: number;
    totalPublished: number;
  };
  pages: PageHealth[];
  overallScore: number;
}

const PUBLIC_BASE = (process.env.PUBLIC_SITE_URL || 'https://dekor-tools.com').replace(/\/$/, '');

function analyzeHtml(html: string) {
  const title = /<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]?.trim() ?? '';
  const description = /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i.exec(html)?.[1]?.trim() ?? '';
  const canonical = /<link[^>]+rel=["']canonical["']/i.test(html);
  const ogTags = (html.match(/<meta[^>]+property=["']og:/gi) ?? []).length;
  const jsonLd = (html.match(/application\/ld\+json/gi) ?? []).length;
  const images = (html.match(/<img\b/gi) ?? []).length;
  const imagesMissingAlt = (html.match(/<img\b(?![^>]*\balt=)[^>]*>/gi) ?? []).length;
  const links = html.match(/href=["'](\/[^"'#]*)["']/gi) ?? [];
  const internalPaths = Array.from(
    new Set(links.map((l) => /href=["'](\/[^"'#]*)["']/i.exec(l)?.[1]).filter((p): p is string => Boolean(p)))
  );
  const hasTitle = title.length > 0;
  const hasDescription = description.length >= 40;
  let seoScore = 0;
  if (hasTitle) seoScore += 25;
  if (hasDescription) seoScore += 25;
  if (canonical) seoScore += 20;
  if (ogTags >= 4) seoScore += 15;
  if (jsonLd >= 1) seoScore += 15;
  return { hasTitle, hasDescription, hasCanonical: canonical, ogTags, jsonLd, images, imagesMissingAlt, internalPaths, seoScore };
}

async function fetchPage(path: string): Promise<{ page: PageHealth; internalPaths: string[] }> {
  const url = PUBLIC_BASE + path;
  const start = Date.now();
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'DecorCMS-HealthBot' }, redirect: 'follow' });
    const html = await res.text();
    const ms = Date.now() - start;
    const a = analyzeHtml(html);
    return {
      page: {
        path, name: NAMES[path] ?? path, status: res.status, ok: res.ok,
        bytes: html.length, ms,
        hasTitle: a.hasTitle, hasDescription: a.hasDescription, hasCanonical: a.hasCanonical,
        ogTags: a.ogTags, jsonLd: a.jsonLd, images: a.images, imagesMissingAlt: a.imagesMissingAlt,
        internalLinks: a.internalPaths.length, seoScore: a.seoScore,
      },
      internalPaths: a.internalPaths,
    };
  } catch {
    return {
      page: {
        path, name: NAMES[path] ?? path, status: 0, ok: false, bytes: 0, ms: Date.now() - start,
        hasTitle: false, hasDescription: false, hasCanonical: false, ogTags: 0, jsonLd: 0,
        images: 0, imagesMissingAlt: 0, internalLinks: 0, seoScore: 0,
      },
      internalPaths: [],
    };
  }
}

async function checkLinks(paths: string[]): Promise<{ checked: number; broken: number; brokenList: { url: string; status: number }[] }> {
  // Bound the work: unique internal paths, capped, HEAD-checked with limited concurrency.
  const unique = Array.from(new Set(paths)).filter((p) => !p.startsWith('/admin')).slice(0, 40);
  const broken: { url: string; status: number }[] = [];
  const CONCURRENCY = 8;
  for (let i = 0; i < unique.length; i += CONCURRENCY) {
    const batch = unique.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (p) => {
        try {
          const res = await fetch(PUBLIC_BASE + p, { method: 'HEAD', redirect: 'follow' });
          if (res.status >= 400) broken.push({ url: p, status: res.status });
        } catch {
          broken.push({ url: p, status: 0 });
        }
      })
    );
  }
  return { checked: unique.length, broken: broken.length, brokenList: broken.slice(0, 20) };
}

export async function analyzeWebsiteHealth(): Promise<WebsiteHealthReport> {
  const user = await resolveCurrentUser();
  requirePermission(user, 'dashboard.view');

  // Crawl all public pages in parallel.
  const results = await Promise.all(PUBLIC_ROUTES.map(fetchPage));
  const pages = results.map((r) => r.page);
  const allInternal = results.flatMap((r) => r.internalPaths);

  const [linkReport, cmsIntegrity] = await Promise.all([checkLinks(allInternal), computeCmsIntegrity()]);

  const pagesOk = pages.filter((p) => p.ok).length;
  const avgResponseMs = Math.round(pages.reduce((s, p) => s + p.ms, 0) / Math.max(pages.length, 1));
  const totalBytes = pages.reduce((s, p) => s + p.bytes, 0);
  const avgSeo = Math.round(pages.reduce((s, p) => s + p.seoScore, 0) / Math.max(pages.length, 1));
  const images = pages.reduce((s, p) => s + p.images, 0);
  const imagesMissingAlt = pages.reduce((s, p) => s + p.imagesMissingAlt, 0);

  // Composite overall score: reachability, SEO, images, links.
  const reachScore = (pagesOk / Math.max(pages.length, 1)) * 100;
  const imgScore = images > 0 ? ((images - imagesMissingAlt) / images) * 100 : 100;
  const linkScore = linkReport.checked > 0 ? ((linkReport.checked - linkReport.broken) / linkReport.checked) * 100 : 100;
  const overallScore = Math.round(reachScore * 0.35 + avgSeo * 0.3 + imgScore * 0.2 + linkScore * 0.15);

  return {
    generatedAt: new Date().toISOString(),
    pagesChecked: pages.length,
    pagesOk,
    pagesWithErrors: pages.length - pagesOk,
    avgResponseMs,
    totalBytes,
    seo: {
      avgScore: avgSeo,
      missingTitle: pages.filter((p) => !p.hasTitle).length,
      missingDescription: pages.filter((p) => !p.hasDescription).length,
      missingCanonical: pages.filter((p) => !p.hasCanonical).length,
      missingJsonLd: pages.filter((p) => p.jsonLd === 0).length,
    },
    images: { total: images, missingAlt: imagesMissingAlt },
    links: linkReport,
    cmsIntegrity,
    pages,
    overallScore,
  };
}

async function computeCmsIntegrity(): Promise<WebsiteHealthReport['cmsIntegrity']> {
  const [publishedProductsWithoutMedia, productsWithoutSeo, categoriesWithoutTr, emptyCategories, orphanRedirects, totalPublished] =
    await Promise.all([
      prisma.product.count({ where: { deletedAt: null, status: 'PUBLISHED', media: { none: {} } } }),
      prisma.product.count({ where: { deletedAt: null, seo: null } }),
      prisma.productCategory.count({ where: { deletedAt: null, translations: { none: { languageCode: 'tr' } } } }),
      prisma.productCategory.count({ where: { deletedAt: null, products: { none: {} } } }),
      prisma.redirect.count({ where: { toPath: '' } }),
      prisma.product.count({ where: { deletedAt: null, status: 'PUBLISHED' } }),
    ]);
  return { publishedProductsWithoutMedia, productsWithoutSeo, categoriesWithoutTr, emptyCategories, orphanRedirects, totalPublished };
}
