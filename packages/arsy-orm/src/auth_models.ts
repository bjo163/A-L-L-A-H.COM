import { fields } from './fields';
import { defineModel } from './model';
import { modelRegistry } from './registry';

export const ResUsers = defineModel({
  name: 'res.users',
  tableName: 'res_users',
  displayName: 'User',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    name: fields.char({ label: 'Full Name', required: true }),
    email: fields.char({ label: 'Email', required: true, unique: true }),
    password: fields.char({ label: 'Hashed Password', required: true }),
    role: fields.selection(
      {
        user: 'User',
        superuser: 'Superuser',
        system: 'System',
      },
      { label: 'Role', required: true, default: 'user' }
    ),
    system_key: fields.char({ label: 'System Identity Key', unique: true }),
    api_key: fields.char({ label: 'API Key', unique: true }),
    reset_token: fields.char({ label: 'Password Reset Token' }),
    email_verification_token: fields.char({ label: 'Verification Token' }),
    email_verified_at: fields.datetime({ label: 'Email Verified At' }),
    magic_link_token: fields.char({ label: 'Magic Link Token' }),
  },
  indexes: [
    { fields: ['email'], unique: true },
    { fields: ['system_key'], unique: true },
  ],
});

export const AuthUser = defineModel({
  name: 'auth.user',
  tableName: 'auth_user',
  displayName: 'Authentication User',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    res_user_id: fields.many2one('res.users', { label: 'ORM User', required: true, unique: true }),
    email: fields.char({ label: 'Email', required: true, unique: true }),
    password_hash: fields.char({ label: 'Password Hash', required: true }),
    name: fields.char({ label: 'Display Name', required: true }),
    status: fields.selection(
      {
        active: 'Active',
        unverified: 'Unverified',
        suspended: 'Suspended',
        disabled: 'Disabled',
      },
      { label: 'Status', default: 'unverified' }
    ),
    email_verified_at: fields.datetime({ label: 'Email Verified At' }),
    two_factor_enabled: fields.boolean({ label: 'Two Factor Enabled', default: false }),
    avatar_url: fields.char({ label: 'Avatar URL' }),
  },
  indexes: [
    { fields: ['email'], unique: true },
    { fields: ['res_user_id'], unique: true },
  ],
});

export const AuthSession = defineModel({
  name: 'auth.session',
  tableName: 'auth_session',
  displayName: 'Authentication Session',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    user_id: fields.many2one('auth.user', { label: 'User ID', required: true }),
    session_token: fields.char({ label: 'Session Token', required: true, unique: true }),
    ip_address: fields.char({ label: 'IP Address' }),
    user_agent: fields.char({ label: 'User Agent' }),
    device_name: fields.char({ label: 'Device Name' }),
    expires_at: fields.datetime({ label: 'Expires At', required: true }),
    revoked: fields.boolean({ label: 'Revoked', default: false }),
  },
  indexes: [
    { fields: ['session_token'], unique: true },
    { fields: ['user_id'] },
  ],
});

export const AuthVerification = defineModel({
  name: 'auth.verification',
  tableName: 'auth_verification',
  displayName: 'Verification Token',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    identifier: fields.char({ label: 'Identifier (Email/ID)', required: true }),
    token: fields.char({ label: 'Verification Token', required: true, unique: true }),
    token_type: fields.selection(
      {
        email_verification: 'Email Verification',
        password_reset: 'Password Reset',
        magic_link: 'Magic Link',
      },
      { label: 'Token Type', required: true }
    ),
    expires_at: fields.datetime({ label: 'Expires At', required: true }),
    consumed: fields.boolean({ label: 'Consumed', default: false }),
  },
  indexes: [{ fields: ['token'], unique: true }],
});

export const AuthSetup = defineModel({
  name: 'auth.setup',
  tableName: 'auth_setup',
  displayName: 'Authentication Setup',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    key: fields.char({ label: 'Setup Key', required: true, unique: true }),
    completed: fields.boolean({ label: 'Completed', required: true, default: false }),
    owner_auth_user_id: fields.many2one('auth.user', { label: 'Initial Superuser' }),
    completed_at: fields.datetime({ label: 'Completed At' }),
  },
  indexes: [{ fields: ['key'], unique: true }],
});

export const AuditEvent = defineModel({
  name: 'arsy.audit.event',
  tableName: 'arsy_audit_event',
  displayName: 'Audit Event',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    actor_uid: fields.many2one('res.users', { label: 'Actor', required: true }),
    model_name: fields.char({ label: 'Model', required: true }),
    record_id: fields.char({ label: 'Record ID', required: true }),
    operation: fields.selection(
      {
        insert: 'Insert',
        update: 'Update',
        delete: 'Delete',
        admin_read: 'Privileged Read',
      },
      { label: 'Operation', required: true }
    ),
    changed_fields: fields.json({ label: 'Changed Fields', required: true }),
    reason_hash: fields.char({ label: 'Reason Hash' }),
    request_id: fields.char({ label: 'Request ID' }),
    global_access: fields.boolean({ label: 'Global Access', default: false }),
  },
  indexes: [
    { fields: ['company_id', 'create_date'] },
    { fields: ['model_name', 'record_id'] },
    { fields: ['actor_uid', 'create_date'] },
  ],
});

export function registerAuthModels(): void {
  modelRegistry.register(ResUsers);
  modelRegistry.register(AuthUser);
  modelRegistry.register(AuthSession);
  modelRegistry.register(AuthVerification);
  modelRegistry.register(AuthSetup);
  modelRegistry.register(AuditEvent);
}
