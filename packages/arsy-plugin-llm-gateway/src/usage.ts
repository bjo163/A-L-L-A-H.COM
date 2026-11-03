import { modelRegistry, BaseRepository, dbEngine } from '@allah/arsy-orm';
import { logger } from '@allah/arsy-core';
import type { VirtualKeyRecord } from './types';

export interface UsageRecordParams {
  virtualKeyId?: number;
  providerId?: number;
  modelId?: number;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
  latencyMs: number;
  statusCode: number;
  isCached: boolean;
}

export class UsageManager {
  private keyRpmTrackers = new Map<string, { count: number; windowStart: number }>();

  async validateVirtualKey(
    rawKey: string
  ): Promise<{ valid: boolean; error?: string; keyRecord?: VirtualKeyRecord }> {
    if (!rawKey) {
      return { valid: false, error: 'Virtual key is required' };
    }

    try {
      const rows = (await dbEngine.query(
        'SELECT * FROM ai_virtual_key WHERE key_hash = $1 OR key_prefix = $1 LIMIT 1',
        [rawKey]
      )) as VirtualKeyRecord[];

      if (!rows || rows.length === 0) {
        return { valid: false, error: 'Invalid or revoked AI virtual key' };
      }

      const keyRecord = rows[0];

      // Rate limit RPM check
      const now = Date.now();
      const tracker = this.keyRpmTrackers.get(keyRecord.key_hash) || { count: 0, windowStart: now };
      if (now - tracker.windowStart > 60000) {
        tracker.count = 0;
        tracker.windowStart = now;
      }

      if (tracker.count >= (keyRecord.rate_limit_rpm || 60)) {
        return { valid: false, error: 'Rate limit (RPM) exceeded for virtual key' };
      }
      tracker.count += 1;
      this.keyRpmTrackers.set(keyRecord.key_hash, tracker);

      // Monthly budget limit check
      if (keyRecord.budget_limit && keyRecord.budget_limit > 0) {
        const usageRows = (await dbEngine.query(
          `SELECT COALESCE(SUM(cost_usd), 0) as total_spent FROM ai_usage_log 
           WHERE virtual_key_id = $1 AND create_date >= date_trunc('month', CURRENT_TIMESTAMP)`,
          [keyRecord.id]
        )) as Array<{ total_spent: number | string }>;

        const totalSpent = Number(usageRows[0]?.total_spent || 0);
        if (totalSpent >= keyRecord.budget_limit) {
          return { valid: false, error: 'Monthly budget limit in USD exceeded for virtual key' };
        }
      }

      return { valid: true, keyRecord };
    } catch (err: any) {
      logger.error({ err }, 'Error checking virtual key against database');
      return { valid: false, error: 'Database check failed for virtual key' };
    }
  }

  async recordUsage(params: UsageRecordParams): Promise<void> {
    try {
      const modelDef = modelRegistry.get('ai.usage_log');
      if (!modelDef) {
        // Model definition not ready, fallback to raw SQL
        await dbEngine.query(
          `INSERT INTO ai_usage_log 
           (virtual_key_id, provider_id, model_id, prompt_tokens, completion_tokens, total_tokens, cost_usd, latency_ms, status_code, is_cached)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            params.virtualKeyId || null,
            params.providerId || null,
            params.modelId || null,
            params.promptTokens,
            params.completionTokens,
            params.promptTokens + params.completionTokens,
            params.costUsd,
            params.latencyMs,
            params.statusCode,
            params.isCached,
          ]
        );
        return;
      }

      const repo = new BaseRepository(modelDef);
      await repo.create({
        virtual_key_id: params.virtualKeyId,
        provider_id: params.providerId,
        model_id: params.modelId,
        prompt_tokens: params.promptTokens,
        completion_tokens: params.completionTokens,
        total_tokens: params.promptTokens + params.completionTokens,
        cost_usd: params.costUsd,
        latency_ms: params.latencyMs,
        status_code: params.statusCode,
        is_cached: params.isCached,
      });
    } catch (err: any) {
      logger.error({ err }, 'Failed recording AI usage log to PGlite');
    }
  }

  calculateCost(
    promptTokens: number,
    completionTokens: number,
    inputCostPerM = 0,
    outputCostPerM = 0
  ): number {
    const inputCost = (promptTokens / 1_000_000) * inputCostPerM;
    const outputCost = (completionTokens / 1_000_000) * outputCostPerM;
    return Math.round((inputCost + outputCost) * 100000) / 100000;
  }
}
