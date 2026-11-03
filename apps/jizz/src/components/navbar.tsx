'use client';

import * as React from 'react';
import { EcosystemNavbar, Badge } from '@moonwitness/ui';
import { Button } from '@moonwitness/ui';
import { cn } from '@moonwitness/ui';

// Create a wrapper that adapts the navbar for jizz
export function JizzNavbar() {
  return (
    <EcosystemNavbar
      currentApp="jizz"
    />
  );
}

// Extend the navigation links for jizz
export function JizzNavigation() {
  return (
    <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
      <a
        href="http://localhost:3001"
        className="hover:text-amber-400 transition-colors"
      >
        Dock (Discovery)
      </a>
      <a
        href="http://localhost:3002"
        className="hover:text-amber-400 transition-colors"
      >
        Headquarter (Ops)
      </a>
      <a
        href="http://localhost:3003/account"
        className="hover:text-amber-400 transition-colors"
      >
        MoonWitness ID
      </a>
      <a
        href="http://localhost:3004"
        className="text-amber-400 font-semibold"
      >
        WORLD OBSERVATORY
      </a>
    </nav>
  );
}

// Export all navbar components for easy import
export * from '@moonwitness/ui';