'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, BadgeCheck, Calendar, BellRing, Trash2, X, Home, Package, ChevronUp, ChevronDown, Download, Settings2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { CertificateDrawer } from '@/components/certificates/CertificateDrawer';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { type Certificate } from '@/lib/mock-data';
import { getAdminCertificates, saveCertificate, deleteCertificate } from '@/lib/actions/misc-content-actions';
import { certificateStatusTone } from '@/lib/status-tones';

const reminderTone: Record<string, { tone: 'warning' | 'danger'; label: string }> = {
  planlandi: { tone: 'warning', label: 'Yenileme Planlandı' },
  gecikti: { tone: 'danger', label: 'Hatırlatma Gecikti' },
};

export default function SertifikalarPage() {
  const { push } = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeCert, setActiveCert] = useState<Certificate | null>(null);
  const [items, setItems] = useState<Certificate[]>([]);

  const loadCerts = useCallback(async () => {
    try {
      setItems(await getAdminCertificates());
    } catch {
      push({ tone: 'danger', title: 'Sertifikalar yüklenemedi', description: 'Veritabanına bağlanılamadı.' });
    }
  }, [push]);

  useEffect(() => {
    loadCerts();
  }, [loadCerts]);
  const [badgeStyle, setBadgeStyle] = useState('renkli');
  const [homepageLayout, setHomepageLayout] = useState('serit');
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function move(index: number, direction: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((c, i) => ({ ...c, order: i + 1 }));
    });
  }

  function addCertificate() {
    const newCert: Certificate = {
      id: `new-${Date.now()}`,
      name: 'Yeni Sertifika',
      issuer: '',
      status: 'gecerli',
      issuedAt: new Date().toISOString().slice(0, 10),
      validUntil: new Date().toISOString().slice(0, 10),
      scope: '',
      reminder: 'yok',
      showOnHomepage: false,
      showOnProductPages: false,
      file: null,
      order: items.length + 1,
      downloadEnabled: false,
      category: 'Kalite',
    };
    setItems((prev) => [...prev, newCert]);
    setActiveCert(newCert);
  }

  async function updateCertificate(updated: Certificate) {
    const result = await saveCertificate(updated.id, updated);
    if (!result.success) { push({ tone: 'danger', title: 'Kaydedilemedi', description: result.error }); return; }
    await loadCerts();
    setActiveCert(null);
  }

  async function confirmBulkDelete() {
    const ids = [...selected];
    setSelected(new Set());
    setBulkDeleteOpen(false);
    // Only persisted rows (cuid ids, no dash) hit the delete action; unsaved drafts just drop.
    await Promise.all(ids.filter((id) => !id.includes('-')).map((id) => deleteCertificate(id)));
    push({ tone: 'danger', title: `${ids.length} sertifika silindi` });
    await loadCerts();
  }

  if (items.length === 0) {
    return (
      <ContentContainer>
        <PageHeader
          title="Sertifikalar"
          description="ISO, CE ve diğer uygunluk belgeleri."
          actions={<Button icon={<Plus size={15} />} onClick={addCertificate}>Sertifika Ekle</Button>}
        />
        <EmptyState icon={BadgeCheck} title="Henüz sertifika yok" description="İlk uygunluk belgenizi ekleyerek başlayın." />
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      <PageHeader
        title="Sertifikalar"
        description="ISO, CE ve diğer uygunluk belgeleri."
        actions={<Button icon={<Plus size={15} />} onClick={addCertificate}>Sertifika Ekle</Button>}
      />

      <Card className="mb-4 p-5">
        <h2 className="mb-3 flex items-center gap-1.5 font-display text-heading-sm text-near-black dark:text-white">
          <Settings2 size={15} /> Görüntüleme Ayarları
        </h2>
        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
          <div>
            <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Rozet Stili</p>
            <Select value={badgeStyle} onChange={(e) => setBadgeStyle(e.target.value)}>
              <option value="renkli">Renkli Rozet</option>
              <option value="mono">Tek Renk (Mono)</option>
              <option value="metin">Sadece Metin</option>
            </Select>
          </div>
          <div>
            <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Ana Sayfa Düzeni</p>
            <Select value={homepageLayout} onChange={(e) => setHomepageLayout(e.target.value)}>
              <option value="serit">Yatay Kayan Şerit</option>
              <option value="grid">Sabit Grid</option>
              <option value="carousel">Carousel</option>
            </Select>
          </div>
        </div>
      </Card>

      {selected.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-soft border border-red/20 bg-red/5 px-4 py-2.5 dark:border-red-eyebrow/20 dark:bg-red/10">
          <span className="text-[13px] font-medium text-near-black dark:text-white">{selected.size} sertifika seçildi</span>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" icon={<Trash2 size={13} />} className="text-danger hover:bg-danger-soft" onClick={() => setBulkDeleteOpen(true)}>Sil</Button>
            <button type="button" onClick={() => setSelected(new Set())} className="ml-1 rounded-soft p-1.5 text-steel hover:bg-mist dark:text-white/40 dark:hover:bg-white/5" aria-label="Seçimi temizle">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
        {items.map((cert, index) => {
          const info = certificateStatusTone[cert.status];
          return (
            <Card key={cert.id} interactive className="p-5" onClick={() => setActiveCert(cert)}>
              <div className="flex items-start justify-between">
                <span onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={selected.has(cert.id)} onChange={() => toggleOne(cert.id)} />
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-soft bg-info-soft text-info">
                  <BadgeCheck size={19} strokeWidth={1.8} />
                </div>
                <Badge tone={info.tone} dot>{info.label}</Badge>
              </div>
              <h3 className="mt-3 font-display text-heading-sm text-near-black dark:text-white">{cert.name}</h3>
              <p className="mt-1 text-body-sm text-steel dark:text-white/50">{cert.scope}</p>

              <div className="mt-3 flex items-center gap-1.5">
                {cert.showOnHomepage && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-soft bg-info-soft text-info" title="Ana sayfada gösteriliyor">
                    <Home size={11} />
                  </span>
                )}
                {cert.showOnProductPages && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-soft bg-ai-soft text-ai" title="Ürün sayfalarında gösteriliyor">
                    <Package size={11} />
                  </span>
                )}
                {cert.downloadEnabled && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-soft bg-success-soft text-success" title="İndirme butonu aktif">
                    <Download size={11} />
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[12px] text-steel dark:border-white/[.06] dark:text-white/40">
                <span>{cert.issuer}</span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {cert.validUntil}
                </span>
              </div>
              {cert.reminder !== 'yok' && (
                <div className="mt-3">
                  <Badge tone={reminderTone[cert.reminder].tone} dot>
                    <BellRing size={10} className="mr-0.5 inline" />
                    {reminderTone[cert.reminder].label}
                  </Badge>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between border-t border-border pt-3 dark:border-white/[.06]" onClick={(e) => e.stopPropagation()}>
                <span className="text-[11px] text-steel dark:text-white/40">Sıra: {cert.order}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="flex h-6 w-6 items-center justify-center rounded-soft text-steel hover:bg-mist disabled:opacity-30 dark:text-white/40 dark:hover:bg-white/5"
                    aria-label="Yukarı taşı"
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1}
                    className="flex h-6 w-6 items-center justify-center rounded-soft text-steel hover:bg-mist disabled:opacity-30 dark:text-white/40 dark:hover:bg-white/5"
                    aria-label="Aşağı taşı"
                  >
                    <ChevronDown size={13} />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <CertificateDrawer certificate={activeCert} onClose={() => setActiveCert(null)} onUpdate={updateCertificate} />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title={`${selected.size} sertifikayı sil`}
        description={<>Seçili {selected.size} sertifikayı kalıcı olarak silmek üzeresiniz.</>}
        consequences={
          items.filter((c) => selected.has(c.id) && c.downloadEnabled).length > 0
            ? ['İndirme sayfalarındaki ilgili bağlantılar da kaldırılacak']
            : undefined
        }
        confirmLabel="Sertifikaları Sil"
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />
    </ContentContainer>
  );
}
