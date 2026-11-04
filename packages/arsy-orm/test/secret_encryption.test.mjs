import { describe, it } from 'node:test';
import assert from 'node:assert';

process.env.NODE_ENV = 'production';
process.env.ARSY_MASTER_KEY = 'test-master-key-0000000000000000000000000000000000000000000000000000';

const { encryptSecret, decryptSecret, isEncrypted } = await import('../dist/index.js');

describe('Secret encryption round-trip', () => {
  it('encrypts then decrypts back to the plaintext', () => {
    const env = encryptSecret('mw_live_supersecret');
    assert.equal(isEncrypted(env), true);
    assert.notEqual(env, 'mw_live_supersecret');
    assert.equal(decryptSecret(env), 'mw_live_supersecret');
  });

  it('is reproducible across "processes" because the KDF salt lives in the envelope', () => {
    const a = encryptSecret('same-secret');
    const b = encryptSecret('same-secret');
    // distinct envelopes (random salt/iv) yet both decrypt to the same value
    assert.notEqual(a, b);
    assert.equal(decryptSecret(a), 'same-secret');
    assert.equal(decryptSecret(b), 'same-secret');
  });

  it('fails closed when the master key changes', () => {
    const env = encryptSecret('locked');
    process.env.ARSY_MASTER_KEY = 'a-different-master-key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
    assert.throws(() => decryptSecret(env), /authentication check|wrong master key|not a recognised/i);
    // restore
    process.env.ARSY_MASTER_KEY = 'test-master-key-0000000000000000000000000000000000000000000000000000';
  });

  it('does not misreport arbitrary base64 as an encrypted envelope', () => {
    const plainBase64 = Buffer.from('this is not an envelope', 'utf8').toString('base64');
    assert.equal(isEncrypted(plainBase64), false);
    assert.equal(isEncrypted(''), false);
    assert.equal(isEncrypted('not base64 !! @@'), false);
    // a tampered envelope (version byte kept, body mangled) fails authentication
    const env = encryptSecret('tamper-me');
    const buf = Buffer.from(env, 'base64');
    buf[buf.length - 1] ^= 0xff;
    assert.throws(() => decryptSecret(buf.toString('base64')));
  });

  it('refuses to encrypt an empty secret', () => {
    assert.throws(() => encryptSecret(''), /empty/i);
  });
});
