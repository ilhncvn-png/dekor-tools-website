import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * Used by every module placeholder page this sprint. Deliberately a real
 * empty state (not a fake table with sample rows) — per this sprint's
 * "Do NOT create fake dashboards" / "Do NOT create CRUD pages" rule, every
 * module honestly shows "not built yet" rather than simulated content.
 */
export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-soft border border-dashed border-border px-6 py-20 text-center dark:border-white/10">
      <div className="flex h-14 w-14 items-center justify-center rounded-soft bg-mist text-steel dark:bg-white/5 dark:text-white/40">
        <Icon size={24} strokeWidth={1.6} />
      </div>
      <div className="max-w-sm">
        <h2 className="font-display text-base font-semibold text-near-black dark:text-white">{title}</h2>
        <p className="mt-1.5 text-sm text-steel dark:text-white/50">{description}</p>
      </div>
    </div>
  );
}
