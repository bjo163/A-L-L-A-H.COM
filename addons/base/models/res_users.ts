import { defineModel, fields } from '@allah/arsy-orm';

export const ResUsers = defineModel({
  name: 'res.users',
  tableName: 'res_users',
  displayName: 'User',
  fields: {
    name: fields.char({ label: 'Full Name', required: true }),
    email: fields.char({ label: 'Email', required: true, unique: true }),
    password: fields.char({ label: 'Hashed Password', required: true }),
    api_key: fields.char({ label: 'API Key', unique: true }),
    reset_token: fields.char({ label: 'Password Reset Token' }),
    email_verification_token: fields.char({ label: 'Verification Token' }),
    email_verified_at: fields.datetime({ label: 'Email Verified At' }),
    magic_link_token: fields.char({ label: 'Magic Link Token' }),
  },
  indexes: [{ fields: ['email'], unique: true }],
});
