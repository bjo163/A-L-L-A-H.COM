'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { EcosystemNavbar } from '@moonwitness/ui';
import { mwClient } from '@allah/sdk';

const workspaces = [
  { href: '/', label: 'Overview', note: 'Platform map' },
  { href: '/ai-gateway', label: 'AI Gateway', note: 'Routing & usage' },
  { href: '/agent', label: 'Agent Studio', note: 'Run an agent' },
  { href: '/swarm', label: 'Swarm Ops', note: 'Coordinate tasks' },
  { href: '/tools', label: 'Tool Registry', note: 'MCP tools' },
  { href: '/knowledge', label: 'Knowledge', note: 'Qorpus search' },
];

export function HeadquarterShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    mwClient.auth.getCurrentUser()
      .then((res) => {
        if (active && res?.user) setUser(res.user);
      })
      .catch((error: unknown) => {
        if (active) {
          setAuthNotice(error instanceof Error ? error.message : 'Session status is unavailable.');
        }
      });

    return () => {
      active = false;
    };
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
    <div className="hq-shell">
      <EcosystemNavbar
        currentApp="headquarter"
        userName={user?.name}
        userEmail={user?.email}
        onSignOut={handleSignOut}
      />
      {authNotice && (
        <p className="hq-shell__notice" role="status">
          Session status: {authNotice}
        </p>
      )}
      <div className="hq-shell__layout">
        <aside className="hq-rail" aria-label="Headquarter workspace">
          <div className="hq-rail__heading">
            <span className="hq-rail__index">N / 04</span>
            <p>Control modules</p>
          </div>
          <nav className="hq-rail__nav" aria-label="Headquarter sections">
            {workspaces.map((workspace, index) => {
              const isCurrent = pathname === workspace.href;

              return (
                <a
                  className="hq-rail__link"
                  href={workspace.href}
                  aria-current={isCurrent ? 'page' : undefined}
                  key={workspace.href}
                >
                  <span className="hq-rail__link-index">0{index + 1}</span>
                  <span className="hq-rail__link-copy">
                    <span>{workspace.label}</span>
                    <small>{workspace.note}</small>
                  </span>
                  <span className="hq-rail__indicator" aria-hidden="true" />
                </a>
              );
            })}
          </nav>
          <p className="hq-rail__footer">NEXUS PARADOX / OPERATIONS</p>
        </aside>
        <div className="hq-shell__content">{children}</div>
      </div>
    </div>
  );
}
