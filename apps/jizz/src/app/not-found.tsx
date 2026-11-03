'use client';

import { AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100">
      <div className="flex flex-col items-center gap-4 p-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 max-w-md">
        <AlertTriangle className="w-12 h-12 text-yellow-400" />
        <h2 className="text-xl font-bold text-zinc-100">Page not found</h2>
        <p className="text-sm text-zinc-400 text-center">
          The page you're looking for doesn't exist in WORLD OBSERVATORY.
        </p>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-amber-100 font-medium hover:bg-amber-600 transition-colors"
        >
          <Home className="w-4 h-4" />
          Return Home
        </Link>
      </div>
    </div>
  );
}