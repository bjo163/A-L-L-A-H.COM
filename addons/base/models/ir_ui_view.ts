import { defineModel, fields } from '@allah/arsy-orm';

export const IrUiView = defineModel({
  name: 'ir.ui.view',
  tableName: 'ir_ui_view',
  displayName: 'SDUI View',
  fields: {
    name: fields.char({ label: 'View Name', required: true }),
    model: fields.char({ label: 'Target Model', required: true }),
    view_type: fields.selection(
      {
        tree: 'Tree (List)',
        form: 'Form',
        kanban: 'Kanban',
        search: 'Search',
      },
      { label: 'View Type', required: true }
    ),
    arch_json: fields.json({ label: 'View Schema Architecture', required: true }),
  },
  indexes: [{ fields: ['model', 'view_type'] }],
});

