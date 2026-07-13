// Single source of truth for which authentication mode is active.
//
// Defaults to FALSE (legacy env-var recovery) when unset, so a production
// deployment WITHOUT DATABASE_URL / AUTH_SECRET configured never accidentally
// activates the database-backed auth path and 500s the login page. Flip to
// "true" in Vercel only after the real Postgres admin account is verified —
// see docs/enterprise-cms-migration.md.
//
// Deliberately dependency-free (no imports) so it is safe to read from Edge
// middleware as well as Node server code.
export function isDatabaseAuthEnabled(): boolean {
  return process.env.CMS_DATABASE_AUTH_ENABLED === 'true';
}
