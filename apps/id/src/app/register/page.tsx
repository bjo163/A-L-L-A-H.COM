'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { mwClient } from '@allah/sdk';
import { Button, Form, Input, Card, sfx } from '@moonwitness/ui';
import { UserPlus, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = 'Register | MoonWitness ID';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await mwClient.auth.register({ name, email, password });
      await mwClient.auth.signIn({ email, password, deviceName: 'Primary Session' });
      sfx.success();
      router.push('/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
            <h2>Begin with a secure account.</h2>
            <p>Create the identity used to access your MoonWitness destinations.</p>
          </div>
          <span className="id-auth-aside__index" aria-hidden="true">L / 02 / ARCHIVE</span>
        </aside>

        <div className="id-auth-form">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4 shadow-lg shadow-amber-500/5">
            <UserPlus className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Create MoonWitness <span className="text-amber-400">ID</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Access Dock, Headquarter & Ecosystem Services with one profile
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
              label="Full Name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />

            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            <Input
              label="Password (min 8 chars)"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
            />

            <Input
              label="Confirm Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Provisioning Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </Form>

          <div className="mt-6 pt-6 border-t border-zinc-800/80 text-center">
            <p className="text-xs text-zinc-400">
              Already have an account?{' '}
              <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium underline-offset-4 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </Card>
        </div>
      </div>
    </main>
  );
}
