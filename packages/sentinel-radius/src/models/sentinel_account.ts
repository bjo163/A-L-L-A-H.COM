import { defineModel, fields, modelRegistry } from '@allah/arsy-orm';

/**
 * Sentinel Account Model
 * Stores subscriber credentials and service plans for RADIUS authentication
 */
export const SentinelAccount = defineModel({
  name: 'sentinel.account',
  tableName: 'sentinel_account',
  displayName: 'Sentinel Subscriber Account',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    username: fields.char({ label: 'Username', required: true, unique: true }),
    password_hash: fields.char({ label: 'Password Hash', required: true }),
    password_salt: fields.char({ label: 'Password Salt', required: true }),
    status: fields.selection({
      active: 'Active',
      suspended: 'Suspended',
      expired: 'Expired',
      cancelled: 'Cancelled',
    }, { label: 'Status', default: 'active', required: true }),
    // Stored as a plain integer: there is no `sentinel.plan` model to relate to
    // (a many2one here would be a dangling reference). The physical column is
    // identical to a many2one (INTEGER), so this only removes the invalid claim.
    plan_id: fields.integer({ label: 'Service Plan ID' }),
    email: fields.char({ label: 'Email' }),
    phone: fields.char({ label: 'Phone' }),
    mac_address: fields.char({ label: 'MAC Address' }),
    ip_address: fields.char({ label: 'Static IP Address' }),
    framed_ip_address: fields.char({ label: 'Framed IP Address' }),
    rate_limit_download: fields.integer({ label: 'Download Rate Limit (Kbps)', default: 10240 }), // 10 Mbps
    rate_limit_upload: fields.integer({ label: 'Upload Rate Limit (Kbps)', default: 5120 }), // 5 Mbps
    data_limit_gb: fields.integer({ label: 'Data Limit (GB)', default: 1024 }), // 1 TB
    data_used_gb: fields.float({ label: 'Data Used (GB)', default: 0 }),
    activation_date: fields.datetime({ label: 'Activation Date' }),
    expiry_date: fields.datetime({ label: 'Expiry Date' }),
    last_payment_date: fields.datetime({ label: 'Last Payment Date' }),
    next_payment_date: fields.datetime({ label: 'Next Payment Date' }),
    billing_cycle: fields.selection({
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      annually: 'Annually',
    }, { label: 'Billing Cycle', default: 'monthly' }),
    notes: fields.text({ label: 'Notes' }),
    metadata: fields.json({ label: 'Metadata', default: {} }),
  },
  indexes: [
    { fields: ['company_id', 'username'], unique: true },
    { fields: ['status'] },
    { fields: ['plan_id'] },
    { fields: ['expiry_date'] },
  ],
});

// Register model
modelRegistry.register(SentinelAccount);
export * from './sentinel_account';