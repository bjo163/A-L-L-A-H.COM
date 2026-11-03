import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-zinc-800 text-zinc-300 border border-zinc-700/60',
        active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        gold: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
        revoked: 'bg-red-500/10 text-red-400 border border-red-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'active' && 'bg-emerald-400 animate-pulse',
            variant === 'gold' && 'bg-amber-400 animate-pulse',
            variant === 'revoked' && 'bg-red-400',
            (!variant || variant === 'default') && 'bg-zinc-400'
          )}
        />
      )}
      {children}
    </span>
  );
}
