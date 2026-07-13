import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// TEMPORARY diagnostic — reports whether the deployed serverless runtime can
// reach Neon and which DB env vars are present (booleans only, never values).
// Removed immediately after the CMS-persistence root cause is confirmed.
export const dynamic = 'force-dynamic';

export async function GET() {
  const env = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    DIRECT_URL: Boolean(process.env.DIRECT_URL),
    CMS_DATABASE_AUTH_ENABLED: process.env.CMS_DATABASE_AUTH_ENABLED ?? null,
    LEGACY_ADMIN_PASSWORD_HASH: Boolean(process.env.LEGACY_ADMIN_PASSWORD_HASH),
  };
  try {
    const count = await prisma.productCategory.count();
    return NextResponse.json({ ok: true, env, categoryCount: count });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      env,
      errorName: error instanceof Error ? error.name : typeof error,
      errorMessage: error instanceof Error ? error.message.slice(0, 500) : String(error).slice(0, 500),
    });
  }
}
