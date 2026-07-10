'use server';

import { z } from 'zod';
import { imageSize } from 'image-size';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { requirePermission } from '@/lib/permissions';
import { recordAuditLog, recordActivity } from '@/lib/audit';
import { uploadFile, deleteFile, ALLOWED_MIME_TYPES, type AllowedMimeType } from '@/lib/storage/blob';
import { revalidatePath } from 'next/cache';

const uploadMetaSchema = z.object({
  altText: z.string().max(300).optional(),
  caption: z.string().max(500).optional(),
  folderId: z.string().cuid().optional(),
});

export interface MediaActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function uploadMediaAsset(formData: FormData): Promise<MediaActionResult> {
  const user = await getCurrentUser();
  try {
    requirePermission(user, 'media.upload');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { success: false, error: 'Dosya bulunamadı.' };
  }

  const meta = uploadMetaSchema.safeParse({
    altText: formData.get('altText') || undefined,
    caption: formData.get('caption') || undefined,
    folderId: formData.get('folderId') || undefined,
  });
  if (!meta.success) {
    return { success: false, error: 'Geçersiz medya bilgisi.' };
  }

  if (!(file.type in ALLOWED_MIME_TYPES)) {
    return { success: false, error: `Desteklenmeyen dosya türü: ${file.type}` };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const uploaded = await uploadFile(buffer, file.name, file.type as AllowedMimeType);

    let width: number | undefined;
    let height: number | undefined;
    if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
      try {
        const dims = imageSize(buffer);
        width = dims.width;
        height = dims.height;
      } catch {
        // Non-fatal: some formats/corrupt files won't parse for dimensions:
        // the upload itself already succeeded, so we keep the asset with
        // null dimensions rather than failing the whole upload over this.
      }
    }

    const asset = await prisma.mediaAsset.create({
      data: {
        fileName: file.name,
        url: uploaded.url,
        mimeType: file.type,
        sizeBytes: uploaded.sizeBytes,
        width,
        height,
        altText: meta.data.altText,
        caption: meta.data.caption,
        folderId: meta.data.folderId,
        uploadedById: user!.id,
      },
    });

    await recordAuditLog({
      actorId: user!.id,
      action: 'media.upload',
      entityType: 'media_asset',
      entityId: asset.id,
      newData: { fileName: asset.fileName, mimeType: asset.mimeType, sizeBytes: asset.sizeBytes },
    });
    await recordActivity({
      actorId: user!.id,
      actorName: user!.name,
      summary: `${user!.name} "${asset.fileName}" dosyasını yükledi.`,
      entityType: 'media_asset',
      entityId: asset.id,
    });

    revalidatePath('/medya-kutuphanesi');
    return { success: true, data: asset };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Yükleme başarısız oldu.';
    return { success: false, error: message };
  }
}

export async function deleteMediaAsset(mediaId: string): Promise<MediaActionResult> {
  const user = await getCurrentUser();
  try {
    requirePermission(user, 'media.delete');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }

  const asset = await prisma.mediaAsset.findUnique({
    where: { id: mediaId },
    include: { usages: true },
  });
  if (!asset) {
    return { success: false, error: 'Medya bulunamadı.' };
  }
  if (asset.usages.length > 0) {
    return {
      success: false,
      error: `Bu medya ${asset.usages.length} içerikte kullanılıyor. Önce bu içeriklerden kaldırın.`,
    };
  }

  await deleteFile(asset.url).catch(() => {
    // Blob-side delete failing shouldn't block removing the DB record the
    // admin explicitly asked to delete - it becomes an orphaned blob, a
    // storage-cost issue, not a correctness one.
  });
  await prisma.mediaAsset.delete({ where: { id: mediaId } });

  await recordAuditLog({
    actorId: user!.id,
    action: 'media.delete',
    entityType: 'media_asset',
    entityId: mediaId,
    previousData: { fileName: asset.fileName, url: asset.url },
  });

  revalidatePath('/medya-kutuphanesi');
  return { success: true };
}

export async function listMediaAssets(params: {
  query?: string;
  mimeCategory?: 'image' | 'document' | 'video';
  folderId?: string;
  page?: number;
  pageSize?: number;
}) {
  const user = await getCurrentUser();
  requirePermission(user, 'media.view');

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 40;

  const mimePrefix = params.mimeCategory === 'image' ? 'image/' : params.mimeCategory === 'video' ? 'video/' : params.mimeCategory === 'document' ? 'application/' : undefined;

  const where = {
    deletedAt: null,
    ...(params.query ? { fileName: { contains: params.query, mode: 'insensitive' as const } } : {}),
    ...(mimePrefix ? { mimeType: { startsWith: mimePrefix } } : {}),
    ...(params.folderId ? { folderId: params.folderId } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { uploadedBy: { select: { name: true } }, _count: { select: { usages: true } } },
    }),
    prisma.mediaAsset.count({ where }),
  ]);

  return { items, total, page, pageSize };
}
