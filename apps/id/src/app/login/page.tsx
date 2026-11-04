'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '../../lib/auth-client';
import { mwClient } from '@allah/sdk';
import { Button, Card, CardContent, Form, Input, Link, PageHero, RouteShell, StatusMessage, WorldArtwork, sfx } from '@moonwitness/ui';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deviceName, setDeviceName] = useState('Current Device');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState<'loading' | 'available' | 'closed' | 'error'>('loading');

  useEffect(() => {
    document.title = 'Sign In | MoonWitness ID';
    mwClient.auth.getOnboardingStatus()
      .then(({ available }) => setOnboardingStatus(available ? 'available' : 'closed'))
      .catch(() => setOnboardingStatus('error'));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error: authError } = await authClient.signIn.email(
        { email, password, fetchOptions: { headers: { 'x-device-name': deviceName } } }
      );
      if (authError) throw new Error(authError.message);
      sfx.success();
      router.push('/account');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Invalid credentials or connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RouteShell as="main" className="id-auth-page">
      <div className="id-auth-layout">
        <div className="id-auth-form">
          <h1 className="id-auth-form__title">MoonWitness ID</h1>
          <p className="id-auth-form__note">
            Single sign-on and account authority for MoonWitness and Empire of the Light.
          </p>

          <Card as="section">
            <CardContent>
              {error && (
                <StatusMessage tone="danger" title="Sign in failed">
                  {error}
                </StatusMessage>
              )}

              <Form onSubmit={handleSubmit}>
                <Input
                  label="Email address"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />

                <Input
                  label="Password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                />

                <Input
                  label="Session device name"
                  type="text"
                  autoComplete="off"
                  value={deviceName}
                  onChange={(event) => setDeviceName(event.target.value)}
                  placeholder="e.g. Workstation Chrome"
                  hint="Shown in your session list so you can revoke the right device later."
                />

                <Button type="submit" disabled={isLoading} className="id-auth-form__submit">
                  {isLoading ? 'Verifying credentials' : 'Sign in'}
                </Button>
              </Form>

              <p className="id-auth-form__alt">
                Don&apos;t have an ID yet?{' '}
                <Link href="/register" underline>Register an account</Link>
              </p>
              {onboardingStatus === 'available' && (
                <p className="id-auth-form__alt">
                  Setting up this hub for the first time?{' '}
                  <Link href="/onboarding" underline>Create the initial superuser</Link>
                </p>
              )}
              {onboardingStatus === 'loading' && (
                <StatusMessage tone="info" title="Checking first-run setup">
                  MoonWitness ID is checking whether this hub still needs its first account.
                </StatusMessage>
              )}
              {onboardingStatus === 'error' && (
                <StatusMessage tone="warning" title="Setup status unavailable">
                  The hub could not confirm first-run setup. Try again after reconnecting.
                </StatusMessage>
              )}
            </CardContent>
          </Card>

          <p className="id-auth-form__foot">
            Sessions are issued by the Fastify hub and stored in its embedded PGlite engine.
          </p>
        </div>

        <PageHero
          as="h2"
          className="id-auth-hero"
          kicker="MOONWITNESS / IDENTITY ARCHIVE"
          title="One identity. A connected universe."
          summary="Sign in to manage your account and the sessions linked to it."
          mediaLayout="backdrop"
          media={<WorldArtwork skin="lunar-chronicles" />}
          captionRight="L / 02 / OBSERVATORY"
        />
      </div>
    </RouteShell>
  );
}
