import type { ReactNode, HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * The one table primitive for Dekor Control Center. Every module list
 * (Ürünler, Bayiler, Kullanıcılar, ...) composes from these instead of
 * hand-styling <table> per page.
 */
export function Table({ children, className, ...rest }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border dark:border-white/10">
      <table className={cn('w-full border-collapse text-left text-body-sm', className)} {...rest}>
        {children}
      </table>
    </div>
  );
}

export function Thead({ children, className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn('border-b border-border bg-mist/60 dark:border-white/10 dark:bg-white/[.03]', className)}
      {...rest}
    >
      {children}
    </thead>
  );
}

export function Tbody({ children, className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn('divide-y divide-border dark:divide-white/[.06]', className)} {...rest}>
      {children}
    </tbody>
  );
}

interface TrProps extends HTMLAttributes<HTMLTableRowElement> {
  interactive?: boolean;
}

export function Tr({ children, className, interactive, ...rest }: TrProps) {
  return (
    <tr
      className={cn(
        interactive && 'cursor-pointer transition-colors duration-fast hover:bg-mist/50 dark:hover:bg-white/[.03]',
        className
      )}
      {...rest}
    >
      {children}
    </tr>
  );
}

export function Th({ children, className, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-steel dark:text-white/40',
        className
      )}
      {...rest}
    >
      {children}
    </th>
  );
}

export function Td({ children, className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('px-4 py-3.5 align-middle text-near-black dark:text-white/85', className)} {...rest}>
      {children}
    </td>
  );
}

export function TableEmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-body-sm text-steel dark:text-white/40">
        {children}
      </td>
    </tr>
  );
}
