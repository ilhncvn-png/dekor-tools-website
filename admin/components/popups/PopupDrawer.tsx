'use client';

import { useEffect, useState } from 'react';
import { Save, Eye } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import type { PopupRule } from '@/lib/mock-data';
import { useToast } from '@/components/ui/Toast';

interface PopupDrawerProps {
  popup: PopupRule | null;
  onClose: () => void;
  onUpdate?: (updated: PopupRule) => void;
}

const ALL_PAGES = ['Tüm Sayfalar', 'Ana Sayfa', 'Ürünler', 'Üretim', 'İhracat', 'Bayi Ol', 'Kariyer', 'İletişim'];

/** Full popup/banner rule editor — type, trigger, delay, target pages, enable/disable, live preview. */
export function PopupDrawer({ popup, onClose, onUpdate }: PopupDrawerProps) {
  const { push } = useToast();
  const [form, setForm] = useState(popup);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (popup) {
      setForm(popup);
      setPreviewOpen(false);
    }
  }, [popup]);

  if (!form) return null;

  function field<K extends keyof PopupRule>(key: K, value: PopupRule[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function togglePage(page: string) {
    if (!form) return;
    const has = form.pages.includes(page);
    field('pages', has ? form.pages.filter((p) => p !== page) : [...form.pages, page]);
  }

  function saveChanges() {
    if (!form) return;
    onUpdate?.(form);
    push({ tone: 'success', title: 'Popup kaydedildi', description: `${form.name} güncellendi.` });
  }

  return (
    <Drawer
      open={Boolean(popup)}
      onClose={onClose}
      title={form.name || 'Popup'}
      description={form.type}
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button variant="secondary" icon={<Eye size={14} />} className="flex-1" onClick={() => setPreviewOpen((v) => !v)}>
            {previewOpen ? 'Önizlemeyi Kapat' : 'Önizle'}
          </Button>
          <Button icon={<Save size={14} />} className="flex-1" onClick={saveChanges}>Kaydet</Button>
        </div>
      }
    >
      <div>
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Ad</p>
        <Input value={form.name} onChange={(e) => field('name', e.target.value)} />
      </div>

      {previewOpen && (
        <div className="mt-3 flex flex-col items-center gap-2 rounded-soft border border-dashed border-border bg-mist p-6 text-center dark:border-white/10 dark:bg-white/[.03]">
          <p className="font-display text-heading-sm text-near-black dark:text-white">{form.name}</p>
          <p className="text-[12px] text-steel dark:text-white/50">
            {form.trigger === 'gecikme' ? `${form.delaySeconds} saniye sonra görünür` : form.trigger === 'her-zaman' ? 'Sayfa açılışında görünür' : form.trigger === 'cikis-niyeti' ? 'Çıkış niyeti algılanınca görünür' : 'Sayfa yüklenince görünür'}
          </p>
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Tür</p>
          <Select value={form.type} onChange={(e) => field('type', e.target.value as PopupRule['type'])}>
            <option value="cerez">Çerez Bildirimi</option>
            <option value="duyuru">Duyuru</option>
            <option value="promosyon">Promosyon</option>
          </Select>
        </div>
        <div>
          <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Tetikleyici</p>
          <Select value={form.trigger} onChange={(e) => field('trigger', e.target.value as PopupRule['trigger'])}>
            <option value="sayfa-yuklenince">Sayfa yüklenince</option>
            <option value="cikis-niyeti">Çıkış niyeti algılandığında</option>
            <option value="gecikme">Gecikmeli</option>
            <option value="her-zaman">Her zaman</option>
          </Select>
        </div>
      </div>

      {form.trigger === 'gecikme' && (
        <div className="mt-3">
          <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Gecikme (saniye)</p>
          <Input type="number" value={form.delaySeconds ?? 0} onChange={(e) => field('delaySeconds', Number(e.target.value))} />
        </div>
      )}

      <div className="mt-4 flex items-center justify-between rounded-soft border border-border px-3.5 py-2.5 dark:border-white/[.06]">
        <span className="text-body-sm text-near-black dark:text-white/85">Aktif</span>
        <Switch checked={form.active} onChange={(v) => field('active', v)} label="Aktif" />
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[10.5px] uppercase tracking-[0.05em] text-steel dark:text-white/40">Hedef Sayfalar</p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_PAGES.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => togglePage(page)}
              className={
                form.pages.includes(page)
                  ? 'rounded-soft bg-red px-2.5 py-1 text-[11.5px] font-medium text-white'
                  : 'rounded-soft border border-border px-2.5 py-1 text-[11.5px] text-steel hover:bg-mist dark:border-white/10 dark:text-white/50 dark:hover:bg-white/5'
              }
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </Drawer>
  );
}
