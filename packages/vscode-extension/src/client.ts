import * as vscode from 'vscode';
import {
  getGatewayErrorMessage,
  parsePlanCompletionResponse,
  type GatewayModel,
} from './gatewayContracts';
import type { PlanMarkdownBodies } from './planManager';
import { PROVIDER_TIMEOUT_MS, StandaloneHttpClient } from './standaloneHttpClient';

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
    const provider = config.get<'gateway' | 'ollama'>('agentProvider') || 'gateway';
    if (provider === 'ollama') {
      return this.completeWithOllama(system, prompt, signal);
    }
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

  async checkAgentProvider(): Promise<{
    provider: 'gateway' | 'ollama';
    ok: boolean;
    model: string;
    models: string[];
    message: string;
  }> {
    const config = vscode.workspace.getConfiguration('allah');
    const provider = config.get<'gateway' | 'ollama'>('agentProvider') || 'gateway';
    if (provider === 'ollama') {
      const baseUrl = (config.get<string>('ollamaUrl') || 'http://127.0.0.1:11434').replace(/\/+$/, '');
      const configuredModel = config.get<string>('agentModel')?.trim() || '';
      try {
        const response = await fetch(`${baseUrl}/api/tags`, {
          signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
        });
        const payload = await response.json().catch(() => undefined) as { models?: Array<{ name?: unknown }> } | undefined;
        if (!response.ok) {
          return { provider, ok: false, model: configuredModel, models: [], message: `Ollama returned HTTP ${response.status}.` };
        }
        const models = (payload?.models ?? [])
          .map((entry) => typeof entry.name === 'string' ? entry.name : '')
          .filter(Boolean);
        if (models.length === 0) {
          return { provider, ok: false, model: configuredModel, models, message: 'Ollama is running, but no local model is installed.' };
        }
        const model = configuredModel || models[0];
        if (!configuredModel) {
          await config.update('agentModel', model, vscode.ConfigurationTarget.Global);
        }
        if (!models.includes(model)) {
          return { provider, ok: false, model, models, message: `Model "${model}" is not installed in Ollama.` };
        }
        return { provider, ok: true, model, models, message: `Ollama is ready with model "${model}".` };
      } catch (error) {
        return { provider, ok: false, model: configuredModel, models: [], message: `Ollama is unavailable at ${baseUrl}: ${errorMessage(error)}` };
      }
    }

    const health = await this.checkHealth();
    const model = config.get<string>('agentModel') || config.get<string>('plannerModel') || 'dx-default';
    if (!health.ok) {
      return { provider, ok: false, model, models: [], message: health.message || 'Gateway is not ready.' };
    }
    try {
      const models = (await this.fetchModels()).map((entry) => entry.id);
      return {
        provider,
        ok: models.length > 0 && models.includes(model),
        model,
        models,
        message: models.length === 0
          ? 'Gateway is healthy, but its model catalog is empty.'
          : models.includes(model) ? `Gateway is ready with model "${model}".` : `Model "${model}" is not in the gateway catalog.`,
      };
    } catch (error) {
      return { provider, ok: false, model, models: [], message: `Gateway model catalog failed: ${errorMessage(error)}` };
    }
  }

  private async completeWithOllama(
    system: string,
    prompt: string,
    signal?: AbortSignal
  ): Promise<string> {
    const config = vscode.workspace.getConfiguration('allah');
    const baseUrl = (config.get<string>('ollamaUrl') || 'http://127.0.0.1:11434').replace(/\/+$/, '');
    const model = config.get<string>('agentModel') || 'llama3.1';
    let response: Response;
    try {
      response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          stream: false,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: prompt },
          ],
        }),
        signal: AbortSignal.any([signal ?? new AbortController().signal, AbortSignal.timeout(PROVIDER_TIMEOUT_MS)]),
      });
    } catch (error) {
      throw new Error(`Ollama is unavailable at ${baseUrl}: ${errorMessage(error)}`);
    }
    const payload = await response.json().catch(() => undefined) as {
      message?: { content?: unknown };
      error?: unknown;
    } | undefined;
    if (!response.ok) {
      const detail = typeof payload?.error === 'string' ? payload.error : `HTTP ${response.status}`;
      throw new Error(`Ollama request failed: ${detail}`);
    }
    const content = payload?.message?.content;
    if (typeof content !== 'string' || content.trim().length === 0) {
      throw new Error(`Ollama returned an empty response for model "${model}".`);
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
