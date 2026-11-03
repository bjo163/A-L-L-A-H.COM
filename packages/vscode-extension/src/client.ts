import * as vscode from 'vscode';

interface HealthResponse {
  status?: string;
  version?: string;
  [key: string]: unknown;
}

interface ModelsResponse {
  object: string;
  data: Array<{
    id: string;
    object: string;
    created?: number;
    owned_by?: string;
  }>;
}

export class MoonWitnessClient {
  private get baseUrl(): string {
    const config = vscode.workspace.getConfiguration('allah');
    return (config.get<string>('gatewayUrl') || 'http://127.0.0.1:5150').replace(/\/+$/, '');
  }

  private get apiKey(): string {
    const config = vscode.workspace.getConfiguration('allah');
    return config.get<string>('apiKey') || '';
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  async checkHealth(): Promise<{ ok: boolean; latencyMs: number; details?: HealthResponse }> {
    const start = Date.now();
    try {
      const res = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      const latencyMs = Date.now() - start;
      if (res.ok) {
        const details = (await res.json().catch(() => ({}))) as HealthResponse;
        return { ok: true, latencyMs, details };
      }
      return { ok: false, latencyMs };
    } catch {
      return { ok: false, latencyMs: Date.now() - start };
    }
  }

  async fetchModels(): Promise<Array<{ id: string; owned_by?: string }>> {
    try {
      const res = await fetch(`${this.baseUrl}/v1/models`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch models: HTTP ${res.status}`);
      }
      const data = (await res.json()) as ModelsResponse;
      return data.data || [];
    } catch (err) {
      vscode.window.showErrorMessage(`MoonWitness LLM Router error: ${err instanceof Error ? err.message : String(err)}`);
      return [];
    }
  }
}

