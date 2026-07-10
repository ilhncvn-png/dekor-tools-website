import { z } from 'zod';

// Split by concern rather than one monolithic schema, so a request path
// that only touches auth (e.g. every page load, via session verification)
// doesn't fail just because BLOB_READ_WRITE_TOKEN or PREVIEW_SECRET isn't
// configured yet — those are only required once media upload or preview
// links are actually used. Each getXEnv() fails fast with a clear message
// scoped to what that specific operation actually needs.

const dbSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().min(1, 'DIRECT_URL is required'),
});

const authSchema = z.object({
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),
});

const blobSchema = z.object({
  BLOB_READ_WRITE_TOKEN: z.string().min(1, 'BLOB_READ_WRITE_TOKEN is required'),
});

const urlsSchema = z.object({
  APP_URL: z.string().url('APP_URL must be a valid URL'),
  PUBLIC_SITE_URL: z.string().url('PUBLIC_SITE_URL must be a valid URL'),
});

const previewSchema = z.object({
  PREVIEW_SECRET: z.string().min(32, 'PREVIEW_SECRET must be at least 32 characters'),
});

const revalidationSchema = z.object({
  REVALIDATION_SECRET: z.string().min(32, 'REVALIDATION_SECRET must be at least 32 characters'),
});

function makeGetter<T extends z.ZodTypeAny>(schema: T, label: string) {
  let cached: z.infer<T> | null = null;
  return function get(): z.infer<T> {
    if (cached) return cached;
    const parsed = schema.safeParse(process.env);
    if (!parsed.success) {
      const missing = parsed.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n');
      throw new Error(`Missing or invalid ${label} environment configuration:\n${missing}\n\nSee .env.example.`);
    }
    cached = parsed.data;
    return cached;
  };
}

export const getDbEnv = makeGetter(dbSchema, 'database');
export const getAuthEnv = makeGetter(authSchema, 'auth');
export const getBlobEnv = makeGetter(blobSchema, 'media storage');
export const getUrlsEnv = makeGetter(urlsSchema, 'URL');
export const getPreviewEnv = makeGetter(previewSchema, 'preview');
export const getRevalidationEnv = makeGetter(revalidationSchema, 'revalidation');

// Full combined check - used only where every var genuinely is required
// (e.g. a startup health check that reports on all subsystems at once).
const fullSchema = dbSchema.merge(authSchema).merge(blobSchema).merge(urlsSchema).merge(previewSchema).merge(revalidationSchema);
export type Env = z.infer<typeof fullSchema>;
export const getEnv = makeGetter(fullSchema, 'application');
