import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { ok, fail, AppError, logger } from '@allah/arsy-core';
import { dbEngine, SchemaMigrator, modelRegistry, BaseRepository } from '@allah/arsy-orm';
import { authPlugin } from '@allah/arsy-plugin-auth';
import { sduiPlugin } from '@allah/arsy-plugin-sdui';
import { llmGatewayPlugin } from '@allah/arsy-plugin-llm-gateway';
import { storagePlugin } from '@allah/arsy-plugin-storage';

import { registerBaseAddon } from '../../../addons/base';
import { registerMlLlmRouterAddon } from '../../../addons/mw_llm_router';
import { registerMwStorageAddon } from '../../../addons/mw_storage';

export interface BuildAppOptions {
  enableLogging?: boolean;
}

export async function buildArsyApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    loggerInstance: options.enableLogging ? logger : false,
  });

  // Global Error Handler conforming to Arsy Standard Envelope
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      reply.status(error.statusCode).send(fail(error.code, error.message, error.details));
      return;
    }

    logger.error({ err: error, url: request.url }, 'Unhandled server exception');
    reply.status(500).send(fail('INTERNAL_SERVER_ERROR', error.message || 'An unexpected error occurred'));
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

  return app;
}
