import { defineModel, fields } from '@allah/arsy-orm';

export const NexusNasSecretLog = defineModel({
  name: 'nexus.nas_secret_log',
  tableName: 'nexus_nas_secret_log',
  displayName: 'NAS Secret Rotation Log',
  fields: {
    nas_id: fields.many2one('nexus.nas', { label: 'NAS', required: true }),
    rotated_by: fields.many2one('auth.user', { label: 'Rotated By', required: true }),
    rotated_at: fields.datetime({ label: 'Rotated At', required: true }),
    previous_secret_hash: fields.char({ label: 'Previous Secret Hash' }),
    metadata: fields.json({ label: 'Metadata' }),
  },
  indexes: [
    { fields: ['nas_id'] },
    { fields: ['rotated_by'] },
    { fields: ['rotated_at'] },
  ],
});