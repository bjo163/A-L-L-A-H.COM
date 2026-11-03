import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

export const badgeVariants = cva(
  'mw-badge',
  {
    variants: {
      variant: {
        default: 'mw-badge--default',
        active: 'mw-badge--active',
        gold: 'mw-badge--gold',
        revoked: 'mw-badge--revoked',
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
          aria-hidden="true"
          className="mw-badge__marker"
        />
      )}
      {children}
    </span>
  );
}
