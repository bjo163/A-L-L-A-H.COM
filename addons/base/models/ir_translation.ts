import { defineModel, fields } from '@allah/arsy-orm';

/**
 * ir.translation - Translation Terms & Model Values Registry
 * 
 * Odoo-inspired translation storage for multi-tenant i18n.
 * Supports two translation pillars:
 * 1. Static UI & Term Translations (type: 'code'/'ui')
 * 2. Dynamic Model Field Translations (type: 'model')
 */
export const IrTranslation = defineModel({
  name: 'ir.translation',
  tableName: 'ir_translation',
  displayName: 'Translation',
  fields: {
    id: fields.integer({ label: 'ID', primary: true }),
    company_id: fields.integer({ label: 'Company', required: true, default: 0 }),
    lang: fields.char({ label: 'Language', size: 64, required: true }),
    type: fields.selection(
      {
        model: 'Model Field Translation',
        ui: 'UI String Translation',
        code: 'Code String Translation',
      },
      { label: 'Translation Type', required: true }
    ),
    name: fields.char({ label: 'Term Key', size: 512, required: true }),
    model_name: fields.char({ label: 'Model Name', size: 255 }),
    res_id: fields.integer({ label: 'Record ID', default: 0 }),
    src: fields.text({ label: 'Source Text' }),
    value: fields.text({ label: 'Translated Text' }),
    state: fields.selection(
      {
        to_translate: 'To Translate',
        translated: 'Translated',
        review_needed: 'Review Needed',
      },
      { label: 'State', default: 'to_translate' }
    ),
  },
  indexes: [
    { fields: ['company_id', 'lang', 'model_name', 'name', 'res_id'] },
    { fields: ['lang', 'model_name', 'name'] },
    { fields: ['state'] },
  ],
});