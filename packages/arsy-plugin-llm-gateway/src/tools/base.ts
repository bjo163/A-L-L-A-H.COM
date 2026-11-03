export interface ToolContext {
  virtualKeyId?: number | null;
  actor?: string | null;
  requestId?: string | null;
}

export interface ToolResult {
  success: boolean;
  output: any;
  error?: string | null;
  latencyMs?: number;
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
