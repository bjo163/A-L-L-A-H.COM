import { defineModel, fields } from '@allah/arsy-orm';

export const IspPlan = defineModel({
  name: 'isp.plan',
  tableName: 'isp_plan',
  displayName: 'ISP Plan',
  fields: {
    company_id: fields.many2one('res.company', { label: 'Company', required: true }),
    name: fields.char({ label: 'Plan Name', required: true }),
    description: fields.text({ label: 'Description' }),
    download_speed_kbps: fields.integer({ label: 'Download Speed (Kbps)', required: true }),
    upload_speed_kbps: fields.integer({ label: 'Upload Speed (Kbps)', required: true }),
    burst_download_kbps: fields.integer({ label: 'Burst Download Speed (Kbps)' }),
    burst_upload_kbps: fields.integer({ label: 'Burst Upload Speed (Kbps)' }),
    burst_threshold_kbps: fields.integer({ label: 'Burst Threshold (Kbps)' }),
    burst_time_seconds: fields.integer({ label: 'Burst Duration (seconds)' }),
    fup_threshold_gb: fields.float({ label: 'FUP Threshold (GB)' }),
    fup_throttled_download_kbps: fields.integer({ label: 'FUP Throttled Download (Kbps)' }),
    fup_throttled_upload_kbps: fields.integer({ label: 'FUP Throttled Upload (Kbps)' }),
    price_cents: fields.integer({ label: 'Price (cents)', required: true }),
    currency: fields.char({ label: 'Currency', required: true, default: 'USD' }),
    billing_cycle_days: fields.integer({ label: 'Billing Cycle (days)', required: true, default: 30 }),
    grace_period_days: fields.integer({ label: 'Grace Period (days)', required: true, default: 7 }),
    is_active: fields.boolean({ label: 'Active', default: true }),
  },
  indexes: [
    { fields: ['company_id'] },
    { fields: ['is_active'] },
  ],
});