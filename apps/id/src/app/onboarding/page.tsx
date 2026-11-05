'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '../../lib/auth-client';
import { mwClient } from '@allah/sdk';
import {
  Button,
  Card,
  CardContent,
  Form,
  Input,
  Link,
  PageHero,
  RouteShell,
  StatusMessage,
  WorldArtwork,
  sfx,
} from '@moonwitness/ui';
import {
  getUserFacingAuthError,
  resolveOnboardingFailureState,
  signInAfterOnboarding,
  validatePasswordPair,
} from '../../lib/identity-ui';

type OnboardingFieldErrors = {
  name?: string;
  password?: string;
  confirmPassword?: string;
};

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<OnboardingFieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [setupState, setSetupState] = useState<'checking' | 'available' | 'closed' | 'created' | 'error'>('checking');
  const requestInFlight = useRef(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);

  const checkSetupStatus = useCallback(async () => {
    setSetupState('checking');
    setError(null);
    const state = await resolveOnboardingFailureState(() => mwClient.auth.getOnboardingStatus());
    setSetupState(state === 'unavailable' ? 'error' : state);
  }, []);

  useEffect(() => {
    void checkSetupStatus();
  }, [checkSetupStatus]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    if (setupState !== 'available' || requestInFlight.current) return;

    if (!name.trim()) {
      setFieldErrors({ name: 'Enter your name.' });
      nameInputRef.current?.focus();
      return;
    }

    const validationError = validatePasswordPair(password, confirmPassword, 12);
    if (validationError) {
      if (password !== confirmPassword) {
        setFieldErrors({ confirmPassword: validationError });
        confirmPasswordInputRef.current?.focus();
      } else {
        setFieldErrors({ password: validationError });
        passwordInputRef.current?.focus();
      }
      return;
    }

    requestInFlight.current = true;
    setIsLoading(true);
    try {
      await mwClient.auth.onboard({ name: name.trim(), email: email.trim(), password });
    } catch {
      const state = await resolveOnboardingFailureState(() => mwClient.auth.getOnboardingStatus());
      setSetupState(state === 'unavailable' ? 'error' : state);
      if (state === 'available') setError(getUserFacingAuthError('onboarding'));
      requestInFlight.current = false;
      setIsLoading(false);
      return;
    }

    try {
      const signInResult = await signInAfterOnboarding(
        () => authClient.signIn.email({ email: email.trim(), password })
      );
      if (signInResult === 'signed-in') {
        sfx.success();
        router.replace('/account');
      } else {
        setSetupState('created');
        setError(null);
      }
    } finally {
      requestInFlight.current = false;
      setIsLoading(false);
    }
  };

  return (
    <RouteShell as="main" className="id-auth-page">
      <div className="id-auth-layout">
        <div className="id-auth-form">
          <h1 className="id-auth-form__title">Initial hub setup</h1>
          <p className="id-auth-form__note">
            This one-time form creates the first administrator. ARSY closes setup after the account is created.
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
                  This hub no longer accepts first-account setup. Sign in with an existing account.
                </StatusMessage>
              )}
              {setupState === 'created' && (
                <StatusMessage tone="warning" title="Account created, sign-in needed">
                  The account was created, but automatic sign-in did not complete. Continue from the sign-in page; do not submit onboarding again.
                </StatusMessage>
              )}
              {setupState === 'error' && (
                <StatusMessage tone="danger" title="Setup status unavailable">
                  The hub could not confirm whether setup is open. The form stays hidden until its status can be checked.
                  {' '}
                  <Button variant="ghost" size="sm" onClick={() => void checkSetupStatus()}>
                    Check again
                  </Button>
                </StatusMessage>
              )}
              {error && (
                <StatusMessage tone="danger" title="Setup could not continue">
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
                    ref={nameInputRef}
                    error={fieldErrors.name}
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
                    ref={passwordInputRef}
                    error={fieldErrors.password}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 12 characters"
                    hint="Use at least 12 characters for the first account."
                  />
                  <Input
                    label="Confirm password"
                    type="password"
                    required
                    minLength={12}
                    autoComplete="new-password"
                    ref={confirmPasswordInputRef}
                    error={fieldErrors.confirmPassword}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Repeat the password"
                  />
                  <Button type="submit" disabled={isLoading} className="id-auth-form__submit">
                    {isLoading ? 'Creating the first account' : 'Create the first account'}
                  </Button>
                </Form>
              )}

              <p className="id-auth-form__alt">
                <Link href="/login" underline>Return to sign in</Link>
              </p>
            </CardContent>
          </Card>
        </div>

        <PageHero
          as="h2"
          className="id-auth-hero"
          kicker="MOONWITNESS / IDENTITY ARCHIVE"
          title="Open the observatory."
          summary="Initial setup is available only while ARSY confirms that no first account has been created."
          mediaLayout="backdrop"
          media={<WorldArtwork skin="lunar-chronicles" />}
          captionRight="L / 02 / INITIAL SETUP"
        />
      </div>
    </RouteShell>
  );
}
