import { defineModel, fields } from '@allah/arsy-orm';

export const NexusNas = defineModel({
  name: 'nexus.nas',
  tableName: 'nexus_nas',
  displayName: 'NAS Client',
  fields: {
    nas_identifier: fields.char({ label: 'NAS Identifier', required: true, unique: true }),
    ip_address: fields.char({ label: 'IP Address', required: true }),
    secret_encrypted: fields.char({ label: 'Encrypted Secret', required: true }),
    vendor: fields.selection(
      {
        mikrotik: 'MikroTik',
        other: 'Other',
      },
      { label: 'Vendor', default: 'mikrotik', required: true }
    ),
    coa_port: fields.integer({ label: 'CoA Port', default: 3799 }),
    disconnect_port: fields.integer({ label: 'Disconnect Port', default: 3799 }),
    source_allowlist: fields.json({ label: 'Source Allowlist (CIDR array)', default: [] }),
    is_active: fields.boolean({ label: 'Active', default: true }),
    site_id: fields.many2one('nexus.site', { label: 'Site' }),
    device_id: fields.many2one('nexus.device', { label: 'Device' }),
    metadata: fields.json({ label: 'Metadata' }),
  },
  indexes: [
    { fields: ['nas_identifier'], unique: true },
    { fields: ['is_active'] },
    { fields: ['ip_address'] },
  ],
});