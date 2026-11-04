'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '../../lib/auth-client';
import { Button, Card, CardContent, Form, Input, Link, PageHero, RouteShell, StatusMessage, WorldArtwork, sfx } from '@moonwitness/ui';

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('The two passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Use at least 8 characters for the password.');
      return;
    }

    setIsLoading(true);

    try {
      const { error: authError } = await authClient.signUp.email({ name, email, password });
      if (authError) throw new Error(authError.message);
      sfx.success();
      router.push('/account');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RouteShell as="main" className="id-auth-page">
      <div className="id-auth-layout">
        <PageHero
          as="h2"
          kicker="MOONWITNESS / IDENTITY ARCHIVE"
          title="Begin with a secure account."
          summary="Create the identity used to access your MoonWitness destinations."
          mediaLayout="backdrop"
          media={<WorldArtwork skin="lunar-chronicles" />}
          captionRight="L / 02 / ARCHIVE"
        />

        <div className="id-auth-form">
          <h1 className="id-auth-form__title">Create MoonWitness ID</h1>
          <p className="id-auth-form__note">
            One profile opens Dock, Headquarter, and the rest of the ecosystem.
          </p>

          <Card as="section">
            <CardContent>
              {error && (
                <StatusMessage tone="danger" title="Registration failed">
                  {error}
                </StatusMessage>
              )}

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
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  hint="Eight characters is the minimum the identity service accepts."
                />

                <Input
                  label="Confirm password"
                  type="password"
                  required
                  autoComplete="new-password"
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
      </div>
    </RouteShell>
  );
}
