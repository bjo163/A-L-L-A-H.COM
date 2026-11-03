import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamChunk,
  UsageInfo,
} from '../types';

export interface EmbeddingsRequest {
  model: string;
  input: string | string[];
  encoding_format?: 'float' | 'base64';
}

export interface EmbeddingsResponse {
  object: 'list';
  data: Array<{
    object: 'embedding';
    index: number;
    embedding: number[];
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface ProviderAdapter {
  slug: string;
  isConfigured(): boolean;
  chat(req: ChatCompletionRequest, upstreamModel: string): Promise<ChatCompletionResponse>;
  chatStream(
    req: ChatCompletionRequest,
    upstreamModel: string,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<UsageInfo>;
  embeddings?(req: EmbeddingsRequest): Promise<EmbeddingsResponse>;
}

