'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FileEdit, CalendarClock, Rocket, Archive, ExternalLink, Pencil, ShieldAlert, ChevronRight, X, History, User } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentContainer } from '@/components/layout/ContentContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { websitePages, type PublishStatus } from '@/lib/mock-data';
import { resolvePublishStatus, resolveRevisions } from '@/lib/publishing-api';
import { getAllFlatSections, siteWideHealthFlags, type FlatSection } from '@/lib/website-graph';
import { cn } from '@/lib/utils';

type Stage = 'taslak' | 'inceleme' | 'zamanlandi' | 'yayinda' | 'arsivlendi';

const stageConfig: Record<Stage, { label: string; icon: typeof FileEdit; tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger'; barClass: string }> = {
  taslak: { label: 'Taslak', icon: FileEdit, tone: 'neutral', barClass: 'border-steel/40 dark:border-white/20' },
  inceleme: { label: 'İnceleme', icon: ShieldAlert, tone: 'danger', barClass: 'border-danger' },
  zamanlandi: { label: 'Zamanlanan', icon: CalendarClock, tone: 'info', barClass: 'border-info' },
  yayinda: { label: 'Yayında', icon: Rocket, tone: 'success', barClass: 'border-success' },
  arsivlendi: { label: 'Arşivlendi', icon: Archive, tone: 'warning', barClass: 'border-warning' },
};

const stageOrder: Stage[] = ['taslak', 'inceleme', 'zamanlandi', 'yayinda', 'arsivlendi'];

/**
 * Yayın Merkezi — the real publishing pipeline, site-wide: every section
 * across every page placed on a real Taslak → İnceleme → Zamanlanan →
 * Yayında → Arşivlendi pipeline. "İnceleme" is not a fabricated stage — it's
 * the real subset of draft sections that the shared health-flag engine has
 * flagged with a critical issue (missing CTA, broken link, missing media),
 * i.e. genuinely blocked from being scheduled until fixed. Everything else
 * comes straight from lib/publishing-api.ts's real PublishStatus. Rollback
 * is real too: it already exists as "Bu Sürüme Dön" inside each section's
 * editor (Yayın & Sürüm tab), reusing restoreRevision rather than
 * duplicating that logic here.
 */
