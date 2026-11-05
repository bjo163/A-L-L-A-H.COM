'use client';

import * as React from 'react';
import { Button } from '../components/button';
import { Badge } from '../components/badge';
import { cn } from '../lib/utils';
import { MotionFrame } from '../primitives/visual-effects';

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
  deviceName,
  ipAddress,
  expiresAt,
  isCurrent = false,
  onRevoke,
  isLoading = false,
  className,
}: SessionCardProps) {
  const expiration = Date.parse(expiresAt);
  const hasValidExpiration = Number.isFinite(expiration);

  return (
    <MotionFrame
      className={cn(
        'mw-session-card',
        isCurrent && 'mw-session-card--current',
        className
      )}
      data-slot="session-card"
      effect="enter"
    >
      <div className="mw-session-card__details">
        <div className="mw-session-card__copy">
          <div className="mw-session-card__title-row">
            <span className="mw-session-card__title">{deviceName?.trim() || 'Unnamed device'}</span>
            {isCurrent && (
              <Badge variant="gold" dot>
                Current
              </Badge>
            )}
          </div>
          <div className="mw-session-card__metadata">
            {ipAddress && <span>IP: {ipAddress}</span>}
            {ipAddress && <span aria-hidden="true">·</span>}
            <span>
              Expires:{' '}
              {hasValidExpiration
                ? <time dateTime={expiresAt}>{new Date(expiration).toISOString().slice(0, 10)}</time>
                : 'Not reported'}
            </span>
          </div>
        </div>
      </div>

      {onRevoke && (
        <Button
          variant="destructive"
          size="sm"
          disabled={isLoading}
          aria-label={`Revoke session for ${deviceName?.trim() || 'unnamed device'}`}
          onClick={() => onRevoke(id)}
        >
          {isLoading ? 'Revoking...' : 'Revoke'}
        </Button>
      )}
    </MotionFrame>
  );
}
