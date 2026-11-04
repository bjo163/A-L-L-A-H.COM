import * as React from 'react';
import { cn } from '../lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export function Skeleton({ className, size = 'md', ...props }: SkeletonProps) {
  return (
    <div
      className={cn('mw-skeleton', `mw-skeleton--${size}`, className)}
      data-slot="skeleton"
      aria-hidden="true"
      {...props}
    />
  );
}
