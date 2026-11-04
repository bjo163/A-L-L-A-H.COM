import * as React from 'react';
import { cn } from '../lib/utils';
import { Kicker } from './kicker';

export interface RouteShellProps {
  kicker?: React.ReactNode;
  /** Pass a title for plain routes. Omit it when the route opens with a PageHero. */
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  titleId?: string;
  /** "main" only when the route owns the landmark; app layouts usually already have one. */
  as?: 'div' | 'main';
  className?: string;
  children?: React.ReactNode;
}

/**
 * Measure and header common to every signed-in route. Replaces dock-page,
 * hq-route, hq-shell__content, id-account-page, jizz-page, and gate-page.
 */
export function RouteShell({
  kicker,
  title,
  description,
  actions,
  titleId,
  as: Tag = 'div',
  className,
  children,
}: RouteShellProps) {
  const hasHeader = kicker !== undefined || title !== undefined || description !== undefined || actions !== undefined;

  return (
    <Tag className={cn('mw-route', className)} data-slot="route">
      {hasHeader && (
        <header className="mw-route__header">
          {kicker && <Kicker className="mw-route__kicker">{kicker}</Kicker>}
          {title && (
            <h1 className="mw-route__title" id={titleId}>
              {title}
            </h1>
          )}
          {description && <p className="mw-route__description">{description}</p>}
          {actions && <div className="mw-route__actions">{actions}</div>}
        </header>
      )}
      {children}
    </Tag>
  );
}
