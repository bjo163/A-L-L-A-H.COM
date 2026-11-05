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
import {
  assertSafeBaseUrl,
  NotifySsrfBlockedError,
} from '../../../addons/mw_notify/services/webhook.ts';
import { notifyDispatch } from '../../../addons/mw_notify/services/cron_dispatch.ts';
import { recordNotifyEvent } from '../../../addons/mw_notify/services/events.ts';

// Roadmap T3.4: mw_notify end-to-end. Covers the producer boundary (a pending
// notify.event append + its sync-outbox ledger row), the notify_dispatch drain
// flipping status in record mode, and the SSRF guard that must reject any
// operator-supplied base_url pointing at an internal address before a live send.

async function ownerCompanyId(app, email) {
  const userRepo = new BaseRepository(modelRegistry.get('res.users'));
  const owners = await userRepo.find({
    scope: { systemScope: true },
    filters: [{ field: 'email', operator: '=', value: email }],
    limit: 1,
  });
  return Number(owners[0].company_id);
}

test('notify: producer append → outbox ledger → dispatch drain flips status (T3.4)', async () => {
  const app = await buildArsyApp({ enableLogging: false });

  const email = `notify-owner-${Date.now()}@example.test`;
  const password = 'notify-owner-password';
  const onboarding = await app.inject({
    method: 'POST', url: '/api/auth/onboarding',
    payload: { name: 'Notify Owner', email, password },
  });
  assert.equal(onboarding.statusCode, 201, onboarding.payload);
  const signIn = await app.inject({
    method: 'POST', url: '/api/auth/sign-in', payload: { email, password },
  });
  assert.equal(signIn.statusCode, 200, signIn.payload);
  const headers = { 'x-session-token': JSON.parse(signIn.payload).data.sessionToken };

  const companyId = await ownerCompanyId(app, email);

  // Seed the platform template the invoice producer references (company_id 0).
  const templateRepo = new BaseRepository(modelRegistry.get('notify.template'));
  await templateRepo.create(
    {
      company_id: 0,
      code: 'invoice.paid',
      channel_type: 'webhook',
      subject: 'Invoice {{invoice_id}} paid',
      body: 'Invoice {{invoice_id}} for {{amount}} {{currency}} is paid.',
    },
    { systemScope: true },
    SYSTEM_ACTOR
  );

  // An open invoice to transition (created straight in the owner's tenant).
  const invoiceRepo = new BaseRepository(modelRegistry.get('isp.invoice'));
  const invoice = await invoiceRepo.create(
    { state: 'open', amount: 150000, currency: 'IDR' },
    { companyId },
    SYSTEM_ACTOR
  );
  const invoiceId = Number(invoice.id);

  // Producer path: the HTTP transition route must append a pending event and emit
  // exactly one notify.event ledger row.
  const boundary = await latestOutboxId();
  const payRes = await app.inject({
    method: 'POST', url: `/v1/works/invoices/${invoiceId}/pay`, headers,
  });
  assert.equal(payRes.statusCode, 200, payRes.payload);
  assert.equal(JSON.parse(payRes.payload).data.state, 'paid');

  const eventRepo = new BaseRepository(modelRegistry.get('notify.event'));
  const events = await eventRepo.find({
    scope: { companyId },
    filters: [{ field: 'template_code', operator: '=', value: 'invoice.paid' }],
    limit: 5,
  });
  assert.equal(events.length, 1, 'the transition appended exactly one notify.event');
  const event = events[0];
  assert.equal(event.status, 'pending', 'the appended event starts pending');
  assert.equal(Number(event.company_id), companyId, 'the event is tenant-tagged');

  const insertLedger = (await pendingOutbox('notify-insert', 500)).filter(
    (r) => r.id > boundary && r.model_name === 'notify.event' && r.record_id === String(event.id)
  );
  assert.equal(insertLedger.length, 1, 'appending the event emitted one outbox ledger row');

  const previousDeliveryMode = process.env.ARSY_NOTIFY_DELIVERY;
  process.env.ARSY_NOTIFY_DELIVERY = 'record';
  try {
    await notifyDispatch({
      id: 0, company_id: companyId, model_name: 'ir.cron',
      method_name: 'notify_dispatch', attempt_count: 0,
    });

    const dispatched = await eventRepo.findById(event.id, { companyId });
    assert.equal(dispatched.status, 'delivered', 'record-mode dispatch advances pending → delivered');
    assert.equal(Number(dispatched.attempts), 1, 'the dispatch counted one attempt');
    assert.ok(dispatched.sent_at, 'sent_at is stamped on delivery');
    assert.ok(String(dispatched.subject).includes(String(invoiceId)), 'rendered subject carried the invoice id');

    const channelRepo = new BaseRepository(modelRegistry.get('notify.channel'));
    const channel = await channelRepo.create(
      { name: 'Blocked test endpoint', channel_type: 'webhook', base_url: 'http://127.0.0.1:8080/hook' },
      { companyId },
      SYSTEM_ACTOR
    );
    const retryEventId = await recordNotifyEvent({
      companyId,
      templateCode: 'invoice.paid',
      channelType: 'webhook',
      channelId: Number(channel.id),
      payload: { invoice_id: invoiceId, amount: 150000, currency: 'IDR' },
    });

    process.env.ARSY_NOTIFY_DELIVERY = 'live';
    const dispatch = () => notifyDispatch({
      id: 0, company_id: companyId, model_name: 'ir.cron',
      method_name: 'notify_dispatch', attempt_count: 0,
    });
    await assert.rejects(dispatch, /notify_dispatch failed/);
    let retried = await eventRepo.findById(retryEventId, { companyId });
    assert.equal(retried.status, 'failed', 'delivery failures remain eligible for retry');
    assert.equal(Number(retried.attempts), 1);
    assert.match(String(retried.last_error), /SSRF/);

    await assert.rejects(dispatch, /notify_dispatch failed/);
    retried = await eventRepo.findById(retryEventId, { companyId });
    assert.equal(retried.status, 'failed');
    assert.equal(Number(retried.attempts), 2, 'the next dispatch retries the event');
  } finally {
    if (previousDeliveryMode === undefined) delete process.env.ARSY_NOTIFY_DELIVERY;
    else process.env.ARSY_NOTIFY_DELIVERY = previousDeliveryMode;
    await app.close();
  }
});

test('notify: SSRF guard rejects internal base_url targets (T3.4)', () => {
  const blocked = [
    'http://169.254.169.254/latest/meta-data',  // cloud metadata
    'http://127.0.0.1:9999/webhook',            // loopback
    'http://localhost/hooks',                    // loopback name
    'http://10.0.0.5/private',                   // private /8
    'http://192.168.1.1/admin',                  // private /16
    'http://[::1]/v1',                           // IPv6 loopback
    'ftp://example.com/file',                    // non-http scheme
    'http://0177.0.0.1/x',                       // octal-encoded loopback
  ];
  for (const url of blocked) {
    assert.throws(() => assertSafeBaseUrl(url), NotifySsrfBlockedError, `${url} must be rejected`);
  }
  // A public endpoint is accepted and normalized.
  assert.equal(typeof assertSafeBaseUrl('https://93.184.216.34/hooks'), 'string');
  assert.equal(typeof assertSafeBaseUrl('https://notify.example.com/hook'), 'string');
});
