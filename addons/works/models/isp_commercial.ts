import { defineModel, fields } from '@allah/arsy-orm';

export const IspPlan = defineModel({
  name: 'isp.plan',
  tableName: 'isp_plan',
  displayName: 'ISP Plan',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    name: fields.char({ label: 'Plan Name', required: true }),
    slug: fields.char({ label: 'Public Slug' }),
    description: fields.text({ label: 'Description' }),
    download_mbps: fields.integer({ label: 'Download (Mbps)', default: 10 }),
    upload_mbps: fields.integer({ label: 'Upload (Mbps)', default: 5 }),
    price: fields.float({ label: 'Price', default: 0 }),
    currency: fields.char({ label: 'Currency', default: 'IDR' }),
    burst_profile: fields.char({ label: 'Burst Profile' }),
    fup_limit_gb: fields.integer({ label: 'FUP Limit (GB)' }),
    is_public: fields.boolean({ label: 'Published', default: false }),
    sequence: fields.integer({ label: 'Display Order', default: 10 }),
  },
  indexes: [
    { fields: ['company_id'] },
    { fields: ['company_id', 'slug'] },
    { fields: ['is_public'] },
  ],
});

export const IspSubscription = defineModel({
  name: 'isp.subscription',
  tableName: 'isp_subscription',
  displayName: 'ISP Subscription',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    // Typed FK (roadmap T3.5): the subscription's customer is a res.partner. The
    // column stays an integer id (no constraint added — per-m2o FK enforcement is
    // deliberately deferred), but the relation label lets `expand` traverse it and
    // makes the reference auditable instead of a bare int.
    customer_id: fields.many2one('res.partner', { label: 'Customer', deferFk: true }),
    plan_id: fields.many2one('isp.plan', { label: 'Plan' }),
    state: fields.selection(
      { draft: 'Draft', active: 'Active', grace: 'Grace', suspended: 'Suspended', cancelled: 'Cancelled' },
      { label: 'State', default: 'draft' }
    ),
    started_at: fields.datetime({ label: 'Started At' }),
    suspended_at: fields.datetime({ label: 'Suspended At' }),
    cancelled_at: fields.datetime({ label: 'Cancelled At' }),
  },
  indexes: [{ fields: ['company_id'] }, { fields: ['state'] }],
});

export const IspInvoice = defineModel({
  name: 'isp.invoice',
  tableName: 'isp_invoice',
  displayName: 'ISP Invoice',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    subscription_id: fields.many2one('isp.subscription', { label: 'Subscription' }),
    amount: fields.float({ label: 'Amount', default: 0 }),
    currency: fields.char({ label: 'Currency', default: 'IDR' }),
    due_date: fields.datetime({ label: 'Due Date' }),
    payment_ref: fields.char({ label: 'Payment Reference' }),
    state: fields.selection(
      { draft: 'Draft', open: 'Open', paid: 'Paid', overdue: 'Overdue' },
      { label: 'State', default: 'draft' }
    ),
  },
  indexes: [{ fields: ['company_id'] }],
});