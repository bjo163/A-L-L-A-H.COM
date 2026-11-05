import { defineModel } from '@allah/arsy-orm';

export const HeLiGridBattery = defineModel({
  name: 'heliogrid.battery',
  tableName: 'heliogrid_battery',
  displayName: 'Heliogrid Battery',
  fields: {
    site_id: { type: 'integer' as const, required: true },
    capacity_kwh: { type: 'decimal' as const, required: true },
    state_of_charge_percent: { type: 'decimal' as const, required: true, default: 100 },
    cycle_count: { type: 'integer' as const, required: true, default: 0 },
    status: { type: 'char' as const, required: true, size: 50, default: 'active' },
    installed_at: { type: 'timestamp' as const, required: true, default: 'now' },
    last_discharge: { type: 'timestamp' as const },
    company_id: { type: 'char' as const, required: true, size: 255 },
    created_at: { type: 'timestamp' as const, required: true, default: 'now' },
    updated_at: { type: 'timestamp' as const, required: true, default: 'now' }
  },
  indexes: [
    { fields: ['company_id'] },
    { fields: ['site_id'] },
    { fields: ['status'] },
  ]
});
