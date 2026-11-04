import * as React from 'react';
import { cn } from '../lib/utils';

export interface KickerProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /** "span" keeps the label inside a heading or link without nesting a paragraph. */
  as?: 'p' | 'span';
}

/**
 * The world-specific label line that opens a hero, a section, or a route.
 * Every app used to ship its own copy of this (dock-kicker, hq-kicker, id-kicker,
 * jizz-kicker, gate-kicker); the skin variant decides tracking and casing.
 */
export function Kicker({ className, as: Tag = 'p', ...props }: KickerProps) {
  return <Tag className={cn('mw-kicker', className)} data-slot="kicker" {...props} />;
}
