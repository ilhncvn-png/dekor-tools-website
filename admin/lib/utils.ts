/**
 * Small shared utilities. Deliberately hand-written instead of adding
 * `clsx`/`tailwind-merge` — a one-line class-joiner doesn't justify a new
 * dependency at this stage (docs/engineering/02_ENGINEERING_STANDARDS.md).
 */

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
