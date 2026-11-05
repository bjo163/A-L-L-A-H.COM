import { defineModel } from '@allah/arsy-orm';

export const HeLiGridSite = defineModel({
  name: 'heliogrid.site',
  tableName: 'heliogrid_site',
  fields: {
    id: { type: 'integer', primary: true },
    site_name: { type: 'char', required: true, size: 255 },
    nexus_site_id: { type: 'integer', required: true, unique: true },
    company_id: { type: 'char', required: true, size: 255 },
    address: { type: 'text', required: false },
    city: { type: 'char', required: false, size: 255 },
    state: { type: 'char', required: false, size: 100 },
    country: { type: 'char', required: false, size: 100 },
    postal_code: { type: 'char', required: false, size: 20 },
    created_at: { type: 'timestamp', required: true, default: 'now' },
    updated_at: { type: 'timestamp', required: true, default: 'now' }
  },
  indexes: [
    { fields: ['company_id'] },
    { fields: ['nexus_site_id'], unique: true },
  ]
});