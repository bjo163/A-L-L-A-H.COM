import { defineModel, fields, modelRegistry } from '@allah/arsy-orm';

export const QorpusDocument = defineModel({
  name: 'qorpus.document',
  tableName: 'qorpus_document',
  displayName: 'Qorpus Document',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    title: fields.char({ label: 'Title', required: true }),
    category: fields.selection(
      {
        canon: 'Canon',
        architecture: 'Architecture',
        contract: 'Contract',
        code: 'Code',
        documentation: 'Documentation',
      },
      { label: 'Category', required: true }
    ),
    source_path: fields.char({ label: 'Source Path' }),
    sha256: fields.char({ label: 'SHA-256 Digest', required: true, unique: true }),
    content: fields.text({ label: 'Content' }),
  },
});

export const QorpusChunk = defineModel({
  name: 'qorpus.chunk',
  tableName: 'qorpus_chunk',
  displayName: 'Qorpus Chunk',
  fields: {
    company_id: fields.integer({ label: 'Company ID', required: true }),
    document_id: fields.many2one('qorpus.document', { label: 'Document', required: true }),
    chunk_index: fields.integer({ label: 'Chunk Index', required: true }),
    content: fields.text({ label: 'Content', required: true }),
    token_count: fields.integer({ label: 'Token Count', default: 0 }),
    embedding: fields.json({ label: 'Embedding Vector' }),
  },
});

export function registerMwQorpusAddon(): void {
  modelRegistry.register(QorpusDocument);
  modelRegistry.register(QorpusChunk);
}
