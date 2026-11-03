import { defineModel, fields, modelRegistry } from '@allah/arsy-orm';

export const MwStorageBackend = defineModel({
  name: 'mw.storage.backend',
  tableName: 'mw_storage_backend',
  displayName: 'Storage Backend',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    name: fields.char({ label: 'Backend Name', required: true }),
    backend_type: fields.selection(
      {
        fs: 'Local Filesystem',
        s3: 'Amazon S3',
        r2: 'Cloudflare R2',
        gcs: 'Google Cloud Storage',
        memory: 'In-Memory',
      },
      { label: 'Storage Type', default: 'fs' }
    ),
    base_path: fields.char({ label: 'Local Base Path' }),
    bucket: fields.char({ label: 'Bucket Name' }),
    endpoint: fields.char({ label: 'Custom Endpoint' }),
    is_default: fields.boolean({ label: 'Default Backend', default: false }),
  },
});

export const IrAttachment = defineModel({
  name: 'ir.attachment',
  tableName: 'ir_attachment',
  displayName: 'Attachment',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    name: fields.char({ label: 'File Name', required: true }),
    digest: fields.char({ label: 'SHA-256 Digest', required: true, unique: true }),
    file_size: fields.integer({ label: 'File Size Bytes', required: true }),
    mimetype: fields.char({ label: 'MIME Type', default: 'application/octet-stream' }),
    res_model: fields.char({ label: 'Resource Model' }),
    res_id: fields.integer({ label: 'Resource ID' }),
    storage_backend_id: fields.many2one('mw.storage.backend', { label: 'Storage Backend' }),
    retention_until: fields.datetime({ label: 'Retention Hold Expiry' }),
    legal_hold: fields.boolean({ label: 'Legal Hold Active', default: false }),
  },
  indexes: [{ fields: ['digest'], unique: true }],
});

export const IrLegalHold = defineModel({
  name: 'ir.legal.hold',
  tableName: 'ir_legal_hold',
  displayName: 'Legal Hold',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    name: fields.char({ label: 'Hold Reference', required: true }),
    res_model: fields.char({ label: 'Resource Model' }),
    res_id: fields.integer({ label: 'Resource ID' }),
    attachment_id: fields.many2one('ir.attachment', { label: 'Target Attachment' }),
    reason: fields.text({ label: 'Legal Hold Reason', required: true }),
    held_at: fields.datetime({ label: 'Held Timestamp', required: true }),
    released_at: fields.datetime({ label: 'Released Timestamp' }),
    released_by: fields.char({ label: 'Released By' }),
  },
});

export function registerMwStorageAddon(): void {
  modelRegistry.register(MwStorageBackend);
  modelRegistry.register(IrAttachment);
  modelRegistry.register(IrLegalHold);
}

