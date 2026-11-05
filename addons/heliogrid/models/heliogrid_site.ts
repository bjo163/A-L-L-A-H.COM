import { ModelDefinition } from '@allah/arsy-orm/model';

export const HeLiGridSite: ModelDefinition = {
  name: 'heliogrid.site',
  tableName: 'heliogrid_site',
  fields: {
    id: { type: 'serial', required: true, unique: true },
    site_name: { type: 'varchar', required: true, length: 255 },
    nexus_site_id: { type: 'integer', required: true, unique: true },
    company_id: { type: 'varchar', required: true, length: 255 },
    address: { type: 'text', required: false },
    city: { type: 'varchar', required: false, length: 255 },
    state: { type: 'varchar', required: false, length: 100 },
    country: { type: 'varchar', required: false, length: 100 },
    postal_code: { type: 'varchar', required: false, length: 20 },
    created_at: { type: 'timestamp', required: true, default: 'now' },
    updated_at: { type: 'timestamp', required: true, default: 'now' }
  },
  indexes: [
    { fields: ['company_id'] },
    { fields: ['nexus_site_id'], unique: true },
  ]
};