import * as React from 'react';
import { cn } from '../lib/utils';
import { Kicker } from './kicker';

export interface PageHeroProps {
  kicker?: React.ReactNode;
  title: React.ReactNode;
  summary?: React.ReactNode;
  /** Composed from Button, Link, or LinkButton. The hero renders no native control of its own. */
  actions?: React.ReactNode;
  /** Image, video, or illustration node. Sizing comes from the skin, not the app. */
  media?: React.ReactNode;
  /** "side" places the media next to the copy; "backdrop" lays it under the copy with a scrim. */
  mediaLayout?: 'side' | 'backdrop';
  captionLeft?: React.ReactNode;
  captionRight?: React.ReactNode;
  /** Wire this to the section's aria-labelledby so the heading stays the accessible name. */
  titleId?: string;
  /** A hero that sits under a route title passes "h2" so the page keeps one h1. Same spelling as SectionHeading and StatePanel. */
  as?: 'h1' | 'h2';
  /** @deprecated Renamed to `as` for one heading-tag vocabulary across blocks. Kept for one release. */
  titleAs?: 'h1' | 'h2';
  className?: string;
}

/**
 * Split title-and-media opener. Replaces dock-hero, hq-home__hero, jizz-hero,
 * gate-hero, and id-auth-aside, which were five copies of the same composition.
 */
export function PageHero({
  kicker,
  title,
  summary,
  actions,
  media,
  mediaLayout = 'side',
  captionLeft,
  captionRight,
  titleId,
  as,
  titleAs,
  className,
}: PageHeroProps) {
  const hasCaption = captionLeft !== undefined || captionRight !== undefined;
  const Title = as ?? titleAs ?? 'h1';

  return (
    <section
      className={cn('mw-hero', mediaLayout === 'backdrop' && 'mw-hero--backdrop', className)}
      data-slot="hero"
      data-media-layout={mediaLayout}
      aria-labelledby={titleId}
    >
      <div className="mw-hero__copy">
        {kicker && <Kicker className="mw-hero__kicker">{kicker}</Kicker>}
        <Title className="mw-hero__title" id={titleId}>
          {title}
        </Title>
        {summary && <p className="mw-hero__summary">{summary}</p>}
        {actions && <div className="mw-hero__actions">{actions}</div>}
      </div>
      {media && (
        <figure className="mw-hero__art">
          {media}
          {hasCaption && (
            <figcaption className="mw-hero__caption">
              <span>{captionLeft}</span>
              <span>{captionRight}</span>
            </figcaption>
          )}
        </figure>
      )}
    </section>
  );
}
