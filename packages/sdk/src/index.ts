import type {
  UserSubject,
  ActiveSession,
  AuthResponse,
  ChatCompletionRequest,
  ChatCompletionResponse,
  SDUIRoot,
} from '@moonwitness/types';

export interface SdkOptions {
  baseUrl?: string;
  storageKey?: string;
}

export class MoonWitnessClient {
  private readonly baseUrl: string;
  private readonly storageKey: string;

  constructor(options: SdkOptions = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:5150';
    this.storageKey = options.storageKey || 'mw_session_token';
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
        body: JSON.stringify(req),
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
