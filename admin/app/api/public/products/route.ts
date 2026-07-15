import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentManifest } from '@/lib/publish/snapshot-store';

/**
 * READ-ONLY public product data — the only public window into the CMS.
 *
 * Serves the currently-promoted snapshot (the isCurrent ProductSnapshot row).
 * The snapshot is built from status=PUBLISHED products only, so drafts can
 * never surface here. There is no write path and no auth: this is intentionally
 * public, like a headless-CMS content API, and is exempted in middleware.ts.
 *
 *   GET /admin/api/public/products            -> full manifest { version, products, index, ... }
 *   GET /admin/api/public/products?code=DKR-3017 -> { product } for one code, 404 if unknown
 *
 * Returns 404 (never another product's data) when a requested code is missing,
 * and 204-style empty manifest before the first publish.
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  // Short CDN cache; publish/rollback flips the pointer and the next read is fresh.
  'Cache-Control': 'public, max-age=30, s-maxage=30, stale-while-revalidate=60',
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get('code')?.trim().toUpperCase();
  // slug = the unique route's last segment, e.g. "profesyonel-ispatula-legacy-boyaci-001".
  // Product codes can contain hyphens, so slug resolution (not code-regex) is the
  // robust way for the static detail page to identify any product.
  const slug = params.get('slug')?.trim().toLowerCase();

  let manifest;
  try {
    manifest = await getCurrentManifest(prisma);
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 503, headers: CORS });
  }

  if (!manifest) {
    // Nothing published yet — the static pages fall back to their built-in data.
    return NextResponse.json({ published: false, products: {}, index: [] }, { status: 200, headers: CORS });
  }

  if (slug) {
    const card = (manifest.index ?? []).find((c) => c.link === `/urunler/urun/${slug}` || c.link.endsWith(`/${slug}`));
    const product = card ? manifest.products?.[card.code] : undefined;
    if (!product) {
      return NextResponse.json({ published: true, error: 'not_found', slug }, { status: 404, headers: CORS });
    }
    return NextResponse.json({ published: true, version: manifest.version, product }, { status: 200, headers: CORS });
  }

  if (code) {
    const product = manifest.products?.[code];
    if (!product) {
      return NextResponse.json({ published: true, error: 'not_found', code }, { status: 404, headers: CORS });
    }
    return NextResponse.json({ published: true, version: manifest.version, product }, { status: 200, headers: CORS });
  }

  return NextResponse.json(
    { published: true, version: manifest.version, generatedAt: manifest.generatedAt, count: manifest.count, products: manifest.products, index: manifest.index, categories: manifest.categories ?? {} },
    { status: 200, headers: CORS },
  );
}
