'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import type { GlobalBanner } from '@/lib/mock-data';
import { useToast } from '@/components/ui/Toast';

const ALL_PLACEMENTS = ['Ana Sayfa', 'Ürünler', 'Üretim', 'İhracat', 'Ürün Detayı', 'Destek Merkezi', 'Tüm Sayfalar'];

interface BannerDrawerProps {
  banner: GlobalBanner | null;
  onClose: () => void;
  onUpdate?: (updated: GlobalBanner) => void;
}

/** Full global banner/CTA editor — one edit updates every real page it's placed on. */
export function BannerDrawer({ banner, onClose, onUpdate }: BannerDrawerProps) {
  const { push } = useToast();
  const [form, setForm] = useState(banner);

  useEffect(() => {
    if (banner) setForm(banner);
  }, [banner]);

  if (!form) return null;

  function field<K extends keyof GlobalBanner>(key: K, value: GlobalBanner[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function togglePlacement(place: string) {
    if (!form) return;
    const has = form.placements.includes(place);
    field('placements', has ? form.placements.filter((p) => p !== place) : [...form.placements, place]);
  }

  function saveChanges() {
    if (!form) return;
    onUpdate?.(form);
    push({ tone: 'success', title: 'Banner kaydedildi', description: `${form.placements.length} sayfada güncellendi.` });
  }

  return (
    <Drawer
      open={Boolean(banner)}
      onClose={onClose}
      title={form.name}
      description={form.type}
      footer={<Button icon={<Save size={14} />} className="w-full" onClick={saveChanges}>Kaydet</Button>}
    >
      <div>
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Ad</p>
        <Input value={form.name} onChange={(e) => field('name', e.target.value)} />
      </div>

      <div className="mt-3">
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Mesaj</p>
        <Textarea rows={2} value={form.message} onChange={(e) => field('message', e.target.value)} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Buton Metni</p>
          <Input value={form.buttonLabel} onChange={(e) => field('buttonLabel', e.target.value)} />
        </div>
        <div>
          <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Bağlantı</p>
          <Input value={form.buttonHref} onChange={(e) => field('buttonHref', e.target.value)} />
        </div>
      </div>

      <div className="mt-3">
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Tür</p>
        <Select value={form.type} onChange={(e) => field('type', e.target.value as GlobalBanner['type'])}>
          <option value="Banner">Banner</option>
          <option value="CTA">CTA</option>
        </Select>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">Görüntülenecek Sayfalar</p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_PLACEMENTS.map((place) => (
            <button
              key={place}
              type="button"
              onClick={() => togglePlacement(place)}
              className={
                form.placements.includes(place)
                  ? 'rounded-soft bg-red px-2.5 py-1 text-[11.5px] font-medium text-white'
                  : 'rounded-soft border border-border px-2.5 py-1 text-[11.5px] text-steel hover:bg-mist dark:border-white/10 dark:text-white/50 dark:hover:bg-white/5'
              }
            >
              {place}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <Badge tone={form.active ? 'success' : 'neutral'} dot>{form.active ? 'Aktif' : 'Pasif'}</Badge>
      </div>
    </Drawer>
  );
}
