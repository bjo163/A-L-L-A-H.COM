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
  captionLeft?: React.ReactNode;
  captionRight?: React.ReactNode;
  /** Wire this to the section's aria-labelledby so the heading stays the accessible name. */
  titleId?: string;
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
  captionLeft,
  captionRight,
  titleId,
  className,
}: PageHeroProps) {
  const hasCaption = captionLeft !== undefined || captionRight !== undefined;

  return (
    <section className={cn('mw-hero', className)} data-slot="hero" aria-labelledby={titleId}>
      <div className="mw-hero__copy">
        {kicker && <Kicker className="mw-hero__kicker">{kicker}</Kicker>}
        <h1 className="mw-hero__title" id={titleId}>
          {title}
        </h1>
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
