import assert from 'node:assert/strict';
import { test } from 'node:test';
import { metadata as accountMetadata } from '../src/app/account/layout';
import { metadata as loginMetadata } from '../src/app/login/layout';
import { metadata as onboardingMetadata } from '../src/app/onboarding/layout';
import { metadata as registerMetadata } from '../src/app/register/layout';

test('authentication and account routes retain their titles and prevent indexing', () => {
  const privateRouteMetadata = [
    [loginMetadata, 'Sign in | MoonWitness ID'],
    [registerMetadata, 'Create account | MoonWitness ID'],
    [onboardingMetadata, 'Initial setup | MoonWitness ID'],
    [accountMetadata, 'Account | MoonWitness ID'],
  ] as const;

  for (const [metadata, title] of privateRouteMetadata) {
    assert.equal(metadata.title, title);
    assert.deepEqual(metadata.robots, { index: false, follow: false });
  }
});
