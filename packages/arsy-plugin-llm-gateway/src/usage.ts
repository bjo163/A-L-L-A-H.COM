import crypto from 'crypto';
import { modelRegistry, BaseRepository, dbEngine, SYSTEM_ACTOR } from '@allah/arsy-orm';
import { logger } from '@allah/arsy-core';
import type { VirtualKeyRecord } from './types';

export interface UsageRecordParams {
  companyId: number;
  virtualKeyId?: number;
  providerId?: number;
  modelId?: number;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  costUsd: number;
  statusCode: number;
  isCached: boolean;
}

export function hashVirtualKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey, 'utf-8').digest('hex');
}

export function generateVirtualKey(): { raw: string; prefix: string; hash: string } {
  const raw = `mw_live_${crypto.randomBytes(24).toString('base64url')}`;
  return { raw, prefix: raw.slice(0, 15), hash: hashVirtualKey(raw) };
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
      // Only the digest is compared: the stored column never holds a usable secret, and the
      // prefix is deliberately not a lookup key because it is not random.
      const rows = (await dbEngine.query(
        'SELECT * FROM ai_virtual_key WHERE key_hash = $1 AND revoked IS NOT TRUE LIMIT 1',
        [hashVirtualKey(rawKey)]
      )) as VirtualKeyRecord[];

      if (!rows || rows.length === 0) {
        return { valid: false, error: 'Invalid or revoked AI virtual key' };
      }

      const keyRecord = rows[0];

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

      if (keyRecord.budget_limit && keyRecord.budget_limit > 0) {
        const usageRows = (await dbEngine.query(
          `SELECT COALESCE(SUM(cost_usd), 0) as total_spent FROM ai_usage_log
           WHERE virtual_key_id = $1 AND company_id = $2 AND create_date >= date_trunc('month', CURRENT_TIMESTAMP)`,
          [keyRecord.id, keyRecord.company_id]
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
        logger.warn('ai.usage_log model unavailable; usage not recorded');
        return;
      }

      const repo = new BaseRepository(modelDef);
      await repo.create(
        {
          company_id: params.companyId,
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
        },
        { companyId: params.companyId },
        SYSTEM_ACTOR
      );
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
