import Fastify, { FastifyInstance, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { AppError, fail, isPublicRoute, logger, ok, type Principal, type PublicRouteRule } from '@allah/arsy-core';
import {
  BaseRepository,
  SchemaMigrator,
  dbEngine,
  decryptSecret,
  encryptSecret,
  isEncrypted,
  modelRegistry,
  redactSecret,
  sha256Hex,
  type AuditActor,
  type QueryExecutor,
  type TenantScope,
} from '@allah/arsy-orm';
import { evaluateTelemetryAlert } from '../../../addons/heliogrid/services/alert';

import { authPlugin, createPrincipalGuard } from '@allah/arsy-plugin-auth';
import { sduiPlugin } from '@allah/arsy-plugin-sdui';
import { llmGatewayPlugin } from '@allah/arsy-plugin-llm-gateway';
import { storagePlugin } from '@allah/arsy-plugin-storage';

import { registerAllAddons } from '../../../addons/index';
import { chunkText, computeSha256 } from '../../../addons/mw_qorpus/src/chunker';
import { reconcilePlans } from '../../../addons/project/services/sync_worker';
import { startCronRunner, stopCronRunner } from '../../../addons/project/services/cron_runner';
import { DEFAULT_PROJECT_CRON } from '../../../addons/project/data/default';
import type { SyncPayload } from '../../../addons/project/services/plan_scanner';
import { recordNotifyEvent } from '../../../addons/mw_notify/services/events';

export interface BuildAppOptions {
  enableLogging?: boolean;
}

const isProduction = process.env.NODE_ENV === 'production';

function nasResponse<T extends { secret_encrypted?: unknown }>(record: T) {
  const { secret_encrypted, ...metadata } = record;
  return {
    ...metadata,
    secret: redactSecret(String(secret_encrypted ?? '')),
  };
}

// Exact `METHOD path` rules: a prefix rule would authorise every future route that
// happens to share the segment.
const PUBLIC_ROUTES: PublicRouteRule[] = [
  { method: 'GET', path: '/health' },
  { method: 'GET', path: '/ready' },
  { method: 'POST', path: '/api/auth/sign-in' },
  { method: 'POST', path: '/api/auth/register' },
  { method: 'GET', path: '/api/auth/onboarding/status' },
  { method: 'POST', path: '/api/auth/onboarding' },
  { method: 'GET', pattern: /^\/api\/auth\/better(?:\/.*)?$/ },
  { method: 'POST', pattern: /^\/api\/auth\/better(?:\/.*)?$/ },
  { method: 'POST', path: '/v1/agent/pairings/claim' },
  { method: 'GET', path: '/v1/agent/device/missions/next' },
  { method: 'POST', pattern: /^\/v1\/agent\/device\/missions\/[0-9]+\/events$/ },
  // Public read-only ISP catalog projections for the e-isp top-of-funnel site.
  // Exact paths; both return only `is_public` rows projected to safe fields.
  { method: 'GET', path: '/v1/public/isp/plans' },
  { method: 'GET', path: '/v1/public/isp/coverage' },
  // HelioGrid telemetry ingestion endpoint.
  { method: 'POST', path: '/v1/heliogrid/telemetry' },
];
if (!isProduction) PUBLIC_ROUTES.push({ method: 'GET', pattern: /^\/docs(\/.*)?$/ });

const RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  'POST /api/auth/sign-in': { limit: 10, windowMs: 60_000 },
  'POST /api/auth/register': { limit: 5, windowMs: 3_600_000 },
  'POST /api/auth/onboarding': { limit: 5, windowMs: 3_600_000 },
  'POST /api/auth/better/sign-in/email': { limit: 10, windowMs: 60_000 },
  'POST /api/auth/better/sign-up/email': { limit: 5, windowMs: 3_600_000 },
  'POST /v1/agent/pairings/claim': { limit: 10, windowMs: 60_000 },
  'GET /v1/agent/device/missions/next': { limit: 120, windowMs: 60_000 },
  'POST /v1/agent/device/missions/*/events': { limit: 300, windowMs: 60_000 },
  'PUT /v1/nexus/nas/*/secret': { limit: 10, windowMs: 60_000 },
};

const DEV_ORIGINS = [3000, 3001, 3002, 3003, 3004].flatMap((port) => [`http://localhost:${port}`, `http://127.0.0.1:${port}`]);

function resolveCorsOrigins(): string[] {
  const configured = (process.env.CORS_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);
  // Production fails closed to an empty list: no cross-origin reader unless one is named.
  if (isProduction) return configured;
  return configured.length > 0 ? configured : DEV_ORIGINS;
}

// Generic CRUD reaches every registered model, so it stays opt-in per model name.
const PROTECTED_GENERIC_MODELS = new Set([
  'res.users',
  'auth.user',
  'auth.account',
  'auth.session',
  'auth.verification',
  'auth.setup',
  'arsy.audit.event',
  'ai.provider',
  'ai.virtual_key',
  'nexus.nas',
  'nexus.nas_secret_log',
]);

