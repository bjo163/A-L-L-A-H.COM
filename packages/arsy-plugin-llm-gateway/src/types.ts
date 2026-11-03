export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatChoice {
  index: number;
  message: ChatMessage;
  finish_reason: string;
}

export interface UsageInfo {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost_usd?: number;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatChoice[];
  usage?: UsageInfo;
}

export interface StreamDelta {
  role?: string;
  content?: string;
}

export interface StreamChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: StreamDelta;
    finish_reason: string | null;
  }>;
  usage?: UsageInfo;
}

export interface ProviderRecord {
  id: number;
  name: string;
  slug: string;
  provider_type: 'openai_compatible' | 'anthropic' | 'gemini' | 'ollama';
  base_url: string;
  encrypted_api_key?: string;
  priority: number;
  is_healthy: boolean;
}

export interface ModelRecord {
  id: number;
  name: string;
  model_id: string;
  provider_id: number;
  context_window: number;
  input_cost_per_m: number;
  output_cost_per_m: number;
}

export interface RouteRecord {
  id: number;
  name: string;
  alias: string;
  strategy: 'fallback' | 'lowest_cost' | 'lowest_latency' | 'weighted_rr';
}

export interface VirtualKeyRecord {
  id: number;
  name: string;
  key_prefix: string;
  key_hash: string;
  partner_id?: number;
  budget_limit?: number;
  rate_limit_rpm: number;
  rate_limit_tpm: number;
}

export interface LlmGatewayOptions {
  prefix?: string;
  defaultUpstreamUrl?: string;
  upstreamApiKey?: string;
  anthropicApiKey?: string;
  geminiApiKey?: string;
  ollamaBaseUrl?: string;
}

