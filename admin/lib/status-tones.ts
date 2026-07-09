import type { SemanticTone } from './design-tokens';

/** Central status → (tone, label) maps so every module's Badge reads the same. */
export const productStatusTone: Record<string, { tone: SemanticTone | 'neutral'; label: string }> = {
  yayinda: { tone: 'success', label: 'Yayında' },
  taslak: { tone: 'neutral', label: 'Taslak' },
  arsiv: { tone: 'warning', label: 'Arşiv' },
};

export const pageStatusTone: Record<string, { tone: SemanticTone | 'neutral'; label: string }> = {
  yayinda: { tone: 'success', label: 'Yayında' },
  taslak: { tone: 'neutral', label: 'Taslak' },
  inceleme: { tone: 'warning', label: 'İncelemede' },
};

export const dealerStatusTone: Record<string, { tone: SemanticTone | 'neutral'; label: string }> = {
  onaylandi: { tone: 'success', label: 'Onaylandı' },
  inceleniyor: { tone: 'warning', label: 'İnceleniyor' },
  reddedildi: { tone: 'danger', label: 'Reddedildi' },
};

export const submissionStatusTone: Record<string, { tone: SemanticTone | 'neutral'; label: string }> = {
  yeni: { tone: 'info', label: 'Yeni' },
  yanitlandi: { tone: 'success', label: 'Yanıtlandı' },
  kapatildi: { tone: 'neutral', label: 'Kapatıldı' },
};

export const submissionTypeLabel: Record<string, string> = {
  iletisim: 'İletişim',
  sikayet: 'Şikayet',
  fikir: 'Fikir',
  kariyer: 'Kariyer',
  bayi: 'Bayilik',
};

export const certificateStatusTone: Record<string, { tone: SemanticTone | 'neutral'; label: string }> = {
  gecerli: { tone: 'success', label: 'Geçerli' },
  yenileniyor: { tone: 'warning', label: 'Yenileniyor' },
  'suresi-doldu': { tone: 'danger', label: 'Süresi Doldu' },
};

export const seoStatusTone: Record<string, { tone: SemanticTone | 'neutral'; label: string }> = {
  iyi: { tone: 'success', label: 'İyi' },
  uyari: { tone: 'warning', label: 'Uyarı' },
  eksik: { tone: 'danger', label: 'Eksik' },
};

export const userStatusTone: Record<string, { tone: SemanticTone | 'neutral'; label: string }> = {
  aktif: { tone: 'success', label: 'Aktif' },
  'davet-edildi': { tone: 'info', label: 'Davet Edildi' },
  pasif: { tone: 'neutral', label: 'Pasif' },
};
