import { PGlite, Transaction } from '@electric-sql/pglite';
import { logger } from '@allah/arsy-core';
import { singleton } from './singleton';

export interface QueryExecutor {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  exec(sql: string): Promise<void>;
}

export interface PGliteOptions {
  dataDir?: string; // defaults to in-memory if undefined
}

export class PGliteEngine {
  private client: PGlite | null = null;
  private isConnected = false;

  constructor(private readonly options: PGliteOptions = {}) {}

  async connect(): Promise<PGlite> {
    if (this.client && this.isConnected) {
      return this.client;
    }

    const target = this.options.dataDir ? `disk: ${this.options.dataDir}` : 'in-memory (:memory:)';
    logger.info(`Starting embedded PGlite instance (${target})...`);

    this.client = new PGlite(this.options.dataDir);
    await this.client.waitReady;
    this.isConnected = true;

    logger.info('Embedded PGlite instance is ready.');
    return this.client;
  }

  getClient(): PGlite {
    if (!this.client || !this.isConnected) {
      throw new Error('PGliteEngine is not connected. Call connect() first.');
    }
    return this.client;
  }

  async close(): Promise<void> {
    if (this.client && this.isConnected) {
      logger.info('Closing embedded PGlite connection...');
      await this.client.close();
      this.isConnected = false;
      this.client = null;
    }
  }

  async query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
    const client = this.getClient();
    const res = await client.query<T>(sql, params as (string | number | boolean | null)[]);
    return res.rows;
  }

  async transaction<T>(callback: (executor: QueryExecutor) => Promise<T>): Promise<T> {
    return this.getClient().transaction(async (transaction: Transaction) =>
      callback(this.createTransactionExecutor(transaction))
    );
  }

  async exec(sql: string): Promise<void> {
    const client = this.getClient();
    await client.exec(sql);
  }

  private createTransactionExecutor(transaction: Transaction): QueryExecutor {
    return {
      query: async <T>(sql: string, params?: unknown[]): Promise<T[]> => {
        const result = await transaction.query<T>(
          sql,
          params as (string | number | boolean | null)[]
        );
        return result.rows;
      },
      exec: async (sql: string): Promise<void> => {
        await transaction.exec(sql);
      },
    };
  }
}

export const dbEngine = singleton('dbEngine', () => new PGliteEngine({
  dataDir: process.env.PG_DATA_DIR,
}));
