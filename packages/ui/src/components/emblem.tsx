import * as React from 'react';
import { cn } from '../lib/utils';

export interface EmblemProps extends React.SVGProps<SVGSVGElement> {
  label?: string;
}

/**
 * The MoonWitness monogram mark. Geometry, not a literal string: the navbar
 * brand used to be raw "MW" text with no slot, no a11y name, and no skin hook.
 * Colour arrives via currentColor, so the active skin paints it.
 */
export function Emblem({ label = 'MoonWitness', className, ...props }: EmblemProps) {
  return (
    <svg
      className={cn('mw-emblem', className)}
      data-slot="emblem"
      role="img"
      aria-label={label}
      viewBox="0 0 48 32"
      width={48}
      height={32}
      focusable="false"
      {...props}
    >
      <rect x="1.5" y="1.5" width="45" height="29" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M10 23 V10 l5 7 5 -7 v13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M27 10 l3 12 4 -8 4 8 3 -12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
