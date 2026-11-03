import { defineModel, fields } from '@allah/arsy-orm';

export const NexusIpPool = defineModel({
  name: 'nexus.ip_pool',
  tableName: 'nexus_ip_pool',
  displayName: 'IP Pool',
  fields: {
    name: fields.char({ label: 'Pool Name', required: true }),
    cidr: fields.char({ label: 'CIDR', required: true }),
    gateway: fields.char({ label: 'Gateway', required: true }),
    dns_primary: fields.char({ label: 'Primary DNS' }),
    dns_secondary: fields.char({ label: 'Secondary DNS' }),
    vlan_id: fields.integer({ label: 'VLAN ID' }),
    nas_id: fields.many2one('nexus.nas', { label: 'NAS' }),
    metadata: fields.json({ label: 'Metadata' }),
  },
  indexes: [
    { fields: ['nas_id'] },
    { fields: ['cidr'] },
  ],
});