import { defineModel } from '@allah/arsy-orm';

export const HeLiGridBattery = defineModel({
  name: 'heliogrid.battery',
  tableName: 'heliogrid_battery',
  fields: {
    id: { type: 'integer', primary: true },
    site_id: { type: 'integer', required: true },
    capacity_kwh: { type: 'decimal', required: true, precision: 10, scale: 2 },
    state_of_charge_percent: { type: 'decimal', required: true, precision: 5, scale: 2, default: 100.00 },
    cycle_count: { type: 'integer', required: true, default: 0 },
    status: { type: 'char', required: true, size: 50, default: 'active' },
    installed_at: { type: 'timestamp', required: true, default: 'now' },
    last_discharge: { type: 'timestamp', required: false },
    company_id: { type: 'char', required: true, size: 255 },
    created_at: { type: 'timestamp', required: true, default: 'now' },
    updated_at: { type: 'timestamp', required: true, default: 'now' }
  },
  indexes: [
    { fields: ['company_id'] },
    { fields: ['site_id'] },
    { fields: ['status'] },
  ]
});