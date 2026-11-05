import { ModelDefinition } from '@allah/arsy-orm/model';

export const HeLiGridTelemetry: ModelDefinition = {
  name: 'heliogrid.telemetry',
  tableName: 'heliogrid_telemetry',
  fields: {
    id: { type: 'serial', required: true, unique: true },
    site_id: { type: 'integer', required: true },
    solar_generation_kw: { type: 'decimal', required: true, precision: 10, scale: 2 },
    battery_discharge_kw: { type: 'decimal', required: true, precision: 10, scale: 2 },
    grid_import_kw: { type: 'decimal', required: true, precision: 10, scale: 2 },
    site_consumption_kw: { type: 'decimal', required: true, precision: 10, scale: 2 },
    recorded_at: { type: 'timestamp', required: true, default: 'now' },
    company_id: { type: 'varchar', required: true, length: 255 }
  },
  indexes: [
    { fields: ['company_id'] },
    { fields: ['site_id'] },
    { fields: ['recorded_at'] },
  ]
};