'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '../../lib/auth-client';
import { mwClient } from '@allah/sdk';
import type { ActiveSession, UserSubject } from '@moonwitness/types';
import {
  Avatar,
  Badge,
  Button,
  Card,
  DestinationCard,
  DestinationGrid,
  Dialog,
  LinkButton,
  RouteShell,
  SectionHeading,
  SessionCard,
  StatePanel,
  StatusMessage,
  type StatusTone,
} from '@moonwitness/ui';
import { getIdEcosystemEndpoints } from '../../lib/endpoints';
import {
  canStartSessionAction,
  getSafeDestinationUrl,
  getUserFacingAuthError,
  readAccountData,
  revokeSessionAndSignOut,
} from '../../lib/identity-ui';

const endpoints = getIdEcosystemEndpoints();
const isProduction = process.env.NODE_ENV === 'production';

const destinationCandidates = [
  {
    key: 'dock',
    role: 'discovery',
    title: 'MoonWitness Dock',
    description: 'Public discovery and client presentation.',
    href: endpoints.dock,
  },
  {
    key: 'headquarter',
    role: 'operations',
    title: 'MoonWitness HQ',
    description: 'Enterprise operations and command center.',
    href: endpoints.headquarter,
  },
  {
    key: 'jizz',
    role: 'research',
    title: 'World Observatory',
    description: 'Source-grounded observation workspace.',
    href: endpoints.jizz,
  },
];

const destinations = destinationCandidates.flatMap(({ href, ...destination }) => {
  const safeUrl = getSafeDestinationUrl(href, isProduction);
  return safeUrl ? [{ ...destination, href: safeUrl }] : [];
});

