import * as React from 'react';
import { cn } from '../lib/utils';
import { RawStack } from '../raw';

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** Surface element to render. "article" keeps a standalone block semantic. */
  as?: 'div' | 'article' | 'section' | 'aside';
}

export function Card({ className, as: Tag = 'div', ...props }: CardProps) {
  return (
    <Tag
      className={cn(
        'mw-card',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <RawStack gap="tight" className={cn('mw-card__header', className)} {...props} />;
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Heading level to render. Keep it aligned with the page outline; skipping levels breaks screen-reader navigation. */
  as?: 'h2' | 'h3' | 'h4';
}

export function CardTitle({ className, as: Tag = 'h3', ...props }: CardTitleProps) {
  return (
    <Tag
      className={cn('mw-card__title', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('mw-card__description', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mw-card__content', className)} {...props} />;
}
