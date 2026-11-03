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
        'mw-session-card',
        isCurrent && 'mw-session-card--current',
        className
      )}
    >
      <div className="mw-session-card__details">
        <div className="mw-session-card__copy">
          <div className="mw-session-card__title-row">
            <span className="mw-session-card__title">{deviceName}</span>
            {isCurrent && (
              <Badge variant="gold" dot>
                Current
              </Badge>
            )}
          </div>
          <div className="mw-session-card__metadata">
            <span>IP: {ipAddress}</span>
            <span aria-hidden="true">·</span>
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
