import * as React from 'react';
import { cn } from '../lib/utils';

export type StatusTone = 'info' | 'success' | 'warning' | 'danger';

export interface StatusMessageProps {
  tone?: StatusTone;
  title?: React.ReactNode;
  /** Button, Link, or LinkButton. Never a bare click handler on the banner itself. */
  action?: React.ReactNode;
  /** Defaults to "alert" for danger and "status" otherwise. */
  role?: 'status' | 'alert';
  className?: string;
  children?: React.ReactNode;
}

const markerGlyph: Record<StatusTone, string> = {
  info: 'i',
  success: '✓',
  warning: '!',
  danger: '×',
};

/**
 * One-line system feedback. Replaces dock-auth-notice, hq-shell__notice, and
 * remote-agent-control__message. The tone is carried by a glyph as well as
 * colour, so a colour-blind or forced-colours reader still reads the state.
 */
export function StatusMessage({
  tone = 'info',
  title,
  action,
  role,
  className,
  children,
}: StatusMessageProps) {
  return (
    <div
      className={cn('mw-status', className)}
      data-slot="status"
      data-tone={tone}
      role={role ?? (tone === 'danger' ? 'alert' : 'status')}
    >
      <span className="mw-status__marker" aria-hidden="true">
        {markerGlyph[tone]}
      </span>
      <div className="mw-status__body">
        {title && (
          <p className="mw-status__title" data-slot="status-title">
            {title}
          </p>
        )}
        {children && (
          <div className="mw-status__message" data-slot="status-message">
            {children}
          </div>
        )}
        {action && <div className="mw-status__action">{action}</div>}
      </div>
    </div>
  );
}
