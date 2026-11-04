import dotenv from 'dotenv';
import { buildArsyApp } from './app';
import { logger } from '@allah/arsy-core';
import { dbEngine } from '@allah/arsy-orm';

dotenv.config();

const PORT = Number(process.env.PORT) || 5150;
// Bind to loopback by default. Set HOST=0.0.0.0 (as docker-compose does) to
// publish the API for container-to-container or external traffic.
const HOST = process.env.HOST || '127.0.0.1';

async function bootstrap() {
  const app = await buildArsyApp({ enableLogging: true });

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

