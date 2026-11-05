import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  validateUrlSsrf,
  validatePublicUrlSsrf,
  ssrfSafeFetch,
  resolvePublicAddresses,
  classifyHostname,
} from '../src/ssrf.js';

function resolverWith(v4, v6 = []) {
  return {
    resolve4: async () => v4,
    resolve6: async () => v6,
  };
}

describe('SSRF guard against resolved IPs', () => {
  it('rejects numeric obfuscation of loopback (decimal / hex / octal)', () => {
    assert.equal(validateUrlSsrf('http://2130706433/'), false); // 127.0.0.1 decimal
    assert.equal(validateUrlSsrf('http://0x7f000001/'), false); // 127.0.0.1 hex
    assert.equal(validateUrlSsrf('http://0177.0.0.1/'), false); // 127.0.0.1 octal
  });

  it('rejects link-local metadata, CGNAT and RFC1918', () => {
    assert.equal(validateUrlSsrf('http://169.254.169.254/latest/meta-data/'), false);
    assert.equal(validateUrlSsrf('http://100.64.0.1/'), false); // CGNAT 100.64/10
    assert.equal(validateUrlSsrf('http://10.0.0.5/'), false);
    assert.equal(validateUrlSsrf('http://172.16.0.1/'), false);
    assert.equal(validateUrlSsrf('http://192.168.1.1/'), false);
  });

  it('rejects reserved hostnames and non-http protocols', () => {
    assert.equal(classifyHostname('metadata.internal'), 'blocked');
    assert.equal(validateUrlSsrf('file:///etc/passwd'), false);
    assert.equal(validateUrlSsrf('http://user:pass@127.0.0.1/'), false); // creds + loopback
  });

  it('allows genuine public upstreams', () => {
    assert.equal(validateUrlSsrf('https://api.openai.com/v1'), true);
    assert.equal(validateUrlSsrf('https://example.com'), true);
  });

  it('widens ONLY loopback when ALLOW_LOCAL_AI is set', () => {
    assert.equal(validateUrlSsrf('http://localhost:11434/v1'), false);
    assert.equal(validateUrlSsrf('http://127.0.0.1:11434/v1'), false);
    assert.equal(validateUrlSsrf('http://10.0.0.5:11434/v1'), false); // private stays blocked
    process.env.ALLOW_LOCAL_AI = 'true';
    assert.equal(validateUrlSsrf('http://localhost:11434/v1'), true);
    assert.equal(validateUrlSsrf('http://127.0.0.1:11434/v1'), true);
    assert.equal(validateUrlSsrf('http://10.0.0.5:11434/v1'), false); // never widens past loopback
    assert.equal(validateUrlSsrf('http://169.254.169.254/'), false);
    delete process.env.ALLOW_LOCAL_AI;
  });

  it('keeps notification-style public-only requests strict when local AI is enabled', () => {
    const previous = process.env.ALLOW_LOCAL_AI;
    process.env.ALLOW_LOCAL_AI = 'true';
    try {
      assert.equal(validateUrlSsrf('http://127.0.0.1:8080'), true);
      assert.equal(validatePublicUrlSsrf('http://127.0.0.1:8080'), false);
      assert.throws(() => ssrfSafeFetch('http://127.0.0.1:8080'), /public HTTP\(S\) endpoint/);
    } finally {
      if (previous === undefined) delete process.env.ALLOW_LOCAL_AI;
      else process.env.ALLOW_LOCAL_AI = previous;
    }
  });

  it('fails closed on DNS rebinding: a public name returning a loopback record', async () => {
    await assert.rejects(
      () => resolvePublicAddresses('evil.example', resolverWith(['127.0.0.1'])),
      /resolves to 127\.0\.0\.1/,
    );
  });

  it('fails closed when any returned record is internal', async () => {
    await assert.rejects(
      () => resolvePublicAddresses('split.example', resolverWith(['93.184.216.34', '10.0.0.1'])),
      /resolves to 10\.0\.0\.1/,
    );
  });

  it('accepts a name whose records are all public', async () => {
    const addrs = await resolvePublicAddresses('good.example', resolverWith(['93.184.216.34']));
    assert.deepEqual(addrs, ['93.184.216.34']);
  });

  it('fails closed when DNS returns no records', async () => {
    await assert.rejects(
      () => resolvePublicAddresses('nx.example', resolverWith([])),
      /no DNS records/,
    );
  });
});
