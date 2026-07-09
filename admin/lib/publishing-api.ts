import type { HomepageSection, PublishStatus, RevisionEntry, RevisionSnapshot } from '@/lib/mock-data';

/**
 * Publishing/versioning API contract for section-based content (Homepage,
 * Manufacturing, About, Export, every page builder that uses
 * SectionListEditor + SectionEditorDrawer).
 *
 * This module is the boundary a real backend will sit behind — every
 * function here is async, returns a fresh object (never mutates its
 * input), and is shaped like the eventual REST/tRPC contract:
 *
 *   PATCH /api/sections/:id/publish     -> PublishSectionResponse
 *   PATCH /api/sections/:id/unpublish   -> PublishSectionResponse
 *   PATCH /api/sections/:id/schedule    -> PublishSectionResponse
 *   POST  /api/sections/:id/archive     -> PublishSectionResponse
 *   POST  /api/sections/:id/revisions/:revisionId/restore -> PublishSectionResponse
 *
 * Today it operates on the in-memory HomepageSection object passed in
 * (mock data as transport layer); swapping in real HTTP calls later means
 * changing only the function bodies below, not any calling component.
 */

const SIMULATED_LATENCY_MS = 350;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_LATENCY_MS));
}

function nowIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function snapshotOf(section: HomepageSection): RevisionSnapshot {
  return { eyebrow: section.eyebrow, title: section.title, subtitle: section.subtitle, description: section.description };
}

function nextRevision(section: HomepageSection, changeSummary: string, author: string): RevisionEntry {
  const existing = section.revisions ?? [];
  const nextVersion = existing.length + 1;
  return {
    id: `${section.id}-rev${nextVersion}-${Date.now()}`,
    versionLabel: `v${nextVersion}`,
    author,
    date: nowIso(),
    changeSummary,
    snapshot: snapshotOf(section),
  };
}

export interface PublishSectionRequest {
  section: HomepageSection;
  actor: string;
  changeSummary?: string;
}

export interface ScheduleSectionRequest extends PublishSectionRequest {
  scheduledAt: string;
}

export interface RestoreRevisionRequest {
  section: HomepageSection;
  revisionId: string;
  actor: string;
}

export interface PublishSectionResponse {
  section: HomepageSection;
}

function withPublishStatus(section: HomepageSection, status: PublishStatus, actor: string, changeSummary: string): HomepageSection {
  const revision = nextRevision(section, changeSummary, actor);
  return {
    ...section,
    publishStatus: status,
    publicationStatus: status === 'yayinda' ? 'yayinda' : 'taslak',
    lastPublishedAt: status === 'yayinda' ? nowIso() : (section.lastPublishedAt ?? null),
    lastEdited: nowIso(),
    modifiedBy: actor,
    scheduledAt: status === 'zamanlandi' ? section.scheduledAt : null,
    revisions: [...(section.revisions ?? []), revision],
  };
}

/** PATCH /api/sections/:id/publish */
export async function publishSection({ section, actor, changeSummary = 'Yayınlandı.' }: PublishSectionRequest): Promise<PublishSectionResponse> {
  return delay({ section: withPublishStatus(section, 'yayinda', actor, changeSummary) });
}

/** PATCH /api/sections/:id/unpublish */
export async function unpublishSection({ section, actor, changeSummary = 'Yayından kaldırıldı, taslağa alındı.' }: PublishSectionRequest): Promise<PublishSectionResponse> {
  return delay({ section: withPublishStatus(section, 'taslak', actor, changeSummary) });
}

/** PATCH /api/sections/:id/schedule */
export async function scheduleSection({ section, actor, scheduledAt, changeSummary }: ScheduleSectionRequest): Promise<PublishSectionResponse> {
  const revision = nextRevision(section, changeSummary ?? `${scheduledAt} tarihine zamanlandı.`, actor);
  return delay({
    section: {
      ...section,
      publishStatus: 'zamanlandi',
      publicationStatus: 'taslak',
      scheduledAt,
      lastEdited: nowIso(),
      modifiedBy: actor,
      revisions: [...(section.revisions ?? []), revision],
    },
  });
}

/** POST /api/sections/:id/archive */
export async function archiveSection({ section, actor, changeSummary = 'Arşivlendi.' }: PublishSectionRequest): Promise<PublishSectionResponse> {
  return delay({ section: withPublishStatus(section, 'arsivlendi', actor, changeSummary) });
}

/** POST /api/sections/:id/revisions/:revisionId/restore */
export async function restoreRevision({ section, revisionId, actor }: RestoreRevisionRequest): Promise<PublishSectionResponse> {
  const target = (section.revisions ?? []).find((r) => r.id === revisionId);
  const changeSummary = target ? `${target.versionLabel} sürümüne geri alındı.` : 'Önceki sürüme geri alındı.';
  const revision = nextRevision(section, changeSummary, actor);
  return delay({
    section: {
      ...section,
      lastEdited: nowIso(),
      modifiedBy: actor,
      revisions: [...(section.revisions ?? []), revision],
    },
  });
}

export function resolvePublishStatus(section: HomepageSection): PublishStatus {
  if (section.publishStatus) return section.publishStatus;
  return section.publicationStatus === 'yayinda' ? 'yayinda' : 'taslak';
}

export function resolveRevisions(section: HomepageSection): RevisionEntry[] {
  if (section.revisions && section.revisions.length > 0) return section.revisions;
  return [{ id: `${section.id}-rev1`, versionLabel: 'v1', author: section.modifiedBy ?? 'Sistem', date: section.lastEdited, changeSummary: 'İlk yayın sürümü.' }];
}

export const publishStatusLabel: Record<PublishStatus, string> = {
  taslak: 'Taslak',
  zamanlandi: 'Zamanlandı',
  yayinda: 'Yayında',
  arsivlendi: 'Arşivlendi',
};

export const publishStatusTone: Record<PublishStatus, 'neutral' | 'info' | 'success' | 'warning'> = {
  taslak: 'neutral',
  zamanlandi: 'info',
  yayinda: 'success',
  arsivlendi: 'warning',
};
