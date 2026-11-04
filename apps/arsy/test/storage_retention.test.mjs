import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAuthenticatedApp } from './helpers.mjs';

const { BaseRepository, modelRegistry, SYSTEM_ACTOR } = await import('@allah/arsy-orm');

// The hub boots one in-memory database per process, so this file shares a single app.
const { app, headers } = await buildAuthenticatedApp();
const attachmentRepo = () => new BaseRepository(modelRegistry.get('ir.attachment'));

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
