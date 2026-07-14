'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Switch } from '@/components/ui/Switch';
import { LanguageDrawer } from '@/components/languages/LanguageDrawer';
import { useToast } from '@/components/ui/Toast';
import { type LanguageRow } from '@/lib/mock-data';
import { getAdminLanguages, setLanguageActive } from '@/lib/actions/language-actions';

function tone(completion: number): 'success' | 'warning' | 'danger' {
  if (completion >= 80) return 'success';
  if (completion >= 30) return 'warning';
  return 'danger';
}

const AVAILABLE_LANGUAGES = [
  { code: 'EN', name: 'İngilizce' },
  { code: 'AR', name: 'Arapça' },
  { code: 'RU', name: 'Rusça' },
  { code: 'FR', name: 'Fransızca' },
];

export default function DilYonetimiPage() {
  const { push } = useToast();
  const [languageRows, setLanguageRows] = useState<LanguageRow[]>([]);
  const [activeMap, setActiveMap] = useState<Record<string, boolean>>({});
  const [activeLang, setActiveLang] = useState<LanguageRow | null>(null);

  const loadLanguages = useCallback(async () => {
    try {
      const rows = await getAdminLanguages();
      setLanguageRows(rows);
      setActiveMap(Object.fromEntries(rows.map((l) => [l.id, l.active])));
    } catch {
      push({ tone: 'danger', title: 'Diller yüklenemedi', description: 'Veritabanına bağlanılamadı.' });
    }
  }, [push]);

  useEffect(() => {
    loadLanguages();
  }, [loadLanguages]);

  async function toggleLanguage(code: string, checked: boolean) {
    setActiveMap((prev) => ({ ...prev, [code]: checked })); // optimistic
    const result = await setLanguageActive(code, checked);
    if (!result.success) {
      push({ tone: 'danger', title: 'İşlem başarısız', description: result.error });
      await loadLanguages();
    }
  }

  function addLanguage() {
    const existingCodes = new Set(languageRows.map((l) => l.code));
    const next = AVAILABLE_LANGUAGES.find((l) => !existingCodes.has(l.code));
    if (!next) {
      push({ tone: 'info', title: 'Eklenebilecek yeni dil kalmadı' });
      return;
    }
    const newLang: LanguageRow = {
      id: `l-${Date.now()}`,
      name: next.name,
      code: next.code,
      completion: 0,
      isDefault: false,
      active: false,
      pagesTranslated: 0,
      pagesTotal: 31,
      contentBreakdown: [],
      untranslatedPages: [],
    };
    setLanguageRows((prev) => [...prev, newLang]);
    setActiveMap((prev) => ({ ...prev, [newLang.id]: false }));
    push({ tone: 'success', title: `${next.name} eklendi`, description: 'Çeviri kuyruğu boş — sayfa sayısı senkronize edildi.' });
  }

  return (
    <ContentContainer>
      <PageHeader
        title="Dil Yönetimi"
        description="Aktif diller ve çeviri tamamlanma durumu."
        actions={<Button icon={<Plus size={15} />} onClick={addLanguage}>Dil Ekle</Button>}
      />

      <Card className="p-0">
        <ul className="divide-y divide-border dark:divide-white/[.06]">
          {languageRows.map((lang) => (
            <li
              key={lang.id}
              className="flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors duration-fast hover:bg-mist/50 dark:hover:bg-white/[.03]"
              onClick={() => setActiveLang(lang)}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-soft bg-mist font-mono text-[12px] font-semibold text-steel dark:bg-white/[.06] dark:text-white/60">
                {lang.code}
              </div>
              <div className="w-40 shrink-0">
                <p className="text-body-sm font-medium text-near-black dark:text-white">{lang.name}</p>
                {lang.isDefault && <Badge tone="info">Varsayılan</Badge>}
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between text-[12px] text-steel dark:text-white/40">
                  <span>{lang.pagesTranslated} / {lang.pagesTotal} sayfa çevrildi</span>
                  <span className="font-medium text-near-black dark:text-white">%{lang.completion}</span>
                </div>
                <ProgressBar value={lang.completion} tone={tone(lang.completion)} />
              </div>
              <span onClick={(e) => e.stopPropagation()} className="shrink-0">
                <Switch
                  checked={activeMap[lang.id]}
                  onChange={(checked) => toggleLanguage(lang.id, checked)}
                  label={`${lang.name} yayında`}
                  disabled={lang.isDefault}
                />
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <LanguageDrawer language={activeLang} onClose={() => setActiveLang(null)} />
    </ContentContainer>
  );
}
