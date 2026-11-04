import { describe, it } from 'node:test';
import assert from 'node:assert';
import { hashSubscriberPassword, verifySubscriberPassword } from '../src/subscriber_password.js';

describe('Subscriber password verification (RADIUS PAP)', () => {
  it('verifies a password against its own scrypt digest', () => {
    const { hash, salt } = hashSubscriberPassword('correct horse battery');
    assert.equal(verifySubscriberPassword('correct horse battery', hash, salt), true);
  });

  it('rejects a wrong password', () => {
    const { hash, salt } = hashSubscriberPassword('correct horse battery');
    assert.equal(verifySubscriberPassword('wrong password', hash, salt), false);
  });

  it('produces distinct digests for the same password (random salt)', () => {
    const a = hashSubscriberPassword('same');
    const b = hashSubscriberPassword('same');
    assert.notEqual(a.salt, b.salt);
    assert.notEqual(a.hash, b.hash);
    // both still verify against their own salt
    assert.equal(verifySubscriberPassword('same', a.hash, a.salt), true);
    assert.equal(verifySubscriberPassword('same', b.hash, b.salt), true);
  });

  it('is deterministic when the salt is supplied', () => {
    const salt = '0123456789abcdef0123456789abcdef';
    const a = hashSubscriberPassword('typed', salt);
    const b = hashSubscriberPassword('typed', salt);
    assert.equal(a.hash, b.hash);
    assert.equal(a.salt, salt);
  });

  it('fails closed on malformed or empty stored values', () => {
    assert.equal(verifySubscriberPassword('anything', '', 'deadbeef'), false);
    assert.equal(verifySubscriberPassword('anything', 'aabb', ''), false);
    assert.equal(verifySubscriberPassword('', 'aabb', 'ccdd'), false);
    // short / non-64-byte digest is rejected rather than throwing
    assert.equal(verifySubscriberPassword('anything', 'aabbcc', 'deadbeef'), false);
  });
});
