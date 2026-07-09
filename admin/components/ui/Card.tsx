'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from './Skeleton';

// Omit the handful of event props that collide between React's
// HTMLAttributes and Framer Motion's MotionProps (both declare
// onDrag/onAnimationStart/etc with incompatible signatures) rather than
// reaching for `any` to paper over the conflict.
type DivPropsSafeForMotion = Omit<
  HTMLAttributes<HTMLDivElement>,
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'
>;

interface CardProps extends DivPropsSafeForMotion {
  interactive?: boolean;
  selected?: boolean;
  loading?: boolean;
  children?: ReactNode;
}

/**
 * The one Card primitive for Dekor Control Center (Sprint 7 Step 6) —
 * soft elevation, layered surface, optional hover/selected/loading states.
 * Every future list/grid module (Ürünler, Bayiler, ...) should compose
 * from this rather than styling its own card per module.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { interactive, selected, loading, className, children, ...rest },
  ref
) {
  if (loading) {
    return (
      <div className={cn('rounded-lg border border-border bg-white p-5 dark:border-white/10 dark:bg-surface-dark-raised', className)}>
        <Skeleton variant="text" className="w-1/3" />
        <Skeleton variant="text" className="mt-3 w-2/3" />
        <Skeleton variant="block" className="mt-4 h-20 w-full" />
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      whileHover={interactive ? { y: -2 } : undefined}
      transition={{ duration: 0.2, ease: [0.2, 0.7, 0.2, 1] }}
      className={cn(
        'rounded-lg border bg-white p-5 shadow-elevation-flat transition-shadow duration-base ease-premium',
        'dark:bg-surface-dark-raised dark:shadow-elevation-dark-flat',
        selected
          ? 'border-red/50 shadow-glow-red'
          : 'border-border dark:border-white/10',
        interactive && 'cursor-pointer hover:shadow-elevation-raised hover:border-near-black/15 dark:hover:border-white/20 dark:hover:shadow-elevation-dark-raised',
        className
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
});
