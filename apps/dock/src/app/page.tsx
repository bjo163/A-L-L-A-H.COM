'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { mwClient } from '@allah/sdk';
import {
  DestinationCard,
  DestinationGrid,
  EcosystemNavbar,
  LinkButton,
  MotionFrame,
  PageHero,
  RouteShell,
  SectionHeading,
  StatusMessage,
  resolveEcosystemEndpoints,
  type EcosystemAppEndpoints,
} from '@moonwitness/ui';

const destinations = [
  {
    number: '01',
    name: 'Headquarter',
    role: 'Operations',
    description: 'Inspect the gateway, agent tools, and knowledge workspace.',
    href: (endpoints: EcosystemAppEndpoints) => endpoints.headquarter,
  },
  {
    number: '02',
    name: 'MoonWitness ID',
    role: 'Identity',
    description: 'Manage your account and active device sessions.',
    href: (endpoints: EcosystemAppEndpoints) => `${endpoints.id}${endpoints.accountPath}`,
  },
  {
    number: '03',
    name: 'World Observatory',
    role: 'Research',
    description: 'Explore a source-grounded intelligence workspace.',
    href: (endpoints: EcosystemAppEndpoints) => endpoints.jizz,
  },
];

export default function DockHomePage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const endpoints = resolveEcosystemEndpoints(process.env);

  useEffect(() => {
    mwClient.auth.getCurrentUser()
      .then((res) => {
        if (res?.user) setUser(res.user);
      })
      .catch((error: unknown) => {
        setAuthNotice(error instanceof Error ? error.message : 'Session status is unavailable.');
      });
  }, []);

  const handleSignOut = async () => {
    try {
      await mwClient.auth.signOut();
      setUser(null);
      setAuthNotice(null);
    } catch (error) {
      setAuthNotice(error instanceof Error ? error.message : 'Unable to sign out.');
    }
  };

  return (
    <>
      <EcosystemNavbar
        apps={endpoints}
        currentApp="dock"
        userName={user?.name}
        userEmail={user?.email}
        onSignOut={handleSignOut}
      />

      <RouteShell as="main" className="dock-shell">
        {authNotice && (
          <StatusMessage tone="warning" title="Session status">
            {authNotice}
          </StatusMessage>
        )}

        <MotionFrame effect="enter">
          <PageHero
            titleId="dock-title"
            kicker="A-L-L-A-H.COM / ENTRY / IMPERIUM LUMEN"
            title="A platform with room to explore."
            summary="Enter the MoonWitness ecosystem through a clear map of its discovery, identity, operations, and observatory spaces."
            actions={<LinkButton href="#dock-index-title" variant="outline">Explore destinations</LinkButton>}
            media={<Image src="/artwork/imperium-lumen.png" alt="" width={1600} height={900} priority />}
            captionLeft="IMPERIUM LUMEN / THRESHOLD"
            captionRight="01 / ENTRANCE"
          />
        </MotionFrame>

        <section className="dock-index" aria-labelledby="dock-index-title">
          <SectionHeading
            titleId="dock-index-title"
            kicker="WAYFINDING / 01-03"
            title="Choose a destination"
            description="Each space has its own purpose and point of entry."
          />

          <DestinationGrid label="Platform destinations">
            {destinations.map((destination) => (
              <DestinationCard
                key={destination.number}
                index={destination.number}
                role={destination.role}
                title={destination.name}
                description={destination.description}
                href={destination.href(endpoints)}
                external
              />
            ))}
          </DestinationGrid>
        </section>
      </RouteShell>
    </>
  );
}
