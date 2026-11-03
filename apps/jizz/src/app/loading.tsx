'use client';

import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="jizz-state jizz-loading" role="status">
      <div className="jizz-state__panel">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <p>Opening the observatory workspace...</p>
      </div>
    </div>
  );
}