
import crypto from 'crypto';
import { request as undiciRequest } from 'undici';
import { logger } from '@allah/arsy-core';
import type { ProviderAdapter } from './base';
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamChunk,
  UsageInfo,
  ToolDefinition,
  ToolChoice,
  ToolCall,
} from '../types';
import { validateUrlSsrf } from '../ssrf';

export class AnthropicAdapter implements ProviderAdapter {
  readonly slug: string;
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(slug = 'anthropic', baseUrl = 'https://api.anthropic.com/v1', apiKey?: string) {
    this.slug = slug;
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.apiKey = apiKey;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }


  private extractText(content: string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>): string {
    if (typeof content === 'string') return content;
    return content.filter(c => c.type === 'text').map(c => c.text).join(' ');
  }

  private transformMessages(messages: ChatCompletionRequest['messages']): {
    system?: string;
    anthropicMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
  } {
    let systemPrompt = '';
    const anthropicMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
         systemPrompt = systemPrompt ? `${systemPrompt}

${this.extractText(msg.content)}` : this.extractText(msg.content);
      } else if (msg.role === 'user' || msg.role === 'assistant') {
        anthropicMessages.push({
          role: msg.role,
           content: this.extractText(msg.content),
        });
      }
    }

    if (anthropicMessages.length === 0) {
      anthropicMessages.push({ role: 'user', content: 'Hello' });
    }

    return {
      system: systemPrompt || undefined,
      anthropicMessages,
    };
  }

  private transformTools(tools?: ToolDefinition[]): Array<{ name: string; description?: string; input_schema: Record<string, unknown> }> {
    if (!tools || tools.length === 0) return [];
    return tools.map((t) => ({
      name: t.function.name,
      description: t.function.description,
      input_schema: t.function.parameters,
    }));
  }

  private transformToolChoice(choice?: ToolChoice): Record<string, unknown> | undefined {
    if (!choice) return undefined;
    if (choice === 'none') return { type: 'none' };
    if (choice === 'auto') return { type: 'auto' };
    if (choice === 'required') return { type: 'any' };
    if (choice.type === 'function') {
      return { type: 'tool', name: choice.function.name, disable_parallel_tool_use: true };
    }
    return undefined;
  }

  private extractToolCalls(contentBlocks: any[]): ToolCall[] {
    const calls: ToolCall[] = [];
    for (const block of contentBlocks) {
      if (block.type === 'tool_use') {
        calls.push({
          id: block.id || `call_${crypto.randomBytes(4).toString('hex')}`,
          type: 'function',
          function: {
            name: block.name || '',
            arguments: typeof block.input === 'string' ? block.input : JSON.stringify(block.input || {}),
          },
        });
      }
    }
    return calls;
  }

  async chat(req: ChatCompletionRequest, upstreamModel: string): Promise<ChatCompletionResponse> {
    if (!this.apiKey) {
      throw new Error(`Anthropic API Key not configured for provider [${this.slug}]`);
    }

    if (!validateUrlSsrf(this.baseUrl)) {
      throw new Error(`Anthropic Base URL '${this.baseUrl}' rejected by SSRF guard`);
    }

    const { system, anthropicMessages } = this.transformMessages(req.messages);

    const payload: Record<string, unknown> = {
      model: upstreamModel,
      max_tokens: req.max_tokens || 4096,
      messages: anthropicMessages,
      temperature: req.temperature ?? 0.7,
    };

    const anthropicTools = this.transformTools(req.tools);
    if (anthropicTools.length > 0) {
      payload.tools = anthropicTools;
    }

    const anthropicToolChoice = this.transformToolChoice(req.tool_choice);
    if (anthropicToolChoice) {
      payload.tool_choice = anthropicToolChoice;
    }

    if (system) {
      payload.system = system;
    }

    const response = await undiciRequest(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    });

    if (response.statusCode < 200 || response.statusCode >= 300) {
      const errorText = await response.body.text().catch(() => '');
      throw new Error(`Anthropic Provider returned HTTP ${response.statusCode}: ${errorText}`);
    }

    const json = (await response.body.json()) as any;
    const contentBlocks = json.content || [];
    const textContent = contentBlocks
      .filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join('\n');
    const toolCalls = this.extractToolCalls(contentBlocks);

    return {
      id: json.id || `msg-${crypto.randomBytes(8).toString('hex')}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: req.model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: textContent,
            ...(toolCalls.length > 0 ? { tool_calls: toolCalls } : {}),
          },
          finish_reason: json.stop_reason === 'end_turn' ? 'stop' : json.stop_reason || 'stop',
        },
      ],
      usage: json.usage
        ? {
            prompt_tokens: json.usage.input_tokens || 0,
            completion_tokens: json.usage.output_tokens || 0,
            total_tokens: (json.usage.input_tokens || 0) + (json.usage.output_tokens || 0),
          }
        : undefined,
    };
  }

  async chatStream(
    req: ChatCompletionRequest,
    upstreamModel: string,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<UsageInfo> {
    if (!this.apiKey) {
      throw new Error(`Anthropic API Key not configured for provider [${this.slug}]`);
    }

    if (!validateUrlSsrf(this.baseUrl)) {
      throw new Error(`Anthropic Base URL '${this.baseUrl}' rejected by SSRF guard`);
    }

    const { system, anthropicMessages } = this.transformMessages(req.messages);

    const payload: Record<string, unknown> = {
      model: upstreamModel,
      max_tokens: req.max_tokens || 4096,
      messages: anthropicMessages,
      temperature: req.temperature ?? 0.7,
      stream: true,
    };

    const anthropicTools = this.transformTools(req.tools);
    if (anthropicTools.length > 0) {
      payload.tools = anthropicTools;
    }

    const anthropicToolChoice = this.transformToolChoice(req.tool_choice);
    if (anthropicToolChoice) {
      payload.tool_choice = anthropicToolChoice;
    }

    if (system) {
      payload.system = system;
    }

    const response = await undiciRequest(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    });

    if (response.statusCode < 200 || response.statusCode >= 300) {
      const errorText = await response.body.text().catch(() => '');
      throw new Error(`Anthropic Provider stream failed with HTTP ${response.statusCode}: ${errorText}`);
    }

    let promptTokens = 0;
    let completionTokens = 0;
    let streamId = `msg-${crypto.randomBytes(8).toString('hex')}`;
    let buffer = '';

    for await (const chunk of response.body) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;

        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.type === 'message_start' && data.message) {
              streamId = data.message.id || streamId;
              if (data.message.usage) {
                promptTokens = data.message.usage.input_tokens || 0;
              }
              onChunk({
                id: streamId,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model: req.model,
                choices: [{ index: 0, delta: { role: 'assistant', content: '' }, finish_reason: null }],
              });
            } else if (data.type === 'content_block_delta' && data.delta?.text) {
              onChunk({
                id: streamId,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model: req.model,
                choices: [{ index: 0, delta: { content: data.delta.text }, finish_reason: null }],
              });
            } else if (data.type === 'message_delta' && data.usage) {
              completionTokens = data.usage.output_tokens || 0;
            } else if (data.type === 'message_stop') {
              onChunk({
                id: streamId,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model: req.model,
                choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
              });
            }
          } catch (e) {
            logger.warn({ err: e, line: trimmed }, 'Failed parsing Anthropic SSE chunk');
          }
        }
      }
    }

    return {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: promptTokens + completionTokens,
    };
  }
}