'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

interface VisualEffectsContextValue {
  paused: boolean;
  prefersReducedMotion: boolean;
  toggle: () => void;
}

const VisualEffectsContext = React.createContext<VisualEffectsContextValue>({
  paused: true,
  prefersReducedMotion: false,
  toggle: () => {},
});

export function VisualEffectsProvider({ children }: { children: React.ReactNode }) {
  const [paused, setPaused] = React.useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const synchronizePreference = () => {
      setPrefersReducedMotion(preference.matches);
      setPaused(preference.matches);
    };

    synchronizePreference();
    preference.addEventListener('change', synchronizePreference);

    return () => preference.removeEventListener('change', synchronizePreference);
  }, []);

  const toggle = React.useCallback(() => {
    setPaused((current) => !current);
  }, []);
  const effectsPaused = paused || prefersReducedMotion;

  return (
    <VisualEffectsContext.Provider value={{ paused: effectsPaused, prefersReducedMotion, toggle }}>
      <div className="mw-motion-root" data-effects-paused={effectsPaused}>
        <div className="mw-ambient-layer" aria-hidden="true" />
        {children}
      </div>
    </VisualEffectsContext.Provider>
  );
}

export function useVisualEffects() {
  return React.useContext(VisualEffectsContext);
}

export interface MotionFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  effect?: 'enter' | 'none';
}

export const MotionFrame = React.forwardRef<HTMLDivElement, MotionFrameProps>(
  ({ className, effect = 'enter', ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mw-motion-frame', className)}
      data-motion-effect={effect}
      {...props}
    />
  )
);
MotionFrame.displayName = 'MotionFrame';
