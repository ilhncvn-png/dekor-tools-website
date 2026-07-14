'use client';

import { useCallback, useEffect, useState } from 'react';
import { Save, Type, MousePointerClick, Shapes } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { themeSettings } from '@/lib/mock-data';
import { useToast } from '@/components/ui/Toast';
import { getSiteSetting, saveSiteSetting } from '@/lib/actions/site-settings-actions';

const THEME_KEY = 'theme-config';
type ThemeConfig = { headingWeight: string; primaryStyle: string; secondaryStyle: string; iconStyle: string };

/** Site-wide brand tokens — the design system every page builder and section editor ultimately renders through. */
export default function TemaAyarlariPage() {
  const [headingWeight, setHeadingWeight] = useState(String(themeSettings.typography.headingWeight));
  const [primaryStyle, setPrimaryStyle] = useState(themeSettings.buttons.primaryStyle);
  const [secondaryStyle, setSecondaryStyle] = useState(themeSettings.buttons.secondaryStyle);
  const [iconStyle, setIconStyle] = useState(themeSettings.iconStyle);
  const { push } = useToast();

  const loadConfig = useCallback(async () => {
    try {
      const c = await getSiteSetting<ThemeConfig>(THEME_KEY);
      if (c) {
        setHeadingWeight(c.headingWeight); setPrimaryStyle(c.primaryStyle);
        setSecondaryStyle(c.secondaryStyle); setIconStyle(c.iconStyle);
      }
    } catch {
      /* keep defaults */
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  async function saveChanges() {
    // Brand colors are frozen (design-system rule) and never persisted from here —
    // only editable typography/button/icon preferences are saved.
    const result = await saveSiteSetting(THEME_KEY, { headingWeight, primaryStyle, secondaryStyle, iconStyle } satisfies ThemeConfig);
    if (!result.success) { push({ tone: 'danger', title: 'Kaydedilemedi', description: result.error }); return; }
    push({ tone: 'success', title: 'Tema ayarları kaydedildi', description: 'Değişiklikler tüm sayfa oluşturucularına yansıtıldı.' });
  }

  return (
    <ContentContainer>
      <PageHeader
        title="Tema Ayarları"
        description="Marka renkleri, tipografi, buton ve ikon stilleri — tüm site bu değerlerden beslenir."
        actions={<Button icon={<Save size={15} />} onClick={saveChanges}>Değişiklikleri Kaydet</Button>}
      />

      <Card className="mb-4 p-5">
        <h2 className="mb-4 font-display text-heading-md text-near-black dark:text-white">Marka Renkleri</h2>
        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
          {themeSettings.brandColors.map((color) => (
            <div key={color.name} className="flex items-center gap-3 rounded-soft border border-border p-3 dark:border-white/[.06]">
              <span className="h-10 w-10 shrink-0 rounded-soft border border-border dark:border-white/10" style={{ backgroundColor: color.value }} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-sm font-medium text-near-black dark:text-white">{color.name}</p>
                <p className="font-mono text-[11px] text-steel dark:text-white/40">{color.value}</p>
                <p className="truncate text-[11px] text-steel/80 dark:text-white/35">{color.role}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11.5px] text-steel dark:text-white/40">
          Yeni bir renk eklemek marka tutarlılığını etkiler — değişiklik öncesi Sistem Ayarları → Marka sekmesiyle senkronize edilir.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 laptop:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-1.5 font-display text-heading-md text-near-black dark:text-white">
            <Type size={16} /> Tipografi
          </h2>
          <div className="flex flex-col gap-3">
            <div>
              <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Başlık Fontu</p>
              <Input defaultValue={themeSettings.typography.displayFont} disabled />
            </div>
            <div>
              <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Mono Font (Etiketler, Kod)</p>
              <Input defaultValue={themeSettings.typography.monoFont} disabled />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Başlık Kalınlığı</p>
                <Select value={headingWeight} onChange={(e) => setHeadingWeight(e.target.value)}>
                  <option value="700">700 — Bold</option>
                  <option value="800">800 — Extra Bold</option>
                  <option value="900">900 — Black</option>
                </Select>
              </div>
              <div>
                <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Gövde Metin Boyutu</p>
                <Input defaultValue={themeSettings.typography.bodySize} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-1.5 font-display text-heading-md text-near-black dark:text-white">
            <MousePointerClick size={16} /> Butonlar
          </h2>
          <div className="flex flex-col gap-3">
            <div>
              <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Köşe Yarıçapı</p>
              <Input defaultValue={themeSettings.buttons.radius} />
            </div>
            <div>
              <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">Birincil Buton Stili</p>
              <Select value={primaryStyle} onChange={(e) => setPrimaryStyle(e.target.value)}>
                <option>Dolu (Solid)</option>
                <option>Çerçeveli (Outline)</option>
              </Select>
            </div>
            <div>
              <p className="mb-1.5 text-body-sm font-medium text-near-black dark:text-white/85">İkincil Buton Stili</p>
              <Select value={secondaryStyle} onChange={(e) => setSecondaryStyle(e.target.value)}>
                <option>Çerçeveli (Outline)</option>
                <option>Metin (Ghost)</option>
              </Select>
            </div>
          </div>

          <h2 className="mb-3 mt-6 flex items-center gap-1.5 font-display text-heading-md text-near-black dark:text-white">
            <Shapes size={16} /> İkon Stili
          </h2>
          <Select value={iconStyle} onChange={(e) => setIconStyle(e.target.value)}>
            <option>Çizgi (Line) — Lucide</option>
            <option>Dolu (Filled)</option>
          </Select>
        </Card>
      </div>
    </ContentContainer>
  );
}
