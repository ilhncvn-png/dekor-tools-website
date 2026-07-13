import 'server-only';
import { cookies } from 'next/headers';
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

  return {
    id: 'legacy-recovery',
    name: 'Yönetici',
    email: config.email,
    roles: ['SUPER_ADMIN'],
    permissions: ALL_PERMISSIONS,
  };
}
