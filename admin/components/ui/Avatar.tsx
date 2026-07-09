import { cn } from '@/lib/utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'neutral' | 'red' | 'ai' | 'info';
}

const sizeClasses = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-9 w-9 text-[13px]',
  lg: 'h-12 w-12 text-body',
} as const;

const toneClasses = {
  neutral: 'bg-mist text-steel dark:bg-white/10 dark:text-white/60',
  red: 'bg-red/10 text-red dark:bg-red/15 dark:text-red-eyebrow',
  ai: 'bg-ai-soft text-ai',
  info: 'bg-info-soft text-info',
} as const;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export function Avatar({ name, size = 'md', tone = 'neutral' }: AvatarProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold',
        sizeClasses[size],
        toneClasses[tone]
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}
