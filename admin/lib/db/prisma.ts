import { PrismaClient } from '@prisma/client';

// Serverless-safe singleton, but LAZILY constructed: `new PrismaClient()`
// validates DATABASE_URL at construction and throws if it's missing. During
// the legacy-recovery phase (CMS_DATABASE_AUTH_ENABLED=false, no DATABASE_URL
// in production yet), the login page still imports Server Action modules that
// import this file — so constructing eagerly at module load would crash the
// login page with a 500 before the user could ever sign in. Deferring
// construction to first real property access means importing `prisma` is
// always safe; only an actual query (which legacy mode never performs)
// triggers construction. Once real Postgres auth is enabled this behaves
// exactly like the normal cached singleton.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Resolve the runtime connection string at construction time rather than
// relying solely on the schema's `url = env("DATABASE_URL")`. In production
// only DIRECT_URL is guaranteed present (the pooled DATABASE_URL is optional
// infra the operator may not have configured yet); without this fallback every
// query throws PrismaClientInitializationError ("DATABASE_URL resolved to an
// empty string") and the whole CMS 500s. Prefer the pooled URL when available
// (better for serverless concurrency), otherwise use the direct URL — so this
// transparently upgrades to pooling the moment DATABASE_URL is provisioned,
// with no code change.
// Defensively normalize a connection string that may have been pasted into the
// hosting provider's env UI as a whole dotenv line — e.g. the value literally
// being `DIRECT_URL="postgresql://..."` (var name + `=` + surrounding quotes)
// instead of just `postgresql://...`. Prisma rejects anything that doesn't
// start with the postgres scheme, so we strip an accidental leading `KEY=`
// prefix and any wrapping quotes/whitespace before handing it over.
function normalizeDbUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  let v = raw.trim();
  v = v.replace(/^[A-Za-z_][A-Za-z0-9_]*=/, ''); // drop an accidental leading VARNAME=
  v = v.replace(/^["']+|["']+$/g, '').trim(); // drop wrapping quotes
  return v || undefined;
}

function resolveDatabaseUrl(): string | undefined {
  return normalizeDbUrl(process.env.DATABASE_URL) || normalizeDbUrl(process.env.DIRECT_URL) || undefined;
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const url = resolveDatabaseUrl();
    globalForPrisma.prisma = url ? new PrismaClient({ datasourceUrl: url }) : new PrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
