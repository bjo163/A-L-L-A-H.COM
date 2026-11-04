'use client';

import { type ReactNode } from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { EcosystemNavbar, Link as MwLink, StatusMessage, resolveEcosystemEndpoints, useEcosystemSession } from '@moonwitness/ui';
import { mwClient } from '@allah/sdk';

const workspaces = [
  { href: '/', label: 'Overview', note: 'Platform map' },
  { href: '/ai-gateway', label: 'AI Gateway', note: 'Routing & usage' },
  { href: '/agent', label: 'Agent Studio', note: 'Run an agent' },
  { href: '/swarm', label: 'Swarm Ops', note: 'Coordinate tasks' },
  { href: '/tools', label: 'Tool Registry', note: 'MCP tools' },
  { href: '/knowledge', label: 'Knowledge', note: 'Qorpus search' },
];

const sessionAuth = {
  getCurrentUser: () => mwClient.auth.getCurrentUser(),
  signOut: () => mwClient.auth.signOut(),
};

export function HeadquarterShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, notice: authNotice, signOut } = useEcosystemSession(sessionAuth);

  return (
    <div className="hq-shell">
      <EcosystemNavbar
        apps={resolveEcosystemEndpoints(process.env)}
        currentApp="headquarter"
        userName={user?.name}
        userEmail={user?.email}
        onSignOut={signOut}
      />
      {authNotice && (
        <StatusMessage tone="warning" title="Session status">
          {authNotice}
        </StatusMessage>
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
                <MwLink asChild current={isCurrent} className="hq-rail__link" key={workspace.href}>
                  <NextLink href={workspace.href}>
                    <span className="hq-rail__link-index">0{index + 1}</span>
                    <span className="hq-rail__link-copy">
                      <span>{workspace.label}</span>
                      <small>{workspace.note}</small>
                    </span>
                    <span className="hq-rail__indicator" aria-hidden="true" />
                  </NextLink>
                </MwLink>
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
