import { defineModel, fields } from '@allah/arsy-orm';

export const IspInvoice = defineModel({
  name: 'isp.invoice',
  tableName: 'isp_invoice',
  displayName: 'ISP Invoice',
  fields: {
    company_id: fields.many2one('res.company', { label: 'Company', required: true }),
    subscription_id: fields.many2one('isp.subscription', { label: 'Subscription', required: true }),
    partner_id: fields.many2one('res.partner', { label: 'Customer', required: true }),
    number: fields.char({ label: 'Invoice Number', required: true, unique: true }),
    status: fields.selection(
      {
        draft: 'Draft',
        open: 'Open',
        paid: 'Paid',
        void: 'Void',
        refunded: 'Refunded',
      },
      { label: 'Status', required: true, default: 'draft' }
    ),
    amount_cents: fields.integer({ label: 'Amount (cents)', required: true }),
    currency: fields.char({ label: 'Currency', required: true, default: 'USD' }),
    tax_cents: fields.integer({ label: 'Tax (cents)', default: 0 }),
    total_cents: fields.integer({ label: 'Total (cents)', required: true }),
    due_date: fields.datetime({ label: 'Due Date', required: true }),
    paid_at: fields.datetime({ label: 'Paid At' }),
    payment_reference: fields.char({ label: 'Payment Reference' }),
    payment_provider: fields.char({ label: 'Payment Provider' }),
    billing_period_start: fields.datetime({ label: 'Billing Period Start', required: true }),
    billing_period_end: fields.datetime({ label: 'Billing Period End', required: true }),
    notes: fields.text({ label: 'Notes' }),
  },
  indexes: [
    { fields: ['company_id'] },
    { fields: ['subscription_id'] },
    { fields: ['partner_id'] },
    { fields: ['status'] },
    { fields: ['number'], unique: true },
    { fields: ['due_date'] },
  ],
});