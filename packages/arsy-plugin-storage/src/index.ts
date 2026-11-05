import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from 'fastify';
import fs from 'fs';
import path from 'path';
import { ok, fail } from '@allah/arsy-core';
import { BaseRepository, modelRegistry, SYSTEM_ACTOR, sha256Hex } from '@allah/arsy-orm';

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
    return sha256Hex(buffer);
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

  // PATCH /api/storage/:digest/retention — manage the legal_hold / retention_until
  // invariant end-to-end (roadmap T3.5). Before this the fail-closed DELETE was only
  // reachable by flipping the flags straight in the database (as the tests did) and the
  // `ir.legal.hold` model had no producer at all. Placing a hold also appends an
  // `ir.legal.hold` provenance row; releasing stamps `released_at` on the open hold.
  // Tenant + actor still derive only from the verified principal, never the body.
  fastify.patch<{
    Params: { digest: string };
    Body: { legal_hold?: boolean; retention_until?: string | null; reason?: string };
  }>(`${prefix}/:digest/retention`, async (request, reply) => {
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

    const body = request.body || {};
    const setsHold = body.legal_hold === true;
    const clearsHold = body.legal_hold === false;
    const setsRetention = 'retention_until' in body;
    if (!setsHold && !clearsHold && !setsRetention) {
      reply.status(400);
      return fail('VALIDATION_ERROR', 'Provide legal_hold and/or retention_until to update');
    }

    // A retention value must be a real datetime or an explicit null clear; garbage is
    // refused fail-closed so a malformed body can never silently disable the hold.
    let retentionUntil: string | null | undefined;
    if (setsRetention) {
      if (body.retention_until === null) {
        retentionUntil = null;
      } else {
        const raw = body.retention_until;
        const parsed = typeof raw === 'string' ? new Date(raw) : new Date('invalid');
        if (Number.isNaN(parsed.getTime())) {
          reply.status(400);
          return fail('VALIDATION_ERROR', 'retention_until must be a valid ISO datetime or null');
        }
        retentionUntil = parsed.toISOString();
      }
    }

    if (setsHold && !(typeof body.reason === 'string' && body.reason.trim() !== '')) {
      reply.status(400);
      return fail('VALIDATION_ERROR', 'A non-empty reason is required to place a legal hold');
    }

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

    const actor = { type: 'user' as const, userId: tenant.ormUserId };
    const updates: Record<string, unknown> = {};
    if (setsHold || clearsHold) updates.legal_hold = setsHold;
    if (setsRetention) updates.retention_until = retentionUntil;

    const updated = await repo.updateById(
      Number(attachment.id),
      updates,
      { companyId: tenant.companyId },
      actor
    );
    if (!updated) {
      reply.status(409);
      return fail('NOT_FOUND', 'Attachment could not be updated');
    }

    // Provenance ledger: `ir.legal.hold` is only touched when mw_storage registered it,
    // so the plugin degrades gracefully on hosts that mount storage without the addon.
    const holdModel = modelRegistry.get('ir.legal.hold');
    if (holdModel) {
      const holdRepo = new BaseRepository(holdModel);
      if (setsHold) {
        await holdRepo.create(
          {
            name: `HOLD-${Number(attachment.id)}-${Date.now()}`,
            attachment_id: Number(attachment.id),
            res_model: attachment.res_model ?? null,
            res_id: attachment.res_id ?? null,
            reason: (body.reason as string).trim(),
            held_at: new Date().toISOString(),
          },
          { companyId: tenant.companyId },
          actor
        );
      } else if (clearsHold && attachment.legal_hold === true) {
        const openHolds = await holdRepo.find({
          scope: { companyId: tenant.companyId },
          filters: [
            { field: 'attachment_id', operator: '=', value: Number(attachment.id) },
            { field: 'released_at', operator: '=', value: null },
          ],
        });
        const releasedAt = new Date().toISOString();
        for (const hold of openHolds) {
          await holdRepo.updateById(
            Number(hold.id),
            { released_at: releasedAt },
            { companyId: tenant.companyId },
            actor
          );
        }
      }
    }

    return ok({
      digest,
      legal_hold: updated.legal_hold === true,
      retention_until: updated.retention_until ?? null,
    });
  });
};

export const storagePlugin = fp(storagePluginAsync, {
  name: '@allah/arsy-plugin-storage',
  fastify: '5.x',
});

export default storagePlugin;

