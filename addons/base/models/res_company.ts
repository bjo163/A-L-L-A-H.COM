import { defineModel, fields } from '@allah/arsy-orm';

export const ResCompany = defineModel({
  name: 'res.company',
  tableName: 'res_company',
  displayName: 'Company',
  fields: {
    name: fields.char({ label: 'Company Name', required: true }),
    currency_id: fields.many2one('res.currency', { label: 'Currency' }),
    country_id: fields.many2one('res.country', { label: 'Country' }),
    parent_id: fields.many2one('res.company', { label: 'Parent Company' }),
    metadata: fields.json({ label: 'Metadata' }),
  },
});
