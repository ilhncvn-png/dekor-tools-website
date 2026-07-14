'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, MessageSquareText, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { PopupDrawer } from '@/components/popups/PopupDrawer';
import { type PopupRule } from '@/lib/mock-data';
import { getAdminPopups, savePopup } from '@/lib/actions/misc-content-actions';
import { useToast } from '@/components/ui/Toast';

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
  const { push } = useToast();
  const [popups, setPopups] = useState<PopupRule[]>([]);
  const [activePopup, setActivePopup] = useState<PopupRule | null>(null);

  const loadPopups = useCallback(async () => {
    try {
      setPopups(await getAdminPopups());
    } catch {
      push({ tone: 'danger', title: 'Popuplar yüklenemedi', description: 'Veritabanına bağlanılamadı.' });
    }
  }, [push]);

  useEffect(() => {
    loadPopups();
  }, [loadPopups]);

  async function toggleActive(id: string) {
    const target = popups.find((p) => p.id === id);
    if (!target) return;
    setPopups((prev) => prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))); // optimistic
    const result = await savePopup(id, { ...target, active: !target.active });
    if (!result.success) { push({ tone: 'danger', title: 'İşlem başarısız', description: result.error }); await loadPopups(); return; }
    await loadPopups();
  }

  async function updatePopup(updated: PopupRule) {
    const result = await savePopup(updated.id, updated);
    if (!result.success) { push({ tone: 'danger', title: 'Kaydedilemedi', description: result.error }); return; }
    await loadPopups();
    setActivePopup(null);
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
