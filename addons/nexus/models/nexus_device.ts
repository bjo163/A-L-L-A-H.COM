import { defineModel, fields } from '@allah/arsy-orm';

export const NexusDevice = defineModel({
  name: 'nexus.device',
  tableName: 'nexus_device',
  displayName: 'Network Device',
  fields: {
    name: fields.char({ label: 'Device Name', required: true }),
    vendor: fields.selection(
      {
        mikrotik: 'MikroTik',
        other: 'Other',
      },
      { label: 'Vendor', default: 'mikrotik', required: true }
    ),
    model: fields.char({ label: 'Model', required: true }),
    routeros_version: fields.char({ label: 'RouterOS Version' }),
    serial_number: fields.char({ label: 'Serial Number' }),
    management_ip: fields.char({ label: 'Management IP', required: true }),
    site_id: fields.many2one('nexus.site', { label: 'Site', required: true }),
    metadata: fields.json({ label: 'Metadata' }),
  },
  indexes: [
    { fields: ['site_id'] },
    { fields: ['management_ip'] },
  ],
});