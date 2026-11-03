import crypto from 'crypto';
import type { ChatMessage, ChatCompletionResponse } from './types';
import { dbEngine, BaseRepository, modelRegistry, cosineSimilarity } from '@allah/arsy-orm';

export interface CacheEntry {
  response: ChatCompletionResponse;
  expiresAt: number;
}

export class GatewayCache {
  private inMemoryCache = new Map<string, CacheEntry>();

  generateKey(model: string, messages: ChatMessage[], temperature?: number): string {
    const serialized = JSON.stringify({
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content.trim() })),
      temperature: temperature ?? 0.7,
    });
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }

  get(key: string): ChatCompletionResponse | null {
    const entry = this.inMemoryCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.inMemoryCache.delete(key);
      return null;
    }
    return entry.response;
  }

  async getVector(
    model: string,
    queryEmbedding: number[],
    threshold = 0.95
  ): Promise<ChatCompletionResponse | null> {
    try {
      const modelDef = modelRegistry.get('ai.semantic_cache');
      if (!modelDef) return null;
      const repo = new BaseRepository(modelDef);
      const entries = await repo.find({ limit: 100 });

      for (const entry of entries) {
        if ((entry as any).model && (entry as any).model !== model) continue;
        const expiresAt = (entry as any).expires_at ? new Date((entry as any).expires_at).getTime() : 0;
        if (expiresAt && Date.now() > expiresAt) continue;
        const embedding = (entry as any).embedding;
        if (!Array.isArray(embedding)) continue;
        const similarity = cosineSimilarity(queryEmbedding, embedding);
        if (similarity >= threshold) {
          try {
            const resp = JSON.parse((entry as any).response_json);
            // Increment hit count asynchronously via query
            dbEngine.query(
              'UPDATE ai_semantic_cache SET hit_count = hit_count + 1 WHERE id = $1',
              [(entry as any).id]
            ).catch(() => {});
            return resp;
          } catch {
            return null;
          }
        }
      }
    } catch (err) {
      // Ignore vector cache errors
    }
    return null;
  }

  async setVector(
    model: string,
    promptText: string,
    promptHash: string,
    embedding: number[],
    response: ChatCompletionResponse,
    ttlSeconds = 7 * 24 * 3600
  ): Promise<void> {
    try {
      const modelDef = modelRegistry.get('ai.semantic_cache');
      if (!modelDef) return;
      const repo = new BaseRepository(modelDef);
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
      await repo.create({
        prompt_hash: promptHash,
        prompt_text: promptText,
        embedding,
        response_json: JSON.stringify(response),
        model,
        hit_count: 0,
        expires_at: expiresAt,
      });
    } catch (err) {
      // Ignore
    }
  }

  set(key: string, response: ChatCompletionResponse, ttlSeconds = 3600): void {
    this.inMemoryCache.set(key, {
      response,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  clear(): void {
    this.inMemoryCache.clear();
  }
}

