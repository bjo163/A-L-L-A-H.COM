import { defineModel, fields } from '@allah/arsy-orm';

export const ResPartner = defineModel({
  name: 'res.partner',
  tableName: 'res_partner',
  displayName: 'Contact',
  fields: {
    name: fields.char({ label: 'Name', required: true }),
    is_company: fields.boolean({ label: 'Is a Company', default: false }),
    parent_id: fields.many2one('res.partner', { label: 'Parent Contact' }),
    email: fields.char({ label: 'Email' }),
    phone: fields.char({ label: 'Phone' }),
    credit_balance: fields.float({ label: 'Credit Balance', default: 0.0 }),
  },
  indexes: [{ fields: ['email'] }],
});

