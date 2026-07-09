'use client';

import { useEffect, useState } from 'react';
import { Save, Image as ImageIcon, PlayCircle, Ruler, Link2, AlertTriangle, Crop, RefreshCw, Trash2 } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { MediaItem } from '@/lib/mock-data';
import { useToast } from '@/components/ui/Toast';

const optimizationTone: Record<MediaItem['optimizationStatus'], { tone: 'success' | 'warning' | 'neutral'; label: string }> = {
  optimized: { tone: 'success', label: 'Optimize Edildi' },
  gerekli: { tone: 'warning', label: 'Optimizasyon Gerekli' },
  desteklenmiyor: { tone: 'neutral', label: 'Optimizasyon Yok (Video)' },
};

interface MediaDrawerProps {
  item: MediaItem | null;
  onClose: () => void;
  onRequestDelete?: (item: MediaItem) => void;
  onUpdate?: (updated: MediaItem) => void;
}

/** Full media editor drawer — title/ALT/caption/rename, replace, crop, download, usage tracking, delete. */
export function MediaDrawer({ item, onClose, onRequestDelete, onUpdate }: MediaDrawerProps) {
  const { push } = useToast();
  const [display, setDisplay] = useState(item);
  const [form, setForm] = useState(item);

  useEffect(() => {
    if (item) {
      setDisplay(item);
      setForm(item);
    }
  }, [item]);

  if (!display || !form) return null;

  const optInfo = optimizationTone[form.optimizationStatus];

  function field<K extends keyof MediaItem>(key: K, value: MediaItem[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function saveChanges() {
    if (!form) return;
    onUpdate?.(form);
    setDisplay(form);
    push({ tone: 'success', title: 'Medya bilgileri kaydedildi', description: `${form.title} güncellendi.` });
  }

  function replaceFile() {
    if (!form) return;
    const updated: MediaItem = { ...form, updatedAt: new Date().toISOString().slice(0, 10) };
    onUpdate?.(updated);
    setDisplay(updated);
    push({ tone: 'success', title: 'Dosya değiştirildi', description: 'Bu görseli kullanan tüm sayfalar otomatik güncellendi.' });
  }

  function cropImage() {
    if (!display) return;
    push({ tone: 'info', title: 'Kırpma aracı açılıyor', description: display.name });
  }

  function downloadFile() {
    if (!display) return;
    push({ tone: 'info', title: 'İndiriliyor', description: display.name });
  }

  return (
    <Drawer
      open={Boolean(item)}
      onClose={onClose}
      title={display.name}
      description={display.folder}
      footer={
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Button variant="secondary" className="flex-1" onClick={downloadFile}>İndir</Button>
            <Button icon={<Save size={14} />} className="flex-1" onClick={saveChanges}>Kaydet</Button>
          </div>
          <div className="flex items-center justify-between gap-2">
            {display.type === 'image' && (
              <Button variant="ghost" size="sm" icon={<Crop size={13} />} className="flex-1" onClick={cropImage}>Kırp</Button>
            )}
            <Button variant="ghost" size="sm" icon={<RefreshCw size={13} />} className="flex-1" onClick={replaceFile}>Değiştir</Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 size={13} />}
              className="flex-1 text-danger hover:bg-danger-soft"
              onClick={() => onRequestDelete?.(display)}
            >
              Sil
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex h-40 items-center justify-center rounded-soft text-white/80" style={{ backgroundColor: display.swatch }}>
        {display.type === 'video' ? <PlayCircle size={30} strokeWidth={1.3} /> : <ImageIcon size={30} strokeWidth={1.3} />}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge tone="neutral">{display.type === 'video' ? 'Video' : 'Görsel'}</Badge>
        <Badge tone={optInfo.tone}>{optInfo.label}</Badge>
        {!form.altText && display.type === 'image' && (
          <Badge tone="danger">
            <AlertTriangle size={10} className="mr-1 inline" />
            ALT Metni Eksik
          </Badge>
        )}
      </div>

      <div className="mt-4">
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Dosya Adı (SEO)</p>
        <Input value={form.name} onChange={(e) => field('name', e.target.value)} />
      </div>

      <div className="mt-3">
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Başlık</p>
        <Input value={form.title} onChange={(e) => field('title', e.target.value)} />
      </div>

      {display.type === 'image' && (
        <div className="mt-3">
          <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">ALT Metni</p>
          <Input value={form.altText ?? ''} onChange={(e) => field('altText', e.target.value || null)} placeholder="Erişilebilirlik ve SEO için ALT metni girin" />
        </div>
      )}

      <div className="mt-3">
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Açıklama / Caption</p>
        <Textarea rows={2} value={form.caption ?? ''} onChange={(e) => field('caption', e.target.value || null)} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
          <p className="flex items-center gap-1 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">
            <Ruler size={10} /> Boyutlar
          </p>
          <p className="mt-0.5 text-body-sm font-medium tabular-nums text-near-black dark:text-white">{display.dimensions}</p>
        </div>
        <div className="rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
          <p className="text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">Dosya Boyutu</p>
          <p className="mt-0.5 text-body-sm font-medium tabular-nums text-near-black dark:text-white">{display.size}</p>
        </div>
      </div>

      <div className="mt-4 rounded-soft border border-border px-3 py-2.5 dark:border-white/[.06]">
        <p className="mb-2 flex items-center gap-1 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">
          <Link2 size={10} /> Kullanıldığı Yerler
        </p>
        {display.usedIn.length === 0 ? (
          <p className="text-body-sm text-steel dark:text-white/50">Hiçbir yerde kullanılmıyor — güvenle silinebilir.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {display.usedIn.map((place) => (
              <li key={place} className="text-body-sm text-near-black dark:text-white/85">
                {place}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-4 text-[11.5px] text-steel dark:text-white/40">
        {display.uploadedBy} tarafından yüklendi · {display.updatedAt}
      </p>
    </Drawer>
  );
}
