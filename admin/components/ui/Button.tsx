'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Spinner } from './Spinner';
import { cn } from '@/lib/utils';
import { focusRing } from '@/lib/design-tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

// Omit the handful of event props that collide between React's
// ButtonHTMLAttributes and Framer Motion's MotionProps (both declare
// onDrag/onAnimationStart/etc with incompatible signatures) — same fix as
// components/ui/Card.tsx, rather than reaching for `any`.
type ButtonPropsSafeForMotion = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'
>;

interface ButtonProps extends ButtonPropsSafeForMotion {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-red text-white hover:bg-red/90 disabled:bg-red/50',
  secondary:
    'bg-mist text-near-black hover:bg-concrete dark:bg-white/[.06] dark:text-white dark:hover:bg-white/10',
  ghost:
    'bg-transparent text-steel hover:bg-mist hover:text-near-black dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white',
  danger: 'bg-danger text-white hover:bg-danger/90 disabled:bg-danger/50',
  success: 'bg-success text-white hover:bg-success/90 disabled:bg-success/50',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-body-sm gap-1.5',
  md: 'h-9 px-4 text-body-sm gap-2',
  lg: 'h-11 px-5 text-body gap-2',
};

/**
 * The one Button primitive every surface in Dekor Control Center should
 * use — Sprint 7's answer to the public site's ~6 parallel button class
 * families (docs/COMPONENT_ARCHITECTURE.md §13). A `variant` + `size` prop
 * covers every real need instead of a new component per look.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, icon, iconPosition = 'left', className, children, disabled, ...rest },
  ref
) {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.12 }}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-soft font-medium select-none',
        'transition-colors duration-fast ease-premium disabled:cursor-not-allowed',
        focusRing,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...rest}
    >
      {loading ? (
        <Spinner size={size === 'lg' ? 16 : 14} className="text-current" />
      ) : (
        icon && iconPosition === 'left' && <span className="inline-flex shrink-0">{icon}</span>
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && <span className="inline-flex shrink-0">{icon}</span>}
    </motion.button>
  );
});
