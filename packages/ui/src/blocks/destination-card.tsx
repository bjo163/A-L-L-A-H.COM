import * as React from 'react';
import { Link, type LinkProps } from '../components/link';
import { cn } from '../lib/utils';

export interface DestinationCardProps extends Omit<LinkProps, 'children' | 'href' | 'role' | 'title'> {
  /** Ordinal shown in the corner, for example "01". */
  index?: React.ReactNode;
  /** The small label above the title, for example "operations" or "module". */
  role?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Availability or state marker. Pass a Badge so the tone stays a shared vocabulary. */
  status?: React.ReactNode;
  /** Omit it for a destination that is not open yet: the card then renders as plain content, not a dead link. */
  href?: string;
}

/**
 * Card-shaped link to another world. Replaces dock-destination, hq-module,
 * universe-destination, and the gate closing-horizon destination list.
 */
export function DestinationCard({
  index,
  role,
  title,
  description,
  status,
  href,
  className,
  ...props
}: DestinationCardProps) {
  const body = (
    <>
      {index !== undefined && <span className="mw-destination__index">{index}</span>}
      {role && <span className="mw-destination__role">{role}</span>}
      <h3 className="mw-destination__title">{title}</h3>
      {description && <p className="mw-destination__description">{description}</p>}
      {status && <span className="mw-destination__status">{status}</span>}
      {href !== undefined && (
        <span className="mw-destination__arrow" aria-hidden="true">
          ↗
        </span>
      )}
    </>
  );

  if (href === undefined) {
    return (
      <article className={cn('mw-destination', 'mw-destination--static', className)} data-slot="destination">
        {body}
      </article>
    );
  }

  return (
    <Link className={cn('mw-destination', className)} href={href} data-slot="destination" {...props}>
      {body}
    </Link>
  );
}

/** Plain non-link container for the grids that hold destination cards. */
export function DestinationGrid({
  className,
  label,
  children,
}: {
  className?: string;
  label?: string;
  children: React.ReactNode;
}) {
  if (label) {
    return (
      <nav className={cn('mw-destinations', className)} aria-label={label} data-slot="destination-grid">
        {children}
      </nav>
    );
  }
  return <div className={cn('mw-destinations', className)} data-slot="destination-grid">{children}</div>;
}
