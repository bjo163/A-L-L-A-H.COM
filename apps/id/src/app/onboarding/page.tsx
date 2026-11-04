'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '../../lib/auth-client';
import { mwClient } from '@allah/sdk';
import { Button, Card, CardContent, Form, Input, Link, PageHero, StatusMessage, sfx } from '@moonwitness/ui';

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [setupState, setSetupState] = useState<'checking' | 'available' | 'closed' | 'created' | 'error'>('checking');

  useEffect(() => {
    document.title = 'Initial Setup | MoonWitness ID';
    mwClient.auth.getOnboardingStatus()
      .then(({ available }) => setSetupState(available ? 'available' : 'closed'))
      .catch(() => setSetupState('error'));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    if (password.length < 12) {
      setError('Use at least 12 characters for the password.');
      return;
    }

    setIsLoading(true);
    try {
      await mwClient.auth.onboard({ name, email, password });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Initial setup failed.');
      if (requestError instanceof Error && requestError.message.includes('already been completed')) {
        setSetupState('closed');
      }
      setIsLoading(false);
      return;
    }

    try {
      const { error: authError } = await authClient.signIn.email({ email, password });
      if (authError) throw new Error(authError.message);
      sfx.success();
      router.push('/account');
    } catch {
      setSetupState('created');
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main id="main-content" tabIndex={-1} className="id-auth-page">
      <div className="id-auth-layout">
        <PageHero
          titleAs="h2"
          kicker="MOONWITNESS / IDENTITY ARCHIVE"
          title="Set up the first administrator."
          summary="Create the first superuser for this hub. This setup closes after the account is created."
          mediaLayout="backdrop"
          media={<Image src="/artwork/lunar-chronicles.png" alt="" width={1600} height={900} priority />}
          captionRight="L / 02 / INITIAL SETUP"
        />

        <div className="id-auth-form">
          <h1 className="id-auth-form__title">Initial hub setup</h1>
          <p className="id-auth-form__note">
            This form creates the first superuser. Later registrations receive a regular account.
          </p>

          <Card as="section">
            <CardContent>
              {setupState === 'checking' && (
                <StatusMessage tone="info" title="Checking setup status">
                  The hub is checking whether initial setup is still available.
                </StatusMessage>
              )}
              {setupState === 'closed' && (
                <StatusMessage tone="warning" title="Initial setup is closed">
                  This hub already has its first superuser. Sign in with an existing account.
                </StatusMessage>
              )}
              {setupState === 'created' && (
                <StatusMessage tone="warning" title="Account created, sign-in needed">
                  The account exists, but automatic sign-in did not complete. Use the sign-in page to continue; do not submit onboarding again.
                </StatusMessage>
              )}
              {setupState === 'error' && (
                <StatusMessage tone="danger" title="Setup status unavailable">
                  The hub could not confirm whether initial setup is available. Reconnect and try again.
                </StatusMessage>
              )}
              {error && (
                <StatusMessage tone="danger" title="Setup failed">
                  {error}
                </StatusMessage>
              )}

              {setupState === 'available' && (
                <Form onSubmit={handleSubmit}>
                  <Input
                    label="Full name"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                  />
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
                    minLength={12}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 12 characters"
                  />
                  <Input
                    label="Confirm password"
                    type="password"
                    required
                    minLength={12}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Repeat the password"
                  />
                  <Button type="submit" disabled={isLoading} className="id-auth-form__submit">
                    {isLoading ? 'Creating the first account' : 'Create the first superuser'}
                  </Button>
                </Form>
              )}

              <p className="id-auth-form__alt">
                <Link href="/login" underline>Return to sign in</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
