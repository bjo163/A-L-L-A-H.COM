import { defineModel, fields } from '@allah/arsy-orm';

export const ProjectTask = defineModel({
  name: 'project.task',
  tableName: 'project_task',
  displayName: 'Task',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    project_id: fields.many2one('project.project', { label: 'Project', required: true }),
    stage_id: fields.many2one('project.task.stage', { label: 'Stage' }),
    name: fields.char({ label: 'Task Name', required: true }),
    description: fields.text({ label: 'Description' }),
    plan_slug: fields.char({ label: '.plans Folder Name' }),
    source_file: fields.char({ label: 'Source Markdown File' }),
    line_index: fields.integer({ label: 'Line Index in Markdown' }),
    file_hash: fields.char({ label: 'SHA-256 of line content at last sync' }),
    state: fields.selection(
      {
        pending: 'Pending',
        in_progress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled',
      },
      { label: 'State', default: 'pending' }
    ),
    priority: fields.selection(
      {
        low: 'Low',
        normal: 'Normal',
        high: 'High',
        urgent: 'Urgent',
      },
      { label: 'Priority', default: 'normal' }
    ),
    assigned_uid: fields.many2one('res.users', { label: 'Assigned To' }),
    agent_mission_id: fields.char({ label: 'Agent Mission ID' }),
    deadline: fields.datetime({ label: 'Deadline' }),
    legal_hold: fields.boolean({ label: 'Legal Hold', default: false }),
    retention_until: fields.datetime({ label: 'Retention Until' }),
  },
  indexes: [
    { fields: ['company_id'] },
    { fields: ['project_id'] },
    { fields: ['state'] },
    { fields: ['plan_slug'] },
    { fields: ['plan_slug', 'line_index'] },
  ],
});
