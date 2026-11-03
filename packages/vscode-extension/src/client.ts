import * as vscode from 'vscode';
import {
  createClient,
  type SessionTokenStore,
  type SwarmAgentMessage,
  type SwarmExecutionResult,
  type SwarmStep,
} from '@allah/sdk';
import {
  getGatewayErrorMessage,
  parsePlanCompletionResponse,
} from './gatewayContracts';
import type { GatewayModel } from './gatewayContracts';
import type { PlanMarkdownBodies } from './planManager';

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

  private async createSdkClient(baseUrl = this.baseUrl, useApiKey = true) {
    const sessionStore: SessionTokenStore = {
      get: async () => (await this.context.secrets.get(SESSION_TOKEN_SECRET)) ?? null,
      set: async (token) => this.context.secrets.store(SESSION_TOKEN_SECRET, token),
      clear: async () => this.context.secrets.delete(SESSION_TOKEN_SECRET),
    };
    const virtualKey = useApiKey ? await this.context.secrets.get(API_KEY_SECRET) : undefined;
    return createClient({
      baseUrl,
      sessionStore,
      ...(virtualKey === undefined ? {} : { virtualKey }),
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
    onEvent: (
      event: string,
      data: SwarmStep | SwarmAgentMessage | SwarmExecutionResult | { error: string }
    ) => void,
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
    const content = response.choices[0]?.message.content;
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
}
