'use client';

import * as React from 'react';
import { Button } from '../components/button';
import { Badge } from '../components/badge';
import { Emblem } from '../components/emblem';
import { Link, LinkButton } from '../components/link';
import { cn } from '../lib/utils';
import { resolveEcosystemEndpoints, type EcosystemAppEndpoints } from './endpoints';
import { SoundToggle } from './sound-toggle';
import { VisualEffectsToggle } from './visual-effects-toggle';

export interface EcosystemNavbarProps {
  /** App id shown in the badge. Any workspace name is accepted so a new app can reuse the shared navbar. */
  currentApp?: 'dock' | 'headquarter' | 'id' | 'jizz' | 'gate' | 'moonsky' | 'harbor';
  userName?: string;
  userEmail?: string;
  onSignOut?: () => void;
  showAuthActions?: boolean;
  apps?: Partial<EcosystemAppEndpoints>;
  className?: string;
}

export function EcosystemNavbar({
  currentApp = 'dock',
  userName,
  userEmail,
  onSignOut,
  showAuthActions = true,
  apps,
  className,
}: EcosystemNavbarProps) {
  const endpoints = React.useMemo<EcosystemAppEndpoints>(
    () => ({ ...resolveEcosystemEndpoints(), ...apps }),
    [apps]
  );
  const isSignedIn = Boolean(userEmail);
  const appLabel =
    currentApp === 'headquarter' ? 'HQ' :
    currentApp === 'jizz' ? 'OBSERVATORY' :
    currentApp === 'gate' ? 'GATE' :
    currentApp === 'moonsky' ? 'MOONSKY' :
    currentApp === 'harbor' ? 'HARBOR' :
    currentApp.toUpperCase();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const navigationId = React.useId();

  React.useEffect(() => {
    if (!isMenuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      event.preventDefault();
      setIsMenuOpen(false);
      window.requestAnimationFrame(() => menuButtonRef.current?.focus());
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  return (
    <header
      className={cn('mw-navbar', className)}
      data-slot="navbar"
      onKeyDown={(event) => {
        if (!isMenuOpen || event.key !== 'Escape') return;

        event.preventDefault();
        setIsMenuOpen(false);
        window.requestAnimationFrame(() => menuButtonRef.current?.focus());
      }}
    >
      <div className="mw-navbar__inner">
        {/* Brand & Badge */}
        <div className="mw-navbar__brand">
          <Emblem className="mw-navbar__brand-mark" />
          <div className="mw-navbar__identity">
            <span className="mw-navbar__brand-name">
              A-L-L-A-H.COM
            </span>
            <span className="mw-navbar__separator" aria-hidden="true">·</span>
            <Badge variant="gold">
              {appLabel}
            </Badge>
          </div>
        </div>

        {/* Cross-App Navigation Links */}
        <nav
          id={navigationId}
          className="mw-navbar__links"
          data-open={isMenuOpen}
          aria-label="Ecosystem navigation and controls"
        >
          <Link
            href={endpoints.dock}
            className="mw-navbar__link"
            current={currentApp === 'dock'}
            onClick={() => setIsMenuOpen(false)}
          >
            Dock (Discovery)
          </Link>
          <Link
            href={endpoints.gate}
            className="mw-navbar__link"
            current={currentApp === 'gate'}
            onClick={() => setIsMenuOpen(false)}
          >
            Gate (Entrance)
          </Link>
          <Link
            href={endpoints.headquarter}
            className="mw-navbar__link"
            current={currentApp === 'headquarter'}
            onClick={() => setIsMenuOpen(false)}
          >
            Headquarter (Ops)
          </Link>
          <Link
            href={`${endpoints.id}${endpoints.accountPath}`}
            className="mw-navbar__link"
            current={currentApp === 'id'}
            onClick={() => setIsMenuOpen(false)}
          >
            MoonWitness ID
          </Link>
          <Link
            href={endpoints.jizz}
            className="mw-navbar__link"
            current={currentApp === 'jizz'}
            onClick={() => setIsMenuOpen(false)}
          >
            WORLD OBSERVATORY
          </Link>
          <Link
            href={endpoints.moonsky}
            className="mw-navbar__link"
            current={currentApp === 'moonsky'}
            onClick={() => setIsMenuOpen(false)}
          >
            MOONSKY Console
          </Link>
          <Link
            href={endpoints.harbor}
            className="mw-navbar__link"
            current={currentApp === 'harbor'}
            onClick={() => setIsMenuOpen(false)}
          >
            HARBOR Portal
          </Link>
          <div className="mw-navbar__actions">
            <VisualEffectsToggle />
            <SoundToggle />
            {showAuthActions && isSignedIn ? (
              <div className="mw-navbar__action-group">
              <Link
                href={`${endpoints.id}${endpoints.accountPath}`}
                className="mw-navbar__identity-link"
              >
                <span>{userName || userEmail}</span>
              </Link>
                {onSignOut && (
                  <Button variant="ghost" size="sm" onClick={onSignOut}>
                    Sign Out
                  </Button>
                )}
              </div>
            ) : showAuthActions ? (
              <div className="mw-navbar__action-group">
                <LinkButton href={`${endpoints.id}${endpoints.signInPath}`} variant="outline" size="sm">
                  Sign In
                </LinkButton>
                <LinkButton href={`${endpoints.id}${endpoints.registerPath}`} size="sm">
                  Get ID
                </LinkButton>
              </div>
            ) : null}
          </div>
        </nav>
        <button
          ref={menuButtonRef}
          className="mw-navbar__menu"
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls={navigationId}
          aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? 'Close' : 'Menu'}
        </button>
      </div>
    </header>
  );
}
