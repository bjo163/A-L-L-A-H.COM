import assert from 'node:assert/strict';
import test from 'node:test';
import { buildArsyApp } from '../src/app.ts';
import {
  BaseRepository,
  modelRegistry,
  SYSTEM_ACTOR,
  pendingOutbox,
  latestOutboxId,
} from '@allah/arsy-orm';

// Roadmap T3.3: the cross-app sync outbox is append-only and every consumer can read
// the full payload, so secret material must NEVER land in the ledger. `nexus.nas` joins
// the default ARSY_SYNC_MODELS allowlist precisely because the `arsy_capture_sync_event`
// trigger strips every `*_encrypted` / `*_hash` column before the payload (and the
// derived changed_fields) is stored. This test proves that redaction end-to-end on the
// real NAS model — a rotation writes the secret to the table, but the outbox row only
// ever carries the non-secret columns.
test('sync outbox redacts *_encrypted/*_hash columns from the payload (T3.3)', async (t) => {
  const app = await buildArsyApp({ enableLogging: false });

  // Onboard a real owner so a res_company row exists to satisfy nexus.nas.company_id.
  const email = `redact-owner-${Date.now()}@example.test`;
  const onboarding = await app.inject({
    method: 'POST', url: '/api/auth/onboarding',
    payload: { name: 'Redact Owner', email, password: 'redact-owner-password' },
  });
  assert.equal(onboarding.statusCode, 201, onboarding.payload);

  const userDef = modelRegistry.get('res.users');
  const userRepo = new BaseRepository(userDef);
  const owners = await userRepo.find({
    scope: { systemScope: true, companyId: 0 },
    filters: [{ field: 'email', operator: '=', value: email }],
    limit: 1,
  });
  assert.equal(owners.length, 1, 'the onboarded owner should be readable');
  const companyId = Number(owners[0].company_id);

  const nasDef = modelRegistry.get('nexus.nas');
  assert.ok(nasDef, 'nexus.nas model must be registered');
  const nasRepo = new BaseRepository(nasDef);

  const ip = `10.${(Date.now() % 200) + 1}.0.1`;
  const identifier = `nas-redact-${Date.now()}`;
  const secretLeak = 'AES256GCM$DO_NOT_LEAK$deadbeef';

  let nasId;
  await t.test('an insert writes the secret to the table but NOT to the outbox payload', async () => {
    const boundary = await latestOutboxId();
    const created = await nasRepo.create(
      {
        nas_identifier: identifier,
        ip_address: ip,
        secret_encrypted: secretLeak,
        vendor: 'mikrotik',
      },
      { companyId },
      SYSTEM_ACTOR
    );
    nasId = Number(created.id);

    // The column itself is persisted (the sentinel needs it to decrypt).
    const stored = await nasRepo.findById(nasId, { companyId });
    assert.equal(stored.secret_encrypted, secretLeak, 'the encrypted column stays in the source table');

    const rows = (await pendingOutbox('redact-insert', 500)).filter(
      (r) => r.id > boundary && r.model_name === 'nexus.nas' && r.record_id === String(nasId)
    );
    assert.equal(rows.length, 1, 'the insert produced exactly one nexus.nas outbox row');
    const row = rows[0];

    // Redaction invariant: no key ending in _encrypted / _hash survives in the payload.
    for (const key of Object.keys(row.payload)) {
      assert.ok(!/_encrypted$/.test(key), `payload leaked an encrypted column: ${key}`);
      assert.ok(!/_hash$/.test(key), `payload leaked a hashed column: ${key}`);
    }
    assert.ok(!('secret_encrypted' in row.payload), 'secret_encrypted must be stripped from payload');
    assert.equal(JSON.stringify(row.payload).includes('DO_NOT_LEAK'), false, 'secret value must never appear in the ledger');

    // The non-secret projection still carries what a consumer needs to invalidate.
    assert.equal(row.payload.ip_address, ip, 'ip_address survives redaction');
    assert.equal(row.payload.nas_identifier, identifier);
    assert.ok(row.changed_fields.includes('ip_address'), 'changed_fields reflects the safe projection');
    assert.equal(row.changed_fields.includes('secret_encrypted'), false, 'changed_fields must not name the secret column');
  });

  await t.test('a secret rotation update stays redacted in the ledger', async () => {
    const boundary = await latestOutboxId();
    const rotated = `AES256GCM$ROTATED$${Date.now()}`;
    await nasRepo.updateById(
      nasId,
      { secret_encrypted: rotated, vendor: 'other' },
      { companyId },
      SYSTEM_ACTOR
    );

    const rows = (await pendingOutbox('redact-update', 500)).filter(
      (r) =>
        r.id > boundary &&
        r.model_name === 'nexus.nas' &&
        r.record_id === String(nasId) &&
        r.operation === 'update'
    );
    assert.equal(rows.length, 1, 'the rotation produced exactly one update outbox row');
    const row = rows[0];

    assert.equal(JSON.stringify(row.payload).includes('ROTATED'), false, 'rotated secret must not enter the ledger');
    assert.ok(!('secret_encrypted' in row.payload), 'secret_encrypted stripped on update too');
    assert.equal(row.payload.vendor, 'other', 'the co-changed non-secret column is delivered');
    assert.equal(row.changed_fields.includes('vendor'), true, 'the visible change is reported');
    assert.equal(row.changed_fields.includes('secret_encrypted'), false, 'the secret change is never named');
  });

  await app.close();
});
