/**
 * MoonWitness Universal Identity Contracts
 */
export interface UserSubject {
  id: number;
  email: string;
  name: string;
  status: 'active' | 'suspended' | 'pending';
  companyId?: number;
  twoFactorEnabled?: boolean;
}

export interface ActiveSession {
  id: number;
  sessionToken: string;
  deviceName?: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: string;
  isCurrent?: boolean;
  revoked?: boolean;
}

export interface AuthResponse {
  user: UserSubject;
  sessionToken: string;
  token?: string;
}

/**
 * Smart LLM Router Contracts
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    estimated_cost_usd?: number;
  };
}

export interface ChatCompletionChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

export interface GatewayModelInfo {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  displayName?: string;
}

export interface GatewayTelemetry {
  metrics: {
    totalRequests: number;
    totalTokens: number;
    totalCostUsd: number;
    avgLatencyMs: number;
  };
  circuits: Record<string, { healthy: boolean; failures: number; isOpen: boolean }>;
}

export interface GatewayProviderInfo {
  id: number;
  name: string;
  slug: string;
  provider_type: string;
  base_url: string;
  priority: number;
  is_healthy: boolean;
}

export interface GatewayUsageLog {
  id: number;
  provider_name?: string;
  model_name?: string;
  key_name?: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
  latency_ms: number;
  status_code: number;
  is_cached: boolean;
  create_date?: string;
}

/**
 * Server-Driven UI (SDUI) Contracts
 */
export interface SDUINode {
  type: string;
  props?: Record<string, any>;
  children?: SDUINode[] | string;
}

export interface SDUIRoot {
  version: string;
  title?: string;
  layout: SDUINode;
}

/**
 * Echolog Content-Addressed Storage Contracts
 */
export interface StorageItem {
  id: number;
  sha256: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  createDate: string;
}

/**
 * LLM Tool Calling Contracts (Phase 3)
 */
export interface ToolParameter {
  type: string;
  description?: string;
  enum?: string[];
  items?: ToolParameter;
  properties?: Record<string, ToolParameter>;
  required?: string[];
  default?: unknown;
}

export interface ToolFunction {
  name: string;
  description?: string;
  parameters: Record<string, ToolParameter>;
}

export interface ToolDefinition {
  type: 'function';
  function: ToolFunction;
}

export interface ToolCallFunction {
  name: string;
  arguments: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: ToolCallFunction;
}

export type ToolChoice = 'none' | 'auto' | 'required' | { type: 'function'; function: { name: string } };

export interface ToolResult {
  success: boolean;
  output: any;
  error?: string | null;
  latencyMs?: number;
}

/**
 * Model Context Protocol (MCP) Contracts (Phase 3)
 */
export interface JsonRpcRequest {
  jsonrpc: string;
  method: string;
  params?: Record<string, unknown> | unknown[];
  id: string | number | null;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface McpToolsListResult {
  tools: McpTool[];
}

export interface McpToolCallResult {
  content: Array<{ type: string; text?: string }>;
  isError?: boolean;
  structuredContent?: Record<string, unknown>;
}

export const MCP_PROTOCOL_VERSION = '2025-06-12';

