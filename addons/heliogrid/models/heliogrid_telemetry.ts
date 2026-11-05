import { defineModel } from '@allah/arsy-orm';

export const HeLiGridTelemetry = defineModel({
  name: 'heliogrid.telemetry',
  tableName: 'heliogrid_telemetry',
  displayName: 'Heliogrid Telemetry',
  fields: {
    site_id: { type: 'integer' as const, required: true },
    solar_generation_kw: { type: 'decimal' as const, required: true },
    battery_discharge_kw: { type: 'decimal' as const, required: true },
    grid_import_kw: { type: 'decimal' as const, required: true },
    site_consumption_kw: { type: 'decimal' as const, required: true },
    recorded_at: { type: 'timestamp' as const, required: true, default: 'now' },
    company_id: { type: 'char' as const, required: true, size: 255 }
  },
  indexes: [
    { fields: ['company_id'] },
    { fields: ['site_id'] },
    { fields: ['recorded_at'] },
  ]
});
