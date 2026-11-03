'use client';

import { useState, useEffect } from 'react';
import { EcosystemNavbar, Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@moonwitness/ui';
import { mwClient } from '@allah/sdk';

export default function HeadquarterHomePage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    mwClient.auth.getCurrentUser()
      .then(res => {
        if (res?.user) setUser(res.user);
      })
      .catch(() => {});
  }, []);

  const handleSignOut = async () => {
    await mwClient.auth.signOut();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      <EcosystemNavbar
        currentApp="headquarter"
        userName={user?.name}
        userEmail={user?.email}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 sm:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
                Command Headquarter
              </h1>
              <Badge variant="gold" dot>LIVE</Badge>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Operations, tenant policies & runtime telemetry
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a href="http://localhost:3003/account">
              <Button variant="outline" size="sm">ID Settings</Button>
            </a>
            <a href="http://localhost:3001">
              <Button variant="default" size="sm">Open Dock</Button>
            </a>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Fastify Gateway Runtime</CardTitle>
              <CardDescription>Primary API & In-Memory PGlite Authority</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs font-mono text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Status:</span>
                  <span className="text-emerald-400">ONLINE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Port:</span>
                  <span>5150</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Database:</span>
                  <span>PGlite WASM</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Authority</CardTitle>
              <CardDescription>Remote Session Revocation Engine</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs font-mono text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-500">SSO Provider:</span>
                  <span className="text-amber-400">MoonWitness ID</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Token Format:</span>
                  <span>sess_* (64-byte)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Guard:</span>
                  <span className="text-emerald-400">Cross-App Fail-Closed</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Invariants</CardTitle>
              <CardDescription>Quality & Anti-Slop Enforcement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs font-mono text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Design System:</span>
                  <span className="text-amber-400">@moonwitness/ui</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">SDK:</span>
                  <span className="text-emerald-400">@allah/sdk</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Doc Score:</span>
                  <span className="text-emerald-400">100 / 100</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
