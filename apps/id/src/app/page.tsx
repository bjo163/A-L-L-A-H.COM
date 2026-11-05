'use client';

import { useCallback, useEffect, useState } from 'react';
import { mwClient } from '@allah/sdk';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  LinkButton,
  MotionFrame,
  PageHero,
  RouteShell,
  SectionHeading,
  StatePanel,
  StatusMessage,
  WorldArtwork,
} from '@moonwitness/ui';
import { authClient } from '../lib/auth-client';
import { resolveIdentityHomeState, type IdentityHomeState } from '../lib/identity-ui';

type HomeViewState = IdentityHomeState | { kind: 'checking' };

export default function IdHomePage() {
  const [homeState, setHomeState] = useState<HomeViewState>({ kind: 'checking' });

  const loadHomeState = useCallback(async () => {
    setHomeState({ kind: 'checking' });
    const state = await resolveIdentityHomeState({
      getSession: () => authClient.getSession(),
      getCurrentUser: () => mwClient.auth.getCurrentUser(),
      getOnboardingStatus: () => mwClient.auth.getOnboardingStatus(),
    });
    setHomeState(state);
  }, []);

  useEffect(() => {
    void loadHomeState();
  }, [loadHomeState]);

  if (homeState.kind === 'checking') {
    return (
      <RouteShell as="main">
        <StatePanel kind="loading" title="Identity status" cause="Checking the current session with the identity service." />
      </RouteShell>
    );
  }

  if (homeState.kind === 'unavailable') {
    return (
      <RouteShell as="main">
        <StatePanel
          kind="offline"
          title="Identity status unavailable"
          cause="The current session could not be confirmed, so this page will not guess whether you are signed in."
          nextAction="Reconnect to the identity service and check again."
          action={
            <>
              <Button variant="outline" onClick={() => void loadHomeState()}>Check again</Button>
              <LinkButton href="/login">Sign in</LinkButton>
            </>
          }
        />
      </RouteShell>
    );
  }

  const authenticated = homeState.kind === 'authenticated';

  return (
    <RouteShell as="main">
      <MotionFrame effect="enter">
        <PageHero
          kicker="THE LUNAR IDENTITY ARCHIVE"
          title="One identity. A connected universe."
          summary="Manage the account and sessions used to enter MoonWitness products. Each destination decides what your account can access."
          media={<WorldArtwork skin="lunar-chronicles" />}
          captionRight="LUNAR / IDENTITY"
          actions={
            authenticated ? (
              <>
                <LinkButton href="/account">Open account center</LinkButton>
                <LinkButton href="/login" variant="outline">Switch account</LinkButton>
              </>
            ) : homeState.onboarding === 'available' ? (
              <>
                <LinkButton href="/onboarding">Set up the first account</LinkButton>
                <LinkButton href="/login" variant="outline">Sign in</LinkButton>
              </>
            ) : (
              <>
                <LinkButton href="/login">Sign in</LinkButton>
                {homeState.onboarding === 'closed' && (
                  <LinkButton href="/register" variant="outline">Create an account</LinkButton>
                )}
              </>
            )
          }
        />
      </MotionFrame>

      <section className="id-console" aria-labelledby="id-console-title">
        <SectionHeading
          title="Identity at a glance"
          titleId="id-console-title"
          description="The account shown here comes from the current identity session."
        />

        {homeState.kind === 'guest' && homeState.onboarding === 'unavailable' && (
          <StatusMessage tone="warning" title="First-run setup status unavailable">
            Sign-in remains available. The initial account link is hidden until the hub confirms setup is open.
            {' '}
            <Button variant="ghost" size="sm" onClick={() => void loadHomeState()}>Check again</Button>
          </StatusMessage>
        )}

        <Card as="section" className="id-console__panel">
          <CardHeader>
            <div className="id-console__header-row">
              <CardTitle>Current identity</CardTitle>
              <Badge variant={authenticated ? 'active' : 'default'}>
                {authenticated ? 'Signed in' : 'Signed out'}
              </Badge>
            </div>
            <CardDescription>
              {authenticated
                ? 'This identity is active in the current browser.'
                : 'Sign in to review the account and its active sessions.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="id-console__facts">
              <div>
                <dt>Account</dt>
                <dd>{authenticated ? homeState.user.name || homeState.user.email : 'No active session'}</dd>
              </div>
              {authenticated && (
                <div>
                  <dt>Email</dt>
                  <dd>{homeState.user.email}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </section>
    </RouteShell>
  );
}
