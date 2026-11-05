import { defineModel } from '@allah/arsy-orm';

export const HeLiGridInverter = defineModel({
  name: 'heliogrid.inverter',
  tableName: 'heliogrid_inverter',
  fields: {
    id: { type: 'integer', primary: true },
    site_id: { type: 'integer', required: true },
    model: { type: 'char', required: true, size: 255 },
    serial_number: { type: 'char', required: true, size: 255 },
    capacity_kw: { type: 'decimal', required: true, precision: 10, scale: 2 },
    status: { type: 'char', required: true, size: 50, default: 'offline' },
    installed_at: { type: 'timestamp', required: true, default: 'now' },
    last_inspection: { type: 'timestamp', required: false },
    company_id: { type: 'char', required: true, size: 255 },
    created_at: { type: 'timestamp', required: true, default: 'now' },
    updated_at: { type: 'timestamp', required: true, default: 'now' }
  },
  indexes: [
    { fields: ['company_id'] },
    { fields: ['site_id'] },
    { fields: ['serial_number'], unique: true },
  ]
});