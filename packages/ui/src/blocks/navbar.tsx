'use client';

import * as React from 'react';
import { Button } from '../components/button';
import { Badge } from '../components/badge';
import { cn } from '../lib/utils';

export interface EcosystemNavbarProps {
  currentApp?: 'dock' | 'headquarter' | 'id';
  userName?: string;
  userEmail?: string;
  onSignOut?: () => void;
  className?: string;
}

export function EcosystemNavbar({
  currentApp = 'dock',
  userName,
  userEmail,
  onSignOut,
  className,
}: EcosystemNavbarProps) {
  const isSignedIn = Boolean(userEmail);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl',
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-sm shadow-sm">
            MW
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-zinc-100">
              A-L-L-A-H.COM
            </span>
            <span className="hidden sm:inline-block text-xs text-zinc-500">•</span>
            <Badge variant="gold">
              {currentApp.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Cross-App Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
          <a
            href="http://localhost:3001"
            className={cn('hover:text-amber-400 transition-colors', currentApp === 'dock' && 'text-amber-400')}
          >
            Dock (Discovery)
          </a>
          <a
            href="http://localhost:3002"
            className={cn('hover:text-amber-400 transition-colors', currentApp === 'headquarter' && 'text-amber-400')}
          >
            Headquarter (Ops)
          </a>
          <a
            href="http://localhost:3003/account"
            className={cn('hover:text-amber-400 transition-colors', currentApp === 'id' && 'text-amber-400')}
          >
            MoonWitness ID
          </a>
        </nav>

        {/* User Identity SSO / Launch Action */}
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <a
                href="http://localhost:3003/account"
                className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-200 hover:border-amber-500/30 transition-all"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-zinc-300">{userName || userEmail}</span>
              </a>
              {onSignOut && (
                <Button variant="ghost" size="sm" onClick={onSignOut}>
                  Sign Out
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <a href="http://localhost:3003/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </a>
              <a href="http://localhost:3003/register">
                <Button variant="default" size="sm">
                  Get ID
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

