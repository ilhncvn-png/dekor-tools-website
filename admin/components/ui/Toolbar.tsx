import type { ReactNode } from 'react';

interface ToolbarProps {
  children: ReactNode;
  actions?: ReactNode;
}

/** Search + filters on the left, primary action(s) on the right — the standard row above every module's table/grid. */
export function Toolbar({ children, actions }: ToolbarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
