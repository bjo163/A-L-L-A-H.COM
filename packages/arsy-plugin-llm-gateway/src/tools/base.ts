import type { ToolResult } from '@moonwitness/types';
export type { ToolResult } from '@moonwitness/types';

export interface ToolContext {
  virtualKeyId?: number | null;
  actor?: string | null;
  requestId?: string | null;
}

export interface Tool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute(args: Record<string, unknown>, context?: ToolContext): Promise<ToolResult>;
}

export interface RegisteredTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}
