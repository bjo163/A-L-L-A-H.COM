import type { ChatMessage, ChatCompletionResponse } from './types';
import { BaseRepository, modelRegistry, cosineSimilarity, SYSTEM_ACTOR, sha256Hex } from '@allah/arsy-orm';

export interface CacheEntry {
  response: ChatCompletionResponse;
  expiresAt: number;
}

export class GatewayCache {
  // Bounded LRU: JS Map preserves insertion order, so the oldest entry is the
  // first key. Without a cap this map grew unbounded across the process lifetime
  // (roadmap T13). Eviction is checked on every insert and lazily on read.
  private readonly maxEntries: number;
  private inMemoryCache = new Map<string, CacheEntry>();

  constructor(maxEntries = 512) {
    this.maxEntries = maxEntries > 0 ? maxEntries : 512;
  }

  private evictIfNeeded(): void {
    // Drop expired entries opportunistically, then trim to the cap from the oldest.
    const now = Date.now();
    for (const [key, entry] of this.inMemoryCache) {
      if (now > entry.expiresAt) this.inMemoryCache.delete(key);
    }
    while (this.inMemoryCache.size > this.maxEntries) {
      const oldest = this.inMemoryCache.keys().next().value;
      if (oldest === undefined) break;
      this.inMemoryCache.delete(oldest);
    }
  }

  generateKey(model: string, messages: ChatMessage[], temperature?: number): string {
    const serialized = JSON.stringify({
      model,
       messages: messages.map(m => ({ role: m.role, content: Array.isArray(m.content) ? m.content.filter(c => c.type === 'text').map(c => c.text.trim()).join(' ') : m.content.trim() })),
      temperature: temperature ?? 0.7,
    });
    return sha256Hex(serialized);
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
    companyId: number,
    model: string,
    queryEmbedding: number[],
    threshold = 0.95
  ): Promise<ChatCompletionResponse | null> {
    try {
      const modelDef = modelRegistry.get('ai.semantic_cache');
      if (!modelDef) return null;
      const repo = new BaseRepository(modelDef);
      const entries = await repo.find({ scope: { companyId }, limit: 100 });

      for (const entry of entries) {
        if ((entry as any).model && (entry as any).model !== model) continue;
        const expiresAt = (entry as any).expires_at ? new Date((entry as any).expires_at).getTime() : 0;
        if (expiresAt && Date.now() > expiresAt) continue;
        const embedding = (entry as any).embedding;
        if (!Array.isArray(embedding)) continue;
        // Fail-closed vector math (roadmap T4) throws on a dimension mismatch; an
        // individual legacy row must not abort the whole lookup, so skip it.
        let similarity: number;
        try {
          similarity = cosineSimilarity(queryEmbedding, embedding);
        } catch {
          continue;
        }
        if (similarity >= threshold) {
          // response_json is a JSONB column: PGlite returns an already-parsed object,
          // but a row written as a JSON string must still parse. Accept both shapes.
          const raw = (entry as any).response_json;
          let resp: ChatCompletionResponse;
          try {
            resp = typeof raw === 'string' ? JSON.parse(raw) : raw;
          } catch {
            continue;
          }
          await repo.updateById(
            Number((entry as any).id),
            { hit_count: Number((entry as any).hit_count || 0) + 1 },
            { companyId },
            SYSTEM_ACTOR
          );
          return resp;
        }
      }
    } catch (err) {
      // Ignore vector cache errors
    }
    return null;
  }

  async setVector(
    companyId: number,
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
      await repo.create(
        {
          company_id: companyId,
          prompt_hash: promptHash,
          prompt_text: promptText,
          embedding,
          response_json: response,
          model,
          hit_count: 0,
          expires_at: expiresAt,
        },
        { companyId },
        SYSTEM_ACTOR
      );
    } catch (err) {
      // Ignore
    }
  }

  set(key: string, response: ChatCompletionResponse, ttlSeconds = 3600): void {
    // Re-insert so the entry moves to the newest position (LRU recency).
    this.inMemoryCache.delete(key);
    this.inMemoryCache.set(key, {
      response,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
    this.evictIfNeeded();
  }

  clear(): void {
    this.inMemoryCache.clear();
  }
}