export default function YayinMerkeziPage() {
  const [activeStage, setActiveStage] = useState<Stage>('taslak');
  const [inspectedId, setInspectedId] = useState<string | null>(null);
  const flatSections = useMemo<FlatSection[]>(() => getAllFlatSections(), []);

  const blockedIds = useMemo(() => {
    const flagged = siteWideHealthFlags(flatSections).filter((e) => e.flag.tone === 'danger');
    return new Set(flagged.map((e) => e.row.section.id));
  }, [flatSections]);

  const byStage: Record<Stage, FlatSection[]> = {
    taslak: [], inceleme: [], zamanlandi: [], yayinda: [], arsivlendi: [],
  };
  for (const row of flatSections) {
    const status: PublishStatus = resolvePublishStatus(row.section);
    if (status === 'taslak') {
      byStage[blockedIds.has(row.section.id) ? 'inceleme' : 'taslak'].push(row);
    } else {
      byStage[status].push(row);
    }
  }

  const activeItems = byStage[activeStage];
  const total = flatSections.length;
  const inspected = activeItems.find((r) => r.section.id === inspectedId) ?? null;

  return (
    <ContentContainer>
      <PageHeader
        title="Yayın Merkezi"
        description="Sitedeki her bölümün gerçek yayın aşaması. Geri alma işlemi ilgili bölümün düzenleyicisindeki Sürüm Geçmişi'nden yapılır."
      />

      {/* Pipeline stepper — Taslak → İnceleme → Zamanlanan → Yayında → Arşivlendi, visually connected */}
      <Card className="p-5">
        <div className="flex items-stretch">
          {stageOrder.map((stage, i) => {
            const config = stageConfig[stage];
            const items = byStage[stage];
            const pct = total > 0 ? Math.round((items.length / total) * 100) : 0;
            return (
              <div key={stage} className="flex flex-1 items-center">
                <button type="button" onClick={() => setActiveStage(stage)} className="flex-1 text-left">
                  <div
                    className={cn(
                      'rounded-soft border-t-2 px-3 py-3 transition-colors tablet:px-4',
                      config.barClass,
                      activeStage === stage ? 'bg-mist dark:bg-white/[.06]' : 'hover:bg-mist/50 dark:hover:bg-white/[.03]'
                    )}
                  >
                    <p className={cn('flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.04em]',
                      stage === 'inceleme' ? 'text-danger' : stage === 'zamanlandi' ? 'text-info' : stage === 'yayinda' ? 'text-success' : stage === 'arsivlendi' ? 'text-warning' : 'text-steel dark:text-white/40')}>
                      <config.icon size={12} /> {config.label}
                    </p>
                    <p className="mt-1 font-display text-heading-md font-bold text-near-black dark:text-white">{items.length}</p>
                    <p className="mt-0.5 text-[10.5px] text-steel dark:text-white/35">%{pct}</p>
                  </div>
                </button>
                {i < stageOrder.length - 1 && <ChevronRight size={16} className="mx-1 shrink-0 text-steel/40 dark:text-white/20" />}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Split panel — list on the left, inspector detail on the right when a row is selected */}
      <div className={cn('mt-4 grid grid-cols-1 gap-4', inspected && 'laptop:grid-cols-[1fr_340px]')}>
        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-3 dark:border-white/[.06]">
            <p className="flex items-center gap-1.5 text-body-sm font-medium text-near-black dark:text-white/85">
              {(() => { const Icon = stageConfig[activeStage].icon; return <Icon size={14} className={activeStage === 'inceleme' ? 'text-danger' : undefined} />; })()}
              {stageConfig[activeStage].label} ({activeItems.length})
            </p>
            <Badge tone={stageConfig[activeStage].tone}>{stageConfig[activeStage].label}</Badge>
          </div>
          {activeItems.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-[12.5px] text-steel dark:text-white/50">Bu aşamada bölüm yok.</p>
              {activeStage === 'taslak' && (
                <p className="mt-1 text-[11.5px] text-steel dark:text-white/40">Tüm bölümler yayında veya arşivde — harika durum.</p>
              )}
              {activeStage === 'inceleme' && (
                <p className="mt-1 text-[11.5px] text-steel dark:text-white/40">Kritik sorunla bloke olmuş taslak yok.</p>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-border dark:divide-white/[.06]">
              {activeItems.map((row) => {
                const targetPage = websitePages.find((p) => p.id === row.pageId);
                const latestRevision = [...resolveRevisions(row.section)].reverse()[0];
                return (
                  <li key={row.section.id}>
                    <button
                      type="button"
                      onClick={() => setInspectedId(inspectedId === row.section.id ? null : row.section.id)}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-mist dark:hover:bg-white/[.03]',
                        inspectedId === row.section.id && 'bg-mist dark:bg-white/[.06]'
                      )}
                    >
                      <span className="flex min-w-0 flex-1 items-center gap-2">
                        <Pencil size={12} className="shrink-0 text-steel dark:text-white/30" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] text-near-black dark:text-white/85">{row.pageName} → {row.section.name}</span>
                          {latestRevision && (
                            <span className="mt-0.5 block truncate text-[11px] text-steel dark:text-white/40">
                              {latestRevision.author} · {latestRevision.date} · {latestRevision.changeSummary}
                            </span>
                          )}
                        </span>
                      </span>
                      <Badge tone="neutral">{row.section.type}</Badge>
                      {row.section.scheduledAt && <span className="shrink-0 font-mono text-[11px] text-steel dark:text-white/40">{row.section.scheduledAt}</span>}
                      <span className="shrink-0 rounded-soft border border-border px-2 py-1 text-[11px] text-steel dark:border-white/10 dark:text-white/50">
                        {targetPage?.linkedHref ? 'Detay' : ''}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {inspected && (() => {
          const targetPage = websitePages.find((p) => p.id === inspected.pageId);
          const liveUrl = inspected.pagePath && !inspected.pagePath.includes('[') ? `https://dekortools.com${inspected.pagePath}` : null;
          const revisions = [...resolveRevisions(inspected.section)].reverse();
          return (
            <Card className="h-fit p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3 dark:border-white/[.06]">
                <p className="text-body-sm font-medium text-near-black dark:text-white">İnceleme Paneli</p>
                <button type="button" onClick={() => setInspectedId(null)} className="text-steel hover:text-near-black dark:text-white/40 dark:hover:text-white">
                  <X size={15} />
                </button>
              </div>
              <div className="p-4">
                <p className="text-[11px] uppercase tracking-[0.05em] text-steel dark:text-white/40">{inspected.pageName}</p>
                <p className="mt-0.5 font-display text-heading-sm text-near-black dark:text-white">{inspected.section.name}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge tone="neutral">{inspected.section.type}</Badge>
                  <Badge tone={stageConfig[activeStage].tone}>{stageConfig[activeStage].label}</Badge>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <Link
                    href={targetPage?.linkedHref ?? '/website-explorer'}
                    className="flex items-center justify-center gap-1.5 rounded-soft bg-red px-3 py-2 text-[12.5px] font-medium text-white transition-opacity hover:opacity-90"
                  >
                    <Pencil size={12} /> Düzenleyiciyi Aç
                  </Link>
                  {liveUrl && (
                    <button
                      type="button"
                      onClick={() => window.open(liveUrl, '_blank', 'noopener,noreferrer')}
                      className="flex items-center justify-center gap-1.5 rounded-soft border border-border px-3 py-2 text-[12.5px] text-near-black transition-colors hover:border-red/30 dark:border-white/10 dark:text-white"
                    >
                      <ExternalLink size={12} /> Sitede Görüntüle
                    </button>
                  )}
                </div>

                <div className="mt-5 border-t border-border pt-4 dark:border-white/[.06]">
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.05em] text-steel dark:text-white/40">
                    <History size={12} /> Sürüm Geçmişi
                  </p>
                  <ul className="flex flex-col gap-3">
                    {revisions.slice(0, 6).map((rev) => (
                      <li key={rev.id} className="relative border-l border-border pl-3 dark:border-white/10">
                        <span className="absolute -left-[3.5px] top-1 h-1.5 w-1.5 rounded-full bg-red" />
                        <p className="flex items-center gap-1 text-[11.5px] font-medium text-near-black dark:text-white/85">
                          <User size={10} className="text-steel dark:text-white/40" /> {rev.author}
                        </p>
                        <p className="mt-0.5 text-[11px] text-steel dark:text-white/40">{rev.date} · {rev.versionLabel}</p>
                        <p className="mt-0.5 text-[11.5px] text-near-black/80 dark:text-white/70">{rev.changeSummary}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          );
        })()}
      </div>
    </ContentContainer>
  );
}
