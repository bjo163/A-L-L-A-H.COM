import { defineModel, fields } from '@allah/arsy-orm';

export const IspSubscription = defineModel({
  name: 'isp.subscription',
  tableName: 'isp_subscription',
  displayName: 'ISP Subscription',
  fields: {
    company_id: fields.many2one('res.company', { label: 'Company', required: true }),
    partner_id: fields.many2one('res.partner', { label: 'Customer', required: true }),
    plan_id: fields.many2one('isp.plan', { label: 'Plan', required: true }),
    status: fields.selection(
      {
        draft: 'Draft',
        pending_payment: 'Pending Payment',
        active: 'Active',
        grace: 'Grace Period',
        suspended: 'Suspended',
        expired: 'Expired',
        cancelled: 'Cancelled',
        reactivation_pending: 'Reactivation Pending',
      },
      { label: 'Status', required: true, default: 'draft' }
    ),
    username: fields.char({ label: 'Username (RADIUS)', required: true }),
    start_date: fields.datetime({ label: 'Start Date', required: true }),
    end_date: fields.datetime({ label: 'End Date' }),
    grace_until: fields.datetime({ label: 'Grace Period Until' }),
    suspended_reason: fields.char({ label: 'Suspension Reason' }),
    auto_renew: fields.boolean({ label: 'Auto Renew', default: true }),
    payment_method_id: fields.integer({ label: 'Payment Method ID' }),
    last_billed_at: fields.datetime({ label: 'Last Billed At' }),
    next_billing_date: fields.datetime({ label: 'Next Billing Date' }),
  },
  indexes: [
    { fields: ['company_id'] },
    { fields: ['partner_id'] },
    { fields: ['plan_id'] },
    { fields: ['status'] },
    { fields: ['username'], unique: true },
  ],
});