import { defineModel } from '@allah/arsy-orm';

export const HeLiGridSite = defineModel({
  name: 'heliogrid.site',
  tableName: 'heliogrid_site',
  displayName: 'Heliogrid Site',
  fields: {
    site_name: { type: 'char' as const, required: true, size: 255 },
    nexus_site_id: { type: 'integer' as const, required: true, unique: true },
    company_id: { type: 'char' as const, required: true, size: 255 },
    address: { type: 'text' as const },
    city: { type: 'char' as const, size: 255 },
    state: { type: 'char' as const, size: 100 },
    country: { type: 'char' as const, size: 100 },
    postal_code: { type: 'char' as const, size: 20 },
    created_at: { type: 'timestamp' as const, required: true, default: 'now' },
    updated_at: { type: 'timestamp' as const, required: true, default: 'now' }
  },
  indexes: [
    { fields: ['company_id'] },
    { fields: ['nexus_site_id'], unique: true },
  ]
});
