import { defineModel, fields } from '@allah/arsy-orm';

/**
 * res.lang - Language Registry Model
 * 
 * Odoo-inspired language definition table for multi-tenant i18n support.
 * Stores metadata about supported languages including direction (LTR/RTL),
 * date/time formats, and regional separators.
 */
export const ResLang = defineModel({
  name: 'res.lang',
  tableName: 'res_lang',
  displayName: 'Language',
  fields: {
    id: fields.integer({ label: 'ID', primary: true }),
    code: fields.char({ label: 'Language Code', size: 64, required: true, unique: true }),
    name: fields.char({ label: 'Language Name', size: 256, required: true }),
    direction: fields.selection(
      {
        ltr: 'Left-to-Right',
        rtl: 'Right-to-Left',
      },
      { label: 'Text Direction', default: 'ltr', required: true }
    ),
    active: fields.boolean({ label: 'Active', default: true }),
    date_format: fields.char({ label: 'Date Format', size: 64, default: '%Y-%m-%d' }),
    time_format: fields.char({ label: 'Time Format', size: 64, default: '%H:%M:%S' }),
    decimal_separator: fields.char({ label: 'Decimal Separator', size: 8, default: '.' }),
    thousands_separator: fields.char({ label: 'Thousands Separator', size: 8, default: ',' }),
    company_id: fields.integer({ label: 'Company', required: true, default: 0 }),
  },
  indexes: [
    { fields: ['code'] },
    { fields: ['active'] },
    { fields: ['company_id'] },
  ],
});