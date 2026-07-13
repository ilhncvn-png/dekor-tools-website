import 'server-only';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser, type AuthenticatedUser, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { isDatabaseAuthEnabled } from '@/lib/auth/flags';
import { getLegacyRecoveryConfig, verifyLegacyToken } from '@/lib/auth/legacy-recovery';

// All permission keys — a legacy-recovery session is treated as SUPER_ADMIN
// so the existing admin UI (which hides/disables actions by permission)
// renders normally during recovery. This is intentional: recovery mode only
// exists to let the sole operator back in before real RBAC is live.
const ALL_PERMISSIONS = [
  'dashboard.view', 'products.view', 'products.create', 'products.update', 'products.delete', 'products.publish',
  'categories.manage', 'pages.manage', 'pages.publish', 'news.manage', 'dealers.manage', 'banners.manage',
  'media.view', 'media.upload', 'media.delete', 'translations.manage', 'users.manage', 'roles.manage',
  'settings.manage', 'audit.view', 'redirects.manage', 'seo.manage',
];

/**
 * The single entry point the app uses to learn who the current user is.
 * Branches on the auth-mode flag so the database-backed path (which needs
 * Postgres + AUTH_SECRET) is never touched while running in legacy-recovery
 * mode.
 */
export async function resolveCurrentUser(): Promise<AuthenticatedUser | null> {
  if (isDatabaseAuthEnabled()) {
    return getCurrentUser();
  }

  const config = getLegacyRecoveryConfig();
  if (!config) return null; // recovery not configured -> nobody is authenticated (fail-closed)

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const valid = await verifyLegacyToken(token, config.passwordHash);
  if (!valid) return null;

  // Attribute CMS actions to the REAL database admin row with the same email,
  // so audit logs and revisions have a valid author FK and the app uses the
  // user's real permissions — even while the live login is still the
  // temporary recovery cookie. This is what lets the CMS be fully operational
  // (create/publish/audit) without first flipping to database auth, keeping
  // the recovery login untouched. Falls back to a synthetic SUPER_ADMIN only
  // if the DB is unreachable or unseeded.
  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: config.email },
      include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
    });
    if (dbUser && dbUser.status === 'ACTIVE' && !dbUser.deletedAt) {
      const roles = dbUser.roles.map((ur) => ur.role.key);
      const permissions = Array.from(
        new Set(dbUser.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.key)))
      );
      return { id: dbUser.id, name: dbUser.name, email: dbUser.email, roles, permissions };
    }
  } catch {
    // DB unavailable -> synthetic fallback below (rendering/login still work;
    // CMS write actions will fail gracefully at their permission check).
  }

  return {
    id: 'legacy-recovery',
    name: 'Yönetici',
    email: config.email,
    roles: ['SUPER_ADMIN'],
    permissions: ALL_PERMISSIONS,
  };
}
