import 'server-only';
import type { AuthenticatedUser } from '@/lib/auth/session';

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export function hasPermission(user: AuthenticatedUser, permissionKey: string): boolean {
  return user.permissions.includes(permissionKey);
}

/**
 * Call at the top of every Server Action / Route Handler that performs a
 * sensitive operation. Throws rather than silently no-oping, so a missing
 * check fails loudly in development instead of shipping a hole. The UI
 * hiding/disabling unauthorized actions (Section 6 of the migration spec) is
 * a UX nicety layered on top of this — never a substitute for it.
 */
export function requirePermission(user: AuthenticatedUser | null, permissionKey: string): AuthenticatedUser {
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user, permissionKey)) {
    throw new ForbiddenError(`Missing permission: ${permissionKey}`);
  }
  return user;
}
