import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createClient } from './index';

test('session tokens use the injected asynchronous store for auth and requests', async () => {
  const storedToken = 'unit-test-session-4321';
  let token: string | null = null;
  const calls: Array<{ url: string; headers: Headers }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    calls.push({
      url: String(input),
      headers: new Headers(init?.headers),
    });
    const data = String(input).endsWith('/api/auth/sign-in')
      ? { sessionToken: storedToken }
      : { id: 'user-1' };
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    const client = createClient({
      baseUrl: 'https://gateway.example',
      sessionStore: {
        get: async () => token,
        set: async (value) => { token = value; },
        clear: async () => { token = null; },
      },
    });

    await client.auth.signIn({ email: 'user@example.test', password: 'not-a-real-password' });
    assert.equal(token, storedToken);

    await client.auth.getCurrentUser();
    assert.equal(calls[1]?.headers.get('x-session-token'), storedToken);

    await client.auth.signOut();
    assert.equal(token, null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('session store read failures are surfaced', async () => {
  const client = createClient({
    sessionStore: {
      get: async () => { throw new Error('secure storage unavailable'); },
      set: async () => undefined,
      clear: async () => undefined,
    },
  });

  await assert.rejects(client.auth.getCurrentUser(), /secure storage unavailable/);
});

test('device polling uses the dedicated device credential header', async () => {
  const originalFetch = globalThis.fetch;
  let tokenHeader: string | null = null;
  globalThis.fetch = async (_input, init) => {
    tokenHeader = new Headers(init?.headers).get('x-agent-device-token');
    return new Response(JSON.stringify({ success: true, data: { mission: null } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };
  try {
    const client = createClient({ baseUrl: 'https://gateway.example' });
    assert.deepEqual(await client.agentControl.nextMission('a'.repeat(64)), { mission: null });
    assert.equal(tokenHeader, 'a'.repeat(64));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('SDK transport errors are not returned as successful data', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(
    JSON.stringify({ error: { message: 'gateway unavailable' } }),
    { status: 503, headers: { 'Content-Type': 'application/json' } }
  );
  try {
    const client = createClient();
    await assert.rejects(client.health.check(), /gateway unavailable/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
