import * as React from 'react';
import { cn } from '../lib/utils';

type GapSize = 'tight' | 'regular' | 'loose';

export type RawContainerProps = React.HTMLAttributes<HTMLDivElement>;

export const RawContainer = React.forwardRef<HTMLDivElement, RawContainerProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mw-raw-container', className)} {...props} />
  )
);
RawContainer.displayName = 'RawContainer';

export type RawSectionProps = React.HTMLAttributes<HTMLElement>;

export const RawSection = React.forwardRef<HTMLElement, RawSectionProps>(
  ({ className, ...props }, ref) => (
    <section ref={ref} className={cn('mw-raw-section', className)} {...props} />
  )
);
RawSection.displayName = 'RawSection';

export interface RawStackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: GapSize;
}

export const RawStack = React.forwardRef<HTMLDivElement, RawStackProps>(
  ({ className, gap = 'regular', ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mw-raw-stack', className)}
      data-gap={gap}
      {...props}
    />
  )
);
RawStack.displayName = 'RawStack';

export interface RawClusterProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: GapSize;
}

export const RawCluster = React.forwardRef<HTMLDivElement, RawClusterProps>(
  ({ className, gap = 'regular', ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mw-raw-cluster', className)}
      data-gap={gap}
      {...props}
    />
  )
);
RawCluster.displayName = 'RawCluster';

export interface RawGridProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: GapSize;
}

export const RawGrid = React.forwardRef<HTMLDivElement, RawGridProps>(
  ({ className, gap = 'regular', ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mw-raw-grid', className)}
      data-gap={gap}
      {...props}
    />
  )
);
RawGrid.displayName = 'RawGrid';
