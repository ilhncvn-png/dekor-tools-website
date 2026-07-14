'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { StatCard } from '@/components/ui/StatCard';
import { Toolbar } from '@/components/ui/Toolbar';
import { SearchInput } from '@/components/ui/SearchInput';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Table, Thead, Tbody, Tr, Th, Td, TableEmptyRow } from '@/components/ui/Table';
import { Gauge, AlertTriangle, FileWarning, ImageOff } from 'lucide-react';
import { SeoDrawer } from '@/components/seo/SeoDrawer';
import { type SeoRow } from '@/lib/mock-data';
import { seoStatusTone } from '@/lib/status-tones';
import { getAdminSeo, saveSeoEntry } from '@/lib/actions/seo-actions';
import { useToast } from '@/components/ui/Toast';

function scoreTone(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 80) return 'success';
  if (score >= 50) return 'warning';
  return 'danger';
}

export default function SeoYonetimiPage() {
  const { push } = useToast();
  const [seoRows, setSeoRows] = useState<SeoRow[]>([]);
  const [query, setQuery] = useState('');
  const [activeRow, setActiveRow] = useState<SeoRow | null>(null);

  const loadSeo = useCallback(async () => {
    try {
      setSeoRows(await getAdminSeo());
    } catch {
      push({ tone: 'danger', title: 'SEO verileri yüklenemedi', description: 'Veritabanına bağlanılamadı.' });
    }
  }, [push]);

  useEffect(() => {
    loadSeo();
  }, [loadSeo]);

  const filtered = useMemo(() => seoRows.filter((r) => r.page.toLowerCase().includes(query.toLowerCase())), [seoRows, query]);
  const avg = seoRows.length > 0 ? Math.round(seoRows.reduce((sum, r) => sum + r.score, 0) / seoRows.length) : 0;
  const warnings = seoRows.filter((r) => r.status === 'uyari').length;
  const missing = seoRows.filter((r) => r.status === 'eksik').length;
  const totalMissingAlt = seoRows.reduce((sum, r) => sum + r.altMissingCount, 0);

  async function applyUpdate(updated: SeoRow) {
    const result = await saveSeoEntry({
      path: updated.id,
      title: updated.title || null,
      metaDescription: updated.metaDescription || null,
      canonicalUrl: updated.canonicalUrl || null,
      ogImageId: updated.ogImage ?? null,
      robotsIndex: updated.robotsIndex,
      twitterCardEnabled: updated.twitterCardEnabled,
      schemaPresent: updated.schemaPresent,
      keywords: updated.keywords,
    });
    if (!result.success) {
      push({ tone: 'danger', title: 'Kaydedilemedi', description: result.error });
      return;
    }
    await loadSeo();
    setActiveRow(null);
  }

  return (
    <ContentContainer>
      <PageHeader title="SEO Yönetimi" description="Sayfa başlıkları, açıklamalar ve yapısal veriler." />

      <div className="grid grid-cols-2 gap-4 tablet:grid-cols-4">
        <StatCard label="Ortalama Skor" value={String(avg)} icon={Gauge} tone="success" />
        <StatCard label="Uyarılı Sayfalar" value={String(warnings)} icon={AlertTriangle} tone="warning" />
        <StatCard label="Eksik Meta Verisi" value={String(missing)} icon={FileWarning} tone="red" />
        <StatCard label="Eksik ALT Metni" value={String(totalMissingAlt)} icon={ImageOff} tone="neutral" />
      </div>

      <div className="mt-6">
        <Toolbar>
          <div className="w-full max-w-xs">
            <SearchInput placeholder="Sayfa ara..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </Toolbar>

        <Table>
          <Thead>
            <Tr>
              <Th>Sayfa</Th>
              <Th>Meta Başlık</Th>
              <Th>Skor</Th>
              <Th>H1</Th>
              <Th>Schema</Th>
              <Th>Durum</Th>
              <Th>Son Denetim</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.length === 0 && <TableEmptyRow colSpan={7}>Arama kriterlerine uyan sayfa bulunamadı.</TableEmptyRow>}
            {filtered.map((row) => {
              const info = seoStatusTone[row.status];
              return (
                <Tr key={row.id} interactive onClick={() => setActiveRow(row)}>
                  <Td className="font-mono text-[12px] font-medium">{row.page}</Td>
                  <Td className="max-w-xs truncate text-steel dark:text-white/60">{row.title}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-body-sm font-medium">{row.score}</span>
                      <ProgressBar value={row.score} tone={scoreTone(row.score)} className="w-20" />
                    </div>
                  </Td>
                  <Td>
                    <Badge tone={row.h1Present ? 'success' : 'danger'}>{row.h1Present ? 'Var' : 'Yok'}</Badge>
                  </Td>
                  <Td>
                    <Badge tone={row.schemaPresent ? 'success' : 'neutral'}>{row.schemaPresent ? 'Var' : 'Yok'}</Badge>
                  </Td>
                  <Td><Badge tone={info.tone} dot>{info.label}</Badge></Td>
                  <Td className="text-steel dark:text-white/50">{row.lastAudit}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </div>

      <SeoDrawer row={activeRow} onClose={() => setActiveRow(null)} onUpdate={applyUpdate} />
    </ContentContainer>
  );
}
