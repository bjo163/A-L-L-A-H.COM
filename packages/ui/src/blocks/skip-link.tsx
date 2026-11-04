import * as React from 'react';
import { cn } from '../lib/utils';

/** Conventional id every app puts on its main landmark. Deliberately not an `mw-` name: app code must not reference private package classes. */
export const mainLandmarkId = 'main-content';

export interface SkipLinkProps {
  targetId?: string;
  label?: React.ReactNode;
  className?: string;
}

/**
 * Keyboard escape hatch past the navigation. Gate had the only working copy of
 * this in the whole ecosystem; every world now ships the same one.
 */
export function SkipLink({
  targetId = mainLandmarkId,
  label = 'Skip to main content',
  className,
}: SkipLinkProps) {
  return (
    <a className={cn('mw-skip-link', className)} data-slot="skip-link" href={`#${targetId}`}>
      {label}
    </a>
  );
}
