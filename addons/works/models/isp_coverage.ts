import { defineModel, fields } from '@allah/arsy-orm';

export const IspCoverage = defineModel({
  name: 'isp.coverage',
  tableName: 'isp_coverage',
  displayName: 'ISP Coverage Area',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    slug: fields.char({ label: 'Area Slug', required: true }),
    area_name: fields.char({ label: 'Area Name', required: true }),
    city: fields.char({ label: 'City' }),
    district: fields.char({ label: 'District' }),
    status: fields.selection(
      { available: 'Available', coming_soon: 'Coming Soon', planned: 'Planned', unavailable: 'Unavailable' },
      { label: 'Coverage Status', default: 'planned' }
    ),
    description: fields.text({ label: 'Description' }),
    is_public: fields.boolean({ label: 'Published', default: false }),
    sequence: fields.integer({ label: 'Display Order', default: 10 }),
  },
  indexes: [
    { fields: ['company_id'] },
    { fields: ['company_id', 'slug'], unique: true },
    { fields: ['is_public'] },
    { fields: ['status'] },
  ],
});
