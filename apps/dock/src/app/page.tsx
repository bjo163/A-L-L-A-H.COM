'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { EcosystemNavbar, MotionFrame } from '@moonwitness/ui';
import { mwClient } from '@allah/sdk';

const destinations = [
  {
    number: '01',
    name: 'Headquarter',
    role: 'Operations',
    description: 'Inspect the gateway, agent tools, and knowledge workspace.',
    href: 'http://localhost:3002',
  },
  {
    number: '02',
    name: 'MoonWitness ID',
    role: 'Identity',
    description: 'Manage your account and active device sessions.',
    href: 'http://localhost:3003/account',
  },
  {
    number: '03',
    name: 'WORLD OBSERVATORY',
    role: 'Research',
    description: 'Explore a source-grounded intelligence workspace.',
    href: 'http://localhost:3004',
  },
];

export default function DockHomePage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

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
        currentApp="dock"
        userName={user?.name}
        userEmail={user?.email}
        onSignOut={handleSignOut}
      />

      <main className="dock-page">
        {authNotice && (
          <p className="dock-auth-notice" role="status">
            Session status: {authNotice}
          </p>
        )}

        <MotionFrame effect="enter">
          <section className="dock-hero" aria-labelledby="dock-title">
            <div className="dock-hero__copy">
              <p className="dock-kicker">A-L-L-A-H.COM / ENTRY / IMPERIUM LUMEN</p>
              <h1 id="dock-title">A platform with room to explore.</h1>
              <p className="dock-hero__summary">
                Enter the MoonWitness ecosystem through a clear map of its discovery, identity, operations,
                and observatory spaces.
              </p>
              <a className="dock-hero__link" href="#dock-index-title">
                Explore destinations
              </a>
            </div>
            <figure className="dock-hero__art">
              <Image
                src="/artwork/imperium-lumen.png"
                alt=""
                width={1600}
                height={900}
                priority
                className="dock-hero__image"
              />
              <figcaption className="dock-hero__caption">
                <span>IMPERIUM LUMEN / THRESHOLD</span>
                <span>01 / ENTRANCE</span>
              </figcaption>
            </figure>
          </section>
        </MotionFrame>

        <section className="dock-index" aria-labelledby="dock-index-title">
          <div className="dock-index__heading">
            <div>
              <p className="dock-kicker">WAYFINDING / 01-03</p>
              <h2 id="dock-index-title">Choose a destination</h2>
            </div>
            <p>Each space has its own purpose and point of entry.</p>
          </div>

          <nav className="dock-destinations" aria-label="Platform destinations">
            {destinations.map((destination) => (
              <a className="dock-destination" href={destination.href} key={destination.number}>
                <span className="dock-destination__number">{destination.number}</span>
                <span className="dock-destination__role">{destination.role}</span>
                <h3>{destination.name}</h3>
                <p>{destination.description}</p>
                <span className="dock-destination__arrow" aria-hidden="true">↗</span>
              </a>
            ))}
          </nav>
        </section>
      </main>
    </>
  );
}
