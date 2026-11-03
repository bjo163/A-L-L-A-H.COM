'use client';

import { AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="jizz-state">
      <div className="jizz-state__panel">
        <AlertTriangle className="w-12 h-12 text-yellow-400" />
        <h2 className="text-xl font-bold text-zinc-100">Page not found</h2>
        <p className="text-sm text-zinc-400 text-center">
          The page you're looking for doesn't exist in WORLD OBSERVATORY.
        </p>
        <Link href="/" className="jizz-state__link">
          <Home className="w-4 h-4" />
          Return Home
        </Link>
      </div>
    </div>
  );
}