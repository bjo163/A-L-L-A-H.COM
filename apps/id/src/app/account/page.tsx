'use client';

import { useEffect, useState } from 'react';
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
  LinkButton,
  RouteShell,
  SectionHeading,
  SessionCard,
  StatePanel,
  StatusMessage,
  resolveEcosystemEndpoints,
  sfx,
  type StatusTone,
} from '@moonwitness/ui';

export default function AccountCenterPage() {
  const router = useRouter();
  const endpoints = resolveEcosystemEndpoints(process.env);
  const [user, setUser] = useState<UserSubject | null>(null);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [status, setStatus] = useState<{ tone: StatusTone; text: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await mwClient.auth.getCurrentUser();
      if (!res?.user) {
        router.replace('/login');
        return;
      }
      setUser(res.user);

      const sessList = await mwClient.auth.getSessions();
      setSessions(sessList);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load account data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Account | MoonWitness ID';
    loadData();
  }, []);

  const handleRevoke = async (sessionId: number) => {
    setRevokingId(sessionId);
    try {
      await mwClient.auth.revokeSession(sessionId);
      sfx.revoke();
      setStatus({ tone: 'success', text: 'Session terminated on the hub.' });
      setSessions((prev) => prev.filter((session) => session.id !== sessionId));
      const targetSession = sessions.find((session) => session.id === sessionId);
      if (targetSession?.isCurrent) {
        await authClient.signOut();
        router.push('/login');
      }
    } catch (error) {
      setStatus({
        tone: 'danger',
        text: error instanceof Error ? `Unable to revoke session: ${error.message}` : 'Unable to revoke session.',
      });
    } finally {
      setRevokingId(null);
      setTimeout(() => setStatus(null), 6000);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error: authError } = await authClient.signOut();
      if (authError) throw new Error(authError.message);
      router.push('/login');
    } catch (error) {
      setStatus({
        tone: 'danger',
        text: error instanceof Error ? `Unable to sign out: ${error.message}` : 'Unable to sign out.',
      });
    }
  };

  if (isLoading) {
    return (
      <RouteShell as="main" className="id-account-shell">
        <StatePanel kind="loading" title="Account" cause="Reading the profile and its active sessions." />
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
        <StatusMessage tone={status.tone} title={status.tone === 'danger' ? 'Action failed' : 'Action confirmed'}>
          {status.text}
        </StatusMessage>
      )}

      <Card as="section" className="id-account-profile">
        <div className="id-account-profile__identity">
          <Avatar size="lg" name={user?.name} />
          <div>
            <div className="id-account-profile__name-row">
              <h1 className="id-account-profile__name">{user?.name || 'Account overview'}</h1>
              <Badge variant="active" dot>Active ID</Badge>
            </div>
            <p className="id-account-profile__email">{user?.email}</p>
            <p className="id-account-profile__subject">Universal Subject #{user?.id}</p>
          </div>
        </div>

        <dl className="id-account-facts">
          <div>
            <dt>Authority</dt>
            <dd>Fastify Hub</dd>
          </div>
          <div>
            <dt>Client SDK</dt>
            <dd>@allah/sdk</dd>
          </div>
        </dl>

        <Button variant="outline" onClick={handleSignOut}>
          Sign out
        </Button>
      </Card>

      <div className="id-account-columns">
        <section className="id-account-sessions" aria-labelledby="id-sessions-title">
          <SectionHeading
            title="Active sessions and device grants"
            titleId="id-sessions-title"
            description="Revocation is applied on the hub, so a terminated device stops working on every destination."
            trailing={<Badge variant="default">{sessions.length} active</Badge>}
          />

          {sessions.length === 0 ? (
            <StatePanel
              kind="empty"
              cause="No device is holding a session for this account."
              nextAction="Signing in from a new device adds it here, where you can revoke it again."
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
                  onRevoke={handleRevoke}
                />
              ))}
            </div>
          )}
        </section>

        <section className="id-account-consumers" aria-labelledby="id-consumers-title">
          <SectionHeading
            title="Ecosystem destinations"
            titleId="id-consumers-title"
            description="Federated endpoints that accept this identity."
            as="h2"
          />

          <DestinationGrid label="Ecosystem destinations">
            <DestinationCard
              role="discovery"
              title="MoonWitness Dock"
              description="Public discovery and client presentation."
              href={endpoints.dock}
              external
            />
            <DestinationCard
              role="operations"
              title="MoonWitness HQ"
              description="Enterprise operations and command center."
              href={endpoints.headquarter}
              external
            />
            <DestinationCard
              role="research"
              title="World Observatory"
              description="Source-grounded observation workspace."
              href={endpoints.jizz}
              external
            />
          </DestinationGrid>
        </section>
      </div>
    </RouteShell>
  );
}
