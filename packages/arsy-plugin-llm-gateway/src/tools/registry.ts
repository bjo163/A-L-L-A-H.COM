import { logger } from '@allah/arsy-core';
import { dbEngine } from '@allah/arsy-orm';
import type { Tool, ToolContext, ToolResult, RegisteredTool } from './base';

export interface ToolExecutionRecord {
  id: string;
  tool: string;
  actor?: string | null;
  virtualKeyId?: number | null;
  args?: Record<string, unknown>;
  output?: any;
  error?: string | null;
  latencyMs: number;
  status: 'ok' | 'error';
  timestamp: string;
}

export class ToolRegistry {
  private tools = new Map<string, Tool>();
  private executionLog: ToolExecutionRecord[] = [];

  register(tool: Tool): void {
    if (this.tools.has(tool.name)) {
      logger.warn({ tool: tool.name }, 'Overwriting existing tool registration');
    }
    this.tools.set(tool.name, tool);
  }

  list(): RegisteredTool[] {
    return Array.from(this.tools.values()).map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    }));
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  async execute(
    name: string,
    args: Record<string, unknown>,
    context: ToolContext = {}
  ): Promise<ToolResult> {
    const startTime = Date.now();
    const record: ToolExecutionRecord = {
      id: `exec_${cryptoRandom(6)}`,
      tool: name,
      actor: context.actor ?? null,
      virtualKeyId: context.virtualKeyId ?? null,
      args,
      latencyMs: 0,
      status: 'error',
      timestamp: new Date().toISOString(),
    };

    const tool = this.tools.get(name);
    if (!tool) {
      record.error = `Tool '${name}' not found`;
      record.latencyMs = Date.now() - startTime;
      this.executionLog.push(record);
      return { success: false, error: record.error, output: null, latencyMs: record.latencyMs };
    }

    try {
      const result = await tool.execute(args, context);
      record.latencyMs = Date.now() - startTime;
      record.status = result.success ? 'ok' : 'error';
      record.output = result.output;
      record.error = result.error ?? null;
      this.executionLog.push(record);
      this.persistAudit(record).catch((err) => logger.warn({ err }, 'Failed to persist tool audit log'));
      return { success: result.success, output: result.output, error: result.error ?? undefined, latencyMs: record.latencyMs };
    } catch (err: any) {
      record.latencyMs = Date.now() - startTime;
      record.status = 'error';
      record.error = err.message || 'Tool execution threw an exception';
      this.executionLog.push(record);
      this.persistAudit(record).catch((err2) => logger.warn({ err2 }, 'Failed to persist tool audit log'));
      return { success: false, error: record.error, output: null, latencyMs: record.latencyMs };
    }
  }

  getLog(): ToolExecutionRecord[] {
    return [...this.executionLog].reverse();
  }

  getDefinitions(): Array<{ type: 'function'; function: { name: string; description: string; parameters: any } }> {
    return this.list().map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: (tool.inputSchema as any)?.properties || tool.inputSchema,
      },
    }));
  }

  private async persistAudit(record: ToolExecutionRecord): Promise<void> {
    try {
      await dbEngine.query(
        `INSERT INTO ai_usage_log
         (virtual_key_id, provider_id, model_id, prompt_tokens, completion_tokens, total_tokens, cost_usd, latency_ms, status_code, is_cached)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          record.virtualKeyId || null,
          null,
          null,
          0,
          0,
          0,
          0,
          record.latencyMs,
          record.status === 'ok' ? 200 : 500,
          false,
        ]
      );
    } catch {
      // Best-effort audit persistence; in-memory log remains authoritative
    }
  }
}

function cryptoRandom(len: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export const toolRegistry = new ToolRegistry();
