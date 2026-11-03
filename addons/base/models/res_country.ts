import { defineModel, fields } from '@allah/arsy-orm';

export const ResCountry = defineModel({
  name: 'res.country',
  tableName: 'res_country',
  displayName: 'Country',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    name: fields.char({ label: 'Country Name', required: true }),
    code: fields.char({ label: 'ISO Code', required: true, unique: true }),
    phone_code: fields.char({ label: 'Phone Code' }),
    currency_id: fields.many2one('res.currency', { label: 'Currency' }),
  },
});

