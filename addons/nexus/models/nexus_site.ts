import { defineModel, fields } from '@allah/arsy-orm';

export const NexusSite = defineModel({
  name: 'nexus.site',
  tableName: 'nexus_site',
  displayName: 'Network Site',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    name: fields.char({ label: 'Site Name', required: true }),
    code: fields.char({ label: 'Site Code', required: true, unique: true }),
    address: fields.text({ label: 'Address' }),
    latitude: fields.float({ label: 'Latitude' }),
    longitude: fields.float({ label: 'Longitude' }),
    metadata: fields.json({ label: 'Metadata' }),
  },
  indexes: [
    { fields: ['code'], unique: true },
  ],
});