import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Sparkline } from '@/components/ui/Sparkline';
import type { ContentOverviewCard } from '@/lib/mock-data';

interface ContentOverviewProps {
  cards: ContentOverviewCard[];
}

/** "İçerik Genel Bakışı" — each tile is a real link with its own mini trend, not a static number grid. */
export function ContentOverview({ cards }: ContentOverviewProps) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 font-display text-heading-md text-near-black dark:text-white">İçerik Genel Bakışı</h2>
      <div className="grid grid-cols-2 gap-3 tablet:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.id} href={card.href} className="block">
            <div className="group rounded-soft border border-border px-3.5 py-3 transition-colors duration-fast hover:border-red/30 hover:bg-mist/50 dark:border-white/[.06] dark:hover:border-red-eyebrow/30 dark:hover:bg-white/[.03]">
              <p className="font-mono text-[10px] uppercase tracking-[0.05em] text-steel dark:text-white/40">{card.label}</p>
              <p className="mt-1 font-display text-heading-md tabular-nums text-near-black dark:text-white">{card.value}</p>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[11px] text-success">{card.trend}</span>
                <Sparkline data={card.sparkline} width={40} height={16} className="text-steel/60 opacity-0 transition-opacity duration-fast group-hover:opacity-100 dark:text-white/40" fill={false} />
              </div>
              <p className="mt-1 text-[10.5px] text-steel/70 dark:text-white/30">Güncelleme: {card.lastUpdate}</p>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
