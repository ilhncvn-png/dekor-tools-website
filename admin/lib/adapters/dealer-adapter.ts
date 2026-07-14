import type { Dealer } from '@/lib/mock-data';
import type { DealerInput } from '@/lib/validation/dealer';

// Maps a database Dealer (with translations) to the exact `Dealer` shape the
// admin screen consumes, and back. The application-workflow status
// (onaylandi/inceleniyor/reddedildi) maps onto ContentStatus.

type DbDealer = {
  id: string;
  slug: string;
  status: string;
  country: string;
  city: string | null;
  region: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  contactName: string | null;
  volume: string | null;
  assignedTo: string | null;
  listedOnWebsite: boolean;
  contractSigned: boolean;
  notes: string | null;
  logoMediaId: string | null;
  source: string;
  categories: string[];
  partnerSince: string | null;
  directoryStatus: string | null;
  createdAt: Date;
  translations: { languageCode: string; name: string; address: string | null }[];
};

const DB_TO_UI_STATUS: Record<string, Dealer['status']> = {
  PUBLISHED: 'onaylandi',
  IN_REVIEW: 'inceleniyor',
  DRAFT: 'inceleniyor',
  ARCHIVED: 'reddedildi',
  UNPUBLISHED: 'reddedildi',
};

export const UI_TO_DB_STATUS: Record<Dealer['status'], 'PUBLISHED' | 'IN_REVIEW' | 'ARCHIVED'> = {
  onaylandi: 'PUBLISHED',
  inceleniyor: 'IN_REVIEW',
  reddedildi: 'ARCHIVED',
};

function slugifyTr(input: string): string {
  const map: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', İ: 'i' };
  return (
    input.trim().replace(/[çğıöşüİ]/g, (c) => map[c] ?? c).toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'bayi'
  );
}

export function dealerSlug(company: string, id: string): string {
  return `${slugifyTr(company)}-${id.slice(0, 6)}`;
}

export function toUiDealer(db: DbDealer): Dealer {
  const tr = db.translations.find((t) => t.languageCode === 'tr') ?? db.translations[0];
  return {
    id: db.id,
    company: tr?.name ?? '(isimsiz)',
    country: db.country,
    region: db.region ?? '',
    contact: db.contactName ?? '',
    email: db.email ?? '',
    phone: db.phone ?? '',
    address: tr?.address ?? '',
    website: db.website ?? '',
    status: DB_TO_UI_STATUS[db.status] ?? 'inceleniyor',
    submittedAt: db.createdAt.toISOString().slice(0, 10),
    volume: db.volume ?? '',
    assignedTo: db.assignedTo ?? '',
    listedOnWebsite: db.listedOnWebsite,
    contractSigned: db.contractSigned,
    notes: db.notes ?? '',
    logo: db.logoMediaId,
    source: db.source === 'basvuru' ? 'basvuru' : 'manuel',
    city: db.city ?? undefined,
    categories: db.categories,
    partnerSince: db.partnerSince ?? undefined,
    directoryStatus: (db.directoryStatus as Dealer['directoryStatus']) ?? undefined,
  };
}

export function toDealerInput(ui: Dealer): DealerInput {
  return {
    company: ui.company,
    country: ui.country,
    region: ui.region || null,
    city: ui.city || null,
    contactName: ui.contact || null,
    email: ui.email || null,
    phone: ui.phone || null,
    address: ui.address || null,
    website: ui.website || null,
    volume: ui.volume || null,
    assignedTo: ui.assignedTo || null,
    listedOnWebsite: ui.listedOnWebsite,
    contractSigned: ui.contractSigned,
    notes: ui.notes || null,
    logoMediaId: ui.logo ?? null,
    source: ui.source === 'basvuru' ? 'basvuru' : 'manuel',
    categories: ui.categories ?? [],
    partnerSince: ui.partnerSince || null,
    directoryStatus: ui.directoryStatus || null,
  };
}
