import { AlertTriangle, ImageOff } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { SemanticTone } from '@/lib/design-tokens';
import type { HomeFeaturedItem, HomeFeaturedStatus } from '@/lib/actions/home-featured-actions';
import { cn } from '@/lib/utils';

const STATUS_META: Record<HomeFeaturedStatus, { tone: SemanticTone | 'neutral'; label: string }> = {
  PUBLISHED: { tone: 'success', label: 'Yayında' },
  DRAFT: { tone: 'neutral', label: 'Taslak' },
  IN_REVIEW: { tone: 'info', label: 'İncelemede' },
  SCHEDULED: { tone: 'info', label: 'Zamanlanmış' },
  UNPUBLISHED: { tone: 'warning', label: 'Yayından Kaldırıldı' },
  ARCHIVED: { tone: 'warning', label: 'Arşiv' },
};

export function StatusBadge({ status }: { status: HomeFeaturedStatus }) {
  const meta = STATUS_META[status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

const THUMB_SIZE = { sm: 40, md: 56 } as const;

export function ProductThumb({ item, size = 'md' }: { item: HomeFeaturedItem; size?: keyof typeof THUMB_SIZE }) {
  const px = THUMB_SIZE[size];
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-soft border border-border bg-mist dark:border-white/10 dark:bg-white/5"
      style={{ width: px, height: px }}
    >
      {item.thumbnailUrl ? (
        // Remote Vercel Blob URLs; next/image would need remotePatterns config.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.thumbnailUrl} alt={item.name} width={px} height={px} loading="lazy" className="h-full w-full object-contain" />
      ) : (
        <ImageOff size={size === 'sm' ? 14 : 18} className="text-steel/60 dark:text-white/30" aria-label="Fotoğraf yok" />
      )}
    </div>
  );
}

export function WarningChips({ warnings, className }: { warnings: string[]; className?: string }) {
  if (!warnings.length) return null;
  return (
    <ul className={cn('flex flex-wrap gap-1.5', className)} aria-label="Vitrin uyarıları">
      {warnings.map((w) => (
        <li
          key={w}
          className="inline-flex items-center gap-1 rounded-full border border-warning-border bg-warning-soft px-2 py-0.5 text-[11px] font-medium text-warning"
        >
          <AlertTriangle size={11} aria-hidden="true" />
          {w}
        </li>
      ))}
    </ul>
  );
}
