'use client';

import { useEffect, useState } from 'react';
import { Save, Download, Link2, Lock, Globe2, RefreshCw, History } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { FileDoc } from '@/lib/mock-data';
import { useToast } from '@/components/ui/Toast';

const accessTone: Record<FileDoc['accessLevel'], { tone: 'success' | 'warning' | 'danger'; label: string }> = {
  'herkese-acik': { tone: 'success', label: 'Herkese Açık' },
  'sadece-bayi': { tone: 'warning', label: 'Sadece Bayi' },
  'sadece-yonetici': { tone: 'danger', label: 'Sadece Yönetici' },
};

const formatTone: Record<FileDoc['format'], 'danger' | 'success' | 'info'> = { PDF: 'danger', XLSX: 'success', DOCX: 'info' };

function nextVersion(version: string): string {
  const n = Number(version.replace(/[^\d]/g, ''));
  return Number.isFinite(n) && n > 0 ? `v${n + 1}` : 'v2';
}

interface FileDrawerProps {
  file: FileDoc | null;
  onClose: () => void;
  onUpdate?: (updated: FileDoc) => void;
}

/** Full document editor drawer — rename, access level, replace file (with version history), download, usage tracking. */
export function FileDrawer({ file, onClose, onUpdate }: FileDrawerProps) {
  const { push } = useToast();
  const [display, setDisplay] = useState(file);
  const [form, setForm] = useState(file);

  useEffect(() => {
    if (file) {
      setDisplay(file);
      setForm(file);
    }
  }, [file]);

  if (!display || !form) return null;

  const access = accessTone[form.accessLevel];
  const history = form.versionHistory ?? [{ version: form.version, date: form.updatedAt, uploadedBy: form.uploadedBy }];

  function field<K extends keyof FileDoc>(key: K, value: FileDoc[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function saveChanges() {
    if (!form) return;
    onUpdate?.(form);
    setDisplay(form);
    push({ tone: 'success', title: 'Dosya bilgileri kaydedildi', description: `${form.name} güncellendi.` });
  }

  function replaceFile() {
    if (!form) return;
    const today = new Date().toISOString().slice(0, 10);
    const updated: FileDoc = {
      ...form,
      version: nextVersion(form.version),
      updatedAt: today,
      versionHistory: [...history, { version: nextVersion(form.version), date: today, uploadedBy: 'Selin Arslan' }],
    };
    setForm(updated);
    onUpdate?.(updated);
    setDisplay(updated);
    push({ tone: 'success', title: 'Dosya değiştirildi', description: `Yeni sürüm: ${updated.version}` });
  }

  function downloadFile() {
    if (!display) return;
    push({ tone: 'info', title: 'İndiriliyor', description: `${display.name} (${display.version})` });
  }

  return (
    <Drawer
      open={Boolean(file)}
      onClose={onClose}
      title={display.name}
      description={`${display.category} · ${display.version}`}
      footer={
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Button variant="secondary" icon={<Download size={14} />} className="flex-1" onClick={downloadFile}>İndir</Button>
            <Button icon={<Save size={14} />} className="flex-1" onClick={saveChanges}>Kaydet</Button>
          </div>
          <Button variant="ghost" size="sm" icon={<RefreshCw size={13} />} onClick={replaceFile}>Dosyayı Değiştir (Yeni Sürüm)</Button>
        </div>
      }
    >
      <div>
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Dosya Adı</p>
        <Input value={form.name} onChange={(e) => field('name', e.target.value)} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Kategori</p>
          <Input value={form.category} onChange={(e) => field('category', e.target.value)} />
        </div>
        <div>
          <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Erişim Düzeyi</p>
          <Select value={form.accessLevel} onChange={(e) => field('accessLevel', e.target.value as FileDoc['accessLevel'])}>
            <option value="herkese-acik">Herkese Açık</option>
            <option value="sadece-bayi">Sadece Bayi</option>
            <option value="sadece-yonetici">Sadece Yönetici</option>
          </Select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge tone={formatTone[display.format]}>{display.format}</Badge>
        <Badge tone="neutral">{display.language}</Badge>
        <Badge tone={access.tone}>
          {form.accessLevel === 'herkese-acik' ? <Globe2 size={10} className="mr-1 inline" /> : <Lock size={10} className="mr-1 inline" />}
          {access.label}
        </Badge>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
          <p className="text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">Dosya Boyutu</p>
          <p className="mt-0.5 text-body-sm font-medium tabular-nums text-near-black dark:text-white">{display.size}</p>
        </div>
        <div className="rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
          <p className="text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">İndirme</p>
          <p className="mt-0.5 font-display text-heading-sm tabular-nums text-near-black dark:text-white">{display.downloads.toLocaleString('tr-TR')}</p>
        </div>
      </div>

      {display.linkedTo && (
        <div className="mt-4 rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
          <p className="flex items-center gap-1 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">
            <Link2 size={10} /> Bağlı Olduğu Bölüm
          </p>
          <p className="mt-0.5 text-body-sm font-medium text-near-black dark:text-white">{display.linkedTo}</p>
        </div>
      )}

      <div className="mt-4">
        <p className="mb-2 flex items-center gap-1.5 text-body-sm font-medium text-near-black dark:text-white/85">
          <History size={13} /> Sürüm Geçmişi
        </p>
        <div className="flex flex-col gap-2">
          {[...history].reverse().map((v) => (
            <div key={v.version} className="flex items-center justify-between rounded-soft border border-border px-3 py-2 dark:border-white/[.06]">
              <span className="font-mono text-[11px] font-semibold text-near-black dark:text-white">{v.version}</span>
              <span className="text-[11.5px] text-steel dark:text-white/40">{v.uploadedBy} · {v.date}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-[11.5px] text-steel dark:text-white/40">
        {display.uploadedBy} tarafından yüklendi · {display.updatedAt}
      </p>
    </Drawer>
  );
}
