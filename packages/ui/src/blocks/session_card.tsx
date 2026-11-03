'use client';

import * as React from 'react';
import { Button } from '../components/button';
import { Badge } from '../components/badge';
import { cn } from '../lib/utils';

export interface SessionCardProps {
  id: number;
  deviceName?: string;
  ipAddress?: string;
  expiresAt: string;
  isCurrent?: boolean;
  onRevoke?: (id: number) => void;
  isLoading?: boolean;
  className?: string;
}

export function SessionCard({
  id,
  deviceName = 'Client Device',
  ipAddress = '127.0.0.1',
  expiresAt,
  isCurrent = false,
  onRevoke,
  isLoading = false,
  className,
}: SessionCardProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-xl border p-4 transition-all',
        isCurrent
          ? 'border-amber-500/30 bg-amber-500/5'
          : 'border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700',
        className
      )}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-semibold',
            isCurrent
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
              : 'border-zinc-700/60 bg-zinc-800/40 text-zinc-400'
          )}
        >
          {isCurrent ? '⚡' : '💻'}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-200">{deviceName}</span>
            {isCurrent && (
              <Badge variant="gold" dot>
                Current
              </Badge>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span>IP: {ipAddress}</span>
            <span>•</span>
            <span>Expires: {new Date(expiresAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {onRevoke && (
        <Button
          variant="destructive"
          size="sm"
          disabled={isLoading}
          onClick={() => onRevoke(id)}
        >
          {isLoading ? 'Revoking...' : 'Revoke'}
        </Button>
      )}
    </div>
  );
}

