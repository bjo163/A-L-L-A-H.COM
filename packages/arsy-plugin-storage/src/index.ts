import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { ok, fail } from '@allah/arsy-core';

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
}

const storagePluginAsync: FastifyPluginAsync<StoragePluginOptions> = async (fastify: FastifyInstance, options) => {
  const prefix = options.prefix || '/api/storage';
  const cas = new ContentAddressedStorage(options.storageDir || './data/storage');

  // POST /api/storage/upload (raw payload or base64)
  fastify.post<{
    Body: { content: string; name?: string };
  }>(`${prefix}/upload`, async (request, reply) => {
    const { content, name } = request.body || {};
    if (!content) {
      reply.status(400);
      return fail('VALIDATION_ERROR', 'Content is required');
    }

    const buffer = Buffer.from(content, 'utf-8');
    const { digest, size } = await cas.put(buffer);

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
    const buffer = await cas.get(digest);

    if (!buffer) {
      reply.status(404);
      return fail('NOT_FOUND', `Object with digest ${digest} not found`);
    }

    reply.header('Content-Type', 'application/octet-stream');
    reply.header('ETag', `"${digest}"`);
    return buffer;
  });
};

export const storagePlugin = fp(storagePluginAsync, {
  name: '@allah/arsy-plugin-storage',
  fastify: '5.x',
});

export default storagePlugin;

