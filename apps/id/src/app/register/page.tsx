'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '../../lib/auth-client';
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
import { getUserFacingAuthError, validatePasswordPair } from '../../lib/identity-ui';

type RegistrationFieldErrors = {
  name?: string;
  password?: string;
  confirmPassword?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RegistrationFieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const requestInFlight = useRef(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!name.trim()) {
      setFieldErrors({ name: 'Enter your name.' });
      nameInputRef.current?.focus();
      return;
    }

    const validationError = validatePasswordPair(password, confirmPassword, 8);
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
    if (requestInFlight.current) return;

    requestInFlight.current = true;
    setIsLoading(true);
    try {
      const { error: authError } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      if (authError) throw new Error('Registration rejected');
      sfx.success();
      router.push('/account');
    } catch {
      setError(getUserFacingAuthError('registration'));
    } finally {
      requestInFlight.current = false;
      setIsLoading(false);
    }
  };

  return (
    <RouteShell as="main" className="id-auth-page">
      <div className="id-auth-layout">
        <div className="id-auth-form">
          <h1 className="id-auth-form__title">Create MoonWitness ID</h1>
          <p className="id-auth-form__note">
            Create an account for the identity service. Each connected product decides what your account can access.
          </p>

          <Card as="section">
            <CardContent>
              {error && (
                <StatusMessage tone="danger" title="Registration could not continue">
                  {error}
                </StatusMessage>
              )}

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
                  minLength={8}
                  autoComplete="new-password"
                  ref={passwordInputRef}
                  error={fieldErrors.password}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  hint="Use at least 8 characters. The identity service validates the account request."
                />

                <Input
                  label="Confirm password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  ref={confirmPasswordInputRef}
                  error={fieldErrors.confirmPassword}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat the password"
                />

                <Button type="submit" disabled={isLoading} className="id-auth-form__submit">
                  {isLoading ? 'Creating the account' : 'Create account'}
                </Button>
              </Form>

              <p className="id-auth-form__alt">
                Already have an account?{' '}
                <Link href="/login" underline>Sign in</Link>
              </p>
            </CardContent>
          </Card>
        </div>

        <PageHero
          as="h2"
          className="id-auth-hero"
          kicker="MOONWITNESS / IDENTITY ARCHIVE"
          title="Begin with your own account."
          summary="A clear identity anchor for your account and its active sessions."
          mediaLayout="backdrop"
          media={<WorldArtwork skin="lunar-chronicles" />}
          captionRight="L / 02 / ARCHIVE"
        />
      </div>
    </RouteShell>
  );
}
