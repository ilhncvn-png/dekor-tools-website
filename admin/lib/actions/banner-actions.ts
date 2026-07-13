'use server';

import { prisma } from '@/lib/db/prisma';
import { resolveCurrentUser } from '@/lib/auth/current-user';
import { requirePermission } from '@/lib/permissions';
import { recordAuditLog, recordActivity } from '@/lib/audit';
import { bannerInputSchema, type BannerInput } from '@/lib/validation/banner';
import { revalidatePath, revalidateTag } from 'next/cache';
import type { ActionResult } from './category-actions';

export async function saveBanner(bannerId: string | null, input: BannerInput): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, 'banners.manage');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }

  const parsed = bannerInputSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join('.')] = issue.message;
    return { success: false, error: 'Doğrulama hatası.', fieldErrors };
  }
  const data = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existingBanner = bannerId
        ? await tx.banner.findUnique({ where: { id: bannerId }, include: { translations: true, slides: true } })
        : null;

      const banner = bannerId
        ? await tx.banner.update({ where: { id: bannerId }, data: { placement: data.placement } })
        : await tx.banner.create({ data: { key: data.key, placement: data.placement } });

      for (const t of data.translations) {
        await tx.bannerTranslation.upsert({
          where: { bannerId_languageCode: { bannerId: banner.id, languageCode: t.languageCode } },
          update: { headline: t.headline, body: t.body, ctaLabel: t.ctaLabel, ctaUrl: t.ctaUrl },
          create: { bannerId: banner.id, languageCode: t.languageCode, headline: t.headline, body: t.body, ctaLabel: t.ctaLabel, ctaUrl: t.ctaUrl },
        });
      }

      await tx.bannerSlide.deleteMany({ where: { bannerId: banner.id } });
      if (data.slideMediaIds.length) {
        await tx.bannerSlide.createMany({
          data: data.slideMediaIds.map((mediaId, i) => ({ bannerId: banner.id, mediaId, sortOrder: i })),
        });
      }

      await tx.bannerRevision.create({
        data: {
          bannerId: banner.id,
          snapshot: JSON.parse(JSON.stringify({ ...banner, translations: data.translations })),
          action: bannerId ? 'UPDATE' : 'CREATE',
          authorId: user!.id,
        },
      });
      await tx.contentRevision.create({
        data: {
          entityType: 'banner',
          entityId: banner.id,
          action: bannerId ? 'UPDATE' : 'CREATE',
          previousData: existingBanner ? JSON.parse(JSON.stringify(existingBanner)) : undefined,
          authorId: user!.id,
        },
      });

      return banner;
    });

    await recordAuditLog({ actorId: user!.id, action: bannerId ? 'banner.update' : 'banner.create', entityType: 'banner', entityId: result.id, newData: { key: result.key } });
    await recordActivity({
      actorId: user!.id,
      actorName: user!.name,
      summary: `${user!.name} "${result.key}" bannerını ${bannerId ? 'güncelledi' : 'oluşturdu'}.`,
      entityType: 'banner',
      entityId: result.id,
    });

    revalidatePath('/genel-bilesenler');
    revalidateTag('banners');
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Kaydetme başarısız oldu.';
    return { success: false, error: message };
  }
}

async function transitionBannerStatus(
  bannerId: string,
  status: 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED',
  action: 'PUBLISH' | 'UNPUBLISH' | 'ARCHIVE'
): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, 'banners.manage');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }

  const banner = await prisma.banner.findUnique({ where: { id: bannerId }, include: { translations: true, slides: true } });
  if (!banner) return { success: false, error: 'Banner bulunamadı.' };

  if (action === 'PUBLISH') {
    const trTranslation = banner.translations.find((t) => t.languageCode === 'tr');
    if (!trTranslation) return { success: false, error: 'Yayınlamadan önce Türkçe içerik gereklidir.' };
    if (banner.slides.length === 0) return { success: false, error: 'Yayınlamadan önce en az bir görsel/video eklenmelidir.' };
  }

  await prisma.$transaction(async (tx) => {
    await tx.banner.update({ where: { id: bannerId }, data: { status, publishedAt: status === 'PUBLISHED' ? new Date() : banner.publishedAt } });
    await tx.contentRevision.create({ data: { entityType: 'banner', entityId: bannerId, action, authorId: user!.id } });
  });

  await recordAuditLog({ actorId: user!.id, action: `banner.${action.toLowerCase()}`, entityType: 'banner', entityId: bannerId });
  revalidatePath('/genel-bilesenler');
  revalidateTag('banners');
  return { success: true };
}

export const publishBanner = (id: string) => transitionBannerStatus(id, 'PUBLISHED', 'PUBLISH');
export const unpublishBanner = (id: string) => transitionBannerStatus(id, 'UNPUBLISHED', 'UNPUBLISH');
export const archiveBanner = (id: string) => transitionBannerStatus(id, 'ARCHIVED', 'ARCHIVE');

export async function listBanners(placement?: string) {
  const user = await resolveCurrentUser();
  requirePermission(user, 'banners.manage');

  return prisma.banner.findMany({
    where: { deletedAt: null, ...(placement ? { placement } : {}) },
    include: { translations: true, slides: { include: { media: true }, orderBy: { sortOrder: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });
}

/** Published-only read, used by the public-site integration layer - never exposes drafts. */
export async function getPublishedBannersForPlacement(placement: string, languageCode: string) {
  return prisma.banner.findMany({
    where: { placement, status: 'PUBLISHED', deletedAt: null },
    include: {
      translations: { where: { languageCode } },
      slides: { include: { media: true }, orderBy: { sortOrder: 'asc' } },
    },
  });
}
