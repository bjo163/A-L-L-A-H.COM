'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { mwClient } from '@allah/sdk';
import { Button, Form, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, sfx } from '@moonwitness/ui';
import { ShieldCheck, KeyRound, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deviceName, setDeviceName] = useState('Current Device');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = 'Sign In | MoonWitness ID';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await mwClient.auth.signIn({ email, password, deviceName });
      sfx.success();
      router.push('/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials or connection error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main id="main-content" tabIndex={-1} className="id-auth-page">
      <div className="id-auth-layout">
        <aside className="id-auth-aside">
          <Image
            src="/artwork/lunar-chronicles.png"
            alt=""
            width={1600}
            height={900}
            priority
            className="id-auth-aside__art"
          />
          <div className="id-auth-aside__copy">
            <p className="id-kicker">MOONWITNESS / IDENTITY ARCHIVE</p>
            <h2>One identity. A connected universe.</h2>
            <p>Sign in to manage your account and the sessions linked to it.</p>
          </div>
          <span className="id-auth-aside__index" aria-hidden="true">L / 02 / OBSERVATORY</span>
        </aside>

        <div className="id-auth-form">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4 shadow-lg shadow-amber-500/5">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            MoonWitness <span className="text-amber-400">ID</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Single Sign-On & Account Authority for MoonWitness & Empire
          </p>
        </div>

        <Card>
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Form onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
            />

            <Input
              label="Session Device Name (Optional)"
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="e.g. Workstation Chrome"
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </Form>

          <div className="mt-6 pt-6 border-t border-zinc-800/80 text-center">
            <p className="text-xs text-zinc-400">
              Don&apos;t have an ID yet?{' '}
              <Link href="/register" className="text-amber-400 hover:text-amber-300 font-medium underline-offset-4 hover:underline">
                Register an Account
              </Link>
            </p>
          </div>
        </Card>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500/70" />
          <span>Secured by Fastify Hub & Embedded PGlite Native Engine</span>
        </div>
        </div>
      </div>
    </main>
  );
}
