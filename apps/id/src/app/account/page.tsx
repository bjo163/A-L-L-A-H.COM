'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IdApiClient, User, SessionInfo } from '@/lib/api';
import {
  ShieldCheck,
  Smartphone,
  Laptop,
  Globe,
  Trash2,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  Clock,
  Layers,
  ExternalLink,
  Loader2,
  AlertTriangle
} from 'lucide-react';

export default function AccountCenterPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const userRes = await IdApiClient.getCurrentUser();
      if (!userRes.success || !userRes.data?.user) {
        router.push('/login');
        return;
      }
      setUser(userRes.data.user);

      const sessRes = await IdApiClient.getSessions();
      if (sessRes.success && sessRes.data) {
        setSessions(sessRes.data);
      }
    } catch {
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRevoke = async (sessionId: number) => {
    setRevokingId(sessionId);
    try {
      const res = await IdApiClient.revokeSession(sessionId);
      if (res.success) {
        setMessage('Session remotely terminated');
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        // If current session was revoked, redirect
        const currentToken = IdApiClient.getSessionToken();
        const targetSession = sessions.find(s => s.id === sessionId);
        if (targetSession && targetSession.session_token === currentToken) {
          IdApiClient.clearSessionToken();
          router.push('/login');
        }
      }
    } catch {
      setMessage('Failed to revoke session');
    } finally {
      setRevokingId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSignOut = async () => {
    await IdApiClient.signOut();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <p className="text-sm text-zinc-400">Loading Account Center...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-amber-500/20 selection:text-amber-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-base shadow-sm">
              MW
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-zinc-100">MoonWitness</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 ml-2 font-mono">
                ID CENTER
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-400 hidden sm:inline-block font-mono">
              {user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {message && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Profile Card */}
        <section className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-400/5 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-2xl shadow-inner">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-zinc-100">{user?.name}</h2>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active ID
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{user?.email}</p>
              <p className="text-[11px] text-zinc-500 mt-1">Universal Identity Subject #{user?.id}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <div className="px-3 py-2 rounded-xl bg-zinc-950/60 border border-zinc-800 text-zinc-300">
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Authority</span>
              Fastify Hub (Port 5150)
            </div>
            <div className="px-3 py-2 rounded-xl bg-zinc-950/60 border border-zinc-800 text-zinc-300">
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold">ORM Engine</span>
              @allah/arsy-orm PGlite
            </div>
          </div>
        </section>

        {/* Grid: Active Sessions & Connected Apps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Sessions Panel */}
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Active Sessions & Device Grants
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Remote session authorization state maintained in Arsy PGlite engine
                </p>
              </div>
              <span className="text-xs font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                {sessions.length} Active
              </span>
            </div>

            <div className="space-y-3">
              {sessions.map((sess) => {
                const isCurrent = sess.session_token === IdApiClient.getSessionToken();
                return (
                  <div
                    key={sess.id}
                    className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                      isCurrent
                        ? 'bg-amber-500/5 border-amber-500/30'
                        : 'bg-zinc-900/30 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                          isCurrent
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-zinc-800/40 border-zinc-700/60 text-zinc-400'
                        }`}
                      >
                        <Laptop className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-zinc-200">
                            {sess.device_name || 'Active Client Device'}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                              Current Session
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1 font-mono">
                          <span>IP: {sess.ip_address || '127.0.0.1'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            Expires: {new Date(sess.expires_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRevoke(sess.id)}
                      disabled={revokingId === sess.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {revokingId === sess.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      <span>Revoke</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Connected Ecosystem Applications */}
          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                Ecosystem Consumers
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Platforms federated by MoonWitness ID
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-200">MoonWitness Dock</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    Port 3001
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Public landing & client presentation portal
                </p>
                <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-medium">SSO Connected</span>
                  <a
                    href="http://localhost:3001"
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-400 hover:text-amber-400 flex items-center gap-1"
                  >
                    <span>Launch</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-200">MoonWitness HQ</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    Port 3002
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Command center, enterprise operations & analytics
                </p>
                <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-medium">SSO Connected</span>
                  <a
                    href="http://localhost:3002"
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-400 hover:text-amber-400 flex items-center gap-1"
                  >
                    <span>Launch</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-200">Empire Web Portal</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    Port 3000
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Legacy consumer and portal client
                </p>
                <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-medium">SSO Connected</span>
                  <a
                    href="http://localhost:3000"
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-400 hover:text-amber-400 flex items-center gap-1"
                  >
                    <span>Launch</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
