import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from 'fastify';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { ok, fail } from '@allah/arsy-core';
import { BaseRepository, modelRegistry, SYSTEM_ACTOR } from '@allah/arsy-orm';

export interface StoragePluginOptions {
  storageDir?: string;
  prefix?: string;
}

export class ContentAddressedStorage {
  private baseDir: string;

  constructor(baseDir = './data/storage') {
    this.baseDir = path.resolve(baseDir);
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  computeDigest(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  async put(buffer: Buffer): Promise<{ digest: string; size: number }> {
    const digest = this.computeDigest(buffer);
    const filePath = path.join(this.baseDir, digest);

    if (!fs.existsSync(filePath)) {
      await fs.promises.writeFile(filePath, buffer);
    }

    return { digest, size: buffer.length };
  }

  async get(digest: string): Promise<Buffer | null> {
    const filePath = path.join(this.baseDir, digest);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return fs.promises.readFile(filePath);
  }

  async remove(digest: string): Promise<boolean> {
    const filePath = path.join(this.baseDir, digest);
    if (!fs.existsSync(filePath)) {
      return false;
    }
    await fs.promises.unlink(filePath);
    return true;
  }
}

const DIGEST_PATTERN = /^[0-9a-f]{64}$/;

const storagePluginAsync: FastifyPluginAsync<StoragePluginOptions> = async (fastify: FastifyInstance, options) => {
  const prefix = options.prefix || '/api/storage';
  const cas = new ContentAddressedStorage(options.storageDir || './data/storage');

  const attachmentRepo = (): BaseRepository<Record<string, any>> => {
    const model = modelRegistry.get('ir.attachment');
    if (!model) {
      throw new Error("Model 'ir.attachment' is not registered. Load the mw_storage addon.");
    }
    return new BaseRepository(model);
  };

  // Tenant and actor always derive from the verified principal, never from the request body.
  const principalOf = (request: FastifyRequest): { companyId: number; ormUserId: number } => {
    const principal = (request as { principal?: { companyId?: number; ormUserId?: number } }).principal;
    const companyId = principal?.companyId;
    const ormUserId = principal?.ormUserId;
    if (!Number.isSafeInteger(companyId) || (companyId as number) === 0) {
      throw Object.assign(new Error('No tenant is bound to this account'), { statusCode: 403, code: 'TENANT_REQUIRED' });
    }
    if (!Number.isSafeInteger(ormUserId) || (ormUserId as number) < 1) {
      throw Object.assign(new Error('A valid session or bearer token is required'), { statusCode: 401, code: 'UNAUTHORIZED' });
    }
    return { companyId: companyId as number, ormUserId: ormUserId as number };
  };

  // POST /api/storage/upload (raw payload or base64)
  fastify.post<{
    Body: { content: string; name?: string; mimetype?: string; retention_until?: string };
  }>(`${prefix}/upload`, async (request, reply) => {
    let tenant: { companyId: number; ormUserId: number };
    try {
      tenant = principalOf(request);
    } catch (err: any) {
      reply.status(err.statusCode ?? 401);
      return fail(err.code ?? 'UNAUTHORIZED', err.message);
    }

    const { content, name, mimetype, retention_until } = request.body || {};
    if (!content) {
      reply.status(400);
      return fail('VALIDATION_ERROR', 'Content is required');
    }

    const buffer = Buffer.from(content, 'utf-8');
    const { digest, size } = await cas.put(buffer);

    // Content-addressed bytes are write-once and shared by digest, so register an
    // ir.attachment row only for the first tenant that stores them. This is what makes
    // the retention invariant enforceable: bytes without a tracked attachment could be
    // purged despite a legal hold.
    const repo = attachmentRepo();
    const existing = await repo.find({
      scope: { systemScope: true },
      filters: [{ field: 'digest', operator: '=', value: digest }],
      limit: 1,
    });
    if (existing.length === 0) {
      await repo.create(
        {
          name: name || digest,
          digest,
          file_size: size,
          mimetype: mimetype || 'application/octet-stream',
          retention_until: retention_until || null,
          legal_hold: false,
        },
        { companyId: tenant.companyId },
        { type: 'user', userId: tenant.ormUserId }
      );
    }

    reply.status(201);
    return ok({
      name: name || digest,
      digest,
      size,
    });
  });

  // GET /api/storage/:digest
  fastify.get<{
    Params: { digest: string };
  }>(`${prefix}/:digest`, async (request, reply) => {
    const { digest } = request.params;
    // A digest is always a bare SHA-256 hex; anything else (notably path segments)
    // must not reach path.join.
    if (!DIGEST_PATTERN.test(digest)) {
      reply.status(400);
      return fail('VALIDATION_ERROR', 'Invalid digest format');
    }
    const buffer = await cas.get(digest);

    if (!buffer) {
      reply.status(404);
      return fail('NOT_FOUND', `Object with digest ${digest} not found`);
    }

    reply.header('Content-Type', 'application/octet-stream');
    reply.header('ETag', `"${digest}"`);
    return buffer;
  });

  // DELETE /api/storage/:digest — fail-closed on legal_hold / active retention.
  fastify.delete<{
    Params: { digest: string };
  }>(`${prefix}/:digest`, async (request, reply) => {
    let tenant: { companyId: number; ormUserId: number };
    try {
      tenant = principalOf(request);
    } catch (err: any) {
      reply.status(err.statusCode ?? 401);
      return fail(err.code ?? 'UNAUTHORIZED', err.message);
    }

    const { digest } = request.params;
    if (!DIGEST_PATTERN.test(digest)) {
      reply.status(400);
      return fail('VALIDATION_ERROR', 'Invalid digest format');
    }

    // Scope the lookup to the requesting tenant so one tenant can never purge another's
    // attachment (or its shared bytes).
    const repo = attachmentRepo();
    const rows = await repo.find({
      scope: { companyId: tenant.companyId },
      filters: [{ field: 'digest', operator: '=', value: digest }],
      limit: 1,
    });
    const attachment = rows[0];
    if (!attachment) {
      reply.status(404);
      return fail('NOT_FOUND', `Attachment with digest ${digest} not found`);
    }

    const onLegalHold = attachment.legal_hold === true;
    const withinRetention =
      !!attachment.retention_until && new Date(attachment.retention_until).getTime() > Date.now();
    if (onLegalHold || withinRetention) {
      reply.status(409);
      return fail('RETENTION_HOLD', `Object with digest ${digest} is under legal hold or active retention`);
    }

    const deleted = await repo.deleteById(
      Number(attachment.id),
      { companyId: tenant.companyId },
      { type: 'user', userId: tenant.ormUserId }
    );
    if (!deleted) {
      reply.status(409);
      return fail('RETENTION_HOLD', 'Attachment could not be released');
    }

    const bytesRemoved = await cas.remove(digest);
    return ok({ digest, attachmentReleased: true, bytesRemoved });
  });
};

export const storagePlugin = fp(storagePluginAsync, {
  name: '@allah/arsy-plugin-storage',
  fastify: '5.x',
});

export default storagePlugin;

