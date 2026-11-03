import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamChunk,
  UsageInfo,
} from '../types';

export interface ProviderAdapter {
  slug: string;
  isConfigured(): boolean;
  chat(req: ChatCompletionRequest, upstreamModel: string): Promise<ChatCompletionResponse>;
  chatStream(
    req: ChatCompletionRequest,
    upstreamModel: string,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<UsageInfo>;
}
