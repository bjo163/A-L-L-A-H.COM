import crypto from 'crypto';
import type { ChatMessage, ChatCompletionResponse } from './types';

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
