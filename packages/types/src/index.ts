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

