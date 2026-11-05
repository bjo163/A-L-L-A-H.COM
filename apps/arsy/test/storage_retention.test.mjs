import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAuthenticatedApp } from './helpers.mjs';

const { BaseRepository, modelRegistry, SYSTEM_ACTOR } = await import('@allah/arsy-orm');

// The hub boots one in-memory database per process, so this file shares a single app.
const { app, headers } = await buildAuthenticatedApp();
const attachmentRepo = () => new BaseRepository(modelRegistry.get('ir.attachment'));
const legalHoldRepo = () => new BaseRepository(modelRegistry.get('ir.legal.hold'));

async function patchRetention(digest, payload) {
  return app.inject({
    method: 'PATCH',
    url: `/api/storage/${digest}/retention`,
    headers,
    payload,
  });
}

async function upload(content) {
  const res = await app.inject({
    method: 'POST',
    url: '/api/storage/upload',
    headers,
    payload: { content, name: 'note.txt' },
  });
  assert.equal(res.statusCode, 201, res.payload);
  return JSON.parse(res.payload).data.digest;
}

async function findAttachment(digest) {
  const rows = await attachmentRepo().find({
    scope: { systemScope: true },
    filters: [{ field: 'digest', operator: '=', value: digest }],
  });
  return rows[0];
}

test('storage upload registers a matching ir.attachment row and returns the bytes', async () => {
  const content = `retention-${Math.random()}`;
  const digest = await upload(content);

  const attachment = await findAttachment(digest);
  assert.ok(attachment, 'upload must create an ir.attachment row for the stored bytes');
  assert.equal(attachment.digest, digest);

  const got = await app.inject({ method: 'GET', url: `/api/storage/${digest}`, headers });
  assert.equal(got.statusCode, 200);
  assert.equal(got.rawPayload.toString('utf-8'), content);
});

test('a legal hold blocks deletion, fail-closed, until released', async () => {
  const digest = await upload(`held-${Math.random()}`);
  const attachment = await findAttachment(digest);

  await attachmentRepo().updateById(
    Number(attachment.id),
    { legal_hold: true },
    { companyId: Number(attachment.company_id) },
    SYSTEM_ACTOR
  );

  const blocked = await app.inject({ method: 'DELETE', url: `/api/storage/${digest}`, headers });
  assert.equal(blocked.statusCode, 409, blocked.payload);
  assert.equal(JSON.parse(blocked.payload).error.code, 'RETENTION_HOLD');

  // Bytes survive the refused delete.
  const present = await app.inject({ method: 'GET', url: `/api/storage/${digest}`, headers });
  assert.equal(present.statusCode, 200);

  await attachmentRepo().updateById(
    Number(attachment.id),
    { legal_hold: false },
    { companyId: Number(attachment.company_id) },
    SYSTEM_ACTOR
  );

  const released = await app.inject({ method: 'DELETE', url: `/api/storage/${digest}`, headers });
  assert.equal(released.statusCode, 200, released.payload);
});

test('an unexpired retention_until blocks deletion', async () => {
  const digest = await upload(`retained-${Math.random()}`);
  const attachment = await findAttachment(digest);
  const future = new Date(Date.now() + 60_000).toISOString();

  await attachmentRepo().updateById(
    Number(attachment.id),
    { retention_until: future },
    { companyId: Number(attachment.company_id) },
    SYSTEM_ACTOR
  );

  const blocked = await app.inject({ method: 'DELETE', url: `/api/storage/${digest}`, headers });
  assert.equal(blocked.statusCode, 409, blocked.payload);
  assert.equal(JSON.parse(blocked.payload).error.code, 'RETENTION_HOLD');
});

test('the retention route drives legal_hold end-to-end and records ir.legal.hold provenance', async () => {
  const digest = await upload(`route-held-${Math.random()}`);
  const attachment = await findAttachment(digest);

  // Place a hold through the documented surface (not a direct DB write).
  const placed = await patchRetention(digest, { legal_hold: true, reason: 'litigation-A' });
  assert.equal(placed.statusCode, 200, placed.payload);
  assert.equal(placed.json().data.legal_hold, true);

  const held = await findAttachment(digest);
  assert.equal(held.legal_hold, true, 'PATCH must persist legal_hold on the attachment');

  // The provenance ledger row now exists (the model previously had no producer).
  const openHolds = await legalHoldRepo().find({
    scope: { companyId: Number(attachment.company_id) },
    filters: [
      { field: 'attachment_id', operator: '=', value: Number(attachment.id) },
      { field: 'released_at', operator: '=', value: null },
    ],
  });
  assert.equal(openHolds.length, 1, 'placing a hold must append one open ir.legal.hold row');
  assert.equal(openHolds[0].reason, 'litigation-A');

  // Fail-closed: the hold blocks deletion via the HTTP surface.
  const blocked = await app.inject({ method: 'DELETE', url: `/api/storage/${digest}`, headers });
  assert.equal(blocked.statusCode, 409, blocked.payload);

  // Release the hold; the open provenance row is stamped released_at.
  const released = await patchRetention(digest, { legal_hold: false });
  assert.equal(released.statusCode, 200, released.payload);
  const remainingOpen = await legalHoldRepo().find({
    scope: { companyId: Number(attachment.company_id) },
    filters: [
      { field: 'attachment_id', operator: '=', value: Number(attachment.id) },
      { field: 'released_at', operator: '=', value: null },
    ],
  });
  assert.equal(remainingOpen.length, 0, 'releasing must close every open ir.legal.hold row');

  const afterRelease = await app.inject({ method: 'DELETE', url: `/api/storage/${digest}`, headers });
  assert.equal(afterRelease.statusCode, 200, afterRelease.payload);
});

test('the retention route refuses a malformed retention_until fail-closed', async () => {
  const digest = await upload(`retained-bad-${Math.random()}`);
  const bad = await patchRetention(digest, { retention_until: 'not-a-date' });
  assert.equal(bad.statusCode, 400, bad.payload);
  assert.equal(bad.json().error.code, 'VALIDATION_ERROR');

  const stillClean = await findAttachment(digest);
  assert.equal(stillClean.retention_until ?? null, null, 'a rejected PATCH must not write the retention field');
});
