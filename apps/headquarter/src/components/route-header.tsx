import type { ReactNode } from 'react';

export interface RouteHeaderProps {
  /** Route title, rendered as the single page-level h1. */
  title: ReactNode;
  /** One-line summary under the title. */
  summary?: ReactNode;
  /** Live status node (a Badge, StatePanel label, etc.) aligned to the title. */
  status?: ReactNode;
  /** Primary route actions (refresh, run) aligned to the far edge. */
  actions?: ReactNode;
}

/**
 * The route header shared by every Headquarter control page. Replaces the
 * copy-pasted `flex … border-b border-border pb-6` blocks so title, status and
 * actions line up identically across the app. Layout is owned by `.hq-route-header`
 * in globals.css, which resolves every colour through a skin token.
 */
export function RouteHeader({ title, summary, status, actions }: RouteHeaderProps) {
  return (
    <header className="hq-route-header">
      <div className="hq-route-header__title">
        <h1>
          {title}
          {status ? <span className="hq-route-header__status">{status}</span> : null}
        </h1>
        {summary ? <p>{summary}</p> : null}
      </div>
      {actions ? <div className="hq-route-header__actions">{actions}</div> : null}
    </header>
  );
}
