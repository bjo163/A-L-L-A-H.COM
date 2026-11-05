import { defineModel, fields } from '@allah/arsy-orm';

/**
 * notify.channel — an outbound delivery target (roadmap T3.4).
 *
 * A channel is one concrete way to reach a recipient: `email` / `sms` ride a
 * provider HTTP gateway (`base_url`), `webhook` posts the rendered event straight
 * to `base_url`. `base_url` is operator-supplied and therefore untrusted, so the
 * dispatch service validates it against the platform SSRF invariant before any
 * outbound request (see `services/webhook.ts`) — a channel pointing at a link-
 * local or private address can never make the hub issue an internal request.
 */
export const NotifyChannel = defineModel({
  name: 'notify.channel',
  tableName: 'notify_channel',
  displayName: 'Notification Channel',
  displayNameSpec: 'name',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    name: fields.char({ label: 'Channel Name', required: true }),
    channel_type: fields.selection(
      { email: 'Email Gateway', sms: 'SMS Gateway', webhook: 'Webhook' },
      { label: 'Type', required: true, default: 'webhook' }
    ),
    base_url: fields.char({ label: 'Base URL', help: 'Outbound endpoint; SSRF-validated before use' }),
    recipient_default: fields.char({ label: 'Default Recipient' }),
    auth_token_encrypted: fields.char({
      label: 'Auth Token (encrypted)',
      help: 'Optional bearer secret for the gateway; encrypted envelope. Never enters the sync ledger.',
    }),
    config: fields.json({ label: 'Extra Config', default: {} }),
    is_active: fields.boolean({ label: 'Active', default: true }),
    sequence: fields.integer({ label: 'Display Order', default: 10 }),
  },
  indexes: [{ fields: ['company_id'] }, { fields: ['channel_type'] }],
});

/**
 * notify.template — the subject/body pair a producer references by `code`.
 *
 * Subject and body are translatable (`translate: true`): the ORM resolves the
 * active-language value through `ir.translation` model rows seeded from the base
 * data catalog, so an operator ships one template and localizes it per language.
 */
export const NotifyTemplate = defineModel({
  name: 'notify.template',
  tableName: 'notify_template',
  displayName: 'Notification Template',
  displayNameSpec: 'code',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    code: fields.char({ label: 'Template Code', required: true, unique: true }),
    channel_type: fields.selection(
      { email: 'Email Gateway', sms: 'SMS Gateway', webhook: 'Webhook' },
      { label: 'Default Channel', default: 'webhook' }
    ),
    subject: fields.char({ label: 'Subject', translate: true }),
    body: fields.text({ label: 'Body', translate: true }),
  },
  indexes: [{ fields: ['company_id'] }],
});

/**
 * notify.event — the append-only notification log (roadmap T3.4).
 *
 * Producers only ever append an event (a state transition, an auth failure, a
 * spend threshold crossing); the `notify_dispatch` cron drains pending events,
 * flips their status, and never deletes history. The row is on the sync-outbox
 * allowlist, so every appended event also emits exactly one ledger row for
 * cross-app consumers — the same "one outbox row per event" contract res.users
 * and nexus.nas already honour.
 */
export const NotifyEvent = defineModel({
  name: 'notify.event',
  tableName: 'notify_event',
  displayName: 'Notification Event',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    template_code: fields.char({ label: 'Template Code', required: true }),
    channel_id: fields.many2one('notify.channel', { label: 'Channel' }),
    channel_type: fields.selection(
      { email: 'Email Gateway', sms: 'SMS Gateway', webhook: 'Webhook' },
      { label: 'Channel Type', required: true, default: 'webhook' }
    ),
    recipient: fields.char({ label: 'Recipient' }),
    subject: fields.char({ label: 'Subject' }),
    body: fields.text({ label: 'Body' }),
    payload: fields.json({ label: 'Payload', default: {} }),
    status: fields.selection(
      { pending: 'Pending', delivered: 'Delivered', failed: 'Failed' },
      { label: 'Status', required: true, default: 'pending' }
    ),
    attempts: fields.integer({ label: 'Attempts', default: 0 }),
    last_error: fields.text({ label: 'Last Error' }),
    sent_at: fields.datetime({ label: 'Sent At' }),
  },
  indexes: [{ fields: ['company_id'] }, { fields: ['status'] }, { fields: ['template_code'] }],
});
