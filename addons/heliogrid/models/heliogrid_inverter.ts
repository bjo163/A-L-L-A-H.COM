import { defineModel } from '@allah/arsy-orm';

export const HeLiGridInverter = defineModel({
  name: 'heliogrid.inverter',
  tableName: 'heliogrid_inverter',
  displayName: 'Heliogrid Inverter',
  fields: {
    site_id: { type: 'integer' as const, required: true },
    model: { type: 'char' as const, required: true, size: 255 },
    serial_number: { type: 'char' as const, required: true, size: 255 },
    capacity_kw: { type: 'decimal' as const, required: true },
    status: { type: 'char' as const, required: true, size: 50, default: 'offline' },
    installed_at: { type: 'timestamp' as const, required: true, default: 'now' },
    last_inspection: { type: 'timestamp' as const },
    company_id: { type: 'char' as const, required: true, size: 255 },
    created_at: { type: 'timestamp' as const, required: true, default: 'now' },
    updated_at: { type: 'timestamp' as const, required: true, default: 'now' }
  },
  indexes: [
    { fields: ['company_id'] },
    { fields: ['site_id'] },
    { fields: ['serial_number'], unique: true },
  ]
});
