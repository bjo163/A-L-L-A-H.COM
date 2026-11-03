import { defineModel, fields, modelRegistry } from './index';

export const AuthUser = defineModel({
  name: 'auth.user',
  tableName: 'auth_user',
  displayName: 'Authentication User',
  fields: {
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
  indexes: [{ fields: ['email'], unique: true }],
});

export const AuthSession = defineModel({
  name: 'auth.session',
  tableName: 'auth_session',
  displayName: 'Authentication Session',
  fields: {
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

export function registerAuthModels(): void {
  modelRegistry.register(AuthUser);
  modelRegistry.register(AuthSession);
  modelRegistry.register(AuthVerification);
}

