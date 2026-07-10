// Deliberately dependency-free (no 'server-only', no Prisma, no next/headers)
// so this can be imported from middleware.ts (Edge runtime) without pulling
// in the whole Node-only session/database module graph.
export const SESSION_COOKIE_NAME = 'decor_admin_session';
