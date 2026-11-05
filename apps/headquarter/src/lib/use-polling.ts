'use client';

import { useEffect, useRef } from 'react';

export interface UsePollingOptions {
  /**
   * When true and the reader prefers reduced motion, the cadence is doubled to
   * quiet background activity. Data still refreshes; it just updates less often.
   */
  respectReducedMotion?: boolean;
}

/**
 * Interval polling that pauses while the tab is hidden and clears on unmount, so a
 * backgrounded Headquarter tab stops hammering the gateway. Replaces the raw
 * `setInterval(...)` loops. The callback is read through a ref, so passing a fresh
 * closure each render does not restart the timer.
 */
export function usePolling(
  callback: () => void | Promise<void>,
  intervalMs: number,
  options: UsePollingOptions = {},
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const reduceMotion =
      options.respectReducedMotion &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cadence = reduceMotion ? intervalMs * 2 : intervalMs;

    let timer: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (timer !== null) return;
      timer = setInterval(() => void callbackRef.current(), cadence);
    };
    const stop = () => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };
    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };

    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [intervalMs, options.respectReducedMotion]);
}
