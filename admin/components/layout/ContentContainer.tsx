import type { ReactNode } from 'react';

/**
 * Consistent max-width/padding wrapper for every page's main content — the
 * one place page-level spacing is defined, per
 * docs/engineering/02_ENGINEERING_STANDARDS.md's "avoid duplicate code" /
 * "every spacing consistent" rules.
 */
export function ContentContainer({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[1400px] px-5 py-8 tablet:px-8">{children}</div>;
}
