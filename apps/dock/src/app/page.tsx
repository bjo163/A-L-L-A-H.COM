'use client';

import { useState, useEffect } from 'react';
import { EcosystemNavbar, Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@moonwitness/ui';
import { mwClient } from '@allah/sdk';

export default function DockHomePage() {
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      <EcosystemNavbar
        currentApp="dock"
        userName={user?.name}
        userEmail={user?.email}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 sm:p-8 space-y-12">
        <section className="text-center py-12 space-y-4">
          <div className="inline-flex items-center gap-2 mb-2">
            <Badge variant="gold" dot>Ecosystem Discovery</Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
            A-L-L-A-H Dock & Gateway
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto text-base md:text-lg">
            Unified developer platform powered by Fastify Hub, native embedded PGlite WASM,
            and shared MoonWitness ID SSO authority.
          </p>
          <div className="pt-4 flex items-center justify-center gap-3">
            <a href="http://localhost:3002">
              <Button variant="default" size="lg">Open Headquarter</Button>
            </a>
            <a href="http://localhost:3003/account">
              <Button variant="outline" size="lg">Manage MoonWitness ID</Button>
            </a>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Smart LLM Router</CardTitle>
                <Badge variant="active" dot>Active</Badge>
              </div>
              <CardDescription>OpenAI-compatible gateway endpoint at Fastify Hub</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-400 font-mono">
                Port 5150 • Multi-tier fallback & caching
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>MoonWitness ID</CardTitle>
                <Badge variant="gold" dot>SSO Center</Badge>
              </div>
              <CardDescription>Centralized session & device grant manager</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-400 font-mono">
                Port 3003 • Zero ORM overlap with PGlite
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Headquarter</CardTitle>
                <Badge variant="default">Port 3002</Badge>
              </div>
              <CardDescription>Enterprise operations, command & analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-400 font-mono">
                Live metrics & unified platform monitoring
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
