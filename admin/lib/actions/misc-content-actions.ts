'use server';

import { prisma } from '@/lib/db/prisma';
import { resolveCurrentUser } from '@/lib/auth/current-user';
import { requirePermission } from '@/lib/permissions';
import { recordAuditLog } from '@/lib/audit';
import type { Certificate, PopupRule, FileDoc } from '@/lib/mock-data';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from './category-actions';

// A real DB id is a cuid (no dashes); every locally-created draft id contains a
// dash (e.g. "pp-123", "cert-123", "new-123"), so this cleanly distinguishes them.
const isDraft = (id: string) => id.includes('-');

/* ---------------- Certificates ---------------- */

export async function getAdminCertificates(): Promise<Certificate[]> {
  const user = await resolveCurrentUser();
  requirePermission(user, 'settings.manage');
  const rows = await prisma.certificate.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } });
  return rows.map((c) => ({
    id: c.id, name: c.name, issuer: c.issuer,
    status: (c.status as Certificate['status']) ?? 'gecerli',
    issuedAt: c.issuedAt ?? '', validUntil: c.validUntil ?? '', scope: c.scope ?? '',
    reminder: (c.reminder as Certificate['reminder']) ?? 'yok',
    showOnHomepage: c.showOnHomepage, showOnProductPages: c.showOnProductPages,
    file: c.fileId, order: c.sortOrder, downloadEnabled: c.downloadEnabled, category: c.category ?? '',
  }));
}

export async function saveCertificate(id: string | null, c: Certificate): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try { requirePermission(user, 'settings.manage'); } catch { return { success: false, error: 'Bu işlem için yetkiniz yok.' }; }
  if (!c.name?.trim()) return { success: false, error: 'Sertifika adı zorunludur.' };
  const data = {
    name: c.name, issuer: c.issuer ?? '', status: c.status, issuedAt: c.issuedAt || null, validUntil: c.validUntil || null,
    scope: c.scope || null, reminder: c.reminder, showOnHomepage: c.showOnHomepage, showOnProductPages: c.showOnProductPages,
    fileId: c.file ?? null, sortOrder: c.order ?? 0, downloadEnabled: c.downloadEnabled, category: c.category || null,
  };
  try {
    const persist = id && !isDraft(id);
    const row = persist ? await prisma.certificate.update({ where: { id }, data }) : await prisma.certificate.create({ data });
    await recordAuditLog({ actorId: user!.id, action: persist ? 'certificate.update' : 'certificate.create', entityType: 'certificate', entityId: row.id });
    revalidatePath('/sertifikalar');
    return { success: true, data: row };
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Kaydetme başarısız oldu.' }; }
}

export async function deleteCertificate(id: string): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try { requirePermission(user, 'settings.manage'); } catch { return { success: false, error: 'Bu işlem için yetkiniz yok.' }; }
  await prisma.certificate.update({ where: { id }, data: { deletedAt: new Date() } });
  await recordAuditLog({ actorId: user!.id, action: 'certificate.delete', entityType: 'certificate', entityId: id });
  revalidatePath('/sertifikalar');
  return { success: true };
}

/* ---------------- Popups ---------------- */

export async function getAdminPopups(): Promise<PopupRule[]> {
  const user = await resolveCurrentUser();
  requirePermission(user, 'settings.manage');
  const rows = await prisma.popup.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } });
  return rows.map((p) => ({
    id: p.id, name: p.name, type: (p.type as PopupRule['type']) ?? 'duyuru',
    trigger: (p.trigger as PopupRule['trigger']) ?? 'sayfa-yuklenince',
    delaySeconds: p.delaySeconds, pages: p.pages, active: p.active,
  }));
}

export async function savePopup(id: string | null, p: PopupRule): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try { requirePermission(user, 'settings.manage'); } catch { return { success: false, error: 'Bu işlem için yetkiniz yok.' }; }
  if (!p.name?.trim()) return { success: false, error: 'Popup adı zorunludur.' };
  const data = { name: p.name, type: p.type, trigger: p.trigger, delaySeconds: p.delaySeconds ?? null, pages: p.pages ?? [], active: p.active };
  try {
    const persist = id && !isDraft(id);
    const row = persist ? await prisma.popup.update({ where: { id }, data }) : await prisma.popup.create({ data });
    await recordAuditLog({ actorId: user!.id, action: persist ? 'popup.update' : 'popup.create', entityType: 'popup', entityId: row.id });
    revalidatePath('/popup-yonetimi');
    return { success: true, data: row };
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Kaydetme başarısız oldu.' }; }
}

export async function deletePopup(id: string): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try { requirePermission(user, 'settings.manage'); } catch { return { success: false, error: 'Bu işlem için yetkiniz yok.' }; }
  await prisma.popup.update({ where: { id }, data: { deletedAt: new Date() } });
  await recordAuditLog({ actorId: user!.id, action: 'popup.delete', entityType: 'popup', entityId: id });
  revalidatePath('/popup-yonetimi');
  return { success: true };
}

/* ---------------- File Center (FileDoc) ---------------- */

export async function getAdminFiles(): Promise<FileDoc[]> {
  const user = await resolveCurrentUser();
  requirePermission(user, 'media.view');
  const rows = await prisma.fileDoc.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: 'desc' } });
  return rows.map((f) => ({
    id: f.id, name: f.name, category: f.category ?? '', format: (f.format as FileDoc['format']) ?? 'PDF',
    size: f.sizeLabel ?? '—', downloads: f.downloads, updatedAt: f.updatedAt.toISOString().slice(0, 10),
    accessLevel: (f.accessLevel as FileDoc['accessLevel']) ?? 'herkese-acik', version: f.version, language: f.language,
    linkedTo: f.linkedTo, uploadedBy: f.uploadedBy ?? 'Sistem', versionHistory: [],
  }));
}

export async function saveFile(id: string | null, f: FileDoc): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try { requirePermission(user, 'media.upload'); } catch { return { success: false, error: 'Bu işlem için yetkiniz yok.' }; }
  if (!f.name?.trim()) return { success: false, error: 'Dosya adı zorunludur.' };
  const data = {
    name: f.name, category: f.category || null, format: f.format, sizeLabel: f.size || null,
    accessLevel: f.accessLevel, version: f.version, language: f.language, linkedTo: f.linkedTo ?? null,
    uploadedBy: f.uploadedBy || user!.name,
  };
  try {
    const persist = id && !isDraft(id);
    const row = persist ? await prisma.fileDoc.update({ where: { id }, data }) : await prisma.fileDoc.create({ data });
    await recordAuditLog({ actorId: user!.id, action: persist ? 'file.update' : 'file.create', entityType: 'file_doc', entityId: row.id });
    revalidatePath('/dosya-merkezi');
    return { success: true, data: row };
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Kaydetme başarısız oldu.' }; }
}

export async function deleteFileDoc(id: string): Promise<ActionResult> {
  const user = await resolveCurrentUser();
  try { requirePermission(user, 'media.delete'); } catch { return { success: false, error: 'Bu işlem için yetkiniz yok.' }; }
  await prisma.fileDoc.update({ where: { id }, data: { deletedAt: new Date() } });
  await recordAuditLog({ actorId: user!.id, action: 'file.delete', entityType: 'file_doc', entityId: id });
  revalidatePath('/dosya-merkezi');
  return { success: true };
}
