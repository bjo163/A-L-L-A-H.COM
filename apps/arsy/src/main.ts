import dotenv from 'dotenv';
import { buildArsyApp } from './app';
import { runBootSeed } from './seed';
import { resolveMigrations } from '../../../addons/migrations';
import { logger } from '@allah/arsy-core';
import { dbEngine, SchemaMigrator } from '@allah/arsy-orm';

dotenv.config();

const PORT = Number(process.env.PORT) || 5150;
// Bind to loopback by default. Set HOST=0.0.0.0 (as docker-compose does) to
// publish the API for container-to-container or external traffic.
const HOST = process.env.HOST || '127.0.0.1';

async function bootstrap() {
  const app = await buildArsyApp({ enableLogging: true });

  // Apply addon-declared ordered migrations after the schema is synced but before
  // any seed data. buildArsyApp already ran `SchemaMigrator.sync()`, so the
  // ledger table exists; a migration failure must not block boot (roadmap: boot
  // resilience), but a checksum drift is a loud, fail-closed signal.
  try {
    const { applied, skipped } = await new SchemaMigrator(dbEngine).runOrderedMigrations(
      resolveMigrations()
    );
    if (applied.length > 0) logger.info(`Applied ${applied.length} migration(s): ${applied.join(', ')}`);
    else logger.info(`Migrations up to date (${skipped} already applied).`);
  } catch (err) {
    logger.error({ err }, 'Ordered migration failed; serving with existing schema');
  }

  // Load platform default data after the schema is migrated. A seed failure is
  // logged but must not prevent the hub from serving (roadmap: boot resilience).
  try {
    await runBootSeed((message) => logger.info(message));
  } catch (err) {
    logger.error({ err }, 'Boot seed failed; serving with existing data');
  }

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Initiating graceful shutdown...`);
    try {
      await app.close();
      await dbEngine.close();
      logger.info('Arsy server stopped cleanly.');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during Arsy shutdown');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  try {
    await app.listen({ port: PORT, host: HOST });
    logger.info(`Arsy API Server running at http://${HOST}:${PORT}`);
    logger.info(`Swagger OpenAPI docs available at http://${HOST}:${PORT}/docs`);
  } catch (err) {
    logger.error({ err }, 'Failed to start Arsy server');
    process.exit(1);
  }
}

bootstrap();

