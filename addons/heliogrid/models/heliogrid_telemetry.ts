import { defineModel } from '@allah/arsy-orm';

export const HeLiGridTelemetry = defineModel({
  name: 'heliogrid.telemetry',
  tableName: 'heliogrid_telemetry',
  fields: {
    id: { type: 'integer', primary: true },
    site_id: { type: 'integer', required: true },
    solar_generation_kw: { type: 'decimal', required: true, precision: 10, scale: 2 },
    battery_discharge_kw: { type: 'decimal', required: true, precision: 10, scale: 2 },
    grid_import_kw: { type: 'decimal', required: true, precision: 10, scale: 2 },
    site_consumption_kw: { type: 'decimal', required: true, precision: 10, scale: 2 },
    recorded_at: { type: 'timestamp', required: true, default: 'now' },
    company_id: { type: 'char', required: true, size: 255 }
  },
  indexes: [
    { fields: ['company_id'] },
    { fields: ['site_id'] },
    { fields: ['recorded_at'] },
  ]
});