'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mwClient } from '@allah/sdk';
import type { UserSubject, ActiveSession } from '@moonwitness/types';
import { SessionCard, Button, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, sfx } from '@moonwitness/ui';
import { ShieldCheck, CheckCircle2, Layers, ExternalLink, Loader2 } from 'lucide-react';

export default function AccountCenterPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSubject | null>(null);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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
      setMessage('Session remotely terminated');
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      const currentToken = mwClient.getSessionToken();
      const targetSession = sessions.find(s => s.id === sessionId);
      if (targetSession && targetSession.sessionToken === currentToken) {
        mwClient.clearSessionToken();
        router.push('/login');
      }
    } catch (error) {
      setMessage(error instanceof Error ? `Unable to revoke session: ${error.message}` : 'Unable to revoke session.');
    } finally {
      setRevokingId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSignOut = async () => {
    try {
      await mwClient.auth.signOut();
      router.push('/login');
    } catch (error) {
      setMessage(error instanceof Error ? `Unable to sign out: ${error.message}` : 'Unable to sign out.');
    }
  };

  if (isLoading) {
    return (
      <main className="id-loading">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-xl font-semibold text-zinc-100">Account</h1>
          <div className="flex flex-col items-center gap-3" role="status">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <p className="text-sm text-zinc-400">Loading Account Center...</p>
          </div>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="id-loading">
        <div className="w-full max-w-md space-y-4 rounded-2xl border border-red-500/30 bg-zinc-900/80 p-6">
          <h1 className="text-xl font-semibold text-zinc-100">Account data unavailable</h1>
          <p className="text-sm text-red-300" role="alert">{loadError}</p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={loadData} disabled={isLoading}>Try Again</Button>
            <a className="inline-flex min-h-11 items-center px-3 text-sm text-zinc-300 underline underline-offset-4" href="/login">
              Go to Sign In
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="id-account-page">
      <div className="id-account-content">
        {message && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <section className="id-account-profile p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-400/5 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-2xl shadow-inner">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-zinc-100">{user?.name || 'Account overview'}</h1>
                <Badge variant="active" dot>Active ID</Badge>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{user?.email}</p>
              <p className="text-[11px] text-zinc-500 mt-1">Universal Subject #{user?.id}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <div className="px-3 py-2 rounded-xl bg-zinc-950/60 border border-zinc-800 text-zinc-300">
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Authority</span>
              Fastify Hub
            </div>
            <div className="px-3 py-2 rounded-xl bg-zinc-950/60 border border-zinc-800 text-zinc-300">
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Client SDK</span>
              @allah/sdk
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Active Sessions & Device Grants
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Remote session revocation state maintained in Arsy PGlite engine
                </p>
              </div>
              <span className="text-xs font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                {sessions.length} Active
              </span>
            </div>

            <div className="space-y-3">
              {sessions.length === 0 ? (
                <p className="text-sm text-zinc-400" role="status">
                  No active sessions are registered for this account.
                </p>
              ) : (
                sessions.map((sess) => (
                  <SessionCard
                    key={sess.id}
                    id={sess.id}
                    deviceName={sess.deviceName}
                    ipAddress={sess.ipAddress}
                    expiresAt={sess.expiresAt}
                    isCurrent={sess.isCurrent}
                    isLoading={revokingId === sess.id}
                    onRevoke={handleRevoke}
                  />
                ))
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                Ecosystem Consumers
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Federated standalone endpoints
              </p>
            </div>

            <div className="space-y-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>MoonWitness Dock</CardTitle>
                    <Badge variant="default">Discovery</Badge>
                  </div>
                  <CardDescription>Public discovery & client presentation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-medium">Open workspace</span>
                    <a href="http://localhost:3001" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-amber-400 flex items-center gap-1">
                      <span>Launch</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>MoonWitness HQ</CardTitle>
                    <Badge variant="default">Operations</Badge>
                  </div>
                  <CardDescription>Enterprise operations & command center</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-medium">Open workspace</span>
                    <a href="http://localhost:3002" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-amber-400 flex items-center gap-1">
                      <span>Launch</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>WORLD OBSERVATORY</CardTitle>
                    <Badge variant="default">Research</Badge>
                  </div>
                  <CardDescription>Source-grounded observation workspace</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-medium">Open workspace</span>
                    <a href="http://localhost:3004" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-amber-400 flex items-center gap-1">
                      <span>Launch</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
