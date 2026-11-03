import * as vscode from 'vscode';
import {
  getGatewayErrorMessage,
  parseModelCatalogResponse,
  parsePlanCompletionResponse,
} from './gatewayContracts';
import type { GatewayModel } from './gatewayContracts';
import type { PlanMarkdownBodies } from './planManager';

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
  private get baseUrl(): string {
    const config = vscode.workspace.getConfiguration('allah');
    return (config.get<string>('gatewayUrl') || 'http://127.0.0.1:5150').replace(/\/+$/, '');
  }

  private get arsyBaseUrl(): string {
    const config = vscode.workspace.getConfiguration('allah');
    return (config.get<string>('arsyUrl') || 'http://127.0.0.1:5150').replace(/\/+$/, '');
  }

  private get apiKey(): string {
    const config = vscode.workspace.getConfiguration('allah');
    return config.get<string>('apiKey') || '';
  }

  get arsyDocsUrl(): string {
    return `${this.arsyBaseUrl}/docs`;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  private async createHttpError(response: Response, operation: string): Promise<Error> {
    const body = await response.text();
    let payload: unknown;
    if (body.trim()) {
      try {
        payload = JSON.parse(body);
      } catch {
        payload = undefined;
      }
    }

    const detail = getGatewayErrorMessage(payload);
    return new Error(
      detail ? `${operation} failed (HTTP ${response.status}): ${detail}` : `${operation} failed (HTTP ${response.status}).`
    );
  }

  async checkHealth(): Promise<{ ok: boolean; latencyMs: number; details?: HealthResponse; message?: string }> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(5000),
      });
      const latencyMs = Date.now() - start;
      if (!response.ok) {
        return { ok: false, latencyMs, message: `HTTP ${response.status}` };
      }

      const payload: unknown = await response.json();
      if (!isRecord(payload) || payload.success !== true || !isRecord(payload.data)) {
        const detail = getGatewayErrorMessage(payload);
        return { ok: false, latencyMs, message: detail || 'Invalid health response envelope.' };
      }

      const details = payload.data as HealthResponse;
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
    const check = async (endpoint: '/health' | '/ready'): Promise<ServiceCheck> => {
      try {
        const response = await fetch(`${this.arsyBaseUrl}${endpoint}`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) {
          return { ok: false, message: `HTTP ${response.status}` };
        }

        const payload: unknown = await response.json();
        if (!isRecord(payload) || payload.success !== true || !isRecord(payload.data)) {
          const detail = getGatewayErrorMessage(payload);
          return { ok: false, message: detail || 'Invalid Arsy response envelope.' };
        }

        if (endpoint === '/health' && payload.data.status !== 'ok') {
          return { ok: false, message: 'Health endpoint did not report status "ok".' };
        }
        if (endpoint === '/ready' && payload.data.ready !== true) {
          return { ok: false, message: 'Readiness endpoint did not report ready.' };
        }
        return { ok: true, message: 'HTTP 200' };
      } catch (error) {
        return { ok: false, message: errorMessage(error) };
      }
    };

    const [health, readiness] = await Promise.all([check('/health'), check('/ready')]);
    return { health, readiness };
  }

  async fetchModels(): Promise<GatewayModel[]> {
    const response = await fetch(`${this.baseUrl}/v1/models`, {
      method: 'GET',
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      throw await this.createHttpError(response, 'Fetching the gateway model catalog');
    }
    return parseModelCatalogResponse(await response.json());
  }

  async generatePlanSpec(featurePrompt: string): Promise<PlanMarkdownBodies> {
    const model = vscode.workspace.getConfiguration('allah').get<string>('plannerModel') || 'dx-reasoning';
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(60000),
      body: JSON.stringify({
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
      }),
    });

    if (!response.ok) {
      throw await this.createHttpError(response, 'Generating a plan');
    }

    return parsePlanCompletionResponse(await response.json());
  }
}
