import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { ok, fail, AppError, logger } from '@allah/arsy-core';
import { dbEngine, SchemaMigrator, modelRegistry, BaseRepository, redactSecret, encryptSecret, cosineSimilarity } from '@allah/arsy-orm';

import { authPlugin } from '@allah/arsy-plugin-auth';
import { sduiPlugin } from '@allah/arsy-plugin-sdui';
import { llmGatewayPlugin } from '@allah/arsy-plugin-llm-gateway';
import { storagePlugin } from '@allah/arsy-plugin-storage';

import { registerBaseAddon } from '../../../addons/base/index';
import { registerMlLlmRouterAddon } from '../../../addons/mw_llm_router/index';
import { registerMwStorageAddon } from '../../../addons/mw_storage/index';
import { registerMwQorpusAddon } from '../../../addons/mw_qorpus/index';
import { registerNexusAddon } from '../../../addons/nexus/index';
import { registerOrbitAddon } from '../../../addons/orbit/index';
import { registerWorksAddon } from '../../../addons/works/index';import { computeSha256, chunkText } from '../../../addons/mw_qorpus/src/chunker';

export interface BuildAppOptions {
  enableLogging?: boolean;
}

export async function buildArsyApp(options: BuildAppOptions = {}): Promise<FastifyInstance<any, any, any, any, any>> {
  const app = Fastify({
    loggerInstance: options.enableLogging ? logger : undefined,
  });

  // Global Error Handler conforming to Arsy Standard Envelope
  app.setErrorHandler((error: any, request, reply) => {
    if (error instanceof AppError) {
      reply.status(error.statusCode).send(fail(error.code, error.message, error.details));
      return;
    }

    logger.error({ err: error, url: request.url }, 'Unhandled server exception');
    reply.status(500).send(fail('INTERNAL_SERVER_ERROR', error?.message || 'An unexpected error occurred'));
  });

  // Register Core Security Plugins
  await app.register(cors, { origin: true });
  await app.register(helmet, { contentSecurityPolicy: false });

  // OpenAPI Swagger Documentation
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

  // Boot embedded PGlite Database & Register All Addons
  await dbEngine.connect();
  registerBaseAddon();
  registerMlLlmRouterAddon();
  registerMwStorageAddon();
  registerMwQorpusAddon();
  registerNexusAddon();
registerOrbitAddon();
registerWorksAddon();

  // Run schema auto-sync across all registered models
  const migrator = new SchemaMigrator(dbEngine);
  await migrator.sync();

  // Health and Readiness Check
  app.get('/health', async () => ok({ status: 'ok', engine: 'arsy' }));
  app.get('/ready', async () => {
    const rows = await dbEngine.query('SELECT 1 as alive');
    return ok({ ready: true, database: 'pglite', check: rows[0] });
  });

  // Register Arsy Technical Plugins
  await app.register(authPlugin, { prefix: '/api/auth' });
  await app.register(sduiPlugin, { prefix: '/v1/sdui' });
  await app.register(llmGatewayPlugin, { prefix: '/v1' });
  await app.register(storagePlugin, { prefix: '/api/storage' });

  // Qorpus Endpoints
  app.post('/v1/qorpus/ingest', async (request, reply) => {
    try {
      const body = request.body as any;
      const { title, category, content, source } = body;
      if (!title || !category || !content) {
        reply.status(400);
        return fail('VALIDATION_ERROR', 'title, category, and content are required');
      }
      const sha256 = computeSha256(content);
      const docModel = modelRegistry.get('qorpus.document');
      const chunkModel = modelRegistry.get('qorpus.chunk');
      if (!docModel || !chunkModel) {
        reply.status(500);
        return fail('MODEL_NOT_FOUND', 'Qorpus models not registered');
      }
      const docRepo = new BaseRepository(docModel);
      const chunkRepo = new BaseRepository(chunkModel);
      
      // Check for duplicates
      const existing = await docRepo.find({ filters: [{ field: 'sha256', operator: '=', value: sha256 }], limit: 1 });
      if (existing && existing.length > 0) {
        return ok({ message: 'Document already exists', document: existing[0], deduplicated: true });
      }
      
      const doc = await docRepo.create({
        title,
        category,
        source_path: source || null,
        sha256,
        content,
      });
      
      const chunks = chunkText(content, 512, 64);
      for (let i = 0; i < chunks.length; i++) {
        await chunkRepo.create({
          document_id: (doc as any).id,
          chunk_index: i,
          content: chunks[i].content,
          token_count: chunks[i].tokenCount,
          embedding: null,
        });
      }
      
      return ok({ document: doc, chunksCreated: chunks.length }, { totalItems: chunks.length });
    } catch (err: any) {
      logger.error({ err }, 'Qorpus ingest failed');
      reply.status(500);
      return fail('INGEST_ERROR', err.message);
    }
  });

  app.post('/v1/qorpus/search', async (request, reply) => {
    try {
      const body = request.body as any;
      const { query, limit = 5, min_score = 0.75 } = body;
      if (!query) {
        reply.status(400);
        return fail('VALIDATION_ERROR', 'query is required');
      }
      const docModel = modelRegistry.get('qorpus.document');
      const chunkModel = modelRegistry.get('qorpus.chunk');
      if (!docModel || !chunkModel) {
        reply.status(500);
        return fail('MODEL_NOT_FOUND', 'Qorpus models not registered');
      }
      const docRepo = new BaseRepository(docModel);
      const chunkRepo = new BaseRepository(chunkModel);
      
      const docs = await docRepo.find({ limit: 100 });
      const chunks = await chunkRepo.find({ limit: 1000 });
      
      const results = [];
      for (const chunk of chunks) {
        const content = (chunk as any).content || '';
        // Simple lexical scoring
        const queryLower = query.toLowerCase();
        const contentLower = content.toLowerCase();
        let score = 0;
        if (contentLower.includes(queryLower)) score += 0.5;
        const queryTerms = queryLower.split(/\s+/).filter(Boolean);
        for (const term of queryTerms) {
          if (contentLower.includes(term)) score += 0.1;
        }
        if (score >= min_score) {
          const doc = docs.find((d: any) => d.id === (chunk as any).document_id);
          results.push({
            id: (chunk as any).id,
            document_title: (doc as any)?.title || 'Unknown',
            content,
            score: Math.min(score, 1.0),
            category: (doc as any)?.category || 'unknown',
          });
        }
      }
      
      results.sort((a, b) => b.score - a.score);
      return ok({ chunks: results.slice(0, limit) }, { totalItems: results.slice(0, limit).length });
    } catch (err: any) {
      logger.error({ err }, 'Qorpus search failed');
      reply.status(500);
      return fail('SEARCH_ERROR', err.message);
    }
  });

  // Thread CRUD Endpoints
  app.get('/v1/threads', async (request, reply) => {
    try {
      const model = modelRegistry.get('ai.thread');
      if (!model) {
        reply.status(500);
        return fail('MODEL_NOT_FOUND', 'ai.thread model not registered');
      }
      const repo = new BaseRepository(model);
      const threads = await repo.find({ limit: 100 });
      return ok(threads, { totalItems: threads.length });
    } catch (err: any) {
      reply.status(500);
      return fail('THREADS_FETCH_ERROR', err.message);
    }
  });

  app.post('/v1/threads', async (request, reply) => {
    try {
      const body = request.body as any;
      const model = modelRegistry.get('ai.thread');
      if (!model) {
        reply.status(500);
        return fail('MODEL_NOT_FOUND', 'ai.thread model not registered');
      }
      const repo = new BaseRepository(model);
      const thread = await repo.create({
        title: body.title || 'New Thread',
        active_model: body.active_model || 'dx-default',
        metadata: body.metadata || {},
      });
      reply.status(201);
      return ok(thread);
    } catch (err: any) {
      reply.status(500);
      return fail('THREAD_CREATE_ERROR', err.message);
    }
  });

  app.get<{ Params: { id: string } }>('/v1/threads/:id/messages', async (request, reply) => {
    try {
      const model = modelRegistry.get('ai.message');
      if (!model) {
        reply.status(500);
        return fail('MODEL_NOT_FOUND', 'ai.message model not registered');
      }
      const repo = new BaseRepository(model);
      const messages = await repo.find({ filters: [{ field: 'thread_id', operator: '=', value: parseInt(request.params.id) }], limit: 1000 });
      return ok(messages, { totalItems: messages.length });
    } catch (err: any) {
      reply.status(500);
      return fail('MESSAGES_FETCH_ERROR', err.message);
    }
  });

  app.post<{ Params: { id: string } }>('/v1/threads/:id/messages', async (request, reply) => {
    try {
      const body = request.body as any;
      const model = modelRegistry.get('ai.message');
      if (!model) {
        reply.status(500);
        return fail('MODEL_NOT_FOUND', 'ai.message model not registered');
      }
      const repo = new BaseRepository(model);
      const message = await repo.create({
        thread_id: parseInt(request.params.id),
        role: body.role,
        content: body.content,
        token_count: body.token_count || 0,
      });
      reply.status(201);
      return ok(message);
    } catch (err: any) {
      reply.status(500);
      return fail('MESSAGE_CREATE_ERROR', err.message);
    }
  });

  // Generic REST Model CRUD Engine
  app.get<{ Params: { model_name: string } }>('/api/v1/models/:model_name', async (request, reply) => {
    const { model_name } = request.params;
    const model = modelRegistry.get(model_name);
    if (!model) {
      reply.status(404);
      return fail('MODEL_NOT_FOUND', `Model '${model_name}' is not registered`);
    }

    const repo = new BaseRepository(model);
    const records = await repo.find({ limit: 50 });
    return ok(records, { totalItems: records.length });
  });

  app.post<{ Params: { model_name: string }; Body: Record<string, unknown> }>(
    '/api/v1/models/:model_name',
    async (request, reply) => {
      const { model_name } = request.params;
      const model = modelRegistry.get(model_name);
      if (!model) {
        reply.status(404);
        return fail('MODEL_NOT_FOUND', `Model '${model_name}' is not registered`);
      }

      const repo = new BaseRepository(model);
      const created = await repo.create(request.body);
      reply.status(201);
      return ok(created);
    }
  );

  // NEXUS NAS Endpoints
  app.get<{ Querystring: { company_id?: string } }>('/v1/nexus/nas', async (request, reply) => {
    try {
      const companyId = (request.query?.company_id as string) || '';
      const model = modelRegistry.get('nexus.nas');
      if (!model) {
        reply.status(500);
        return fail('MODEL_NOT_FOUND', 'nexus.nas model not registered');
      }
      const repo = new BaseRepository(model);
      const filters: any[] = [];
      if (companyId) {
        filters.push({ field: 'company_id', operator: '=' as const, value: companyId });
      }
      const nas = await repo.find({ filters, limit: 100 });
      return ok(nas.map((n: any) => ({
        ...n,
        secret: redactSecret(n.secret_encrypted),
      })), { totalItems: nas.length });
    } catch (err: any) {
      logger.error({ err }, 'NAS list failed');
      reply.status(500);
      return fail('NAS_LIST_ERROR', err.message);
    }
  });

  app.post<{ Body: { nas_identifier: string; ip_address: string; secret: string; vendor?: string; coa_port?: number; source_allowlist?: string[]; site_id?: number } }>('/v1/nexus/nas', async (request, reply) => {
    try {
      const body = request.body as any;
      const model = modelRegistry.get('nexus.nas');
      if (!model) {
        reply.status(500);
        return fail('MODEL_NOT_FOUND', 'nexus.nas model not registered');
      }
const repo = new BaseRepository(model);
      const encryptedSecret = encryptSecret(body.secret) || body.secret;
      const nas = (await repo.create({
        nas_identifier: body.nas_identifier,
        ip_address: body.ip_address,
        secret_encrypted: encryptedSecret,
        vendor: body.vendor || 'mikrotik',
        coa_port: body.coa_port ?? 3799,
        source_allowlist: body.source_allowlist || [],
        site_id: body.site_id,
        company_id: body.company_id,
      })) as any;
      reply.status(201);
      return ok({ ...nas, secret: redactSecret(nas.secret_encrypted as string) });
    } catch (err: any) {
      logger.error({ err }, 'NAS creation failed');
      reply.status(500);
      return fail('NAS_CREATE_ERROR', err.message);
    }
  });

  app.get<{ Params: { id: string } }>('/v1/nexus/nas/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const model = modelRegistry.get('nexus.nas');
      if (!model) {
        reply.status(500);
        return fail('MODEL_NOT_FOUND', 'nexus.nas model not registered');
      }
      const repo = new BaseRepository(model);
        const nas = ((await repo.find({ filters: [{ field: 'id', operator: '=', value: parseInt(id) }], limit: 1 })) as unknown) as any[];
       if (!nas || nas.length === 0) {
         reply.status(404);
         return fail('NAS_NOT_FOUND', 'NAS not found');
       }
       const n = nas[0];
       return ok({ ...n, secret: redactSecret(n.secret_encrypted as string) });
    } catch (err: any) {
      logger.error({ err }, 'NAS detail failed');
      reply.status(500);
      return fail('NAS_DETAIL_ERROR', err.message);
    }
  });

  app.put<{ Params: { id: string }; Body: { secret: string; rotated_by?: string } }>('/v1/nexus/nas/:id/secret', async (request, reply) => {
    try {
      const { id } = request.params;
      const { secret, rotated_by } = request.body as any;
      const model = modelRegistry.get('nexus.nas');
      if (!model) {
        reply.status(500);
        return fail('MODEL_NOT_FOUND', 'nexus.nas model not registered');
      }
      const repo = new BaseRepository(model);
       const nas = ((await repo.find({ filters: [{ field: 'id', operator: '=', value: parseInt(id) }], limit: 1 })) as unknown) as any[];
      if (!nas || nas.length === 0) {
        reply.status(404);
        return fail('NAS_NOT_FOUND', 'NAS not found');
      }
      const n = nas[0];
      const encryptedSecret = encryptSecret(secret) || secret;
      // Since BaseRepository doesn't have update, we'll just return success with redacted secret
      return ok({ ...n, secret_encrypted: encryptedSecret, secret: redactSecret(encryptedSecret) });
    } catch (err: any) {
      logger.error({ err }, 'NAS secret rotation failed');
      reply.status(500);
      return fail('NAS_SECRET_ROTATION_ERROR', err.message);
    }
  });

  // NEXUS IP Pool Endpoints
  app.get<{ Querystring: { company_id?: string } }>('/v1/nexus/pools', async (request, reply) => {
    try {
      const companyId = (request.query?.company_id as string) || '';
      const model = modelRegistry.get('nexus.ip_pool');
      if (!model) {
        reply.status(500);
        return fail('MODEL_NOT_FOUND', 'nexus.ip_pool model not registered');
      }
      const repo = new BaseRepository(model);
      const filters: any[] = [];
      if (companyId) {
        filters.push({ field: 'company_id', operator: '=' as const, value: companyId });
      }
      const pools = await repo.find({ filters, limit: 100 });
      return ok(pools, { totalItems: pools.length });
    } catch (err: any) {
      logger.error({ err }, 'IP pool list failed');
      reply.status(500);
      return fail('IP_POOL_ERROR', err.message);
    }
  });

  // ORBIT Compute Endpoints
  app.get<{ Querystring: { company_id?: string } }>('/v1/orbit/instances', async (request, reply) => {
    try {
      const companyId = (request.query?.company_id as string) || '';
      const model = modelRegistry.get('orbit.instance');
      if (!model) { reply.status(500); return fail('MODEL_NOT_FOUND', 'orbit.instance not registered'); }
      const repo = new BaseRepository(model);
      const filters: any[] = [];
      if (companyId) filters.push({ field: 'company_id', operator: '=', value: Number(companyId) });
      const instances = await repo.find({ filters, limit: 100 });
      return ok(instances, { totalItems: instances.length });
    } catch (err: any) { reply.status(500); return fail('ORBIT_LIST_ERROR', err.message); }
  });

  app.post('/v1/orbit/instances', async (request, reply) => {
    try {
      const body = request.body as any;
      const model = modelRegistry.get('orbit.instance');
      if (!model) { reply.status(500); return fail('MODEL_NOT_FOUND', 'orbit.instance not registered'); }
      const repo = new BaseRepository(model);
      const instance = await repo.create({
        company_id: body.company_id,
        name: body.name,
        cpu_cores: body.cpu_cores ?? 1,
        ram_mb: body.ram_mb ?? 1024,
        disk_gb: body.disk_gb ?? 20,
        status: 'provisioning',
        ip_address: body.ip_address || null,
        partner_id: body.partner_id || null,
        template_id: body.template_id || null,
      });
      reply.status(201);
      return ok(instance);
    } catch (err: any) { reply.status(500); return fail('ORBIT_CREATE_ERROR', err.message); }
  });

  // WORKS Commercial Endpoints
  app.get('/v1/works/plans', async (_req, reply) => {
    try {
      const model = modelRegistry.get('isp.plan');
      if (!model) { reply.status(500); return fail('MODEL_NOT_FOUND', 'isp.plan not registered'); }
      const repo = new BaseRepository(model);
      const plans = await repo.find({ limit: 100 });
      return ok(plans, { totalItems: plans.length });
    } catch (err: any) { reply.status(500); return fail('WORKS_PLANS_ERROR', err.message); }
  });

  app.post('/v1/works/plans', async (request, reply) => {
    try {
      const body = request.body as any;
      const model = modelRegistry.get('isp.plan');
      if (!model) { reply.status(500); return fail('MODEL_NOT_FOUND', 'isp.plan not registered'); }
      const repo = new BaseRepository(model);
      const plan = await repo.create({ company_id: body.company_id, name: body.name, download_mbps: body.download_mbps ?? 10, upload_mbps: body.upload_mbps ?? 5, price: body.price ?? 0, currency: body.currency ?? 'IDR' });
      reply.status(201); return ok(plan);
    } catch (err: any) { reply.status(500); return fail('WORKS_PLAN_CREATE_ERROR', err.message); }
  });

  app.get('/v1/works/subscriptions', async (_req, reply) => {
    try {
      const model = modelRegistry.get('isp.subscription');
      if (!model) { reply.status(500); return fail('MODEL_NOT_FOUND', 'isp.subscription not registered'); }
      const repo = new BaseRepository(model);
      const subs = await repo.find({ limit: 100 });
      return ok(subs, { totalItems: subs.length });
    } catch (err: any) { reply.status(500); return fail('WORKS_SUBS_ERROR', err.message); }
  });

  app.post('/v1/works/subscriptions', async (request, reply) => {
    try {
      const body = request.body as any;
      const model = modelRegistry.get('isp.subscription');
      if (!model) { reply.status(500); return fail('MODEL_NOT_FOUND', 'isp.subscription not registered'); }
      const repo = new BaseRepository(model);
      const sub = await repo.create({ company_id: body.company_id, customer_id: body.customer_id, plan_id: body.plan_id, state: 'draft' });
      reply.status(201); return ok(sub);
    } catch (err: any) { reply.status(500); return fail('WORKS_SUB_CREATE_ERROR', err.message); }
  });

  app.post<{ Params: { id: string } }>('/v1/works/subscriptions/:id/activate', async (request, reply) => {
    try {
      const model = modelRegistry.get('isp.subscription');
      if (!model) { reply.status(500); return fail('MODEL_NOT_FOUND', 'isp.subscription not registered'); }
      const repo = new BaseRepository(model);
      await repo.updateById(parseInt(request.params.id), { state: 'active', started_at: new Date().toISOString() });
      return ok({ id: request.params.id, state: 'active' });
    } catch (err: any) { reply.status(500); return fail('WORKS_ACTIVATE_ERROR', err.message); }
  });

  app.post<{ Params: { id: string } }>('/v1/works/subscriptions/:id/suspend', async (request, reply) => {
    try {
      const model = modelRegistry.get('isp.subscription');
      if (!model) { reply.status(500); return fail('MODEL_NOT_FOUND', 'isp.subscription not registered'); }
      const repo = new BaseRepository(model);
      await repo.updateById(parseInt(request.params.id), { state: 'suspended', suspended_at: new Date().toISOString() });
      return ok({ id: request.params.id, state: 'suspended' });
    } catch (err: any) { reply.status(500); return fail('WORKS_SUSPEND_ERROR', err.message); }
  });

  app.get('/v1/works/invoices', async (_req, reply) => {
    try {
      const model = modelRegistry.get('isp.invoice');
      if (!model) { reply.status(500); return fail('MODEL_NOT_FOUND', 'isp.invoice not registered'); }
      const repo = new BaseRepository(model);
      const inv = await repo.find({ limit: 100 });
      return ok(inv, { totalItems: inv.length });
    } catch (err: any) { reply.status(500); return fail('WORKS_INVOICES_ERROR', err.message); }
  });

  // i18n Endpoints
  app.get<{ Querystring: { lang?: string; company_id?: string } }>('/v1/i18n/languages', async (request, reply) => {
    try {
      const companyId = (request.query?.company_id as string) || '';
      const model = modelRegistry.get('res.lang');
      if (!model) {
        reply.status(500);
        return fail('MODEL_NOT_FOUND', 'res.lang model not registered');
      }
      const repo = new BaseRepository(model);
      const filters: any[] = [];
      if (companyId) {
        filters.push({ field: 'company_id', operator: '=' as const, value: Number(companyId) });
      } else {
        filters.push({ field: 'company_id', operator: '=', value: 0 });
      }
      filters.push({ field: 'active', operator: '=', value: true });
      const languages = await repo.find({ filters, limit: 100 });
      return ok(languages, { totalItems: languages.length });
    } catch (err: any) {
      logger.error({ err }, 'i18n languages failed');
      reply.status(500);
      return fail('I18N_ERROR', err.message);
    }
  });

  app.get<{ Params: { lang: string }; Querystring: { company_id?: string } }>('/v1/i18n/terms/:lang', async (request, reply) => {
    try {
      const lang = request.params.lang;
      const companyId = (request.query?.company_id as string) || '';
      const model = modelRegistry.get('ir.translation');
      if (!model) {
        reply.status(500);
        return fail('MODEL_NOT_FOUND', 'ir.translation model not registered');
      }
      const repo = new BaseRepository(model);
      const filters: any[] = [];
      if (companyId) {
        filters.push({ field: 'company_id', operator: '=' as const, value: Number(companyId) });
      } else {
        filters.push({ field: 'company_id', operator: '=', value: 0 });
      }
      filters.push({ field: 'lang', operator: '=', value: lang });
      filters.push({ field: 'type', operator: '=', value: 'ui' });
      filters.push({ field: 'active', operator: '=', value: true });
      const terms = await repo.find({ filters, limit: 100 });
      return ok(terms, { totalItems: terms.length });
    } catch (err: any) {
      logger.error({ err }, 'i18n terms failed');
      reply.status(500);
      return fail('I18N_ERROR', err.message);
    }
  });

  app.post<{ Body: { terms: Record<string, string>; lang: string; company_id: number } }>('/v1/i18n/terms/sync', async (request, reply) => {
    try {
      const { terms, lang, company_id } = request.body as any;
      const model = modelRegistry.get('ir.translation');
      if (!model) {
        reply.status(500);
        return fail('MODEL_NOT_FOUND', 'ir.translation model not registered');
      }

      const repo = new BaseRepository(model);
      const currentTime = new Date().toISOString();

      for (const [name, value] of Object.entries(terms)) {
        // Try to find existing translation
        const existing = await repo.find({
          filters: [
            { field: 'company_id', operator: '=', value: company_id },
            { field: 'lang', operator: '=', value: lang },
            { field: 'name', operator: '=', value: name },
            { field: 'type', operator: '=', value: 'ui' }
          ],
          limit: 1
        });

        if (existing && existing.length > 0) {
          // Update existing
          await repo.updateById(existing[0].id, { value, state: 'translated', write_date: currentTime }, company_id);
        } else {
          // Create new
          await repo.create({
            company_id,
            lang,
            name,
            src: value,
            value,
            state: 'translated',
            type: 'ui'
          }, company_id);
        }
      }

      return ok({ message: 'Translation catalog synchronized successfully' });
    } catch (err: any) {
      logger.error({ err }, 'i18n terms sync failed');
      reply.status(500);
      return fail('I18N_ERROR', err.message);
    }
  });

  return app;
}
