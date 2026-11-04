import fs from 'fs';
import path from 'path';
import { modelRegistry, BaseRepository, SYSTEM_ACTOR, sha256Hex } from '@allah/arsy-orm';
import { logger } from '@allah/arsy-core';
import type { Tool, ToolContext, ToolResult } from './base';

const STORAGE_DIR = path.resolve(process.env.STORAGE_DIR || path.join(process.cwd(), 'data', 'storage'));

if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

export class StorageCasTool implements Tool {
  readonly name = 'storage_cas';
  readonly description = 'Store and fetch content-addressed assets (SHA-256 digest) in the content-addressed store.';
  readonly inputSchema: Record<string, unknown> = {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['get', 'put'],
        description: "'put' to store content, 'get' to retrieve content by digest.",
      },
      content: {
        type: 'string',
        description: 'Content to store. Required for action "put".',
      },
      digest: {
        type: 'string',
        description: 'SHA-256 digest of the object to retrieve. Required for action "get".',
      },
    },
    required: ['action'],
  };

  private computeDigest(content: string): string {
    return sha256Hex(content);
  }

  private async recordAttachment(
    digest: string,
    content: string,
    companyId: number,
    name?: string
  ): Promise<void> {
    try {
      const model = modelRegistry.get('mw.storage.backend') ? modelRegistry.get('ir.attachment') : null;
      if (!model) return;
      const repo = new BaseRepository(model);
      const existing = await repo.find({
        scope: { companyId },
        filters: [{ field: 'digest', operator: '=', value: digest }],
        limit: 1,
      });
      if (existing && existing.length > 0) return;
      await repo.create(
        {
          name: name || digest,
          digest,
          file_size: Buffer.byteLength(content, 'utf-8'),
          mimetype: 'application/octet-stream',
        },
        { companyId },
        SYSTEM_ACTOR
      );
    } catch (err) {
      logger.warn({ err }, 'Could not record CAS attachment provenance');
    }
  }

  async execute(args: Record<string, unknown>, context?: ToolContext): Promise<ToolResult> {
    const companyId = Number(context?.companyId);
    if (!Number.isSafeInteger(companyId) || companyId === 0) {
      return { success: false, error: 'TENANT_REQUIRED: a verified tenant is required', output: null };
    }

    const action = args.action === 'get' || args.action === 'put' ? args.action : undefined;
    if (!action) {
      return { success: false, error: 'action must be "get" or "put"', output: null };
    }

    if (action === 'put') {
      const content = typeof args.content === 'string' ? args.content : undefined;
      if (content === undefined) {
        return { success: false, error: 'content is required for action "put"', output: null };
      }
      const digest = this.computeDigest(content);
      const filePath = path.join(STORAGE_DIR, digest);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content, 'utf-8');
      }
      await this.recordAttachment(digest, content, companyId, args.name as string | undefined);
      return {
        success: true,
        output: { digest, action: 'put', size: Buffer.byteLength(content, 'utf-8') },
        error: null,
      };
    }

    // action === 'get'
    const digest = typeof args.digest === 'string' ? args.digest : undefined;
    if (!digest) {
      return { success: false, error: 'digest is required for action "get"', output: null };
    }
    // A digest is always 64 lowercase hex chars; anything else could escape the store directory.
    if (!/^[0-9a-f]{64}$/.test(digest)) {
      return { success: false, error: 'digest must be a 64-character lowercase SHA-256 hex digest', output: null };
    }
    const filePath = path.join(STORAGE_DIR, digest);
    if (!fs.existsSync(filePath)) {
      return { success: false, error: `Object with digest ${digest} not found`, output: null };
    }
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return { success: true, output: { digest, action: 'get', content }, error: null };
    } catch (err: any) {
      logger.error({ err, digest }, 'storage_cas get failed');
      return { success: false, error: err.message || 'Failed to read object', output: null };
    }
  }
}

export const storageCasTool = new StorageCasTool();