export default function AccountCenterPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSubject | null>(null);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [sessionToRevokeId, setSessionToRevokeId] = useState<number | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [status, setStatus] = useState<{ tone: StatusTone; text: string; showLogin?: boolean } | null>(null);
  const sessionActionInFlight = useRef(false);
  const signOutInFlight = useRef(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    const result = await readAccountData(
      () => mwClient.auth.getCurrentUser(),
      () => mwClient.auth.getSessions()
    );
    if (result.kind === 'signed-out') {
      router.replace('/login');
    } else if (result.kind === 'unavailable') {
      setLoadError(getUserFacingAuthError('account'));
    } else {
      setUser(result.user);
      setSessions(result.sessions);
    }
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleRevoke = async (sessionId: number) => {
    if (!canStartSessionAction(sessionActionInFlight.current, signOutInFlight.current)) return;
    sessionActionInFlight.current = true;
    setRevokingId(sessionId);
    setStatus(null);
    const targetSession = sessions.find((session) => session.id === sessionId);

    try {
      const outcome = await revokeSessionAndSignOut(
        () => mwClient.auth.revokeSession(sessionId),
        () => authClient.signOut(),
        targetSession?.isCurrent === true
      );
      setSessions((previous) => previous.filter((session) => session.id !== sessionId));
      setSessionToRevokeId(null);

      if (outcome === 'current-session-revoked') {
        router.replace('/login');
      } else if (outcome === 'current-session-signout-failed') {
        setStatus({
          tone: 'warning',
          text: 'The hub confirmed revocation, but the browser could not clear its sign-in state.',
          showLogin: true,
        });
      } else {
        setStatus({ tone: 'success', text: 'The hub confirmed session revocation.' });
      }
    } catch {
      setStatus({ tone: 'danger', text: getUserFacingAuthError('revoke') });
      setSessionToRevokeId(null);
    } finally {
      sessionActionInFlight.current = false;
      setRevokingId(null);
    }
  };

  const sessionToRevoke = sessions.find((session) => session.id === sessionToRevokeId) ?? null;

  const handleSignOut = async () => {
    if (!canStartSessionAction(signOutInFlight.current, sessionActionInFlight.current)) return;
    signOutInFlight.current = true;
    setIsSigningOut(true);
    setStatus(null);
    try {
      const { error: authError } = await authClient.signOut();
      if (authError) throw new Error('Sign-out was not confirmed');
      router.replace('/login');
    } catch {
      setStatus({ tone: 'danger', text: getUserFacingAuthError('signout') });
    } finally {
      signOutInFlight.current = false;
      setIsSigningOut(false);
    }
  };

  if (isLoading) {
    return (
      <RouteShell as="main" className="id-account-shell">
        <StatePanel kind="loading" title="Account" cause="Reading the profile and active sessions." />
      </RouteShell>
    );
  }

  if (loadError) {
    return (
      <RouteShell as="main" className="id-account-shell">
        <StatePanel
          kind="error"
          title="Account data unavailable"
          cause={loadError}
          nextAction="Retry the read, or sign in again if the session has expired."
          action={
            <>
              <Button variant="outline" onClick={() => void loadData()}>
                Try again
              </Button>
              <LinkButton href="/login">Sign in</LinkButton>
            </>
          }
        />
      </RouteShell>
    );
  }

  return (
    <RouteShell as="main" className="id-account-shell">
      {status && (
        <StatusMessage
          tone={status.tone}
          title={
            status.tone === 'danger'
              ? 'Action not confirmed'
              : status.tone === 'warning'
                ? 'Session revoked'
                : 'Action confirmed'
          }
        >
          {status.text}
          {status.showLogin && (
            <>
              {' '}
              <LinkButton href="/login" variant="outline">Return to sign in</LinkButton>
            </>
          )}
        </StatusMessage>
      )}

      {revokingId !== null && (
        <StatusMessage tone="info" title="Revoking session">
          Waiting for the identity service to confirm this action.
        </StatusMessage>
      )}

      <Dialog
        open={sessionToRevoke !== null}
        onOpenChange={(open) => {
          if (!open && revokingId === null) setSessionToRevokeId(null);
        }}
        title={sessionToRevoke?.isCurrent ? 'End this session?' : 'Revoke this session?'}
        description={
          sessionToRevoke?.isCurrent
            ? 'You will be signed out of this browser after the identity service confirms revocation.'
            : `The ${sessionToRevoke?.deviceName?.trim() || 'unnamed device'} session will remain listed until the identity service confirms revocation.`
        }
        footer={
          <>
            <Button
              variant="ghost"
              disabled={revokingId !== null}
              onClick={() => setSessionToRevokeId(null)}
            >
              Keep session
            </Button>
            <Button
              variant="destructive"
              disabled={revokingId !== null || sessionToRevoke === null}
              onClick={() => {
                if (sessionToRevoke) void handleRevoke(sessionToRevoke.id);
              }}
            >
              {revokingId !== null ? 'Revoking...' : 'Revoke session'}
            </Button>
          </>
        }
      />

      <Card as="section" className="id-account-profile">
        <div className="id-account-profile__identity">
          <Avatar size="lg" name={user?.name} />
          <div>
            <div className="id-account-profile__name-row">
              <h1 className="id-account-profile__name">{user?.name || 'Account overview'}</h1>
              <Badge variant="active" dot>Active ID</Badge>
            </div>
            <p className="id-account-profile__email">{user?.email}</p>
            <p className="id-account-profile__subject">Identity details supplied by the account service</p>
          </div>
        </div>

        <Button variant="outline" disabled={isSigningOut || revokingId !== null} onClick={handleSignOut}>
          {isSigningOut ? 'Signing out...' : 'Sign out'}
        </Button>
      </Card>

      <div className="id-account-columns">
        <section className="id-account-sessions" aria-labelledby="id-sessions-title">
          <SectionHeading
            title="Active sessions"
            titleId="id-sessions-title"
            description="The identity service reports these sessions. Expiry dates use UTC."
            trailing={<Badge variant="default">{sessions.length} active</Badge>}
          />

          {sessions.length === 0 ? (
            <StatePanel
              kind="empty"
              cause="The identity service reports no active sessions for this account."
              nextAction="A new sign-in will appear here, where it can be reviewed or revoked."
            />
          ) : (
            <div className="id-account-sessions__list">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  id={session.id}
                  deviceName={session.deviceName}
                  ipAddress={session.ipAddress}
                  expiresAt={session.expiresAt}
                  isCurrent={session.isCurrent}
                  isLoading={revokingId === session.id}
                  onRevoke={
                    revokingId === null && !isSigningOut
                      ? (sessionId) => setSessionToRevokeId(sessionId)
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </section>

        <section className="id-account-consumers" aria-labelledby="id-consumers-title">
          <SectionHeading
            title="Connected destinations"
            titleId="id-consumers-title"
            description="Only configured addresses are listed. Each product decides what your account can access."
            as="h2"
          />

          {destinations.length > 0 ? (
            <DestinationGrid label="Connected destinations">
              {destinations.map((destination) => (
                <DestinationCard
                  key={destination.key}
                  role={destination.role}
                  title={destination.title}
                  description={destination.description}
                  href={destination.href}
                  external
                />
              ))}
            </DestinationGrid>
          ) : (
            <StatePanel
              kind="empty"
              cause="No safe destination address is configured for this environment."
              nextAction="Use the address supplied by your administrator when one is available."
            />
          )}
        </section>
      </div>
    </RouteShell>
  );
}
