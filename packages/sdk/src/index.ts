import type {
  UserSubject,
  ActiveSession,
  AuthResponse,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionChunk,
  GatewayModelInfo,
  GatewayTelemetry,
  GatewayProviderInfo,
  GatewayUsageLog,
  SDUIRoot,
} from '@moonwitness/types';

export interface SdkOptions {
  baseUrl?: string;
  storageKey?: string;
  virtualKey?: string;
}

export class MoonWitnessClient {
  private readonly baseUrl: string;
  private readonly storageKey: string;
  private virtualKey?: string;

  constructor(options: SdkOptions = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:5150';
    this.storageKey = options.storageKey || 'mw_session_token';
    this.virtualKey = options.virtualKey;
  }

  setVirtualKey(key: string): void {
    this.virtualKey = key;
  }

  // Session Token State
  getSessionToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.storageKey);
  }

  setSessionToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.storageKey, token);
    document.cookie = `arsy_session=${token}; path=/; max-age=2592000; SameSite=Lax`;
  }

  clearSessionToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.storageKey);
    document.cookie = 'arsy_session=; path=/; max-age=0; SameSite=Lax';
  }

  private async request<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers || {});
    if (!headers.has('Content-Type') && init.body && typeof init.body === 'string') {
      headers.set('Content-Type', 'application/json');
    }

    const token = this.getSessionToken();
    if (token && !headers.has('x-session-token')) {
      headers.set('x-session-token', token);
    }

    if (this.virtualKey && !headers.has('x-virtual-key')) {
      headers.set('x-virtual-key', this.virtualKey);
    }

    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, { ...init, headers });
    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = json.error?.message || json.message || `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return json.data !== undefined ? json.data : json;
  }

  // Auth Operations
  readonly auth = {
    signIn: async (credentials: { email: string; password: string; deviceName?: string }): Promise<AuthResponse> => {
      const data = await this.request<AuthResponse>('/api/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      if (data?.sessionToken) {
        this.setSessionToken(data.sessionToken);
      }
      return data;
    },

    register: async (payload: { email: string; password: string; name: string }): Promise<{ user: UserSubject }> => {
      return this.request<{ user: UserSubject }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    getCurrentUser: async (): Promise<{ user: UserSubject }> => {
      const user = await this.request<UserSubject>('/api/auth/current');
      return { user };
    },

    getSessions: async (): Promise<ActiveSession[]> => {
      return this.request<ActiveSession[]>('/api/auth/sessions');
    },

    revokeSession: async (sessionId: number): Promise<{ message: string; revokedSessionId: number }> => {
      return this.request<{ message: string; revokedSessionId: number }>('/api/auth/sessions/revoke', {
        method: 'POST',
        body: JSON.stringify({ sessionId }),
      });
    },

    signOut: async (): Promise<void> => {
      try {
        await this.request('/api/auth/sign-out', { method: 'POST' });
      } catch {
        // Suppress network errors on exit
      }
      this.clearSessionToken();
    },
  };

  // Router LLM Operations
  readonly router = {
    chat: async (req: ChatCompletionRequest): Promise<ChatCompletionResponse> => {
      return this.request<ChatCompletionResponse>('/v1/chat/completions', {
        method: 'POST',
        body: JSON.stringify({ ...req, stream: false }),
      });
    },

    chatStream: async (
      req: ChatCompletionRequest,
      onChunk: (chunk: ChatCompletionChunk) => void
    ): Promise<void> => {
      const headers = new Headers();
      headers.set('Content-Type', 'application/json');

      const token = this.getSessionToken();
      if (token) headers.set('x-session-token', token);
      if (this.virtualKey) headers.set('x-virtual-key', this.virtualKey);

      const url = `${this.baseUrl}/v1/chat/completions`;
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...req, stream: true }),
      });

      if (!response.ok || !response.body) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Streaming request failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;
          if (trimmed === 'data: [DONE]') return;

          if (trimmed.startsWith('data: ')) {
            try {
              const chunk = JSON.parse(trimmed.slice(6));
              if (chunk.choices) {
                onChunk(chunk as ChatCompletionChunk);
              }
            } catch {
              // Ignore partial chunk decode
            }
          }
        }
      }
    },

    embeddings: async (req: { model: string; input: string | string[]; encoding_format?: 'float' | 'base64' }) => {
      return this.request('/v1/embeddings', {
        method: 'POST',
        body: JSON.stringify(req),
      });
    },

    listModels: async (): Promise<GatewayModelInfo[]> => {
      const res = await this.request<{ object: string; data: GatewayModelInfo[] }>('/v1/models');
      return res.data || [];
    },

    getTelemetry: async (): Promise<GatewayTelemetry> => {
      return this.request<GatewayTelemetry>('/v1/gateway/telemetry');
    },

    getProviders: async (): Promise<GatewayProviderInfo[]> => {
      return this.request<GatewayProviderInfo[]>('/v1/gateway/providers');
    },

    getUsage: async (): Promise<GatewayUsageLog[]> => {
      return this.request<GatewayUsageLog[]>('/v1/gateway/usage');
    },
  };

  // Threads & Memory Operations
  readonly threads = {
    list: async () => {
      return this.request('/v1/threads');
    },
    create: async (payload: { title?: string; active_model?: string }) => {
      return this.request('/v1/threads', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    getMessages: async (threadId: string | number) => {
      return this.request(`/v1/threads/${threadId}/messages`);
    },
    addMessage: async (threadId: string | number, payload: { role: string; content: string }) => {
      return this.request(`/v1/threads/${threadId}/messages`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  };

  // Qorpus Operations
  readonly qorpus = {
    ingest: async (payload: { title: string; category: string; content: string; source?: string }) => {
      return this.request('/v1/qorpus/ingest', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    search: async (payload: { query: string; limit?: number; min_score?: number }) => {
      return this.request('/v1/qorpus/search', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  };


  // Server-Driven UI (SDUI)
  readonly sdui = {
    render: async (viewId: string): Promise<SDUIRoot> => {
      return this.request<SDUIRoot>(`/v1/sdui?view=${encodeURIComponent(viewId)}`);
    },
  };
}

export const createClient = (options?: SdkOptions) => new MoonWitnessClient(options);
export const mwClient = createClient();

