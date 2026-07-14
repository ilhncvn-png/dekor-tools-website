'use server';

import { prisma } from '@/lib/db/prisma';
import { resolveCurrentUser } from '@/lib/auth/current-user';
import { requirePermission } from '@/lib/permissions';
import { recordAuditLog, recordActivity } from '@/lib/audit';
import { dealerInputSchema, type DealerInput } from '@/lib/validation/dealer';
import { toUiDealer, dealerSlug, UI_TO_DB_STATUS } from '@/lib/adapters/dealer-adapter';
import type { Dealer } from '@/lib/mock-data';
import { revalidatePath, revalidateTag } from 'next/cache';
import type { ActionResult } from './category-actions';

export async function saveDealer(dealerId: string | null, input: DealerInput): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, 'dealers.manage');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }

  const parsed = dealerInputSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join('.')] = issue.message;
    return { success: false, error: 'Doğrulama hatası.', fieldErrors };
  }
  const data = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = dealerId
        ? await tx.dealer.findUnique({ where: { id: dealerId }, include: { translations: true } })
        : null;

      const dealerData = {
        country: data.country,
        city: data.city ?? null,
        region: data.region ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        website: data.website ?? null,
        contactName: data.contactName ?? null,
        volume: data.volume ?? null,
        assignedTo: data.assignedTo ?? null,
        listedOnWebsite: data.listedOnWebsite,
        contractSigned: data.contractSigned,
        notes: data.notes ?? null,
        logoMediaId: data.logoMediaId ?? null,
        source: data.source,
        categories: data.categories,
        partnerSince: data.partnerSince ?? null,
        directoryStatus: data.directoryStatus ?? null,
      };

      const dealer = dealerId
        ? await tx.dealer.update({ where: { id: dealerId }, data: dealerData })
        : await tx.dealer.create({ data: { slug: `temp-${Date.now()}`, ...dealerData } });

      // Backfill a real slug from the company name once we have an id.
      if (!dealerId) {
        await tx.dealer.update({ where: { id: dealer.id }, data: { slug: dealerSlug(data.company, dealer.id) } });
      }

      await tx.dealerTranslation.upsert({
        where: { dealerId_languageCode: { dealerId: dealer.id, languageCode: 'tr' } },
        update: { name: data.company, address: data.address ?? null },
        create: { dealerId: dealer.id, languageCode: 'tr', name: data.company, address: data.address ?? null },
      });

      await tx.contentRevision.create({
        data: {
          entityType: 'dealer', entityId: dealer.id, action: dealerId ? 'UPDATE' : 'CREATE',
          previousData: existing ? JSON.parse(JSON.stringify(existing)) : undefined, authorId: user!.id,
        },
      });
      return dealer;
    });

    await recordAuditLog({ actorId: user!.id, action: dealerId ? 'dealer.update' : 'dealer.create', entityType: 'dealer', entityId: result.id, newData: { company: data.company } });
    await recordActivity({
      actorId: user!.id, actorName: user!.name,
      summary: `${user!.name} "${data.company}" bayisini ${dealerId ? 'güncelledi' : 'oluşturdu'}.`,
      entityType: 'dealer', entityId: result.id,
    });

    revalidatePath('/bayi-yonetimi');
    revalidateTag('dealers');
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Kaydetme başarısız oldu.' };
  }
}

/** The admin's approve/review/reject workflow maps onto ContentStatus. */
export async function setDealerStatus(dealerId: string, uiStatus: Dealer['status']): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, 'dealers.manage');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }
  const dbStatus = UI_TO_DB_STATUS[uiStatus];
  await prisma.$transaction(async (tx) => {
    await tx.dealer.update({
      where: { id: dealerId },
      data: {
        status: dbStatus,
        publishedAt: dbStatus === 'PUBLISHED' ? new Date() : undefined,
        // Approving a dealer lists it on the public directory.
        listedOnWebsite: dbStatus === 'PUBLISHED' ? true : undefined,
      },
    });
    await tx.contentRevision.create({
      data: { entityType: 'dealer', entityId: dealerId, action: dbStatus === 'PUBLISHED' ? 'PUBLISH' : dbStatus === 'ARCHIVED' ? 'ARCHIVE' : 'UPDATE', authorId: user!.id },
    });
  });
  await recordAuditLog({ actorId: user!.id, action: `dealer.${uiStatus}`, entityType: 'dealer', entityId: dealerId });
  revalidatePath('/bayi-yonetimi');
  revalidateTag('dealers');
  return { success: true };
}

export async function softDeleteDealer(dealerId: string): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, 'dealers.manage');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }
  await prisma.dealer.update({ where: { id: dealerId }, data: { deletedAt: new Date() } });
  await recordAuditLog({ actorId: user!.id, action: 'dealer.delete', entityType: 'dealer', entityId: dealerId });
  revalidatePath('/bayi-yonetimi');
  revalidateTag('dealers');
  return { success: true };
}

export async function getAdminDealers(): Promise<Dealer[]> {
  const user = await resolveCurrentUser();
  requirePermission(user, 'dealers.manage');

  const rows = await prisma.dealer.findMany({
    where: { deletedAt: null },
    include: { translations: true },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(toUiDealer);
}
