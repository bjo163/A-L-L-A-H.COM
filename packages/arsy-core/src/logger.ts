import pino, { Logger, LoggerOptions } from 'pino';

export type ArsyLogger = Logger;

export function createLogger(options?: LoggerOptions): ArsyLogger {
  const isDev = process.env.NODE_ENV !== 'production';

  return pino({
    level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level(label) {
        return { level: label };
      },
    },
    ...options,
  });
}

export const logger = createLogger();

