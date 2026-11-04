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
  JsonRpcResponse,
  McpTool,
  McpToolCallResult,
  ToolExecutionRecord,
  AgentMode,
  AgentSessionEvent,
  PairedAgentDevice,
  RemoteAgentMission,
} from '@moonwitness/types';

export interface SdkOptions {
  baseUrl?: string;
  storageKey?: string;
  virtualKey?: string;
  sessionStore?: SessionTokenStore;
}

export interface SessionTokenStore {
  get(): Promise<string | null>;
  set(token: string): Promise<void>;
  clear(): Promise<void>;
}

export interface AgentPairingResult {
  id: string;
  code: string;
  deviceName: string;
  expiresAt: string;
}

export interface ClaimedAgentDevice {
  deviceId: string;
  deviceToken: string;
  deviceName: string;
  platform: 'windows';
}

export type SwarmRole = 'planner' | 'researcher' | 'builder' | 'verifier';

function isMcpTool(value: unknown): value is McpTool {
  if (typeof value !== 'object' || value === null) return false;
  return (
    'name' in value &&
    typeof value.name === 'string' &&
    'description' in value &&
    typeof value.description === 'string' &&
    'inputSchema' in value &&
    typeof value.inputSchema === 'object' &&
    value.inputSchema !== null &&
    !Array.isArray(value.inputSchema)
  );
}

export interface SwarmAgentMessage {
  id: string;
  from: SwarmRole;
  to: SwarmRole | 'supervisor' | 'all';
  role: SwarmRole;
  payload: Record<string, unknown>;
  timestamp: string;
  latency_ms?: number;
}

export interface SwarmStep {
  step: number;
  agent: SwarmRole;
  action: string;
  thought?: string;
  input?: Record<string, unknown>;
  output?: unknown;
  success: boolean;
  latency_ms?: number;
  timestamp: string;
}

export interface SwarmExecutionResult {
  success: boolean;
  mission_id: string;
  goal: string;
  summary: string;
  steps: SwarmStep[];
  messages: SwarmAgentMessage[];
  finish_reason: 'completed' | 'verifier_rejected' | 'max_turns' | 'human_intervention' | 'error';
  error?: string;
}

export class MoonWitnessClient {
  private readonly baseUrl: string;
  private readonly storageKey: string;
  private readonly sessionStore: SessionTokenStore | undefined;
  private cachedSessionToken: string | null | undefined;
  private virtualKey: string | undefined;

  constructor(options: SdkOptions = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:5150';
    this.storageKey = options.storageKey || 'mw_session_token';
    this.sessionStore = options.sessionStore;
    this.virtualKey = options.virtualKey;
  }

  setVirtualKey(key: string): void {
    this.virtualKey = key;
  }

