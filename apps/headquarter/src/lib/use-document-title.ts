'use client';

import { useEffect } from 'react';

/**
 * Sets the document title for a client route. These pages are `use client`, so they
 * cannot export Next `metadata`; this hook replaces the per-page `document.title =`
 * effect that was copy-pasted across every control page.
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
