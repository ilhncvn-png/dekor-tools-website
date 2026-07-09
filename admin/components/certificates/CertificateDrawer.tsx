'use client';

import { useEffect, useState } from 'react';
import { Save, Home, Package, FileWarning, BellRing, Calendar } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { fileDocs, type Certificate } from '@/lib/mock-data';
import { certificateStatusTone } from '@/lib/status-tones';
import { useToast } from '@/components/ui/Toast';
import { FilePickerModal } from '@/components/files/FilePickerModal';

const reminderTone: Record<string, { tone: 'warning' | 'danger'; label: string }> = {
  planlandi: { tone: 'warning', label: 'Yenileme Planlandı' },
  gecikti: { tone: 'danger', label: 'Hatırlatma Gecikti' },
};

interface CertificateDrawerProps {
  certificate: Certificate | null;
  onClose: () => void;
  onUpdate?: (updated: Certificate) => void;
}

/** Full certificate editor drawer — validity window, website placement, download toggle; the real "client manages a certificate" interface. */
export function CertificateDrawer({ certificate, onClose, onUpdate }: CertificateDrawerProps) {
  const { push } = useToast();
  const [display, setDisplay] = useState(certificate);
  const [form, setForm] = useState(certificate);
  const [filePickerOpen, setFilePickerOpen] = useState(false);

  useEffect(() => {
    if (certificate) {
      setDisplay(certificate);
      setForm(certificate);
    }
  }, [certificate]);

  if (!display || !form) return null;

  const statusInfo = certificateStatusTone[form.status];

  function field<K extends keyof Certificate>(key: K, value: Certificate[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function saveChanges() {
    if (!form) return;
    onUpdate?.(form);
    setDisplay(form);
    push({ tone: 'success', title: 'Sertifika kaydedildi', description: `${form.name} güncellendi.` });
  }

  return (
    <Drawer
      open={Boolean(certificate)}
      onClose={onClose}
      title={display.name}
      description={display.issuer}
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            disabled={!display.file}
            onClick={() => push({ tone: 'info', title: 'Belge indiriliyor', description: fileDocs.find((f) => f.id === display.file)?.name ?? display.name })}
          >
            Belgeyi Görüntüle
          </Button>
          <Button icon={<Save size={14} />} className="flex-1" onClick={saveChanges}>Kaydet</Button>
        </div>
      }
    >
      <div>
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Sertifika Adı</p>
        <Input value={form.name} onChange={(e) => field('name', e.target.value)} />
      </div>

      <div className="mt-3">
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Kapsam</p>
        <Input value={form.scope} onChange={(e) => field('scope', e.target.value)} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge tone={statusInfo.tone} dot>{statusInfo.label}</Badge>
        {!display.file && (
          <Badge tone="danger">
            <FileWarning size={10} className="mr-1 inline" />
            Belge Dosyası Eksik
          </Badge>
        )}
      </div>

      <button
        type="button"
        onClick={() => setFilePickerOpen(true)}
        className="mt-3 flex w-full items-center gap-2 rounded-soft border border-border px-3 py-2 text-left transition-colors hover:border-red/30 dark:border-white/[.06] dark:hover:border-red-eyebrow/30"
      >
        <FileWarning size={13} className={form.file ? 'text-success' : 'text-steel dark:text-white/25'} />
        <span className="truncate text-[12px] text-near-black dark:text-white/85">
          {form.file ? fileDocs.find((f) => f.id === form.file)?.name ?? form.file : 'Sertifika belgesi seçilmedi — seçmek için tıklayın'}
        </span>
      </button>

      <FilePickerModal
        open={filePickerOpen}
        onClose={() => setFilePickerOpen(false)}
        onSelect={(file) => {
          field('file', file.id);
          push({ tone: 'success', title: 'Belge eklendi', description: file.name });
        }}
      />

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
          <p className="flex items-center gap-1 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">
            <Calendar size={10} /> Veriliş Tarihi
          </p>
          <Input type="date" className="mt-1" value={form.issuedAt} onChange={(e) => field('issuedAt', e.target.value)} />
        </div>
        <div className="rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
          <p className="flex items-center gap-1 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">
            <Calendar size={10} /> Geçerlilik Sonu
          </p>
          <Input type="date" className="mt-1" value={form.validUntil} onChange={(e) => field('validUntil', e.target.value)} />
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">Web Sitesinde Görünürlük</p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between rounded-soft border border-border px-3 py-2 dark:border-white/[.06]">
            <span className="flex items-center gap-1.5 text-[12.5px] text-near-black dark:text-white/80">
              <Home size={12} /> Ana Sayfa
            </span>
            <Switch checked={form.showOnHomepage} onChange={(v) => field('showOnHomepage', v)} label="Ana sayfada göster" />
          </div>
          <div className="flex items-center justify-between rounded-soft border border-border px-3 py-2 dark:border-white/[.06]">
            <span className="flex items-center gap-1.5 text-[12.5px] text-near-black dark:text-white/80">
              <Package size={12} /> Ürün Sayfaları
            </span>
            <Switch checked={form.showOnProductPages} onChange={(v) => field('showOnProductPages', v)} label="Ürün sayfalarında göster" />
          </div>
          <div className="flex items-center justify-between rounded-soft border border-border px-3 py-2 dark:border-white/[.06]">
            <span className="text-[12.5px] text-near-black dark:text-white/80">İndirme İzni</span>
            <Switch checked={form.downloadEnabled} onChange={(v) => field('downloadEnabled', v)} label="İndirme izni" />
          </div>
        </div>
      </div>

      {display.reminder !== 'yok' && (
        <div className="mt-4 flex items-center gap-2 rounded-soft bg-warning-soft px-3 py-2.5 text-[12.5px] text-warning">
          <BellRing size={14} className="shrink-0" />
          {reminderTone[display.reminder].label}
        </div>
      )}
    </Drawer>
  );
}