export async function buildArsyApp(options: BuildAppOptions = {}): Promise<FastifyInstance<any, any, any, any, any>> {
  const app = Fastify({
    loggerInstance: options.enableLogging ? logger : undefined,
  });

  app.setErrorHandler((error: any, request, reply) => {
    if (error instanceof AppError) {
      reply.status(error.statusCode).send(fail(error.code, error.message, error.details));
      return;
    }

    logger.error({ err: error, url: request.url }, 'Unhandled server exception');
    reply.status(500).send(fail('INTERNAL_SERVER_ERROR', 'An unexpected error occurred'));
  });

  await app.register(cors, { origin: resolveCorsOrigins(), credentials: true });
  await app.register(helmet, { contentSecurityPolicy: false });

  // The API only returns JSON; Swagger UI ships inline scripts and is the sole exception.
  app.addHook('onRequest', async (request, reply) => {
    if (request.url.split('?')[0].startsWith('/docs')) return;
    reply.header('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
  });

  // Root hook, registered before the plugins: `fastify-plugin` keeps every plugin
  // route in this context, so one guard covers the whole surface. `resolvePrincipal`
  // is read per request, which is what lets it run ahead of the auth plugin boot.
  app.addHook('onRequest', createPrincipalGuard(app as unknown as FastifyInstance, {
    isPublic: (method, path) => isPublicRoute(method, path, PUBLIC_ROUTES),
    rateLimits: RATE_LIMITS,
  }));

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Arsy API Gateway',
        description: 'Next-generation Fastify + PGlite ultra-modular backend',
        version: '0.1.0',
      },
    },
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });

  await dbEngine.connect();
  // Manifest-driven, dependency-ordered registration (T8): the load order is
  // resolved from each addon's `__manifest__.json`, not hand-wired here.
  registerAllAddons((message) => logger.info(message));

  const migrator = new SchemaMigrator(dbEngine);
  await migrator.sync();

  app.get('/health', async () => ok({ status: 'ok', engine: 'arsy' }));
  app.get('/ready', async () => {
    const rows = await dbEngine.query('SELECT 1 as alive');
    return ok({ ready: true, database: 'pglite', check: rows[0] });
  });

  await app.register(authPlugin, {
    prefix: '/api/auth',
    trustedOrigins: resolveCorsOrigins(),
  });
  await app.register(sduiPlugin, { prefix: '/v1/sdui' });
  await app.register(llmGatewayPlugin, { prefix: '/v1' });
  await app.register(storagePlugin, { prefix: '/api/storage' });

  const repository = (
    modelName: string,
    executor: QueryExecutor = dbEngine
  ): BaseRepository<Record<string, any>> => {
    const model = modelRegistry.get(modelName);
    if (!model) throw new AppError(`Model '${modelName}' is not registered`, 500, 'MODEL_NOT_FOUND');
    return new BaseRepository(model, dbEngine, executor);
  };

  const principalOf = (request: FastifyRequest): Principal => {
    const principal = (request as { principal?: Principal }).principal;
    if (!principal) throw new AppError('A valid session or bearer token is required', 401, 'UNAUTHORIZED');
    return principal;
  };

  const tenantOf = (request: FastifyRequest): TenantScope => {
    const { companyId } = principalOf(request);
    if (!Number.isSafeInteger(companyId) || companyId === 0) {
      throw new AppError('No tenant is bound to this account', 403, 'TENANT_REQUIRED');
    }
    return { companyId };
  };

  const actorOf = (request: FastifyRequest): AuditActor => ({ type: 'user', userId: principalOf(request).ormUserId });

  const parseId = (raw: string | number, label: string): number => {
    const id = Number(raw);
    if (!Number.isSafeInteger(id) || id < 1) throw new AppError(`${label} must be a positive integer`, 400, 'VALIDATION_ERROR');
    return id;
  };

  const parseTenantCompanyId = (raw: unknown): number => {
    if ((typeof raw !== 'string' && typeof raw !== 'number') || String(raw).trim() === '') {
      throw new AppError('A non-zero target company_id is required', 400, 'VALIDATION_ERROR');
    }
    const companyId = Number(raw);
    if (!Number.isSafeInteger(companyId) || companyId === 0) {
      throw new AppError('A non-zero target company_id is required', 400, 'VALIDATION_ERROR');
    }
    return companyId;
  };

  const requireAdminReasonHash = (raw: unknown): string => {
    if (typeof raw !== 'string' || raw.trim().length < 8 || raw.trim().length > 500) {
      throw new AppError('A reason between 8 and 500 characters is required', 400, 'VALIDATION_ERROR');
    }
    return sha256Hex(raw.trim());
  };

  const assertSuperuser = (request: FastifyRequest): Principal => {
    const principal = principalOf(request);
    if (principal.role !== 'superuser') {
      throw new AppError('Superuser access is required', 403, 'SUPERUSER_REQUIRED');
    }
    return principal;
  };

  const adminActor = (
    request: FastifyRequest,
    reasonHash: string,
    principal: Principal = assertSuperuser(request)
  ): AuditActor => ({
    type: 'user',
    userId: principal.ormUserId,
    reasonHash,
    requestId: request.id,
    globalAccess: true,
  });

  const recordAdminRead = async (
    request: FastifyRequest,
    principal: Principal,
    companyId: number,
    modelName: string,
    recordId: string,
    reasonHash: string,
    executor: QueryExecutor = dbEngine
  ): Promise<void> => {
    await repository('arsy.audit.event', executor).create(
      {
        company_id: companyId,
        actor_uid: principal.ormUserId,
        model_name: modelName,
        record_id: recordId,
        operation: 'admin_read',
        changed_fields: [],
        reason_hash: reasonHash,
        request_id: request.id,
        global_access: true,
      },
      { companyId },
      adminActor(request, reasonHash, principal)
    );
  };

  const requireString = (body: Record<string, any>, field: string): string => {
    const value = body[field];
    if (typeof value !== 'string' || value.length === 0) throw new AppError(`${field} is required`, 400, 'VALIDATION_ERROR');
    return value;
  };

  const optionalInteger = (body: Record<string, any>, field: string, fallback: number): number => {
    const value = body[field];
    if (value === undefined || value === null || value === '') return fallback;
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed)) throw new AppError(`${field} must be an integer`, 400, 'VALIDATION_ERROR');
    return parsed;
  };

  const bodyOf = (request: FastifyRequest): Record<string, any> => (request.body as Record<string, any>) ?? {};

  app.post('/v1/qorpus/ingest', async (request, reply) => {
    const body = bodyOf(request);
    const title = requireString(body, 'title');
    const category = requireString(body, 'category');
    const content = requireString(body, 'content');
    const scope = tenantOf(request);
    const actor = actorOf(request);

    const docRepo = repository('qorpus.document');
    const chunkRepo = repository('qorpus.chunk');
    const sha256 = computeSha256(content);
    const chunks = chunkText(content, 512, 64);

    const existing = await docRepo.find({ scope, filters: [{ field: 'sha256', operator: '=', value: sha256 }], limit: 1 });
    if (existing.length > 0) {
      const document = existing[0];
      // A crashed ingest can leave the document row without its full chunk set, so the
      // dedupe hit backfills the missing indexes instead of reporting an empty index.
      const indexed = await chunkRepo.find({
        scope,
        filters: [{ field: 'document_id', operator: '=', value: document.id }],
        limit: chunks.length,
      });
      const present = new Set(indexed.map((chunk) => Number(chunk.chunk_index)));
      // Backfill the missing indexes in a single batched insert rather than one
      // transaction + trigger set per chunk (roadmap T14).
      const missing: Array<Record<string, unknown>> = [];
      for (let i = 0; i < chunks.length; i++) {
        if (present.has(i)) continue;
        missing.push({
          document_id: document.id,
          chunk_index: i,
          content: chunks[i].content,
          token_count: chunks[i].tokenCount,
          embedding: null,
        });
      }
      if (missing.length > 0) await chunkRepo.createMany(missing, scope, actor);
      const backfilled = missing.length;
      return ok({ message: 'Document already exists', document, deduplicated: true, backfilled }, { totalItems: chunks.length });
    }

    const document = await docRepo.create({
      title,
      category,
      source_path: typeof body.source === 'string' ? body.source : null,
      sha256,
      content,
    }, scope, actor);

    // Ingest every chunk in one batched write (single txn + trigger set) instead
    // of one create() call per chunk (roadmap T14).
    const chunkRows = chunks.map((c, i) => ({
      document_id: document.id,
      chunk_index: i,
      content: c.content,
      token_count: c.tokenCount,
      embedding: null,
    }));
    if (chunkRows.length > 0) await chunkRepo.createMany(chunkRows, scope, actor);

    reply.status(201);
    return ok({ document, chunksCreated: chunks.length }, { totalItems: chunks.length });
  });

  app.post('/v1/qorpus/search', async (request) => {
    const body = bodyOf(request);
    const query = requireString(body, 'query');
    const limit = optionalInteger(body, 'limit', 5);
    const minScore = Number(body.min_score ?? 0.75);
    const scope = tenantOf(request);

    // Push filtering and the row cap down to SQL with a tenant-scoped ILIKE
    // OR-predicate over the query terms, then re-rank only that candidate window
    // in JS. This replaces loading 1000 chunks + 100 docs and an O(N×M)
    // docs.find() per chunk (roadmap T14).
    const queryTerms = query.trim().split(/\s+/).filter(Boolean);
    if (queryTerms.length === 0) {
      return ok({ chunks: [] }, { totalItems: 0 });
    }
    const chunkRepo = repository('qorpus.chunk');
    const candidateLimit = Math.max(limit * 4, limit, 20);
    // `expand: ['document_id']` replaces the hand-rolled chunk→document re-join
    // (roadmap T3.5): the ORM collects the distinct FK ids and does one scoped IN
    // query for the parents, so the search route no longer fabricates that join.
    const chunks = await chunkRepo.find({
      scope,
      filters: queryTerms.map((term, index) => ({
        field: 'content',
        operator: 'ILIKE' as const,
        value: `%${term}%`,
        connector: index === 0 ? ('AND' as const) : ('OR' as const),
      })),
      limit: candidateLimit,
      expand: ['document_id'],
    });

    const queryLower = query.toLowerCase();
    const results = chunks
      .map((chunk) => {
        const content = String(chunk.content ?? '');
        const contentLower = content.toLowerCase();
        let score = contentLower.includes(queryLower) ? 0.5 : 0;
        for (const term of queryTerms) {
          if (contentLower.includes(term.toLowerCase())) score += 0.1;
        }
        const document = chunk.document_id as Record<string, unknown> | null;
        return {
          id: chunk.id,
          document_title: document?.title ?? 'Unknown',
          content,
          score: Math.min(score, 1.0),
          category: document?.category ?? 'unknown',
        };
      })
      .filter((result) => result.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return ok({ chunks: results }, { totalItems: results.length });
  });

  app.get('/v1/threads', async (request) => {
    const { rows: threads, total } = await repository('ai.thread').search({ scope: tenantOf(request), limit: 100 });
    return ok(threads, { totalItems: total });
  });

  app.post('/v1/threads', async (request, reply) => {
    const body = bodyOf(request);
    const scope = tenantOf(request);
    const thread = await repository('ai.thread').create({
      title: typeof body.title === 'string' && body.title.length > 0 ? body.title : 'New Thread',
      active_model: body.active_model || 'dx-default',
      metadata: body.metadata || {},
    }, scope, actorOf(request));
    reply.status(201);
    return ok(thread);
  });

  const threadOf = async (request: FastifyRequest<{ Params: { id: string } }>) => {
    const scope = tenantOf(request);
    const threadId = parseId(request.params.id, 'thread id');
    const thread = await repository('ai.thread').findById(threadId, scope);
    if (!thread) throw new AppError('Thread not found', 404, 'NOT_FOUND');
    return { scope, threadId };
  };

  app.get<{ Params: { id: string } }>('/v1/threads/:id/messages', async (request) => {
    const { scope, threadId } = await threadOf(request);
    const messages = await repository('ai.message').find({
      scope,
      filters: [{ field: 'thread_id', operator: '=', value: threadId }],
      limit: 1000,
    });
    return ok(messages, { totalItems: messages.length });
  });

  app.post<{ Params: { id: string } }>('/v1/threads/:id/messages', async (request, reply) => {
    const { scope, threadId } = await threadOf(request);
    const body = bodyOf(request);
    const message = await repository('ai.message').create({
      thread_id: threadId,
      role: requireString(body, 'role'),
      content: requireString(body, 'content'),
      token_count: optionalInteger(body, 'token_count', 0),
    }, scope, actorOf(request));
    reply.status(201);
    return ok(message);
  });

  const assertModelExposed = (modelName: string): void => {
    if (PROTECTED_GENERIC_MODELS.has(modelName)) {
      throw new AppError(`Model '${modelName}' is protected from generic CRUD`, 403, 'PROTECTED_MODEL');
    }
    const allowedModels = new Set(
      (process.env.GENERIC_MODEL_ALLOWLIST || '').split(',').map((name) => name.trim()).filter(Boolean)
    );
    if (!allowedModels.has(modelName)) {
      throw new AppError(`Model '${modelName}' is not exposed over generic CRUD`, 403, 'MODEL_NOT_ALLOWED');
    }
  };

  app.get<{ Params: { model_name: string } }>('/api/v1/models/:model_name', async (request) => {
    const modelName = request.params.model_name;
    assertModelExposed(modelName);
    const { rows: records, total } = await repository(modelName).search({ scope: tenantOf(request), limit: 50 });
    return ok(records, { totalItems: total });
  });

  app.post<{ Params: { model_name: string }; Body: Record<string, unknown> }>(
    '/api/v1/models/:model_name',
    async (request, reply) => {
      const modelName = request.params.model_name;
      assertModelExposed(modelName);
      const created = await repository(modelName).create(
        request.body as Record<string, any>,
        tenantOf(request),
        actorOf(request)
      );
      reply.status(201);
      return ok(created);
    }
  );

  app.get<{ Params: { model_name: string } }>('/v1/admin/models/:model_name', async (request) => {
    const principal = assertSuperuser(request);
    const query = request.query as Record<string, unknown>;
    const companyId = parseTenantCompanyId(query.company_id);
    const reasonHash = requireAdminReasonHash(query.reason);
    const modelName = request.params.model_name;
    assertModelExposed(modelName);
    const { rows: records, total } = await repository(modelName).search({ scope: { companyId }, limit: 50 });
    await recordAdminRead(request, principal, companyId, modelName, '*', reasonHash);
    return ok(records, { totalItems: total });
  });

  app.post<{ Params: { model_name: string } }>('/v1/admin/models/:model_name', async (request, reply) => {
    const principal = assertSuperuser(request);
    const body = bodyOf(request);
    const companyId = parseTenantCompanyId(body.company_id);
    const reasonHash = requireAdminReasonHash(body.reason);
    const modelName = request.params.model_name;
    assertModelExposed(modelName);
    const data = body.data;
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new AppError('data must be an object', 400, 'VALIDATION_ERROR');
    }
    if ('company_id' in data) {
      throw new AppError('company_id must be supplied outside data', 400, 'VALIDATION_ERROR');
    }
    const created = await repository(modelName).create(
      data as Record<string, unknown>,
      { companyId },
      adminActor(request, reasonHash, principal)
    );
    reply.status(201);
    return ok(created);
  });

  app.put<{ Params: { model_name: string; id: string } }>(
    '/v1/admin/models/:model_name/:id',
    async (request) => {
      const principal = assertSuperuser(request);
      const body = bodyOf(request);
      const companyId = parseTenantCompanyId(body.company_id);
      const reasonHash = requireAdminReasonHash(body.reason);
      const modelName = request.params.model_name;
      assertModelExposed(modelName);
      const data = body.data;
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new AppError('data must be an object', 400, 'VALIDATION_ERROR');
      }
      if ('company_id' in data) {
        throw new AppError('company_id cannot be changed by this operation', 400, 'VALIDATION_ERROR');
      }
      const updated = await repository(modelName).updateById(
        parseId(request.params.id, 'record id'),
        data as Record<string, unknown>,
        { companyId },
        adminActor(request, reasonHash, principal)
      );
      if (!updated) throw new AppError('Record not found in the target tenant', 404, 'RECORD_NOT_FOUND');
      return ok(updated);
    }
  );

  app.get('/v1/admin/audit-events', async (request) => {
    const principal = assertSuperuser(request);
    const query = request.query as Record<string, unknown>;
    const companyId = parseTenantCompanyId(query.company_id);
    const reasonHash = requireAdminReasonHash(query.reason);
    const { rows: events, total } = await repository('arsy.audit.event').search({
      scope: { companyId },
      limit: 100,
      orderBy: 'create_date',
      orderDirection: 'DESC',
    });
    await recordAdminRead(request, principal, companyId, 'arsy.audit.event', '*', reasonHash);
    return ok(events, { totalItems: total });
  });

  app.post<{ Params: { id: string } }>('/v1/admin/users/:id/role', async (request) => {
    const principal = assertSuperuser(request);
    const body = bodyOf(request);
    const reasonHash = requireAdminReasonHash(body.reason);
    if (body.role !== 'user' && body.role !== 'superuser') {
      throw new AppError('role must be user or superuser', 400, 'VALIDATION_ERROR');
    }

    const authUserId = parseId(request.params.id, 'user id');
    const nextRole = body.role;
    const updated = await dbEngine.transaction(async (executor: QueryExecutor) => {
      const targetAuthUsers = await executor.query<{
        id: number;
        res_user_id: number;
        company_id: number;
        status: string;
      }>(
        `SELECT "id", "res_user_id", "company_id", "status" FROM "auth_user" WHERE "id" = $1;`,
        [authUserId]
      );
      const authUser = targetAuthUsers[0];
      if (!authUser) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      if (authUser.status !== 'active') {
        throw new AppError('Only active users can receive an administrative role', 409, 'USER_NOT_ACTIVE');
      }

      const activeSuperusers = await executor.query<{ id: number }>(
        `SELECT users."id"
         FROM "res_users" AS users
         JOIN "auth_user" AS accounts ON accounts."res_user_id" = users."id"
         WHERE users."role" = 'superuser' AND accounts."status" = 'active'
         ORDER BY users."id"
         FOR UPDATE OF users;`
      );
      const targetRows = await executor.query<{
        id: number;
        role: string;
        company_id: number;
      }>(
        `SELECT "id", "role", "company_id" FROM "res_users" WHERE "id" = $1 FOR UPDATE;`,
        [authUser.res_user_id]
      );
      const target = targetRows[0];
      if (!target || target.role === 'system') {
        throw new AppError('This identity cannot receive a login role', 409, 'ROLE_NOT_ASSIGNABLE');
      }
      const targetCompanyId = Number(target.company_id);
      if (
        !Number.isSafeInteger(targetCompanyId) ||
        targetCompanyId === 0 ||
        Number(authUser.company_id) !== targetCompanyId
      ) {
        throw new AppError('Authentication and ORM tenant assignments do not match', 409, 'TENANT_LINK_MISMATCH');
      }

      if (target.role === 'superuser' && nextRole === 'user' && activeSuperusers.length <= 1) {
        throw new AppError('The last active superuser cannot be demoted', 409, 'LAST_SUPERUSER');
      }

      await recordAdminRead(
        request,
        principal,
        targetCompanyId,
        'res.users',
        String(target.id),
        reasonHash,
        executor
      );
      if (target.role === nextRole) return target.role;

      const roleChange = await repository('res.users', executor).updateById(
        target.id,
        { role: nextRole },
        { companyId: targetCompanyId },
        adminActor(request, reasonHash, principal),
        {}
      );
      if (!roleChange) throw new AppError('User identity changed during the operation', 409, 'ROLE_UPDATE_CONFLICT');
      return nextRole;
    });
    return ok({ userId: authUserId, role: updated });
  });

  app.get('/v1/nexus/nas', async (request) => {
    const { rows: nas, total } = await repository('nexus.nas').search({ scope: tenantOf(request), limit: 100 });
    return ok(nas.map(nasResponse), { totalItems: total });
  });

  app.post('/v1/nexus/nas', async (request, reply) => {
    const body = bodyOf(request);
    const scope = tenantOf(request);
    const nas = await repository('nexus.nas').create({
      nas_identifier: requireString(body, 'nas_identifier'),
      ip_address: requireString(body, 'ip_address'),
      secret_encrypted: encryptSecret(requireString(body, 'secret')),
      vendor: body.vendor || 'mikrotik',
      coa_port: optionalInteger(body, 'coa_port', 3799),
      disconnect_port: optionalInteger(body, 'disconnect_port', 3799),
      source_allowlist: Array.isArray(body.source_allowlist) ? body.source_allowlist : [],
      site_id: body.site_id ?? null,
      device_id: body.device_id ?? null,
    }, scope, actorOf(request));
    reply.status(201);
    return ok(nasResponse(nas));
  });

  const nasById = async (request: FastifyRequest<{ Params: { id: string } }>) => {
    const scope = tenantOf(request);
    const nas = await repository('nexus.nas').findById(parseId(request.params.id, 'nas id'), scope);
    if (!nas) throw new AppError('NAS not found', 404, 'NAS_NOT_FOUND');
    return { scope, nas };
  };

  app.get<{ Params: { id: string } }>('/v1/nexus/nas/:id', async (request) => {
    const { nas } = await nasById(request);
    return ok(nasResponse(nas));
  });

  app.put<{ Params: { id: string } }>('/v1/nexus/nas/:id/secret', async (request) => {
    const { scope, nas } = await nasById(request);
    const nextSecret = requireString(bodyOf(request), 'secret');
    const encrypted = encryptSecret(nextSecret);
    const updated = await repository('nexus.nas').updateById(
      Number(nas.id),
      { secret_encrypted: encrypted },
      scope,
      actorOf(request)
    );

    const previous = String(nas.secret_encrypted ?? '');
    await repository('nexus.nas_secret_log').create({
      nas_id: Number(nas.id),
      rotated_by: principalOf(request).userId,
      rotated_at: new Date().toISOString(),
      // Legacy rows may still hold a plaintext secret; only an envelope can be read back.
      previous_secret_hash: isEncrypted(previous)
        ? sha256Hex(decryptSecret(previous))
        : null,
      metadata: {},
    }, scope, actorOf(request));

    return ok(nasResponse(updated ?? nas));
  });

  app.get('/v1/nexus/pools', async (request) => {
    const { rows: pools, total } = await repository('nexus.ip_pool').search({ scope: tenantOf(request), limit: 100 });
    return ok(pools, { totalItems: total });
  });

  app.get('/v1/orbit/instances', async (request) => {
    const { rows: instances, total } = await repository('orbit.instance').search({ scope: tenantOf(request), limit: 100 });
    return ok(instances, { totalItems: total });
  });

  app.post('/v1/orbit/instances', async (request, reply) => {
    const body = bodyOf(request);
    const instance = await repository('orbit.instance').create({
      name: requireString(body, 'name'),
      cpu_cores: optionalInteger(body, 'cpu_cores', 1),
      ram_mb: optionalInteger(body, 'ram_mb', 1024),
      disk_gb: optionalInteger(body, 'disk_gb', 20),
      status: 'provisioning',
      ip_address: body.ip_address || null,
      partner_id: body.partner_id ?? null,
      template_id: body.template_id ?? null,
    }, tenantOf(request), actorOf(request));
    reply.status(201);
    return ok(instance);
  });

  app.get('/v1/works/plans', async (request) => {
    const { rows: plans, total } = await repository('isp.plan').search({ scope: tenantOf(request), limit: 100 });
    return ok(plans, { totalItems: total });
  });

  app.post('/v1/works/plans', async (request, reply) => {
    const body = bodyOf(request);
    const plan = await repository('isp.plan').create({
      name: requireString(body, 'name'),
      download_mbps: optionalInteger(body, 'download_mbps', 10),
      upload_mbps: optionalInteger(body, 'upload_mbps', 5),
      price: Number(body.price ?? 0),
      currency: body.currency || 'IDR',
    }, tenantOf(request), actorOf(request));
    reply.status(201);
    return ok(plan);
  });

  app.get('/v1/works/subscriptions', async (request) => {
    const { rows: subscriptions, total } = await repository('isp.subscription').search({ scope: tenantOf(request), limit: 100 });
    return ok(subscriptions, { totalItems: total });
  });

  app.post('/v1/works/subscriptions', async (request, reply) => {
    const body = bodyOf(request);
    const scope = tenantOf(request);
    const planId = parseId(body.plan_id, 'plan_id');
    // The plan is read through the tenant scope, so another tenant's plan id is a 404, not a booking.
    const plan = await repository('isp.plan').findById(planId, scope);
    if (!plan) throw new AppError('Plan not found', 404, 'PLAN_NOT_FOUND');

    const subscription = await repository('isp.subscription').create({
      customer_id: body.customer_id ?? null,
      plan_id: planId,
      state: 'draft',
    }, scope, actorOf(request));
    reply.status(201);
    return ok(subscription);
  });

  const subscriptionTransitions: Record<string, { state: string; timestampField: string }> = {
    activate: { state: 'active', timestampField: 'started_at' },
    suspend: { state: 'suspended', timestampField: 'suspended_at' },
  };

  for (const [action, rule] of Object.entries(subscriptionTransitions)) {
    app.post<{ Params: { id: string } }>(`/v1/works/subscriptions/:id/${action}`, async (request) => {
      const scope = tenantOf(request);
      const repo = repository('isp.subscription');
      const id = parseId(request.params.id, 'subscription id');
      const updated = await repo.updateById(id, { [rule.timestampField]: new Date().toISOString(), state: rule.state }, scope, actorOf(request));
      if (!updated) throw new AppError('Subscription not found', 404, 'SUBSCRIPTION_NOT_FOUND');
      return ok({ id, state: rule.state });
    });
  }

  app.get('/v1/works/invoices', async (request) => {
    const { rows: invoices, total } = await repository('isp.invoice').search({ scope: tenantOf(request), limit: 100 });
    return ok(invoices, { totalItems: total });
  });

  // Invoice state transitions (roadmap T3.4 producer). Moving an invoice to
  // `paid` / `overdue` appends a pending notify.event naming the matching
  // template code; the notify_dispatch cron renders and delivers it. The event
  // write is a fire-and-forget append that must never fail the transition, so a
  // producer error is logged, not thrown — the state change already committed.
  const invoiceTransitions: Record<string, { state: string; templateCode?: string }> = {
    open: { state: 'open' },
    pay: { state: 'paid', templateCode: 'invoice.paid' },
    markOverdue: { state: 'overdue', templateCode: 'invoice.overdue' },
  };

  for (const [action, rule] of Object.entries(invoiceTransitions)) {
    app.post<{ Params: { id: string } }>(`/v1/works/invoices/:id/${action}`, async (request) => {
      const scope = tenantOf(request);
      const companyId = (scope as { companyId: number }).companyId;
      const repo = repository('isp.invoice');
      const id = parseId(request.params.id, 'invoice id');
      const invoice = await repo.findById(id, scope);
      if (!invoice) throw new AppError('Invoice not found', 404, 'INVOICE_NOT_FOUND');
      const updated = await repo.updateById(id, { state: rule.state }, scope, actorOf(request));
      if (!updated) throw new AppError('Invoice not found', 404, 'INVOICE_NOT_FOUND');
      if (rule.templateCode) {
        try {
          await recordNotifyEvent(
            {
              companyId,
              templateCode: rule.templateCode,
              payload: { invoice_id: id, amount: invoice.amount ?? 0, currency: invoice.currency ?? 'IDR' },
            },
            actorOf(request),
          );
        } catch (err) {
          app.log.warn({ err, invoiceId: id, templateCode: rule.templateCode }, 'notify event append failed on invoice transition');
        }
      }
      return ok({ id, state: rule.state });
    });
  }

  // Public ISP projections. Read the cross-tenant platform catalog with
  // systemScope filtered to is_public, then assemble an explicit field whitelist
  // so no company_id / fup / burst / relation id can ever reach an anonymous
  // caller. BaseRepository owns the scoping; there is no raw SQL here.
  const publicScope = (): TenantScope => ({ systemScope: true });

  app.get('/v1/public/isp/plans', async () => {
    const plans = await repository('isp.plan').find({
      scope: publicScope(),
      filters: [{ field: 'is_public', operator: '=', value: true }],
      orderBy: 'sequence',
      orderDirection: 'ASC',
      limit: 100,
    });
    const projected = plans.map((plan) => ({
      slug: plan.slug ?? null,
      name: plan.name,
      description: plan.description ?? '',
      download_mbps: plan.download_mbps,
      upload_mbps: plan.upload_mbps,
      price: plan.price,
      currency: plan.currency,
    }));
    return ok(projected, { totalItems: projected.length });
  });

  app.get('/v1/public/isp/coverage', async (request) => {
    const coverage = await repository('isp.coverage').find({
      scope: publicScope(),
      filters: [{ field: 'is_public', operator: '=', value: true }],
      orderBy: 'sequence',
      orderDirection: 'ASC',
      limit: 500,
    });
    const query = String((request.query as Record<string, unknown>).q ?? '').trim().toLowerCase();
    const projected = coverage
      .filter((area) => {
        if (!query) return true;
        const haystack = `${String(area.area_name ?? '')} ${String(area.city ?? '')} ${String(area.district ?? '')}`
          .toLowerCase();
        return haystack.includes(query);
      })
      .map((area) => ({
        slug: area.slug ?? null,
        area_name: area.area_name,
        city: area.city ?? '',
        district: area.district ?? '',
        status: area.status,
        description: area.description ?? '',
      }));
    return ok(projected, { totalItems: projected.length });
  });

  // HelioGrid telemetry ingestion endpoint.
  app.post('/v1/heliogrid/telemetry', async (request) => {
    const body = bodyOf(request);
    const scope = tenantOf(request);
    const actor = actorOf(request);

    // Validate required fields
    const siteId = Number(body.site_id);
    if (!Number.isSafeInteger(siteId) || siteId < 1) {
      throw new AppError('site_id must be a positive integer', 400, 'VALIDATION_ERROR');
    }

    const solarGenerationKw = Number(body.solar_generation_kw);
    const batteryDischargeKw = Number(body.battery_discharge_kw);
    const gridImportKw = Number(body.grid_import_kw);
    const siteConsumptionKw = Number(body.site_consumption_kw);

    if (Number.isNaN(solarGenerationKw) || solarGenerationKw < 0) {
      throw new AppError('solar_generation_kw must be a non-negative number', 400, 'VALIDATION_ERROR');
    }
    if (Number.isNaN(batteryDischargeKw) || batteryDischargeKw < 0) {
      throw new AppError('battery_discharge_kw must be a non-negative number', 400, 'VALIDATION_ERROR');
    }
    if (Number.isNaN(gridImportKw) || gridImportKw < 0) {
      throw new AppError('grid_import_kw must be a non-negative number', 400, 'VALIDATION_ERROR');
    }
    if (Number.isNaN(siteConsumptionKw) || siteConsumptionKw < 0) {
      throw new AppError('site_consumption_kw must be a non-negative number', 400, 'VALIDATION_ERROR');
    }

    // Create telemetry record with tenant scoping
    const telemetry = await repository('heliogrid.telemetry').create({
      site_id: siteId,
      solar_generation_kw: solarGenerationKw,
      battery_discharge_kw: batteryDischargeKw,
      grid_import_kw: gridImportKw,
      site_consumption_kw: siteConsumptionKw,
      recorded_at: body.recorded_at || new Date().toISOString(),
    }, scope, actor);

    // Evaluate alert conditions (WATCHTOWER integration)
    await evaluateTelemetryAlert(telemetry, actor);

    return ok({ success: true, recorded_at: telemetry.recorded_at }, { totalItems: 1 });
  });

  // Platform catalogs are shared rows owned by company_id 0. Reading them needs the public
  // rows plus this tenant's overrides, and the id list always comes from the principal.
  const catalogScope = (): TenantScope => ({ systemScope: true });

  app.get('/v1/i18n/languages', async (request) => {
    const languages = await repository('res.lang').find({
      scope: catalogScope(),
      filters: [
        { field: 'company_id', operator: 'IN', value: [0, principalOf(request).companyId] },
        { field: 'active', operator: '=', value: true },
      ],
      limit: 100,
    });
    return ok(languages, { totalItems: languages.length });
  });

  app.get<{ Params: { lang: string } }>('/v1/i18n/terms/:lang', async (request) => {
    const terms = await repository('ir.translation').find({
      scope: catalogScope(),
      filters: [
        { field: 'company_id', operator: 'IN', value: [0, principalOf(request).companyId] },
        { field: 'lang', operator: '=', value: request.params.lang },
        { field: 'type', operator: '=', value: 'ui' },
        { field: 'active', operator: '=', value: true },
      ],
      limit: 1000,
    });
    return ok(terms, { totalItems: terms.length });
  });

  app.post('/v1/i18n/terms/sync', async (request) => {
    const body = bodyOf(request);
    const lang = requireString(body, 'lang');
    const terms = body.terms as Record<string, string>;
    if (!terms || typeof terms !== 'object') throw new AppError('terms is required', 400, 'VALIDATION_ERROR');

    // A tenant may only write its own override rows; company_id 0 stays platform-owned.
    const scope = tenantOf(request);
    const actor = actorOf(request);
    const repo = repository('ir.translation');

    // Resolve every touched term with one scoped read, then split into a single
    // batched update txn and a single batched insert, instead of a find + write
    // per term (roadmap T14).
    const entries = Object.entries(terms);
    if (entries.length === 0) {
      return ok({ message: 'Translation catalog synchronized successfully' });
    }
    const names = entries.map(([name]) => name);
    const existingRows = await repo.find({
      scope,
      filters: [
        { field: 'lang', operator: '=', value: lang },
        { field: 'type', operator: '=', value: 'ui' },
        { field: 'name', operator: 'IN', value: names },
      ],
      limit: names.length,
    });
    const byName = new Map(existingRows.map((row) => [String(row.name), row]));

    const updates: Array<{ id: string | number; data: Record<string, unknown> }> = [];
    const newRows: Array<Record<string, unknown>> = [];
    for (const [name, value] of entries) {
      const existing = byName.get(name);
      if (existing) {
        updates.push({ id: existing.id, data: { value, state: 'translated' } });
      } else {
        newRows.push({ lang, name, src: value, value, state: 'translated', type: 'ui' });
      }
    }

    if (updates.length > 0) await repo.updateMany(updates, scope, actor);
    if (newRows.length > 0) await repo.createMany(newRows, scope, actor);

    return ok({ message: 'Translation catalog synchronized successfully' });
  });

  // --- Project Manager Routes ---

  // List projects (tenant-scoped).
  app.get('/v1/projects', async (request, reply) => {
    const scope = tenantOf(request);
    const projects = await repository('project.project').find({ scope });
    return reply.send(ok(projects));
  });

  // Create a project.
  app.post('/v1/projects', async (request, reply) => {
    const scope = tenantOf(request);
    const actor = actorOf(request);
    const body = request.body as Record<string, unknown>;
    const name = requireString(body, 'name');
    const created = await dbEngine.transaction(async (tx) => {
      return repository('project.project', tx).create(
        { ...body, company_id: (scope as { companyId: number }).companyId, name },
        scope,
        actor
      );
    });
    return reply.status(201).send(ok(created));
  });

  // Get single project.
  app.get('/v1/projects/:projectId', async (request, reply) => {
    const scope = tenantOf(request);
    const { projectId } = request.params as { projectId: string };
    const id = parseId(projectId, 'projectId');
    const project = await repository('project.project').findById(id, scope);
    if (!project) throw new AppError('Project not found', 404, 'NOT_FOUND');
    return reply.send(ok(project));
  });

  // Update a project (name, sync_mode, workspace_path, etc).
  app.patch('/v1/projects/:projectId', async (request, reply) => {
    const scope = tenantOf(request);
    const actor = actorOf(request);
    const { projectId } = request.params as { projectId: string };
    const id = parseId(projectId, 'projectId');
    const body = request.body as Record<string, unknown>;
    const updated = await dbEngine.transaction(async (tx) => {
      return repository('project.project', tx).updateById(id, body, scope, actor);
    });
    if (!updated) throw new AppError('Project not found', 404, 'NOT_FOUND');
    return reply.send(ok(updated));
  });

  // List tasks for a project.
  app.get('/v1/projects/:projectId/tasks', async (request, reply) => {
    const scope = tenantOf(request);
    const { projectId } = request.params as { projectId: string };
    const id = parseId(projectId, 'projectId');
    const tasks = await repository('project.task').find({
      scope,
      filters: [{ field: 'project_id', operator: '=', value: id }],
      orderBy: 'plan_slug',
      orderDirection: 'ASC',
    });
    return reply.send(ok(tasks));
  });

  // Update a task state from Hub UI or VS Code Extension.
  app.patch('/v1/projects/:projectId/tasks/:taskId', async (request, reply) => {
    const scope = tenantOf(request);
    const actor = actorOf(request);
    const { projectId, taskId } = request.params as { projectId: string; taskId: string };
    parseId(projectId, 'projectId'); // validate parent exists in scope implicitly via tenant filter
    const tid = parseId(taskId, 'taskId');
    const body = request.body as Record<string, unknown>;
    // Fail-closed: legal_hold tasks cannot be modified from outside.
    const existing = await repository('project.task').findById(tid, scope);
    if (!existing) throw new AppError('Task not found', 404, 'NOT_FOUND');
    if (existing.legal_hold === true && 'state' in body) {
      throw new AppError('Task is under legal hold and cannot be modified', 403, 'LEGAL_HOLD');
    }
    const updated = await dbEngine.transaction(async (tx) => {
      return repository('project.task', tx).updateById(tid, body, scope, actor);
    });
    return reply.send(ok(updated));
  });

  // Push sync: Extension scans local .plans/ and sends the payload here.
  // Hub reconciles DB state and returns outbound patches for the Extension to apply.
  app.post('/v1/projects/:projectId/sync', async (request, reply) => {
    const scope = tenantOf(request);
    const { projectId } = request.params as { projectId: string };
    const id = parseId(projectId, 'projectId');
    const project = await repository('project.project').findById(id, scope);
    if (!project) throw new AppError('Project not found', 404, 'NOT_FOUND');
    if (project.sync_mode === 'disabled') {
      throw new AppError('Sync is disabled for this project', 400, 'SYNC_DISABLED');
    }
    const body = request.body as SyncPayload;
    if (!Array.isArray(body?.plans)) {
      throw new AppError('Request body must include a plans array', 400, 'VALIDATION_ERROR');
    }
    const companyId = (scope as { companyId: number }).companyId;
    const result = await reconcilePlans(companyId, id, body.plans);
    return reply.send(ok(result));
  });

  // Export: returns all project tasks so Extension can apply outbound patches.
  app.get('/v1/projects/:projectId/export', async (request, reply) => {
    const scope = tenantOf(request);
    const { projectId } = request.params as { projectId: string };
    const id = parseId(projectId, 'projectId');
    const project = await repository('project.project').findById(id, scope);
    if (!project) throw new AppError('Project not found', 404, 'NOT_FOUND');
    const tasks = await repository('project.task').find({
      scope,
      filters: [{ field: 'project_id', operator: '=', value: id }],
    });
    return reply.send(ok({ project, tasks }));
  });

  // Task stages CRUD.
  app.get('/v1/projects/:projectId/stages', async (request, reply) => {
    const scope = tenantOf(request);
    const stages = await repository('project.task.stage').find({
      scope,
      orderBy: 'sequence',
      orderDirection: 'ASC',
    });
    return reply.send(ok(stages));
  });

  app.post('/v1/projects/:projectId/stages', async (request, reply) => {
    const scope = tenantOf(request);
    const actor = actorOf(request);
    const body = request.body as Record<string, unknown>;
    const name = requireString(body, 'name');
    const created = await dbEngine.transaction(async (tx) => {
      return repository('project.task.stage', tx).create(
        { ...body, company_id: (scope as { companyId: number }).companyId, name },
        scope,
        actor
      );
    });
    return reply.status(201).send(ok(created));
  });

  // Admin: list scheduled actions (superuser only).
  app.get('/v1/admin/cron', async (request, reply) => {
    assertSuperuser(request);
    const crons = await dbEngine.query(
      `SELECT id, company_id, name, model_name, method_name, interval_number, interval_unit,
              nextcall, active, state, run_count, last_error
         FROM ir_cron
        ORDER BY nextcall`
    );
    return reply.send(ok(crons));
  });

  // Admin: seed default cron jobs for a company.
  app.post('/v1/admin/cron/seed/:companyId', async (request, reply) => {
    const principal = assertSuperuser(request);
    const { companyId: rawCompanyId } = request.params as { companyId: string };
    const companyId = parseId(rawCompanyId, 'companyId');
    const actor = adminActor(request, requireAdminReasonHash(request.body), principal);
    const scope: TenantScope = { companyId };
    const nextcall = new Date(Date.now() + 60_000).toISOString();
    const created = await dbEngine.transaction(async (tx) => {
      // The schedule definition is the addon-owned `DEFAULT_PROJECT_CRON` single
      // source; this route only stamps the tenant id and the first run time so
      // there is one cron spec, not one here and one in the addon data.
      return repository('ir.cron', tx).create(
        { ...DEFAULT_PROJECT_CRON, company_id: companyId, nextcall },
        scope,
        actor
      );
    });
    return reply.status(201).send(ok(created));
  });

  // Start cron runner after all routes are ready.
  app.addHook('onReady', async () => {
    startCronRunner((err) => logger.warn({ err }, 'Cron poll failed; will retry next tick'));
  });

  app.addHook('onClose', async () => {
    stopCronRunner();
  });

  return app;
}
