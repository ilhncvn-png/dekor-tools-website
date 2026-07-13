import type { MediaItem } from '@/lib/mock-data';

// Maps a database MediaAsset (Vercel Blob-backed) to the exact `MediaItem`
// shape the Media Library UI already consumes, so the screen renders unchanged
// while reading real storage. Mirrors the Category/Product adapters.

type DbMediaAsset = {
  id: string;
  fileName: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  caption: string | null;
  createdAt: Date;
  folder?: { name: string } | null;
  uploadedBy?: { name: string } | null;
  _count?: { usages?: number; productLinks?: number; bannerSlides?: number };
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function optimizationFor(mimeType: string): MediaItem['optimizationStatus'] {
  if (mimeType === 'image/avif' || mimeType === 'image/webp' || mimeType === 'image/svg+xml') return 'optimized';
  if (mimeType.startsWith('image/')) return 'gerekli'; // jpeg/png could be re-encoded to a modern format
  if (mimeType.startsWith('video/')) return 'desteklenmiyor';
  return 'desteklenmiyor';
}

export function toUiMediaItem(a: DbMediaAsset): MediaItem {
  const usageCount =
    (a._count?.usages ?? 0) + (a._count?.productLinks ?? 0) + (a._count?.bannerSlides ?? 0);
  return {
    id: a.id,
    name: a.fileName,
    type: a.mimeType.startsWith('video/') ? 'video' : 'image',
    size: formatBytes(a.sizeBytes),
    folder: a.folder?.name ?? 'Genel',
    updatedAt: a.createdAt.toISOString().slice(0, 10),
    dimensions: a.width && a.height ? `${a.width}×${a.height}` : '—',
    altText: a.altText,
    title: a.altText || a.fileName,
    caption: a.caption,
    usageCount,
    optimizationStatus: optimizationFor(a.mimeType),
    uploadedBy: a.uploadedBy?.name ?? 'Sistem',
    swatch: '#8A9097',
    usedIn: [],
    // The real Blob URL — the UI's preview/thumbnail can use it directly.
    url: a.url,
  } as MediaItem & { url: string };
}
