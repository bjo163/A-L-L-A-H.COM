import * as React from 'react';
import { cn } from '../lib/utils';

export type StatePanelKind = 'empty' | 'loading' | 'error' | 'offline' | 'permission';

export interface StatePanelProps {
  kind: StatePanelKind;
  /** Why the user is seeing this panel. Required: a state without a cause is decoration. */
  cause: React.ReactNode;
  /** What the user can do next, in words. Rendered even when `action` is absent. */
  nextAction?: React.ReactNode;
  title?: React.ReactNode;
  /** Kind label above the title. Apps with their own language policy pass a translated one. */
  label?: React.ReactNode;
  /** Button or LinkButton node for the next step. */
  action?: React.ReactNode;
  /** Defaults to "alert" for error and offline, "status" for the rest. */
  role?: 'status' | 'alert';
  as?: 'h2' | 'h3';
  className?: string;
}

const kindLabel: Record<StatePanelKind, string> = {
  empty: 'Nothing here',
  loading: 'Working',
  error: 'Problem',
  offline: 'Offline',
  permission: 'Restricted',
};

const kindTitle: Record<StatePanelKind, string> = {
  empty: 'No records yet',
  loading: 'Loading',
  error: 'This view could not be shown',
  offline: 'The service is unreachable',
  permission: 'Access is not granted',
};

const announceAsAlert: ReadonlySet<StatePanelKind> = new Set<StatePanelKind>(['error', 'offline']);

/**
 * The five non-happy states every data view owes its reader. Replaces jizz-empty,
 * jizz-state, and the state files that four apps never built.
 */
export function StatePanel({
  kind,
  cause,
  nextAction,
  title,
  label,
  action,
  role,
  as: Tag = 'h2',
  className,
}: StatePanelProps) {
  const resolvedRole = role ?? (announceAsAlert.has(kind) ? 'alert' : 'status');

  return (
    <div
      className={cn('mw-state', className)}
      data-slot="state"
      data-kind={kind}
      role={resolvedRole}
      aria-busy={kind === 'loading' || undefined}
    >
      <span className="mw-state__marker" aria-hidden="true" />
      <p className="mw-state__label">{label ?? kindLabel[kind]}</p>
      <Tag className="mw-state__title">{title ?? kindTitle[kind]}</Tag>
      <p className="mw-state__cause">{cause}</p>
      {nextAction && <p className="mw-state__next">{nextAction}</p>}
      {action && <div className="mw-state__action">{action}</div>}
    </div>
  );
}
