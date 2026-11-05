/**
 * The platform notification-template catalog (roadmap T3.4). These are the codes
 * the wired producers reference, shipped as company_id 0 reference rows so every
 * tenant resolves the same subject/body by `code`. Idempotent on `code` (a unique
 * column), so a re-seed writes nothing.
 */
export const DEFAULT_NOTIFY_TEMPLATES: Array<{
  code: string;
  channel_type: 'email' | 'sms' | 'webhook';
  subject: string;
  body: string;
}> = [
  {
    code: 'invoice.paid',
    channel_type: 'email',
    subject: 'Invoice {{invoice_id}} paid',
    body: 'Invoice {{invoice_id}} for {{amount}} {{currency}} has been marked paid.',
  },
  {
    code: 'invoice.overdue',
    channel_type: 'email',
    subject: 'Invoice {{invoice_id}} overdue',
    body: 'Invoice {{invoice_id}} for {{amount}} {{currency}} is now overdue.',
  },
  {
    code: 'radius.auth_failure',
    channel_type: 'webhook',
    subject: 'RADIUS authentication rejected',
    body: 'RADIUS auth from NAS {{nas_ip}} was rejected ({{reason}}).',
  },
  {
    code: 'gateway.spend_threshold',
    channel_type: 'email',
    subject: 'LLM gateway spend threshold crossed',
    body: 'LLM gateway spend for the day reached {{cost_usd}} USD, above the configured threshold.',
  },
  {
    code: 'heliogrid.low_battery',
    channel_type: 'email',
    subject: 'Heliogrid low battery alert',
    body: 'Battery charge at site {{site_id}} is below {{threshold}}% for {{day}}.',
  },
  {
    code: 'heliogrid.grid_failure',
    channel_type: 'email',
    subject: 'Heliogrid grid failure alert',
    body: 'Grid import dropped while site {{site_id}} continued consuming power on {{day}}.',
  },
];
