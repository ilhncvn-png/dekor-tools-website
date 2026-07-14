'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, Save, Share2, BadgeCheck, Map } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { footerColumns as initialFooterColumns, footerSocial as initialFooterSocial, footerContact, certificates, type FooterColumn } from '@/lib/mock-data';
import { useToast } from '@/components/ui/Toast';
import { getSiteSetting, saveSiteSetting } from '@/lib/actions/site-settings-actions';

const FOOTER_KEY = 'footer-config';

type FooterConfig = {
  footerColumns: FooterColumn[];
  footerSocial: { platform: string; url: string }[];
  newsletter: boolean;
  copyright: string;
  showCertificates: boolean;
  showMap: boolean;
};

/** Footer configuration — columns/links, social channels, certificate badges, map embed, contact block, copyright, newsletter toggle. */
export default function FooterYonetimiPage() {
  const { push } = useToast();
  const [footerColumns, setFooterColumns] = useState<FooterColumn[]>(initialFooterColumns);
  const [footerSocial, setFooterSocial] = useState(initialFooterSocial);
  const [newsletter, setNewsletter] = useState(footerContact.newsletterEnabled);
  const [copyright, setCopyright] = useState(footerContact.copyright);
  const [showCertificates, setShowCertificates] = useState(true);
  const [showMap, setShowMap] = useState(true);
  const homepageCertificates = certificates.filter((c) => c.showOnHomepage);

  // Load saved footer config from the database (falls back to seed defaults).
  const loadConfig = useCallback(async () => {
    try {
      const cfg = await getSiteSetting<FooterConfig>(FOOTER_KEY);
      if (cfg) {
        setFooterColumns(cfg.footerColumns ?? initialFooterColumns);
        setFooterSocial(cfg.footerSocial ?? initialFooterSocial);
        setNewsletter(cfg.newsletter ?? footerContact.newsletterEnabled);
        setCopyright(cfg.copyright ?? footerContact.copyright);
        setShowCertificates(cfg.showCertificates ?? true);
        setShowMap(cfg.showMap ?? true);
      }
    } catch {
      /* keep seed defaults on failure */
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  function addColumn() {
    setFooterColumns((prev) => [...prev, { id: `fc-${Date.now()}`, title: 'Yeni Sütun', links: [] }]);
  }

  function removeColumn(id: string) {
    setFooterColumns((prev) => prev.filter((c) => c.id !== id));
  }

  function addLink(columnId: string) {
    setFooterColumns((prev) =>
      prev.map((c) => (c.id === columnId ? { ...c, links: [...c.links, { label: 'Yeni Bağlantı', href: '/' }] } : c))
    );
  }

  function addChannel() {
    setFooterSocial((prev) => [...prev, { platform: 'Yeni Kanal', url: '' }]);
  }

  async function saveChanges() {
    const result = await saveSiteSetting(FOOTER_KEY, {
      footerColumns, footerSocial, newsletter, copyright, showCertificates, showMap,
    } satisfies FooterConfig);
    if (!result.success) {
      push({ tone: 'danger', title: 'Kaydedilemedi', description: result.error });
      return;
    }
    push({ tone: 'success', title: 'Footer ayarları kaydedildi' });
  }

  return (
    <ContentContainer>
      <PageHeader
        title="Footer Yönetimi"
        description="Footer sütunları, sosyal medya ve iletişim bilgileri."
        actions={<Button icon={<Save size={15} />} onClick={saveChanges}>Değişiklikleri Kaydet</Button>}
      />

      <div className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-heading-md text-near-black dark:text-white">Footer Sütunları</h2>
          <Button variant="secondary" size="sm" icon={<Plus size={13} />} onClick={addColumn}>Sütun Ekle</Button>
        </div>
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 laptop:grid-cols-4">
          {footerColumns.map((col) => (
            <Card key={col.id} className="p-4">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-body-sm font-medium text-near-black dark:text-white">{col.title}</p>
                <button type="button" onClick={() => removeColumn(col.id)} className="text-steel hover:text-danger dark:text-white/40" aria-label="Sütunu sil">
                  <Trash2 size={13} />
                </button>
              </div>
              <ul className="flex flex-col gap-1.5">
                {col.links.map((link) => (
                  <li key={link.href} className="flex items-center justify-between text-[12.5px] text-steel dark:text-white/50">
                    <span className="truncate">{link.label}</span>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => addLink(col.id)} className="mt-2.5 flex items-center gap-1 text-[12px] font-medium text-red dark:text-red-eyebrow">
                <Plus size={11} /> Bağlantı Ekle
              </button>
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 laptop:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 font-display text-heading-md text-near-black dark:text-white">
              <BadgeCheck size={16} /> Sertifika Rozetleri
            </h2>
            <Switch checked={showCertificates} onChange={setShowCertificates} label="Footer sertifikaları" />
          </div>
          {showCertificates && (
            <div className="flex flex-wrap gap-1.5">
              {homepageCertificates.map((c) => (
                <Badge key={c.id} tone="neutral">{c.name}</Badge>
              ))}
            </div>
          )}
          <p className="mt-3 text-[11.5px] text-steel dark:text-white/40">
            Sertifikalar modülünde &quot;Ana Sayfada Göster&quot; işaretli olanlar burada listelenir.
          </p>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 font-display text-heading-md text-near-black dark:text-white">
              <Map size={16} /> Konum Haritası
            </h2>
            <Switch checked={showMap} onChange={setShowMap} label="Footer harita" />
          </div>
          {showMap ? (
            <div className="flex h-24 items-center justify-center rounded-soft bg-mist text-steel dark:bg-white/[.04] dark:text-white/30">
              <Map size={22} strokeWidth={1.4} />
            </div>
          ) : (
            <p className="text-[12px] text-steel dark:text-white/40">Harita gizli.</p>
          )}
          <p className="mt-3 text-[11.5px] text-steel dark:text-white/40">{footerContact.address}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 laptop:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-1.5 font-display text-heading-md text-near-black dark:text-white">
            <Share2 size={16} /> Sosyal Medya
          </h2>
          <ul className="flex flex-col gap-2.5">
            {footerSocial.map((s) => (
              <li key={s.platform} className="flex items-center gap-2.5">
                <span className="w-24 shrink-0 text-body-sm font-medium text-near-black dark:text-white">{s.platform}</span>
                <Input defaultValue={s.url} className="flex-1" />
              </li>
            ))}
          </ul>
          <button type="button" onClick={addChannel} className="mt-3 flex items-center gap-1 text-[12px] font-medium text-red dark:text-red-eyebrow">
            <Plus size={11} /> Kanal Ekle
          </button>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-display text-heading-md text-near-black dark:text-white">İletişim Bilgileri</h2>
          <div className="flex flex-col gap-3">
            <div>
              <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Adres</p>
              <Input defaultValue={footerContact.address} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Telefon</p>
                <Input defaultValue={footerContact.phone} />
              </div>
              <div>
                <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">E-posta</p>
                <Input defaultValue={footerContact.email} />
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Telif Hakkı Metni</p>
              <Input value={copyright} onChange={(e) => setCopyright(e.target.value)} />
            </div>
            <div className="flex items-center justify-between rounded-soft border border-border px-3.5 py-2.5 dark:border-white/[.06]">
              <span className="text-body-sm text-near-black dark:text-white/85">Bülten (Newsletter) Bölümü</span>
              <Switch checked={newsletter} onChange={setNewsletter} label="Bülten bölümü" />
            </div>
          </div>
        </Card>
      </div>
    </ContentContainer>
  );
}
