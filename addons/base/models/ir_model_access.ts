import { defineModel, fields } from '@allah/arsy-orm';

export const IrModelAccess = defineModel({
  name: 'ir.model.access',
  tableName: 'ir_model_access',
  displayName: 'Model Access Control',
  fields: {
    id: fields.integer({ label: 'ID', primary: true }),
    company_id: fields.integer({ label: 'Company', required: true, default: 0 }),
    model_name: fields.char({ label: 'Model Name', size: 255, required: true }),
    group_id: fields.integer({ label: 'Group ID', required: true }),
    perm_read: fields.boolean({ label: 'Read Access', default: true }),
    perm_write: fields.boolean({ label: 'Write Access', default: false }),
    perm_create: fields.boolean({ label: 'Create Access', default: false }),
    perm_unlink: fields.boolean({ label: 'Delete Access', default: false }),
  },
  indexes: [
    { fields: ['model_name', 'group_id'], unique: true },
    { fields: ['group_id'] },
  ],
});
