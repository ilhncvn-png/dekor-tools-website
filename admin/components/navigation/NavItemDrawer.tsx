'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import type { NavMenuItem } from '@/lib/mock-data';
import { useToast } from '@/components/ui/Toast';

interface NavItemDrawerProps {
  item: NavMenuItem | null;
  onClose: () => void;
  onUpdate?: (updated: NavMenuItem) => void;
}

/** Full nav item editor drawer — label/href/external/visibility, the real "client edits a menu item" interface. */
export function NavItemDrawer({ item, onClose, onUpdate }: NavItemDrawerProps) {
  const { push } = useToast();
  const [form, setForm] = useState(item);

  useEffect(() => {
    if (item) setForm(item);
  }, [item]);

  if (!form) return null;

  function field<K extends keyof NavMenuItem>(key: K, value: NavMenuItem[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function saveChanges() {
    if (!form) return;
    onUpdate?.(form);
    push({ tone: 'success', title: 'Menü öğesi kaydedildi', description: `${form.label} güncellendi.` });
  }

  return (
    <Drawer
      open={Boolean(item)}
      onClose={onClose}
      title={form.label || 'Menü Öğesi'}
      description={form.href}
      footer={<Button icon={<Save size={14} />} className="w-full" onClick={saveChanges}>Kaydet</Button>}
    >
      <div>
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Etiket</p>
        <Input value={form.label} onChange={(e) => field('label', e.target.value)} />
      </div>
      <div className="mt-3">
        <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Bağlantı</p>
        <Input value={form.href} onChange={(e) => field('href', e.target.value)} />
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between rounded-soft border border-border px-3 py-2 dark:border-white/[.06]">
          <span className="text-[12.5px] text-near-black dark:text-white/80">Dış Bağlantı</span>
          <Switch checked={form.external} onChange={(v) => field('external', v)} label="Dış bağlantı" />
        </div>
        <div className="flex items-center justify-between rounded-soft border border-border px-3 py-2 dark:border-white/[.06]">
          <span className="text-[12.5px] text-near-black dark:text-white/80">Menüde Görünür</span>
          <Switch checked={form.visible !== false} onChange={(v) => field('visible', v)} label="Görünür" />
        </div>
      </div>
    </Drawer>
  );
}
