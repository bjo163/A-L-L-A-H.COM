'use client';

import { useEffect, useState } from 'react';
import { mwClient } from '@allah/sdk';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DestinationCard,
  DestinationGrid,
  LinkButton,
  MotionFrame,
  PageHero,
  RouteShell,
  SectionHeading,
  StatusMessage,
} from '@moonwitness/ui';

const managedRoutes = [
  {
    role: 'profile',
    title: 'Account center',
    description: 'Name, subject identifier, and the sessions that carry them.',
    href: '/account',
  },
  {
    role: 'access',
    title: 'Sign in',
    description: 'Open a session on a device you can revoke later.',
    href: '/login',
  },
  {
    role: 'new identity',
    title: 'Create an ID',
    description: 'Register the profile the rest of the ecosystem reads.',
    href: '/register',
  },
];

export default function IdHomePage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  useEffect(() => {
    mwClient.auth
      .getCurrentUser()
      .then((res) => {
        if (res?.user) {
          setUser(res.user);
        }
      })
      .catch((error: unknown) => {
        setAuthNotice(error instanceof Error ? error.message : 'Session status is unavailable.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <RouteShell as="main">
      <MotionFrame effect="enter">
        <PageHero
          kicker="LUNAR CHRONICLES / IDENTITY / SSO"
          title="MoonWitness ID"
          summary="Unified authentication and session center for MoonWitness and Empire of the Light, with observable session governance."
          actions={
            isLoading ? (
              <Button disabled>Checking session</Button>
            ) : user ? (
              <>
                <LinkButton href="/account">Open account center</LinkButton>
                <LinkButton href="/login" variant="outline">Sign in elsewhere</LinkButton>
              </>
            ) : (
              <>
                <LinkButton href="/login">Sign in</LinkButton>
                <LinkButton href="/register" variant="outline">Create ID</LinkButton>
              </>
            )
          }
        />
      </MotionFrame>

      <section className="id-console" aria-labelledby="id-console-title">
        <SectionHeading
          title="Session governance"
          titleId="id-console-title"
          description="Every read below comes from the connected identity service."
          trailing={<Badge variant="default">Observable</Badge>}
        />

        {authNotice && (
          <StatusMessage tone="warning" title="Session status">
            {authNotice}
          </StatusMessage>
        )}

        <Card as="section" className="id-console__panel">
          <CardHeader>
            <div className="id-console__header-row">
              <CardTitle>Identity console</CardTitle>
              <Badge variant="gold">{user ? 'Signed in' : 'Guest'}</Badge>
            </div>
            <CardDescription>The account, the world it renders in, and whether SSO is active.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="id-console__facts">
              <div>
                <dt>Account</dt>
                <dd>{user?.name || user?.email || 'No active session'}</dd>
              </div>
              <div>
                <dt>Skin</dt>
                <dd>Lunar Chronicles</dd>
              </div>
              <div>
                <dt>SSO</dt>
                <dd>Enabled</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <DestinationGrid label="Identity routes">
          {managedRoutes.map((route) => (
            <DestinationCard key={route.href} role={route.role} title={route.title} description={route.description} href={route.href} />
          ))}
        </DestinationGrid>
      </section>
    </RouteShell>
  );
}
