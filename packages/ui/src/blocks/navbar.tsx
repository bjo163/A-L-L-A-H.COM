'use client';

import * as React from 'react';
import { Button, buttonVariants } from '../components/button';
import { Badge } from '../components/badge';
import { cn } from '../lib/utils';
import { resolveEcosystemEndpoints, type EcosystemAppEndpoints } from './endpoints';
import { SoundToggle } from './sound-toggle';
import { VisualEffectsToggle } from './visual-effects-toggle';

export interface EcosystemNavbarProps {
  currentApp?: 'dock' | 'headquarter' | 'id' | 'jizz';
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
          <div className="mw-navbar__brand-mark">
            MW
          </div>
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
          <a
            href={endpoints.dock}
            className="mw-navbar__link"
            aria-current={currentApp === 'dock' ? 'page' : undefined}
            onClick={() => setIsMenuOpen(false)}
          >
            Dock (Discovery)
          </a>
          <a
            href={endpoints.headquarter}
            className="mw-navbar__link"
            aria-current={currentApp === 'headquarter' ? 'page' : undefined}
            onClick={() => setIsMenuOpen(false)}
          >
            Headquarter (Ops)
          </a>
          <a
            href={`${endpoints.id}${endpoints.accountPath}`}
            className="mw-navbar__link"
            aria-current={currentApp === 'id' ? 'page' : undefined}
            onClick={() => setIsMenuOpen(false)}
          >
            MoonWitness ID
          </a>
          <a
            href={endpoints.jizz}
            className="mw-navbar__link"
            aria-current={currentApp === 'jizz' ? 'page' : undefined}
            onClick={() => setIsMenuOpen(false)}
          >
            WORLD OBSERVATORY
          </a>
          <div className="mw-navbar__actions">
            <VisualEffectsToggle />
            <SoundToggle />
            {showAuthActions && isSignedIn ? (
              <div className="mw-navbar__action-group">
                <a
                  href={`${endpoints.id}${endpoints.accountPath}`}
                  className="mw-navbar__identity-link"
                >
                  <span>{userName || userEmail}</span>
                </a>
                {onSignOut && (
                  <Button variant="ghost" size="sm" onClick={onSignOut}>
                    Sign Out
                  </Button>
                )}
              </div>
            ) : showAuthActions ? (
              <div className="mw-navbar__action-group">
                <a
                  href={`${endpoints.id}${endpoints.signInPath}`}
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                >
                  Sign In
                </a>
                <a
                  href={`${endpoints.id}${endpoints.registerPath}`}
                  className={cn(buttonVariants({ variant: 'default', size: 'sm' }))}
                >
                  Get ID
                </a>
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
