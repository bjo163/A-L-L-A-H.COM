'use client';

import * as React from 'react';
import { Button, buttonVariants } from '../components/button';
import { Badge } from '../components/badge';
import { cn } from '../lib/utils';
import { SoundToggle } from './sound-toggle';

export interface EcosystemNavbarProps {
  currentApp?: 'dock' | 'headquarter' | 'id' | 'jizz';
  userName?: string;
  userEmail?: string;
  onSignOut?: () => void;
  showAuthActions?: boolean;
  className?: string;
}

export function EcosystemNavbar({
  currentApp = 'dock',
  userName,
  userEmail,
  onSignOut,
  showAuthActions = true,
  className,
}: EcosystemNavbarProps) {
  const isSignedIn = Boolean(userEmail);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const navigationId = React.useId();

  return (
    <header
      className={cn('mw-navbar', className)}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && isMenuOpen) {
          setIsMenuOpen(false);
          menuButtonRef.current?.focus();
        }
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
              {currentApp.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Cross-App Navigation Links */}
        <nav
          id={navigationId}
          className="mw-navbar__links"
          data-open={isMenuOpen}
          aria-label="Ecosystem"
        >
          <a
            href="http://localhost:3001"
            className="mw-navbar__link"
            aria-current={currentApp === 'dock' ? 'page' : undefined}
            onClick={() => setIsMenuOpen(false)}
          >
            Dock (Discovery)
          </a>
          <a
            href="http://localhost:3002"
            className="mw-navbar__link"
            aria-current={currentApp === 'headquarter' ? 'page' : undefined}
            onClick={() => setIsMenuOpen(false)}
          >
            Headquarter (Ops)
          </a>
          <a
            href="http://localhost:3003/account"
            className="mw-navbar__link"
            aria-current={currentApp === 'id' ? 'page' : undefined}
            onClick={() => setIsMenuOpen(false)}
          >
            MoonWitness ID
          </a>
          <a
            href="http://localhost:3004"
            className="mw-navbar__link"
            aria-current={currentApp === 'jizz' ? 'page' : undefined}
            onClick={() => setIsMenuOpen(false)}
          >
            WORLD OBSERVATORY
          </a>
        </nav>

        {/* User Identity SSO / Launch Action */}
        <div className="mw-navbar__actions">
          <SoundToggle />
          {showAuthActions && isSignedIn ? (
            <div className="mw-navbar__action-group">
              <a
                href="http://localhost:3003/account"
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
                href="http://localhost:3003/login"
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
              >
                Sign In
              </a>
              <a
                href="http://localhost:3003/register"
                className={cn(buttonVariants({ variant: 'default', size: 'sm' }))}
              >
                Get ID
              </a>
            </div>
          ) : null}
        </div>
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
