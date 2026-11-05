import * as vscode from 'vscode';
import {
  getGatewayErrorMessage,
  parsePlanCompletionResponse,
  type GatewayModel,
} from './gatewayContracts';
import type { PlanMarkdownBodies } from './planManager';
import type { ChatCompletionResponse, ChatMessage, RemoteAgentMission } from '@moonwitness/types';

const API_KEY_SECRET = process.env.API_KEY_SECRET_NAME || 'allah.apiKey';
const SESSION_TOKEN_SECRET = process.env.SESSION_TOKEN_SECRET_NAME || 'allah.sessionToken';
const DEVICE_TOKEN_SECRET = process.env.DEVICE_TOKEN_SECRET_NAME || 'allah.agentDeviceToken';

interface HealthResponse {
  status?: string;
  version?: string;
  [key: string]: unknown;
}

interface ServiceCheck {
  ok: boolean;
  message: string;
}

interface SwarmEvent {
  event: string;
  data: Record<string, unknown>;
}

class StandaloneHttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly headers: Record<string, string>,
  ) {}

  private async request<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...this.headers,
        ...(init.headers as Record<string, string> | undefined),
      },
    });
    const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
    if (!response.ok) {
      const error = isRecord(payload.error) && typeof payload.error.message === 'string'
        ? payload.error.message
        : typeof payload.message === 'string' ? payload.message : `Request failed with status ${response.status}`;
      throw new Error(error);
    }
    return (payload.data === undefined ? payload : payload.data) as T;
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
    chat: (body: { model: string; messages: ChatMessage[] }, signal?: AbortSignal): Promise<ChatCompletionResponse> =>
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

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export class MoonWitnessClient {
  constructor(private readonly context: vscode.ExtensionContext) {}

  private get baseUrl(): string {
    const config = vscode.workspace.getConfiguration('allah');
    return (config.get<string>('gatewayUrl') || 'http://127.0.0.1:5150').replace(/\/+$/, '');
  }

  private get arsyBaseUrl(): string {
    const config = vscode.workspace.getConfiguration('allah');
    return (config.get<string>('arsyUrl') || 'http://127.0.0.1:5150').replace(/\/+$/, '');
  }

  get arsyDocsUrl(): string {
    return `${this.arsyBaseUrl}/docs`;
  }

  async setApiKey(apiKey: string): Promise<void> {
    if (apiKey.trim()) {
      await this.context.secrets.store(API_KEY_SECRET, apiKey.trim());
      return;
    }
    await this.context.secrets.delete(API_KEY_SECRET);
  }

  async claimAgentDevice(code: string, deviceName: string): Promise<string> {
    const client = await this.createSdkClient(this.arsyBaseUrl, false);
    const claimed = await client.agentControl.claimPairing(code.trim(), deviceName.trim());
    await this.context.secrets.store(DEVICE_TOKEN_SECRET, claimed.deviceToken);
    return claimed.deviceId;
  }

  async getAgentDeviceToken(): Promise<string | undefined> {
    return this.context.secrets.get(DEVICE_TOKEN_SECRET);
  }

  async pollAgentMission(deviceToken: string) {
    const client = await this.createSdkClient(this.arsyBaseUrl, false);
    return client.agentControl.nextMission(deviceToken);
  }

  async reportAgentMissionEvent(
    deviceToken: string,
    missionId: string,
    event: string,
    payload: Record<string, unknown> = {}
  ): Promise<void> {
    const client = await this.createSdkClient(this.arsyBaseUrl, false);
    await client.agentControl.reportMissionEvent(deviceToken, missionId, event, payload);
  }

  async migrateLegacyApiKey(): Promise<void> {
    const configuration = vscode.workspace.getConfiguration('allah');
    const inspected = configuration.inspect<string>('apiKey');
    const legacyApiKey = configuration.get<string>('apiKey');
    if (!legacyApiKey) return;

    if (!(await this.context.secrets.get(API_KEY_SECRET))) {
      await this.context.secrets.store(API_KEY_SECRET, legacyApiKey);
    }

    const target = inspected?.workspaceFolderValue !== undefined
      ? vscode.ConfigurationTarget.WorkspaceFolder
      : inspected?.workspaceValue !== undefined
        ? vscode.ConfigurationTarget.Workspace
        : vscode.ConfigurationTarget.Global;
    await configuration.update('apiKey', undefined, target);
    void vscode.window.showInformationMessage(
      'The MoonWitness API key was moved from settings to VS Code SecretStorage.'
    );
  }

  private async createSdkClient(baseUrl = this.baseUrl, useApiKey = true): Promise<StandaloneHttpClient> {
    const apiKey = useApiKey ? await this.context.secrets.get(API_KEY_SECRET) : undefined;
    const sessionToken = await this.context.secrets.get(SESSION_TOKEN_SECRET);
    return new StandaloneHttpClient(baseUrl, {
      ...(apiKey ? { 'x-virtual-key': apiKey } : {}),
      ...(sessionToken ? { 'x-session-token': sessionToken } : {}),
    });
  }

  async checkHealth(): Promise<{ ok: boolean; latencyMs: number; details?: HealthResponse; message?: string }> {
    const start = Date.now();
    try {
      const client = await this.createSdkClient();
      const details = await client.health.check();
      const latencyMs = Date.now() - start;
      if (details.status !== 'ok') {
        return { ok: false, latencyMs, message: 'Health endpoint did not report status "ok".' };
      }
      return { ok: true, latencyMs, details };
    } catch (error) {
      return { ok: false, latencyMs: Date.now() - start, message: errorMessage(error) };
    }
  }

  async checkArsyReadiness(): Promise<{
    health: ServiceCheck;
    readiness: ServiceCheck;
  }> {
    const client = await this.createSdkClient(this.arsyBaseUrl, false);
    const check = async (
      endpoint: 'health' | 'ready',
      operation: () => Promise<Record<string, unknown>>
    ): Promise<ServiceCheck> => {
      try {
        const data = await operation();
        if (endpoint === 'health' && data.status !== 'ok') {
          return { ok: false, message: 'Health endpoint did not report status "ok".' };
        }
        if (endpoint === 'ready' && data.ready !== true) {
          return { ok: false, message: 'Readiness endpoint did not report ready.' };
        }
        return { ok: true, message: 'HTTP 200' };
      } catch (error) {
        return { ok: false, message: errorMessage(error) };
      }
    };

    const [health, readiness] = await Promise.all([
      check('health', () => client.health.check()),
      check('ready', () => client.health.ready()),
    ]);
    return { health, readiness };
  }

  async fetchModels(): Promise<GatewayModel[]> {
    const client = await this.createSdkClient();
    const models = await client.router.listModels();
    return models.map((model) => ({
      id: model.id,
      ...(model.owned_by === undefined ? {} : { owned_by: model.owned_by }),
    }));
  }

  async streamSwarm(
    goal: string,
    maxTurns: number,
    onEvent: (event: string, data: Record<string, unknown>) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const client = await this.createSdkClient(this.arsyBaseUrl);
    await client.swarm.stream({ goal, max_turns: maxTurns }, onEvent, signal);
  }

  async completeAgent(
    system: string,
    prompt: string,
    signal?: AbortSignal
  ): Promise<string> {
    const config = vscode.workspace.getConfiguration('allah');
    const model = config.get<string>('agentModel')
      || config.get<string>('plannerModel')
      || 'dx-default';
    const client = await this.createSdkClient();
    const response = await client.router.chat({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
    }, signal);
    const content = response.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || content.trim().length === 0) {
      throw new Error('The model returned an empty agent response.');
    }
    return content;
  }

  async generatePlanSpec(featurePrompt: string): Promise<PlanMarkdownBodies> {
    const config = vscode.workspace.getConfiguration('allah');
    const model = config.get<string>('plannerModel') || 'dx-reasoning';
    const client = await this.createSdkClient();
    const response = await client.router.chat({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are the MoonWitness spec-driven architecture planner. Never invent time, duration, or budget estimates. Omit estimates when no reliable evidence exists.',
        },
        {
          role: 'user',
          content: [
            `Create a repository-compliant implementation plan for: ${featurePrompt}`,
            'Return only a JSON object with four non-empty Markdown body strings: "spec", "tasks", "design", and "rules".',
            'Do not include YAML frontmatter or a top-level heading; the extension supplies canonical metadata and headings.',
            'The spec body must describe context, scope, constraints, and observable acceptance criteria.',
            'The tasks body must be an actionable checklist using - [ ] items.',
            'The design body must state the interaction model and reasons for major design choices.',
            'The rules body must state invariants, security boundaries, and out-of-scope behavior.',
            'Do not claim that a gateway model has an upstream provider unless the response proves it.',
          ].join('\n'),
        },
      ],
    });

    if (!isRecord(response)) {
      throw new Error(getGatewayErrorMessage(response) || 'Gateway returned an invalid chat completion response.');
    }
    return parsePlanCompletionResponse(response);
  }

  // --- Project Manager API ---

  private async arsyFetch(path: string, init: RequestInit = {}): Promise<unknown> {
    const token = await this.context.secrets.get(SESSION_TOKEN_SECRET);
    const response = await fetch(`${this.arsyBaseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers as Record<string, string> ?? {}),
      },
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Arsy ${init.method ?? 'GET'} ${path} failed (${response.status}): ${text}`);
    }
    return response.json();
  }

  async listProjects(): Promise<unknown[]> {
    const result = await this.arsyFetch('/v1/projects') as { data?: unknown[] };
    return result.data ?? [];
  }

  async createProject(payload: Record<string, unknown>): Promise<unknown> {
    const result = await this.arsyFetch('/v1/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    }) as { data?: unknown };
    return result.data;
  }

  async syncProjectToHub(projectId: number, plans: unknown[]): Promise<unknown> {
    const result = await this.arsyFetch(`/v1/projects/${projectId}/sync`, {
      method: 'POST',
      body: JSON.stringify({ projectId, plans }),
    }) as { data?: unknown };
    return result.data;
  }

  async exportProjectFromHub(projectId: number): Promise<unknown> {
    const result = await this.arsyFetch(`/v1/projects/${projectId}/export`) as { data?: unknown };
    return result.data;
  }

  async updateTask(projectId: number, taskId: number, patch: Record<string, unknown>): Promise<unknown> {
    const result = await this.arsyFetch(`/v1/projects/${projectId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }) as { data?: unknown };
    return result.data;
  }

  async listProjectTasks(projectId: number): Promise<unknown[]> {
    const result = await this.arsyFetch(`/v1/projects/${projectId}/tasks`) as { data?: unknown[] };
    return result.data ?? [];
  }
}
