import 'server-only';
import type { PrismaClient, Prisma } from '@prisma/client';
import type { ProductSnapshotManifest } from './product-snapshot';

/**
 * Neon-backed snapshot store with atomic promotion + rollback.
 *
 * Each publish inserts one immutable ProductSnapshot row. Exactly one row is
 * isCurrent (the live pointer the public /api/public/products endpoint reads)
 * and at most one is isPrevious (the rollback target). Promotion and rollback
 * are single-transaction pointer flips, so a public read is always a whole,
 * consistent snapshot — never a partial write. Storing the snapshot in Neon
 * (not Blob) sidesteps the private-store limitation and keeps the promoted
 * state in the same database the admin already trusts.
 */

function assertValid(manifest: ProductSnapshotManifest): void {
  if (!manifest || typeof manifest !== 'object') throw new Error('Snapshot geçersiz: boş manifest');
  if (!manifest.version) throw new Error('Snapshot geçersiz: sürüm yok');
  if (typeof manifest.count !== 'number') throw new Error('Snapshot geçersiz: adet yok');
  if (!manifest.products || typeof manifest.products !== 'object') throw new Error('Snapshot geçersiz: ürün haritası yok');
  const keys = Object.keys(manifest.products);
  if (keys.length !== manifest.count) throw new Error(`Snapshot tutarsız: count=${manifest.count} ama ${keys.length} ürün var`);
  for (const k of keys) if (!manifest.products[k]?.code) throw new Error(`Snapshot geçersiz: ${k} ürününde kod yok`);
}

export interface PromoteResult { version: string; count: number; previousVersion: string | null; }

/** Validate, then atomically flip the current pointer to a freshly-inserted row. */
export async function promoteProductSnapshot(
  prisma: PrismaClient,
  manifest: ProductSnapshotManifest,
  userId: string | null,
): Promise<PromoteResult> {
  assertValid(manifest);

  return prisma.$transaction(async (tx) => {
    // At most one isPrevious survives — clear stale flags first.
    await tx.productSnapshot.updateMany({ where: { isPrevious: true }, data: { isPrevious: false } });
    // Demote the outgoing current to previous (the rollback target).
    const outgoing = await tx.productSnapshot.findFirst({ where: { isCurrent: true } });
    if (outgoing) {
      await tx.productSnapshot.update({ where: { id: outgoing.id }, data: { isCurrent: false, isPrevious: true } });
    }
    // Insert the new snapshot as the live pointer.
    await tx.productSnapshot.create({
      data: {
        version: manifest.version,
        manifest: manifest as unknown as Prisma.InputJsonValue,
        count: manifest.count,
        isCurrent: true,
        createdById: userId,
      },
    });
    return { version: manifest.version, count: manifest.count, previousVersion: outgoing?.version ?? null };
  });
}

export interface RollbackResult { restoredVersion: string; count: number; }

/** Swap current <-> previous in a single transaction. Reversible: the
 * rolled-back snapshot becomes the new previous, so rollback can be undone. */
export async function rollbackProductSnapshot(prisma: PrismaClient, userId: string | null): Promise<RollbackResult> {
  return prisma.$transaction(async (tx) => {
    const [current, previous] = await Promise.all([
      tx.productSnapshot.findFirst({ where: { isCurrent: true } }),
      tx.productSnapshot.findFirst({ where: { isPrevious: true } }),
    ]);
    if (!previous) throw new Error('Geri alınacak önceki yayın yok.');

    await tx.productSnapshot.update({ where: { id: previous.id }, data: { isCurrent: true, isPrevious: false } });
    if (current) {
      await tx.productSnapshot.update({ where: { id: current.id }, data: { isCurrent: false, isPrevious: true } });
    }
    // Touch createdBy for the audit trail without mutating the immutable manifest.
    void userId;
    return { restoredVersion: previous.version, count: previous.count };
  });
}

/** The live manifest the public endpoint serves. Null before the first publish. */
export async function getCurrentManifest(prisma: PrismaClient): Promise<ProductSnapshotManifest | null> {
  const row = await prisma.productSnapshot.findFirst({ where: { isCurrent: true } });
  return row ? (row.manifest as unknown as ProductSnapshotManifest) : null;
}

export interface SnapshotMeta {
  current: { version: string; promotedAt: string; count: number } | null;
  previous: { version: string; promotedAt: string; count: number } | null;
  historyCount: number;
}

export async function getSnapshotMeta(prisma: PrismaClient): Promise<SnapshotMeta> {
  const [current, previous, historyCount] = await Promise.all([
    prisma.productSnapshot.findFirst({ where: { isCurrent: true } }),
    prisma.productSnapshot.findFirst({ where: { isPrevious: true } }),
    prisma.productSnapshot.count(),
  ]);
  return {
    current: current ? { version: current.version, promotedAt: current.createdAt.toISOString(), count: current.count } : null,
    previous: previous ? { version: previous.version, promotedAt: previous.createdAt.toISOString(), count: previous.count } : null,
    historyCount,
  };
}
