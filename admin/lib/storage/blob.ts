import 'server-only';
import { put, del, list } from '@vercel/blob';
import { randomBytes } from 'node:crypto';

// Thin abstraction over Vercel Blob, scoped to exactly what Decor's Media
// Library needs — not a generic multi-provider storage layer. Swapping the
// implementation later (e.g. S3) means editing this one file, not every
// call site, without over-engineering a provider-agnostic interface nobody
// asked for yet.

export const ALLOWED_MIME_TYPES = {
  'image/jpeg': { maxBytes: 8 * 1024 * 1024, category: 'image' },
  'image/png': { maxBytes: 8 * 1024 * 1024, category: 'image' },
  'image/webp': { maxBytes: 8 * 1024 * 1024, category: 'image' },
  'image/avif': { maxBytes: 8 * 1024 * 1024, category: 'image' },
  'image/svg+xml': { maxBytes: 512 * 1024, category: 'image' },
  'application/pdf': { maxBytes: 25 * 1024 * 1024, category: 'document' },
  'video/mp4': { maxBytes: 100 * 1024 * 1024, category: 'video' },
  'video/webm': { maxBytes: 100 * 1024 * 1024, category: 'video' },
} as const;

export type AllowedMimeType = keyof typeof ALLOWED_MIME_TYPES;

export class UnsupportedMediaTypeError extends Error {
  constructor(mimeType: string) {
    super(`Unsupported media type: ${mimeType}`);
    this.name = 'UnsupportedMediaTypeError';
  }
}

export class FileTooLargeError extends Error {
  constructor(mimeType: string, maxBytes: number) {
    super(`File exceeds the ${Math.round(maxBytes / 1024 / 1024)}MB limit for ${mimeType}`);
    this.name = 'FileTooLargeError';
  }
}

function isAllowedMimeType(mimeType: string): mimeType is AllowedMimeType {
  return mimeType in ALLOWED_MIME_TYPES;
}

/**
 * SVGs can embed <script> and event-handler attributes, so unlike raster
 * formats they need content inspection, not just a MIME-type check, before
 * being treated as safe to serve inline. Reject anything with script
 * content or an XML external entity reference rather than trying to
 * sanitize it here — sanitization is a bigger job than this pass covers.
 */
export function isSafeSvgContent(buffer: Buffer): boolean {
  const text = buffer.toString('utf-8').toLowerCase();
  const dangerous = ['<script', 'onload=', 'onerror=', 'onclick=', '<!entity', 'javascript:'];
  return !dangerous.some((pattern) => text.includes(pattern));
}

function folderForCategory(category: string): string {
  return { image: 'images', document: 'documents', video: 'videos' }[category] ?? 'misc';
}

function safeFilename(originalName: string): string {
  const ext = originalName.includes('.') ? originalName.split('.').pop() : '';
  const base = randomBytes(8).toString('hex');
  return ext ? `${base}.${ext.toLowerCase().replace(/[^a-z0-9]/g, '')}` : base;
}

export interface UploadResult {
  url: string;
  pathname: string;
  mimeType: string;
  sizeBytes: number;
  originalFilename: string;
}

async function putAdaptiveAccess(pathname: string, buffer: Buffer, mimeType: string) {
  try {
    return await put(pathname, buffer, { access: 'public', contentType: mimeType, addRandomSuffix: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (/private (access|store)|public access on a private/i.test(message)) {
      return await put(pathname, buffer, { access: 'private', contentType: mimeType, addRandomSuffix: false });
    }
    throw error;
  }
}

export async function uploadFile(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<UploadResult> {
  if (!isAllowedMimeType(mimeType)) {
    throw new UnsupportedMediaTypeError(mimeType);
  }
  const { maxBytes, category } = ALLOWED_MIME_TYPES[mimeType];
  if (buffer.byteLength > maxBytes) {
    throw new FileTooLargeError(mimeType, maxBytes);
  }
  if (mimeType === 'image/svg+xml' && !isSafeSvgContent(buffer)) {
    throw new UnsupportedMediaTypeError('image/svg+xml (unsafe content detected)');
  }

  const folder = folderForCategory(category);
  const filename = safeFilename(originalFilename);
  const pathname = `${folder}/${filename}`;

  // Prefer 'public' (website media needs URL-addressable assets), but fall back
  // to 'private' when the configured Blob store only allows private access —
  // this keeps uploads working regardless of how the store was provisioned,
  // and auto-uses public if the store is later switched, with no code change.
  const blob = await putAdaptiveAccess(pathname, buffer, mimeType);

  return {
    url: blob.url,
    pathname: blob.pathname,
    mimeType,
    sizeBytes: buffer.byteLength,
    originalFilename,
  };
}

export async function deleteFile(url: string): Promise<void> {
  await del(url);
}

export async function replaceFile(
  oldUrl: string,
  buffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<UploadResult> {
  const result = await uploadFile(buffer, originalFilename, mimeType);
  await deleteFile(oldUrl).catch(() => {
    // Old blob deletion failing shouldn't roll back a successful new
    // upload - it becomes an orphaned blob, not a data-loss risk. Real
    // cleanup of orphans is a maintenance job, not this call path.
  });
  return result;
}

export async function listFiles(prefix?: string) {
  return list({ prefix, limit: 1000 });
}
