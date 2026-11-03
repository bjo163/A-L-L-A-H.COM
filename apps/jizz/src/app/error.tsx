'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('WORLD OBSERVATORY error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100">
      <div className="flex flex-col items-center gap-4 p-6 rounded-2xl border border-red-500/30 bg-red-500/10 max-w-md">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <h2 className="text-xl font-bold text-zinc-100">Something went wrong</h2>
        <p className="text-sm text-zinc-400 text-center">
          Unable to load WORLD OBSERVATORY data. Please try again.
        </p>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-amber-100 font-medium hover:bg-amber-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}