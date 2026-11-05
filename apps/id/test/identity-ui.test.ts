import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  canStartSessionAction,
  getSafeDestinationUrl,
  getUserFacingAuthError,
  readAccountData,
  resolveIdentityHomeState,
  resolveOnboardingFailureState,
  revokeSessionAndSignOut,
  signInAfterOnboarding,
  validatePasswordPair,
} from '../src/lib/identity-ui';

test('arrival distinguishes guest, first-run setup, signed-in, and unavailable states', async () => {
  const guest = await resolveIdentityHomeState({
    getSession: async () => ({ data: null, error: null }),
    getCurrentUser: async () => { throw new Error('must not read a guest profile'); },
    getOnboardingStatus: async () => ({ available: true }),
  });
  assert.deepEqual(guest, { kind: 'guest', onboarding: 'available' });

  const signedIn = await resolveIdentityHomeState({
    getSession: async () => ({ data: { user: { id: 'auth-user' } }, error: null }),
    getCurrentUser: async () => ({ user: { name: 'Member', email: 'member@example.test' } }),
    getOnboardingStatus: async () => { throw new Error('must not read setup status'); },
  });
  assert.deepEqual(signedIn, {
    kind: 'authenticated',
    user: { name: 'Member', email: 'member@example.test' },
  });

  const expiredProfile = await resolveIdentityHomeState({
    getSession: async () => ({ data: { user: { id: 'stale' } }, error: null }),
    getCurrentUser: async () => { throw new Error('profile unavailable'); },
    getOnboardingStatus: async () => ({ available: false }),
  });
  assert.deepEqual(expiredProfile, { kind: 'unavailable' });

  const setupUnavailable = await resolveIdentityHomeState({
    getSession: async () => ({ data: null, error: null }),
    getCurrentUser: async () => { throw new Error('must not read a guest profile'); },
    getOnboardingStatus: async () => { throw new Error('hub unavailable'); },
  });
  assert.deepEqual(setupUnavailable, { kind: 'guest', onboarding: 'unavailable' });

  const authUnavailable = await resolveIdentityHomeState({
    getSession: async () => { throw new Error('auth service unavailable'); },
    getCurrentUser: async () => { throw new Error('must not read profile'); },
    getOnboardingStatus: async () => ({ available: true }),
  });
  assert.deepEqual(authUnavailable, { kind: 'unavailable' });
});

test('credential validation distinguishes mismatch and minimum length', () => {
  assert.equal(validatePasswordPair('long-enough-password', 'different-password', 8), 'The passwords do not match.');
  assert.equal(
    validatePasswordPair('short', 'short', 8),
    'Use at least 8 characters for the password.'
  );
  assert.equal(validatePasswordPair('long-enough-password', 'long-enough-password', 8), null);
  assert.equal(
    validatePasswordPair('shortpass', 'shortpass', 12),
    'Use at least 12 characters for the password.'
  );
});

test('onboarding failures re-check authority and never assume setup remains open', async () => {
  assert.equal(await resolveOnboardingFailureState(async () => ({ available: true })), 'available');
  assert.equal(await resolveOnboardingFailureState(async () => ({ available: false })), 'closed');
  assert.equal(
    await resolveOnboardingFailureState(async () => { throw new Error('service unavailable'); }),
    'unavailable'
  );
});

test('successful setup is not repeated when automatic sign-in fails', async () => {
  assert.equal(await signInAfterOnboarding(async () => ({ error: null })), 'signed-in');
  assert.equal(await signInAfterOnboarding(async () => ({ error: new Error('rejected') })), 'created-sign-in-required');
  assert.equal(
    await signInAfterOnboarding(async () => { throw new Error('service unavailable'); }),
    'created-sign-in-required'
  );
});

test('account data distinguishes signed-out, complete, and unavailable reads', async () => {
  let sessionsRead = false;
  assert.deepEqual(
    await readAccountData(async () => ({ user: null }), async () => {
      sessionsRead = true;
      return [];
    }),
    { kind: 'signed-out' }
  );
  assert.equal(sessionsRead, false);

  const account = await readAccountData(
    async () => ({
      user: { id: 1, name: 'Member', email: 'member@example.test', status: 'active' },
    }),
    async () => [{ id: 2, expiresAt: '2026-12-01T00:00:00.000Z', isCurrent: true }]
  );
  assert.deepEqual(account, {
    kind: 'ready',
    user: { id: 1, name: 'Member', email: 'member@example.test', status: 'active' },
    sessions: [{ id: 2, expiresAt: '2026-12-01T00:00:00.000Z', isCurrent: true }],
  });

  assert.deepEqual(
    await readAccountData(
      async () => ({ user: { id: 1, name: 'Member', email: 'member@example.test', status: 'active' } }),
      async () => { throw new Error('sessions unavailable'); }
    ),
    { kind: 'unavailable' }
  );
});

test('session actions guard duplicate operations and update only after confirmed revocation', async () => {
  assert.equal(canStartSessionAction(false, false), true);
  assert.equal(canStartSessionAction(true, false), false);
  assert.equal(canStartSessionAction(false, true), false);

  let signOutCalled = false;
  await assert.rejects(
    revokeSessionAndSignOut(
      async () => { throw new Error('revocation rejected'); },
      async () => {
        signOutCalled = true;
        return {};
      },
      true
    ),
    /revocation rejected/
  );
  assert.equal(signOutCalled, false);

  assert.equal(
    await revokeSessionAndSignOut(async () => {}, async () => ({ error: null }), false),
    'revoked'
  );
  assert.equal(
    await revokeSessionAndSignOut(async () => {}, async () => ({ error: null }), true),
    'current-session-revoked'
  );
  assert.equal(
    await revokeSessionAndSignOut(async () => {}, async () => ({ error: new Error('local failure') }), true),
    'current-session-signout-failed'
  );
});

test('destination URLs reject malformed, credential-bearing, insecure production, and private addresses', () => {
  assert.equal(getSafeDestinationUrl('not a URL', false), null);
  assert.equal(getSafeDestinationUrl('javascript:alert(1)', false), null);
  assert.equal(getSafeDestinationUrl('https://user:pass@example.com', true), null);
  assert.equal(getSafeDestinationUrl('http://example.com', true), null);
  assert.equal(getSafeDestinationUrl('https://localhost:3001', true), null);
  assert.equal(getSafeDestinationUrl('https://192.168.1.10', true), null);
  assert.equal(getSafeDestinationUrl('https://dock.example.com', true), 'https://dock.example.com/');
  assert.equal(getSafeDestinationUrl('http://localhost:3001', false), 'http://localhost:3001/');
});

test('auth errors are replaced with generic, context-specific messages', () => {
  assert.equal(
    getUserFacingAuthError('login'),
    'The email or password could not be verified. Check your details and try again.'
  );
  assert.notEqual(getUserFacingAuthError('registration'), getUserFacingAuthError('login'));
  assert.match(getUserFacingAuthError('revoke'), /session remains listed/);
});
