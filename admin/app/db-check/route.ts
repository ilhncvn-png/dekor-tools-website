import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { saveCategory, publishCategory, softDeleteCategory, getAdminCategories } from '@/lib/actions/category-actions';

// TEMPORARY diagnostic — confirms the deployed serverless runtime can reach Neon
// and exercises the full Category write path (create -> publish -> read -> delete)
// end to end in production. Removed immediately after the proof.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const count = await prisma.productCategory.count();
    return NextResponse.json({ ok: true, categoryCount: count });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      errorName: error instanceof Error ? error.name : typeof error,
      errorMessage: error instanceof Error ? error.message.slice(0, 500) : String(error).slice(0, 500),
    });
  }
}

// POST /admin/db-check runs a self-contained round-trip against the real DB.
export async function POST() {
  const slug = `diag-${Date.now()}`;
  const steps: Record<string, unknown> = {};
  let createdId: string | null = null;
  try {
    const created = await saveCategory(null, {
      key: slug,
      parentId: null,
      sortOrder: 0,
      isVisible: false,
      code: null,
      icon: null,
      showOnHomepage: false,
      showInNavigation: false,
      translations: [{ languageCode: 'tr', name: 'Diagnostic Category', slug }],
    });
    steps.create = created;
    createdId = (created.data as { id?: string } | undefined)?.id ?? null;

    if (createdId) {
      steps.publish = await publishCategory(createdId);
      const all = await getAdminCategories();
      steps.readBackFound = all.some((c) => c.id === createdId);
      steps.delete = await softDeleteCategory(createdId);
    }

    // Hard-clean the diagnostic row so it never lingers in real data.
    if (createdId) {
      await prisma.contentRevision.deleteMany({ where: { entityId: createdId } });
      await prisma.auditLog.deleteMany({ where: { entityType: 'product_category', entityId: createdId } });
      await prisma.productCategoryTranslation.deleteMany({ where: { categoryId: createdId } });
      await prisma.productCategory.delete({ where: { id: createdId } }).catch(() => {});
    }
    return NextResponse.json({ ok: true, steps });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      steps,
      errorName: error instanceof Error ? error.name : typeof error,
      errorMessage: error instanceof Error ? error.message.slice(0, 600) : String(error).slice(0, 600),
    });
  }
}
