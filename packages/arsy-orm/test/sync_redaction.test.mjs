import assert from 'node:assert/strict';
import test from 'node:test';

process.env.NODE_ENV = 'test';
const { redactPayload } = await import('../src/sync.ts');

test('sync payload redaction', async (t) => {
  await t.test('strips credential-bearing fields', () => {
    const payload = {
      id: 1,
      name: 'Test User',
      api_key: 'secret123',
      password: 'pass456',
      email: 'test@example.com',
    };

    const redacted = redactPayload('test.model', payload);

    assert.equal(redacted.id, 1);
    assert.equal(redacted.name, 'Test User');
    assert.equal(redacted.email, 'test@example.com');
    assert.equal(redacted.api_key, undefined, 'api_key should be stripped');
    assert.equal(redacted.password, undefined, 'password should be stripped');
  });

  await t.test('strips token fields', () => {
    const payload = {
      id: 2,
      access_token: 'token123',
      refresh_token: 'refresh456',
      data: 'keep this',
    };

    const redacted = redactPayload('test.model', payload);

    assert.equal(redacted.id, 2);
    assert.equal(redacted.data, 'keep this');
    assert.equal(redacted.access_token, undefined, 'access_token should be stripped');
    assert.equal(redacted.refresh_token, undefined, 'refresh_token should be stripped');
  });

  await t.test('strips secret and private_key fields', () => {
    const payload = {
      id: 3,
      client_secret: 'secret',
      private_key: 'key',
      public_key: 'keep',
    };

    const redacted = redactPayload('test.model', payload);

    assert.equal(redacted.id, 3);
    assert.equal(redacted.public_key, 'keep');
    assert.equal(redacted.client_secret, undefined, 'client_secret should be stripped');
    assert.equal(redacted.private_key, undefined, 'private_key should be stripped');
  });

  await t.test('handles null payload', () => {
    const redacted = redactPayload('test.model', null);
    assert.equal(redacted, null);
  });

  await t.test('case-insensitive pattern matching', () => {
    const payload = {
      API_KEY: 'upper',
      Api_Key: 'mixed',
      api_key: 'lower',
    };

    const redacted = redactPayload('test.model', payload);

    assert.equal(redacted.API_KEY, undefined);
    assert.equal(redacted.Api_Key, undefined);
    assert.equal(redacted.api_key, undefined);
  });
});
