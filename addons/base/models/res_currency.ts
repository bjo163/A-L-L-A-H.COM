import { defineModel, fields } from '@allah/arsy-orm';

export const ResCurrency = defineModel({
  name: 'res.currency',
  tableName: 'res_currency',
  displayName: 'Currency',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    name: fields.char({ label: 'Currency Code', required: true, unique: true }),
    symbol: fields.char({ label: 'Symbol', required: true }),
    rate: fields.float({ label: 'Exchange Rate', default: 1.0 }),
    decimal_places: fields.integer({ label: 'Decimal Places', default: 2 }),
  },
});

