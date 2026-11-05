import { defineModel, fields } from '@allah/arsy-orm';

export const ProjectProject = defineModel({
  name: 'project.project',
  tableName: 'project_project',
  displayName: 'Project',
  displayNameSpec: 'name',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    name: fields.char({ label: 'Project Name', required: true }),
    code: fields.char({ label: 'Project Code' }),
    slug: fields.char({ label: 'Slug', unique: true }),
    description: fields.text({ label: 'Description' }),
    workspace_path: fields.char({ label: 'Workspace Path' }),
    sync_mode: fields.selection(
      {
        local_master: 'Local Master',
        hub_master: 'Hub Master',
        bidirectional: 'Bidirectional',
        disabled: 'Disabled',
      },
      { label: 'Sync Mode', default: 'bidirectional' }
    ),
    last_sync_at: fields.datetime({ label: 'Last Synced At' }),
    sync_hash: fields.char({ label: 'Sync State Hash' }),
  },
  indexes: [
    { fields: ['company_id'] },
    { fields: ['slug'], unique: true },
  ],
});
