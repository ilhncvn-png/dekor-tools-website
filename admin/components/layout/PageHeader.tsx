import type { ReactNode } from 'react';
import { Breadcrumbs } from './Breadcrumbs';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

/**
 * Every module page (Ürünler, Bayiler, ...) opens with this — consistent
 * title/description/actions placement, per
 * docs/engineering/06_COMPONENT_STANDARDS.md's one-responsibility rule.
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4">
      <Breadcrumbs />
      <div className="flex flex-col items-start justify-between gap-4 tablet:flex-row tablet:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-near-black dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm text-steel dark:text-white/50">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
