'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search, Image as ImageIcon, Link2, Gauge, Database, RefreshCw,
  CheckCircle2, AlertTriangle, XCircle, ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { analyzeWebsiteHealth, type WebsiteHealthReport } from '@/lib/actions/website-health-actions';

function scoreTone(n: number): 'success' | 'warning' | 'red' {
  return n >= 85 ? 'success' : n >= 60 ? 'warning' : 'red';
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function WebsiteSagligiPage() {
  const [report, setReport] = useState<WebsiteHealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function run() {
    setLoading(true);
    setError(false);
    try {
      setReport(await analyzeWebsiteHealth());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    run();
  }, []);

  return (
    <ContentContainer>
      <PageHeader
        title="Website Sağlığı"
        description="Canlı yayındaki web sitesinin gerçek zamanlı analizi."
        actions={
          <button
            type="button"
            onClick={run}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-soft border border-border bg-white px-3 py-1.5 text-[12.5px] font-medium text-near-black transition-colors hover:border-red/40 disabled:opacity-50 dark:border-white/[.08] dark:bg-surface-dark-raised dark:text-white"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> {loading ? 'Analiz ediliyor…' : 'Yeniden Tara'}
          </button>
        }
      />

      {loading && !report ? (
        <div className="grid grid-cols-2 gap-4 tablet:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="block" className="h-[130px]" />
          ))}
        </div>
      ) : error || !report ? (
        <Card className="p-6">
          <p className="flex items-center gap-2 text-[13px] text-danger"><XCircle size={15} /> Analiz başarısız oldu. Lütfen tekrar deneyin.</p>
        </Card>
      ) : (
        <>
          {/* Hero score */}
          <div
            className="relative overflow-hidden rounded-lg border border-white/10 p-6 tablet:p-8"
            style={{ background: 'radial-gradient(120% 140% at 8% 0%, #1d2126 0%, #121417 45%, #0a0b0c 100%)' }}
          >
            <div className="relative flex flex-col gap-6 laptop:flex-row laptop:items-center laptop:justify-between">
              <div className="flex items-center gap-5">
                <div
                  className={cn(
                    'flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 font-display text-heading-lg font-bold tabular-nums text-white',
                    report.overallScore >= 85 ? 'border-success/60' : report.overallScore >= 60 ? 'border-warning/60' : 'border-danger/60'
                  )}
                >
                  %{report.overallScore}
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-white/40">Genel Site Sağlığı</p>
                  <p className="mt-1 font-display text-heading-lg font-bold text-white">
                    {report.pagesWithErrors === 0 ? 'Tüm sayfalar erişilebilir.' : `${report.pagesWithErrors} sayfa erişilemiyor.`}
                  </p>
                  <p className="mt-1.5 text-[13px] text-white/50">
                    {report.pagesChecked} sayfa tarandı · ort. {report.avgResponseMs}ms · {formatBytes(report.totalBytes)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* KPI row */}
          <div className="mt-4 grid grid-cols-2 gap-4 tablet:grid-cols-4">
            <StatCard label="Erişilebilir Sayfa" value={`${report.pagesOk}/${report.pagesChecked}`} icon={CheckCircle2} tone={report.pagesWithErrors === 0 ? 'success' : 'warning'} />
            <StatCard label="Ortalama SEO" value={`%${report.seo.avgScore}`} icon={Search} tone={scoreTone(report.seo.avgScore)} />
            <StatCard label="Eksik ALT Metni" value={String(report.images.missingAlt)} icon={ImageIcon} tone={report.images.missingAlt === 0 ? 'success' : 'warning'} />
            <StatCard label="Kırık Bağlantı" value={String(report.links.broken)} icon={Link2} tone={report.links.broken === 0 ? 'success' : 'red'} />
          </div>

          {/* SEO + Images + Performance */}
          <div className="mt-4 grid grid-cols-1 gap-4 laptop:grid-cols-3">
            <Card className="p-5">
              <p className="mb-3 flex items-center gap-1.5 font-display text-heading-sm font-bold text-near-black dark:text-white"><Search size={15} /> SEO Durumu</p>
              <div className="mb-3"><ProgressBar value={report.seo.avgScore} tone={scoreTone(report.seo.avgScore)} /></div>
              <ul className="flex flex-col gap-1.5 text-[12.5px]">
                <IssueRow label="Başlık eksik" count={report.seo.missingTitle} />
                <IssueRow label="Açıklama eksik" count={report.seo.missingDescription} />
                <IssueRow label="Canonical eksik" count={report.seo.missingCanonical} />
                <IssueRow label="JSON-LD eksik" count={report.seo.missingJsonLd} />
              </ul>
            </Card>

            <Card className="p-5">
              <p className="mb-3 flex items-center gap-1.5 font-display text-heading-sm font-bold text-near-black dark:text-white"><ImageIcon size={15} /> Görseller</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-heading-lg font-bold text-near-black dark:text-white">{report.images.total}</span>
                <span className="text-[12px] text-steel dark:text-white/40">toplam görsel</span>
              </div>
              <ul className="mt-3 flex flex-col gap-1.5 text-[12.5px]">
                <IssueRow label="ALT metni eksik" count={report.images.missingAlt} />
              </ul>
            </Card>

            <Card className="p-5">
              <p className="mb-3 flex items-center gap-1.5 font-display text-heading-sm font-bold text-near-black dark:text-white"><Gauge size={15} /> Performans</p>
              <ul className="flex flex-col gap-2 text-[12.5px]">
                <li className="flex items-center justify-between"><span className="text-steel dark:text-white/50">Ort. yanıt süresi</span><Badge tone={report.avgResponseMs < 800 ? 'success' : 'warning'}>{report.avgResponseMs}ms</Badge></li>
                <li className="flex items-center justify-between"><span className="text-steel dark:text-white/50">Toplam boyut</span><Badge tone="neutral">{formatBytes(report.totalBytes)}</Badge></li>
                <li className="flex items-center justify-between"><span className="text-steel dark:text-white/50">Bağlantı kontrolü</span><Badge tone="neutral">{report.links.checked}</Badge></li>
              </ul>
            </Card>
          </div>

          {/* CMS Integrity */}
          <div className="mt-4">
            <Card className="p-5">
              <p className="mb-3 flex items-center gap-1.5 font-display text-heading-sm font-bold text-near-black dark:text-white"><Database size={15} /> CMS Bütünlüğü</p>
              <div className="grid grid-cols-2 gap-2.5 tablet:grid-cols-3 laptop:grid-cols-6">
                <IntegrityTile label="Medyasız yayın ürün" value={report.cmsIntegrity.publishedProductsWithoutMedia} />
                <IntegrityTile label="SEO'suz ürün" value={report.cmsIntegrity.productsWithoutSeo} />
                <IntegrityTile label="TR çevirisiz kategori" value={report.cmsIntegrity.categoriesWithoutTr} />
                <IntegrityTile label="Boş kategori" value={report.cmsIntegrity.emptyCategories} />
                <IntegrityTile label="Hatalı yönlendirme" value={report.cmsIntegrity.orphanRedirects} />
                <IntegrityTile label="Yayındaki içerik" value={report.cmsIntegrity.totalPublished} good />
              </div>
            </Card>
          </div>

          {/* Broken links */}
          {report.links.brokenList.length > 0 && (
            <div className="mt-4">
              <Card className="p-5">
                <p className="mb-3 flex items-center gap-1.5 font-display text-heading-sm font-bold text-danger"><Link2 size={15} /> Kırık Bağlantılar</p>
                <ul className="flex flex-col gap-1.5">
                  {report.links.brokenList.map((l) => (
                    <li key={l.url} className="flex items-center justify-between gap-2 rounded-soft border border-danger/20 px-2.5 py-2 text-[12.5px]">
                      <span className="truncate font-mono text-near-black dark:text-white/85">{l.url}</span>
                      <Badge tone="danger">{l.status || 'erişilemedi'}</Badge>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}

          {/* Per-page table */}
          <div className="mt-4">
            <Card className="p-5">
              <p className="mb-3 font-display text-heading-sm font-bold text-near-black dark:text-white">Sayfa Bazında Analiz</p>
              <div className="overflow-x-auto">
                <table className="w-full text-[12.5px]">
                  <thead>
                    <tr className="border-b border-border text-left text-steel dark:border-white/[.06] dark:text-white/40">
                      <th className="py-2 pr-3 font-medium">Sayfa</th>
                      <th className="px-2 py-2 font-medium">Durum</th>
                      <th className="px-2 py-2 font-medium">SEO</th>
                      <th className="px-2 py-2 font-medium">Görsel</th>
                      <th className="px-2 py-2 font-medium">OG</th>
                      <th className="px-2 py-2 font-medium">JSON-LD</th>
                      <th className="px-2 py-2 font-medium">Süre</th>
                      <th className="px-2 py-2 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.pages.map((p) => (
                      <tr key={p.path} className="border-b border-border/60 dark:border-white/[.04]">
                        <td className="py-2 pr-3 text-near-black dark:text-white/85">{p.name}</td>
                        <td className="px-2 py-2"><Badge tone={p.ok ? 'success' : 'danger'} dot>{p.status || '—'}</Badge></td>
                        <td className={cn('px-2 py-2 font-medium', p.seoScore >= 85 ? 'text-success' : p.seoScore >= 60 ? 'text-warning' : 'text-danger')}>%{p.seoScore}</td>
                        <td className="px-2 py-2 text-steel dark:text-white/50">{p.images}{p.imagesMissingAlt > 0 ? ` (${p.imagesMissingAlt}!)` : ''}</td>
                        <td className="px-2 py-2 text-steel dark:text-white/50">{p.ogTags}</td>
                        <td className="px-2 py-2 text-steel dark:text-white/50">{p.jsonLd}</td>
                        <td className="px-2 py-2 text-steel dark:text-white/50">{p.ms}ms</td>
                        <td className="px-2 py-2">
                          <Link href={`https://dekor-tools.com${p.path}`} target="_blank" rel="noopener noreferrer" className="text-steel transition-colors hover:text-red dark:text-white/40">
                            <ExternalLink size={13} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}
    </ContentContainer>
  );
}

function IssueRow({ label, count }: { label: string; count: number }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-steel dark:text-white/50">{label}</span>
      {count === 0 ? (
        <span className="flex items-center gap-1 text-success"><CheckCircle2 size={12} /> 0</span>
      ) : (
        <span className="flex items-center gap-1 text-warning"><AlertTriangle size={12} /> {count}</span>
      )}
    </li>
  );
}

function IntegrityTile({ label, value, good }: { label: string; value: number; good?: boolean }) {
  const tone = good ? 'text-success' : value === 0 ? 'text-success' : 'text-warning';
  return (
    <div className="flex flex-col gap-1 rounded-soft border border-border p-3 dark:border-white/[.06]">
      <span className="text-[10.5px] uppercase tracking-[0.04em] text-steel dark:text-white/40">{label}</span>
      <span className={cn('font-display text-heading-sm font-bold', tone)}>{value}</span>
    </div>
  );
}
