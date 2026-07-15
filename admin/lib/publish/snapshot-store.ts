import 'server-only';
import { put, list } from '@vercel/blob';
import type { ProductSnapshotManifest } from './product-snapshot';

/**
 * Blob-backed snapshot store with atomic promotion + rollback.
 *
 * Layout (all under a fixed prefix, public, deterministic pathnames):
 *   product-snapshots/current.json          <- the live pointer the public reads
 *   product-snapshots/versions/<version>.json  <- immutable archive of every promoted snapshot
 *   product-snapshots/meta.json             <- { current, previous, history[] }
 *
 * PROMOTION IS ATOMIC because the public only ever reads current.json, and a
 * Blob `put` replaces that object in a single operation — a reader gets either
 * the whole old object or the whole new one, never a partial write. The new
 * version is archived FIRST; current.json (the promote) is written LAST; so a
 * failure mid-way never leaves a half-published pointer.
 */

const PREFIX = 'product-snapshots';
const CURRENT_PATH = `${PREFIX}/current.json`;
const META_PATH = `${PREFIX}/meta.json`;
const versionPath = (v: string) => `${PREFIX}/versions/${v}.json`;

const JSON_OPTS = { access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json' } as const;

export interface SnapshotMetaEntry { version: string; promotedAt: string; count: number; url: string; }
export interface SnapshotMeta {
  current: SnapshotMetaEntry | null;
  previous: SnapshotMetaEntry | null;
  history: SnapshotMetaEntry[];
}

async function findBlobUrl(pathname: string): Promise<string | null> {
  const { blobs } = await list({ prefix: pathname, limit: 1 });
  const hit = blobs.find((b) => b.pathname === pathname);
  return hit?.url ?? null;
}

async function readJson<T>(pathname: string): Promise<T | null> {
  const url = await findBlobUrl(pathname);
  if (!url) return null;
  // cache-bust so we never read a stale CDN copy during a promote/rollback cycle.
  const res = await fetch(`${url}?ts=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

export async function getSnapshotMeta(): Promise<SnapshotMeta> {
  return (await readJson<SnapshotMeta>(META_PATH)) ?? { current: null, previous: null, history: [] };
}

/** Full public URL of the live pointer (stable per store) — this is what the
 * static pages fetch. Returns null before the first publish. */
export async function getCurrentSnapshotUrl(): Promise<string | null> {
  return findBlobUrl(CURRENT_PATH);
}

function assertValid(manifest: ProductSnapshotManifest): void {
  if (!manifest || typeof manifest !== 'object') throw new Error('Snapshot geçersiz: boş manifest');
  if (!manifest.version) throw new Error('Snapshot geçersiz: sürüm yok');
  if (typeof manifest.count !== 'number') throw new Error('Snapshot geçersiz: adet yok');
  if (!manifest.products || typeof manifest.products !== 'object') throw new Error('Snapshot geçersiz: ürün haritası yok');
  const keys = Object.keys(manifest.products);
  if (keys.length !== manifest.count) throw new Error(`Snapshot tutarsız: count=${manifest.count} ama ${keys.length} ürün var`);
  for (const k of keys) {
    if (!manifest.products[k]?.code) throw new Error(`Snapshot geçersiz: ${k} ürününde kod yok`);
  }
}

export interface PromoteResult { version: string; currentUrl: string; count: number; previousVersion: string | null; }

/** Archive the new version, then atomically flip current.json to it. Only
 * runs after the manifest has passed validation. */
export async function promoteProductSnapshot(manifest: ProductSnapshotManifest): Promise<PromoteResult> {
  assertValid(manifest);
  const body = JSON.stringify(manifest);
  const meta = await getSnapshotMeta();

  // 1. Immutable archive of the incoming version (rollback target for the future).
  await put(versionPath(manifest.version), body, JSON_OPTS);

  // 2. Atomic promote — the single write the public observes.
  const current = await put(CURRENT_PATH, body, JSON_OPTS);

  // 3. Record meta: new current, prior current becomes previous (rollback target now).
  const entry: SnapshotMetaEntry = { version: manifest.version, promotedAt: manifest.generatedAt, count: manifest.count, url: current.url };
  const nextMeta: SnapshotMeta = {
    current: entry,
    previous: meta.current, // the snapshot we just replaced
    history: [entry, ...meta.history].slice(0, 20),
  };
  await put(META_PATH, JSON.stringify(nextMeta), JSON_OPTS);

  return { version: manifest.version, currentUrl: current.url, count: manifest.count, previousVersion: meta.current?.version ?? null };
}

export interface RollbackResult { restoredVersion: string; currentUrl: string; count: number; }

/** Restore the previously-published snapshot by copying its archive back over
 * current.json. Swaps current/previous in meta so rollback is itself reversible. */
export async function rollbackProductSnapshot(): Promise<RollbackResult> {
  const meta = await getSnapshotMeta();
  if (!meta.previous) throw new Error('Geri alınacak önceki yayın yok.');

  const archived = await readJson<ProductSnapshotManifest>(versionPath(meta.previous.version));
  if (!archived) throw new Error(`Önceki sürüm arşivi bulunamadı: ${meta.previous.version}`);
  assertValid(archived);

  const body = JSON.stringify(archived);
  const current = await put(CURRENT_PATH, body, JSON_OPTS);

  const restoredEntry: SnapshotMetaEntry = { ...meta.previous, url: current.url };
  const nextMeta: SnapshotMeta = {
    current: restoredEntry,
    previous: meta.current, // allow rolling forward again
    history: [restoredEntry, ...meta.history].slice(0, 20),
  };
  await put(META_PATH, JSON.stringify(nextMeta), JSON_OPTS);

  return { restoredVersion: archived.version, currentUrl: current.url, count: archived.count };
}
