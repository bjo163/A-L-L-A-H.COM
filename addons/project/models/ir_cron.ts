import { defineModel, fields } from '@allah/arsy-orm';

export const IrCron = defineModel({
  name: 'ir.cron',
  tableName: 'ir_cron',
  displayName: 'Scheduled Action',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    name: fields.char({ label: 'Job Name', required: true }),
    model_name: fields.char({ label: 'Target Model' }),
    method_name: fields.char({ label: 'Method to Call' }),
    interval_number: fields.integer({ label: 'Interval', default: 5 }),
    interval_unit: fields.selection(
      {
        seconds: 'Seconds',
        minutes: 'Minutes',
        hours: 'Hours',
        days: 'Days',
      },
      { label: 'Interval Unit', default: 'minutes' }
    ),
    nextcall: fields.datetime({ label: 'Next Execution' }),
    state: fields.selection(
      {
        idle: 'Idle',
        running: 'Running',
        error: 'Error',
        disabled: 'Disabled',
      },
      { label: 'State', default: 'idle' }
    ),
    last_error: fields.text({ label: 'Last Error' }),
    run_count: fields.integer({ label: 'Run Count', default: 0 }),
    // Work-queue bookkeeping (roadmap T3.2): consecutive-failure attempts drive
    // exponential backoff; the claimer resets `attempt_count` on success and
    // parks `next_retry_at` at the backoff instant on failure (kept alongside
    // `nextcall` so the schedule column stays the single due-time source).
    attempt_count: fields.integer({ label: 'Attempt Count', default: 0 }),
    next_retry_at: fields.datetime({ label: 'Next Retry At' }),
  },
  indexes: [
    { fields: ['company_id'] },
    { fields: ['active', 'nextcall'] },
  ],
});
