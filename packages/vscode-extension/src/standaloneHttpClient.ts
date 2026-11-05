import type {
  RemoteAgentMission,
  StandaloneChatCompletionResponse,
  StandaloneChatMessage,
} from './contracts';

export const PROVIDER_TIMEOUT_MS = 30_000;

interface SwarmEvent {
  event: string;
  data: Record<string, unknown>;
}

export class StandaloneHttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly headers: Record<string, string>,
    private readonly timeoutMs = PROVIDER_TIMEOUT_MS,
  ) {}

  private async request<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, this.timeoutMs);
    const abort = () => controller.abort();
    if (init.signal?.aborted) {
      controller.abort();
    } else {
      init.signal?.addEventListener('abort', abort, { once: true });
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...init,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          ...this.headers,
          ...(init.headers as Record<string, string> | undefined),
        },
      });
      const text = await response.text();
      let payload: unknown = {};
      if (text) {
        try {
          payload = JSON.parse(text);
        } catch {
          if (response.ok) throw new Error('Provider returned an invalid JSON response.');
        }
      }

      const data = isRecord(payload) ? payload : {};
      if (!response.ok) {
        const error = isRecord(data.error) && typeof data.error.message === 'string'
          ? data.error.message
          : typeof data.message === 'string' ? data.message : `Request failed with status ${response.status}`;
        throw new Error(error);
      }
      if (!isRecord(payload)) {
        throw new Error('Provider returned an invalid response.');
      }
      return (payload.data === undefined ? payload : payload.data) as T;
    } catch (error) {
      if (timedOut) {
        throw new Error(`Request to ${endpoint} timed out after ${this.timeoutMs} ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
      init.signal?.removeEventListener('abort', abort);
    }
  }

  readonly health = {
    check: (): Promise<Record<string, unknown>> => this.request('/health'),
    ready: (): Promise<Record<string, unknown>> => this.request('/ready'),
  };

  readonly router = {
    listModels: async (): Promise<Array<{ id: string; owned_by?: string }>> => {
      const payload = await this.request<{ object?: string; data?: Array<{ id?: unknown; owned_by?: unknown }> }>('/v1/models');
      return (payload.data ?? []).flatMap((model) => typeof model.id === 'string'
        ? [{ id: model.id, ...(typeof model.owned_by === 'string' ? { owned_by: model.owned_by } : {}) }]
        : []);
    },
    chat: (body: { model: string; messages: StandaloneChatMessage[] }, signal?: AbortSignal): Promise<StandaloneChatCompletionResponse> =>
      this.request('/v1/chat/completions', {
        method: 'POST',
        body: JSON.stringify(body),
        signal,
        headers: { 'Content-Type': 'application/json' },
      }),
  };

  readonly agentControl = {
    claimPairing: (code: string, deviceName: string): Promise<{ deviceId: string; deviceToken: string }> =>
      this.request('/v1/agent/devices/claim', {
        method: 'POST',
        body: JSON.stringify({ code, deviceName }),
        headers: { 'Content-Type': 'application/json' },
      }),
    nextMission: (deviceToken: string): Promise<{ mission?: RemoteAgentMission }> =>
      this.request('/v1/agent/missions/next', { headers: { 'x-device-token': deviceToken } }),
    reportMissionEvent: (deviceToken: string, missionId: string, event: string, payload: Record<string, unknown>) =>
      this.request('/v1/agent/missions/event', {
        method: 'POST',
        body: JSON.stringify({ missionId, event, payload }),
        headers: { 'Content-Type': 'application/json', 'x-device-token': deviceToken },
      }),
  };

  readonly swarm = {
    stream: async (body: { goal: string; max_turns: number }, onEvent: (event: SwarmEvent['event'], data: SwarmEvent['data']) => void, signal?: AbortSignal): Promise<void> => {
      const response = await fetch(`${this.baseUrl}/v1/swarm/stream`, {
        method: 'POST',
        headers: { ...this.headers, Accept: 'text/event-stream', 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal,
      });
      if (!response.ok || !response.body) {
        throw new Error(`Swarm stream failed with status ${response.status}`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const raw = line.slice(5).trim();
            if (!raw) continue;
            const parsed = JSON.parse(raw) as Record<string, unknown>;
            onEvent(typeof parsed.event === 'string' ? parsed.event : 'message', parsed);
          }
        }
      } finally {
        reader.releaseLock();
      }
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
