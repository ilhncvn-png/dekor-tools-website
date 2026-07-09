'use client';

import { useState } from 'react';
import { Plus, MessageSquareText, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { PopupDrawer } from '@/components/popups/PopupDrawer';
import { popups as initialPopups, type PopupRule } from '@/lib/mock-data';

const typeTone: Record<PopupRule['type'], 'danger' | 'success' | 'info'> = {
  cerez: 'info',
  duyuru: 'success',
  promosyon: 'danger',
};

const typeLabel: Record<PopupRule['type'], string> = {
  cerez: 'Çerez Bildirimi',
  duyuru: 'Duyuru',
  promosyon: 'Promosyon',
};

const triggerLabel: Record<PopupRule['trigger'], string> = {
  'sayfa-yuklenince': 'Sayfa yüklenince',
  'cikis-niyeti': 'Çıkış niyeti algılandığında',
  gecikme: 'Gecikmeli',
  'her-zaman': 'Her zaman',
};

/** Site-wide overlays — announcement/promo popups and the cookie consent banner, one shared rule engine. */
export default function PopupYonetimiPage() {
  const [popups, setPopups] = useState<PopupRule[]>(initialPopups);
  const [activePopup, setActivePopup] = useState<PopupRule | null>(null);

  function toggleActive(id: string) {
    setPopups((prev) => prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  }

  function updatePopup(updated: PopupRule) {
    setPopups((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setActivePopup(updated);
  }

  function addPopup() {
    const newPopup: PopupRule = {
      id: `pp-${Date.now()}`,
      name: 'Yeni Popup',
      type: 'duyuru',
      trigger: 'sayfa-yuklenince',
      delaySeconds: null,
      pages: ['Tüm Sayfalar'],
      active: false,
    };
    setPopups((prev) => [...prev, newPopup]);
    setActivePopup(newPopup);
  }

  return (
    <ContentContainer>
      <PageHeader
        title="Popup Yönetimi"
        description="Duyuru pop-up'ları, promosyonlar ve çerez bildirimi — tetikleyici kurallarıyla birlikte."
        actions={<Button icon={<Plus size={15} />} onClick={addPopup}>Popup Oluştur</Button>}
      />

      <Card className="p-0">
        <ul className="divide-y divide-border dark:divide-white/[.06]">
          {popups.map((popup) => (
            <li key={popup.id} className="flex items-center gap-4 px-5 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-soft bg-ai-soft text-ai">
                <MessageSquareText size={18} strokeWidth={1.8} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-body-sm font-medium text-near-black dark:text-white">{popup.name}</p>
                  <Badge tone={typeTone[popup.type]}>{typeLabel[popup.type]}</Badge>
                </div>
                <p className="mt-0.5 text-[12px] text-steel dark:text-white/50">
                  Tetikleyici: {triggerLabel[popup.trigger]}
                  {popup.delaySeconds !== null && ` · ${popup.delaySeconds} sn sonra`}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {popup.pages.map((p) => (
                    <Badge key={p} tone="neutral">{p}</Badge>
                  ))}
                </div>
              </div>
              <Switch checked={popup.active} onChange={() => toggleActive(popup.id)} label={`${popup.name} aktif`} />
              <button type="button" onClick={() => setActivePopup(popup)} className="shrink-0 text-steel hover:text-near-black dark:text-white/40 dark:hover:text-white" aria-label="Düzenle">
                <Pencil size={14} />
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <PopupDrawer popup={activePopup} onClose={() => setActivePopup(null)} onUpdate={updatePopup} />
    </ContentContainer>
  );
}
