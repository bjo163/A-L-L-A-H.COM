'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { describeError } from './hq-format';

export interface UseAsyncDataResult<T> {
  data: T | null;
  loading: boolean;
  /** A human-readable failure message, or null when the last run succeeded. */
  error: string | null;
  /** Re-run the loader, cancelling any in-flight request first. */
  refresh: () => void;
  /** Cancel the in-flight request without starting a new one. */
  abort: () => void;
}

/**
 * Fetch-on-mount plus manual refresh for Headquarter's client data views. Owns a
 * single AbortController so a refresh or unmount cancels the previous request, and
 * guards state writes after teardown so a late response can never set state on an
 * unmounted component. The loader is read through a ref, so an inline closure does
 * not retrigger the fetch on every render.
 */
export function useAsyncData<T>(loader: (signal: AbortSignal) => Promise<T>): UseAsyncDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const controllerRef = useRef<AbortController | null>(null);
  const activeRef = useRef(true);

  const run = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError(null);

    try {
      const result = await loaderRef.current(controller.signal);
      if (!activeRef.current || controller.signal.aborted) return;
      setData(result);
      setLoading(false);
    } catch (requestError) {
      if (!activeRef.current || controller.signal.aborted) return;
      setError(describeError(requestError));
      setLoading(false);
    }
  }, []);

  const abort = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    if (activeRef.current) setLoading(false);
  }, []);

  useEffect(() => {
    activeRef.current = true;
    void run();
    return () => {
      activeRef.current = false;
      controllerRef.current?.abort();
    };
  }, [run]);

  return { data, loading, error, refresh: () => void run(), abort };
}
