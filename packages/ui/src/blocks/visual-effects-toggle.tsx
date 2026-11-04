'use client';

import * as React from 'react';
import { useVisualEffects } from '../primitives/visual-effects';

export function VisualEffectsToggle() {
  const { paused, prefersReducedMotion, toggle } = useVisualEffects();

  return (
    <button
      className="mw-effects-toggle"
      type="button"
      data-slot="effects-toggle"
      aria-pressed={!paused}
      aria-label={
        prefersReducedMotion
          ? 'Ambient visual effects disabled by reduced-motion preference'
          : paused
            ? 'Resume ambient visual effects'
            : 'Pause ambient visual effects'
      }
      disabled={prefersReducedMotion}
      onClick={toggle}
    >
      {prefersReducedMotion ? 'Motion reduced' : paused ? 'Resume effects' : 'Pause effects'}
    </button>
  );
}
