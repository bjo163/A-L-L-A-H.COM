import { ModelDefinition } from '@allah/arsy-orm/model';

export const HeLiGridInverter: ModelDefinition = {
  name: 'heliogrid.inverter',
  tableName: 'heliogrid_inverter',
  fields: {
    id: { type: 'serial', required: true, unique: true },
    site_id: { type: 'integer', required: true },
    model: { type: 'varchar', required: true, length: 255 },
    serial_number: { type: 'varchar', required: true, length: 255 },
    capacity_kw: { type: 'decimal', required: true, precision: 10, scale: 2 },
    status: { type: 'varchar', required: true, length: 50, default: 'offline' },
    installed_at: { type: 'timestamp', required: true, default: 'now' },
    last_inspection: { type: 'timestamp', required: false },
    company_id: { type: 'varchar', required: true, length: 255 },
    created_at: { type: 'timestamp', required: true, default: 'now' },
    updated_at: { type: 'timestamp', required: true, default: 'now' }
  },
  indexes: [
    { fields: ['company_id'] },
    { fields: ['site_id'] },
    { fields: ['serial_number'], unique: true },
  ]
};