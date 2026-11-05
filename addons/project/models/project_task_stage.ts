import { defineModel, fields } from '@allah/arsy-orm';

export const ProjectTaskStage = defineModel({
  name: 'project.task.stage',
  tableName: 'project_task_stage',
  displayName: 'Task Stage',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    name: fields.char({ label: 'Stage Name', required: true }),
    sequence: fields.integer({ label: 'Sequence', default: 10 }),
    fold: fields.boolean({ label: 'Folded in Kanban', default: false }),
    state_mapping: fields.selection(
      {
        pending: 'Pending',
        in_progress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled',
      },
      { label: 'Maps to State', default: 'pending' }
    ),
  },
  indexes: [
    { fields: ['company_id'] },
    { fields: ['sequence'] },
  ],
});