  // Session Token State
  getSessionToken(): string | null {
    if (this.sessionStore) {
      return this.cachedSessionToken ?? null;
    }
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.storageKey);
  }

  setSessionToken(token: string): void {
    if (this.sessionStore) {
      throw new Error('Use setSessionTokenAsync when a session store is configured.');
    }
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.storageKey, token);
    document.cookie = `arsy_session=${token}; path=/; max-age=2592000; SameSite=Lax`;
  }

  clearSessionToken(): void {
    if (this.sessionStore) {
      throw new Error('Use clearSessionTokenAsync when a session store is configured.');
    }
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.storageKey);
    document.cookie = 'arsy_session=; path=/; max-age=0; SameSite=Lax';
  }

  async setSessionTokenAsync(token: string): Promise<void> {
    if (this.sessionStore) {
      await this.sessionStore.set(token);
      this.cachedSessionToken = token;
      return;
    }
    this.setSessionToken(token);
  }

  async clearSessionTokenAsync(): Promise<void> {
    if (this.sessionStore) {
      await this.sessionStore.clear();
      this.cachedSessionToken = null;
      return;
    }
    this.clearSessionToken();
  }

  private async getSessionTokenForRequest(): Promise<string | null> {
    if (this.sessionStore) {
      const token = await this.sessionStore.get();
      this.cachedSessionToken = token;
      return token;
    }
    return this.getSessionToken();
  }

  private async request<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers || {});
    if (!headers.has('Content-Type') && init.body && typeof init.body === 'string') {
      headers.set('Content-Type', 'application/json');
    }

    const token = await this.getSessionTokenForRequest();
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
        await this.setSessionTokenAsync(data.sessionToken);
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
      await this.clearSessionTokenAsync();
    },
  };

  // Router LLM Operations
  readonly router = {
    chat: async (req: ChatCompletionRequest, signal?: AbortSignal): Promise<ChatCompletionResponse> => {
      return this.request<ChatCompletionResponse>('/v1/chat/completions', {
        method: 'POST',
        body: JSON.stringify({ ...req, stream: false }),
        ...(signal ? { signal } : {}),
      });
    },

    chatStream: async (
      req: ChatCompletionRequest,
      onChunk: (chunk: ChatCompletionChunk) => void
    ): Promise<void> => {
      const headers = new Headers();
      headers.set('Content-Type', 'application/json');

      const token = await this.getSessionTokenForRequest();
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

    getUsageLogs: async (): Promise<GatewayUsageLog[]> => {
      return this.request<GatewayUsageLog[]>('/v1/gateway/usage');
    },
  };

  readonly health = {
    check: async (): Promise<Record<string, unknown>> => {
      return this.request<Record<string, unknown>>('/health');
    },
    ready: async (): Promise<Record<string, unknown>> => {
      return this.request<Record<string, unknown>>('/ready');
    },
  };

  readonly agentControl = {
    createPairing: async (deviceName: string): Promise<AgentPairingResult> => {
      return this.request<AgentPairingResult>('/v1/agent/pairings', {
        method: 'POST',
        body: JSON.stringify({ deviceName }),
      });
    },

    claimPairing: async (code: string, deviceName: string): Promise<ClaimedAgentDevice> => {
      return this.request<ClaimedAgentDevice>('/v1/agent/pairings/claim', {
        method: 'POST',
        body: JSON.stringify({ code, deviceName, platform: 'windows' }),
      });
    },

    listDevices: async (): Promise<PairedAgentDevice[]> => {
      return this.request<PairedAgentDevice[]>('/v1/agent/devices');
    },

    revokeDevice: async (deviceId: string): Promise<{ deviceId: string; status: 'revoked' }> => {
      return this.request(`/v1/agent/devices/${encodeURIComponent(deviceId)}/revoke`, {
        method: 'POST',
      });
    },

    submitMission: async (payload: {
      deviceId: string;
      mode: AgentMode;
      goal: string;
    }): Promise<RemoteAgentMission> => {
      return this.request<RemoteAgentMission>('/v1/agent/missions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    listMissions: async (deviceId?: string): Promise<RemoteAgentMission[]> => {
      const query = deviceId ? `?deviceId=${encodeURIComponent(deviceId)}` : '';
      return this.request<RemoteAgentMission[]>(`/v1/agent/missions${query}`);
    },

    cancelMission: async (missionId: string): Promise<{ missionId: string; state: 'cancel_requested' }> => {
      return this.request(`/v1/agent/missions/${encodeURIComponent(missionId)}/cancel`, {
        method: 'POST',
      });
    },

    getMissionEvents: async (missionId: string): Promise<AgentSessionEvent[]> => {
      return this.request<AgentSessionEvent[]>(`/v1/agent/missions/${encodeURIComponent(missionId)}/events`);
    },

    nextMission: async (deviceToken: string): Promise<{ mission: RemoteAgentMission | null }> => {
      return this.request('/v1/agent/device/missions/next', {
        headers: { 'x-agent-device-token': deviceToken },
      });
    },

    reportMissionEvent: async (
      deviceToken: string,
      missionId: string,
      event: string,
      payload: Record<string, unknown> = {}
    ): Promise<{ missionId: string; event: string }> => {
      return this.request(`/v1/agent/device/missions/${encodeURIComponent(missionId)}/events`, {
        method: 'POST',
        headers: { 'x-agent-device-token': deviceToken },
        body: JSON.stringify({ event, payload }),
      });
    },
  };

  // Works Commercial Operations
  readonly works = {
    listPlans: async () => {
      return this.request('/v1/works/plans', { method: 'GET' });
    },
    createPlan: async (payload: {
      name: string;
      description?: string;
      download_speed_kbps: number;
      upload_speed_kbps: number;
      burst_download_kbps?: number;
      burst_upload_kbps?: number;
      burst_threshold_kbps?: number;
      burst_time_seconds?: number;
      fup_threshold_gb?: number;
      fup_throttled_download_kbps?: number;
      fup_throttled_upload_kbps?: number;
      price_cents: number;
      currency?: string;
      billing_cycle_days?: number;
      grace_period_days?: number;
      is_active?: boolean;
    }): Promise<any> => {
      return this.request('/v1/works/plans', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    listSubscriptions: async () => {
      return this.request('/v1/works/subscriptions', { method: 'GET' });
    },
    createSubscription: async (payload: {
      company_id: number;
      partner_id: number;
      plan_id: number;
      username: string;
      start_date: string;
      end_date?: string;
      auto_renew?: boolean;
      payment_method_id?: number;
    }): Promise<any> => {
      return this.request('/v1/works/subscriptions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    activateSubscription: async (subscriptionId: number) => {
      return this.request(`/v1/works/subscriptions/${subscriptionId}/activate`, {
        method: 'POST',
      });
    },
     suspendSubscription: async (subscriptionId: number, reason?: string) => {
       return this.request(`/v1/works/subscriptions/${subscriptionId}/suspend`, {
         method: 'POST',
         body: JSON.stringify(reason ? { reason } : {}) as string,
       });
     },
    listInvoices: async () => {
      return this.request('/v1/works/invoices', { method: 'GET' });
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

  // NEXUS Network Inventory Operations
  readonly nexus = {
    listNas: async (companyId?: string) => {
      return this.request<{ success: boolean; data: any[] }>(`/v1/nexus/nas?company_id=${companyId || ''}`, {
        method: 'GET',
      });
    },
    createNas: async (payload: { nas_identifier: string; ip_address: string; secret: string; vendor?: string; coa_port?: number; source_allowlist?: string[]; site_id?: number }) => {
      return this.request<{ success: boolean; data: any }>('/v1/nexus/nas', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    getNas: async (id: number) => {
      return this.request<{ success: boolean; data: any }>(`/v1/nexus/nas/${id}`, {
        method: 'GET',
      });
    },
    rotateSecret: async (id: number, secret: string, rotated_by?: string) => {
      return this.request<{ success: boolean; data: any }>(`/v1/nexus/nas/${id}/secret`, {
        method: 'PUT',
        body: JSON.stringify({ secret, rotated_by }),
      });
    },
  };

  // Model Context Protocol (MCP) Operations
  readonly mcp = {
    listTools: async (): Promise<McpTool[]> => {
      const res = await this.request<JsonRpcResponse>('/v1/mcp/message', {
        method: 'POST',
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/list',
          id: `mcp_${Date.now()}`,
        }),
      });
      if (res.error) throw new Error(`MCP tools/list failed: ${res.error.message}`);
      const tools: unknown = typeof res.result === 'object' && res.result !== null && 'tools' in res.result
        ? res.result.tools
        : undefined;
      if (!Array.isArray(tools) || !tools.every(isMcpTool)) {
        throw new Error('MCP tools/list returned an invalid response.');
      }
      return tools;
    },

    callTool: async (
      name: string,
      arguments_: Record<string, unknown> = {}
    ): Promise<McpToolCallResult> => {
      const res = await this.request<JsonRpcResponse>('/v1/mcp/message', {
        method: 'POST',
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/call',
          params: { name, arguments: arguments_ },
          id: `mcp_${Date.now()}`,
        }),
      });
      return ((res as any)?.result ?? { content: [], isError: true }) as McpToolCallResult;
    },

    getAuditLog: async (): Promise<ToolExecutionRecord[]> => {
      const res = await this.request<{ audit: unknown; total: number }>('/v1/mcp/audit');
      if (!Array.isArray(res.audit)) {
        throw new Error('MCP audit endpoint returned an invalid response.');
      }
      // The hub owns the record shape; only its array-ness is checkable here.
      return res.audit as ToolExecutionRecord[];
    },
  };


  // Server-Driven UI (SDUI)
  readonly sdui = {
    render: async (viewId: string): Promise<SDUIRoot> => {
      return this.request<SDUIRoot>(`/v1/sdui?view=${encodeURIComponent(viewId)}`);
    },
  };

  // Multi-Agent Swarm Orchestration
  readonly swarm = {
    run: async (options: {
      goal: string;
      system?: string;
      max_turns?: number;
      allowed_tools?: string[];
      temperature?: number;
      context?: Record<string, unknown>;
    }): Promise<SwarmExecutionResult> => {
      return this.request<SwarmExecutionResult>('/v1/swarm/run', {
        method: 'POST',
        body: JSON.stringify(options),
      });
    },

    stream: async (
      options: {
        goal: string;
        system?: string;
        max_turns?: number;
        allowed_tools?: string[];
        temperature?: number;
        context?: Record<string, unknown>;
      },
      onEvent: (event: string, data: SwarmStep | SwarmAgentMessage | SwarmExecutionResult | { error: string }) => void,
      signal?: AbortSignal
    ): Promise<void> => {
      const token = await this.getSessionTokenForRequest();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (this.virtualKey) headers['x-virtual-key'] = this.virtualKey;

      const res = await fetch(`${this.baseUrl}/v1/swarm/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify(options),
        ...(signal ? { signal } : {}),
      });

      if (!res.ok) {
        throw new Error(`Swarm stream failed with status ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('ReadableStream not supported by runtime');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          const trimmed = block.trim();
          if (!trimmed) continue;

          let currentEvent = 'message';
          let currentData = '';

          for (const line of trimmed.split('\n')) {
            if (line.startsWith('event: ')) {
              currentEvent = line.replace('event: ', '').trim();
            } else if (line.startsWith('data: ')) {
              currentData = line.replace('data: ', '').trim();
            }
          }

          if (currentData) {
            try {
              onEvent(currentEvent, JSON.parse(currentData));
            } catch {
              onEvent(currentEvent, { error: currentData });
            }
          }
        }
      }
    },
  };

  // Autonomous Cognitive Agent Loop
  readonly agent = {
    run: async (options: {
      prompt: string;
      system?: string;
      max_steps?: number;
      allowed_tools?: string[];
      temperature?: number;
    }): Promise<{
      session_id: string;
      success: boolean;
      total_steps: number;
      steps: any[];
      final_response: string;
      finish_reason: string;
      sdui_payloads: any[];
      error?: string;
    }> => {
      return this.request('/v1/agent/run', {
        method: 'POST',
        body: JSON.stringify(options),
      });
    },

    stream: async (
      options: {
        prompt: string;
        system?: string;
        max_steps?: number;
        allowed_tools?: string[];
        temperature?: number;
      },
      onEvent: (event: string, data: any) => void
    ): Promise<void> => {
      const token = await this.getSessionTokenForRequest();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (this.virtualKey) headers['x-virtual-key'] = this.virtualKey;

      const res = await fetch(`${this.baseUrl}/v1/agent/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify(options),
      });

      if (!res.ok) {
        throw new Error(`Agent stream failed with status ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('ReadableStream not supported by runtime');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          const trimmed = block.trim();
          if (!trimmed) continue;

          let currentEvent = 'message';
          let currentData = '';

          for (const line of trimmed.split('\n')) {
            if (line.startsWith('event: ')) {
              currentEvent = line.replace('event: ', '').trim();
            } else if (line.startsWith('data: ')) {
              currentData = line.replace('data: ', '').trim();
            }
          }

          if (currentData) {
            try {
              onEvent(currentEvent, JSON.parse(currentData));
            } catch {
              onEvent(currentEvent, currentData);
            }
          }
        }
      }
    },
  };
}

export const createClient = (options?: SdkOptions) => new MoonWitnessClient(options);
export const mwClient = createClient();