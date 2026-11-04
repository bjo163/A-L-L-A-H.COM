import * as React from 'react';
import { cn } from '../lib/utils';
import { Kicker } from './kicker';

export interface SectionHeadingProps {
  kicker?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Filter controls, a count, or a Link that belongs to the section rather than the page. */
  trailing?: React.ReactNode;
  titleId?: string;
  /** "h1" when the section heading is also the page title. */
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}

/**
 * Title, description, and trailing control on one line. Replaces
 * dock-index__heading, hq-modules__heading, jizz-records__heading, and
 * gate-section__heading.
 */
export function SectionHeading({
  kicker,
  title,
  description,
  trailing,
  titleId,
  as: Tag = 'h2',
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('mw-section-heading', className)} data-slot="section-heading">
      <div className="mw-section-heading__lead">
        {kicker && <Kicker className="mw-section-heading__kicker">{kicker}</Kicker>}
        <Tag className="mw-section-heading__title" id={titleId}>
          {title}
        </Tag>
      </div>
      {description && <p className="mw-section-heading__description">{description}</p>}
      {trailing && <div className="mw-section-heading__trailing">{trailing}</div>}
    </div>
  );
}
