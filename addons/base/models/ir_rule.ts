import { defineModel, fields } from '@allah/arsy-orm';

export const IrRule = defineModel({
  name: 'ir.rule',
  tableName: 'ir_rule',
  displayName: 'Record Rule',
  fields: {
    id: fields.integer({ label: 'ID', primary: true }),
    company_id: fields.integer({ label: 'Company', required: true, default: 0 }),
    name: fields.char({ label: 'Rule Name', size: 255, required: true }),
    model_name: fields.char({ label: 'Model Name', size: 255, required: true }),
    domain_force: fields.text({ label: 'Domain Filter', required: true }),
    group_ids: fields.json({ label: 'Groups (empty = global)' }),
    global: fields.boolean({ label: 'Global Rule', default: false }),
    perm_read: fields.boolean({ label: 'Apply to Read', default: true }),
    perm_write: fields.boolean({ label: 'Apply to Write', default: true }),
    perm_create: fields.boolean({ label: 'Apply to Create', default: true }),
    perm_unlink: fields.boolean({ label: 'Apply to Delete', default: true }),
  },
  indexes: [
    { fields: ['model_name'] },
    { fields: ['global'] },
  ],
});
