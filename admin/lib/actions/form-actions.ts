'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { resolveCurrentUser } from '@/lib/auth/current-user';
import { requirePermission } from '@/lib/permissions';
import { recordAuditLog } from '@/lib/audit';
import type { FormSubmission } from '@/lib/mock-data';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from './category-actions';

type DbSubmission = {
  id: string; type: string; name: string; email: string; subject: string; message: string;
  sourceForm: string; sourcePage: string; status: string; priority: string; assignedTo: string | null;
  createdAt: Date;
};

function toUi(s: DbSubmission): FormSubmission {
  return {
    id: s.id,
    type: (['iletisim', 'sikayet', 'fikir', 'kariyer', 'bayi'].includes(s.type) ? s.type : 'iletisim') as FormSubmission['type'],
    name: s.name, email: s.email, subject: s.subject, message: s.message,
    sourceForm: s.sourceForm, sourcePage: s.sourcePage,
    status: (['yeni', 'yanitlandi', 'kapatildi'].includes(s.status) ? s.status : 'yeni') as FormSubmission['status'],
    submittedAt: s.createdAt.toISOString().slice(0, 10),
    priority: (['yuksek', 'orta', 'dusuk'].includes(s.priority) ? s.priority : 'orta') as FormSubmission['priority'],
    assignedTo: s.assignedTo,
  };
}

export async function getAdminSubmissions(): Promise<FormSubmission[]> {
  const user = await resolveCurrentUser();
  requirePermission(user, 'dashboard.view');
  const rows = await prisma.formSubmission.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } });
  return rows.map(toUi);
}

const updateSchema = z.object({
  status: z.enum(['yeni', 'yanitlandi', 'kapatildi']).optional(),
  priority: z.enum(['yuksek', 'orta', 'dusuk']).optional(),
  assignedTo: z.string().max(160).nullable().optional(),
});

export async function updateSubmission(id: string, patch: z.infer<typeof updateSchema>): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, 'dashboard.view');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }
  const parsed = updateSchema.safeParse(patch);
  if (!parsed.success) return { success: false, error: 'Doğrulama hatası.' };
  try {
    const s = await prisma.formSubmission.update({ where: { id }, data: parsed.data });
    await recordAuditLog({ actorId: user!.id, action: 'form.update', entityType: 'form_submission', entityId: id, newData: parsed.data });
    revalidatePath('/form-talepleri');
    return { success: true, data: s };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Güncelleme başarısız oldu.' };
  }
}

export async function deleteSubmission(id: string): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try {
    requirePermission(user, 'dashboard.view');
  } catch {
    return { success: false, error: 'Bu işlem için yetkiniz yok.' };
  }
  await prisma.formSubmission.update({ where: { id }, data: { deletedAt: new Date() } });
  await recordAuditLog({ actorId: user!.id, action: 'form.delete', entityType: 'form_submission', entityId: id });
  revalidatePath('/form-talepleri');
  return { success: true };
}

const createSchema = z.object({
  type: z.enum(['iletisim', 'sikayet', 'fikir', 'kariyer', 'bayi']).default('iletisim'),
  name: z.string().min(1).max(200),
  email: z.string().max(200),
  subject: z.string().min(1).max(300),
  message: z.string().max(5000).default(''),
  sourceForm: z.string().max(120).default(''),
  sourcePage: z.string().max(200).default(''),
  priority: z.enum(['yuksek', 'orta', 'dusuk']).default('orta'),
});

/**
 * Create a submission. Intended to be called by the public-site form
 * integration (or manually from the admin). Not permission-gated on create so
 * the public forms can post leads; validated strictly instead.
 */
export async function createFormSubmission(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: 'Geçersiz form verisi.' };
  try {
    const s = await prisma.formSubmission.create({ data: { ...parsed.data, status: 'yeni' } });
    revalidatePath('/form-talepleri');
    return { success: true, data: s };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Gönderim başarısız oldu.' };
  }
}
