'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@moonwitness/ui';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('WORLD OBSERVATORY error:', error);
  }, [error]);

  return (
    <div className="jizz-state">
      <div className="jizz-state__panel" role="alert">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <h2 className="text-xl font-bold text-zinc-100">Something went wrong</h2>
        <p className="text-sm text-zinc-400 text-center">
          We couldn't render this workspace. Try again.
        </p>
        <Button onClick={reset} variant="outline">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
}