import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// TEMPORARY diagnostic — runs each getProductWizard query in isolation so the
// real failing query/model surfaces (digest-hidden 500s). Removed after use.
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id') ?? '';
  const steps: Record<string, string> = {};
  const run = async (name: string, fn: () => Promise<unknown>) => {
    try { const r = await fn(); steps[name] = Array.isArray(r) ? `ok(${r.length})` : r ? 'ok' : 'null'; }
    catch (e) { steps[name] = 'ERR: ' + (e instanceof Error ? e.message.slice(0, 160) : String(e)); }
  };
  await run('product', () => prisma.product.findUnique({ where: { id }, include: { translations: true } }));
  await run('variant', () => prisma.productVariant.findMany({ where: { productId: id } }));
  await run('applicationArea', () => prisma.productApplicationArea.findMany({ where: { productId: id } }));
  await run('document', () => prisma.productDocument.findMany({ where: { productId: id } }));
  await run('video', () => prisma.productVideo.findMany({ where: { productId: id } }));
  await run('drawing', () => prisma.productTechnicalDrawing.findFirst({ where: { productId: id } }));
  await run('media', () => prisma.productMedia.findMany({ where: { productId: id } }));
  return NextResponse.json({ steps });
}
