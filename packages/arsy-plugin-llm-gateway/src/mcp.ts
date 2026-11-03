import { logger } from '@allah/arsy-core';
import { toolRegistry } from './tools';
import type { RegisteredTool, ToolResult } from './tools/base';
import type { JsonRpcRequest, JsonRpcResponse, McpTool } from '@moonwitness/types';

export const MCP_PROTOCOL_VERSION = '2025-06-12';

// JSON-RPC 2.0 error codes
export const JSON_RPC_ERRORS = {
  PARSE_ERROR: { code: -32700, message: 'Parse error' },
  INVALID_REQUEST: { code: -32600, message: 'Invalid Request' },
  METHOD_NOT_FOUND: { code: -32601, message: 'Method not found' },
  INVALID_PARAMS: { code: -32602, message: 'Invalid params' },
  INTERNAL_ERROR: { code: -32603, message: 'Internal error' },
} as const;

function makeErrorResponse(id: string | number | null, error: { code: number; message: string; data?: unknown }): JsonRpcResponse {
  return { jsonrpc: '2.0', id, error };
}

function makeSuccessResponse(id: string | number | null, result: unknown): JsonRpcResponse {
  return { jsonrpc: '2.0', id, result };
}

export class McpHandler {
  async handle(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    // Validate JSON-RPC 2.0 envelope
    if (!request || request.jsonrpc !== '2.0' || typeof request.method !== 'string') {
      return makeErrorResponse((request as any)?.id ?? null, JSON_RPC_ERRORS.INVALID_REQUEST);
    }

    const { method, params = {}, id } = request;

    try {
      switch (method) {
        case 'initialize':
          return this.handleInitialize(id);
        case 'initialized':
          return { jsonrpc: '2.0', id, result: null };
        case 'tools/list':
          return this.handleToolsList(id);
        case 'tools/call':
          return await this.handleToolsCall(id, params as Record<string, unknown>);
        case 'ping':
          return makeSuccessResponse(id, {});
        default:
          return makeErrorResponse(id, JSON_RPC_ERRORS.METHOD_NOT_FOUND);
      }
    } catch (err: any) {
      logger.error({ err, method }, 'MCP handler error');
      return makeErrorResponse(id, JSON_RPC_ERRORS.INTERNAL_ERROR);
    }
  }

  private handleInitialize(_id: string | number | null): JsonRpcResponse {
    return makeSuccessResponse(_id, {
      protocolVersion: MCP_PROTOCOL_VERSION,
      capabilities: {
        tools: { listChanged: false },
      },
      serverInfo: {
        name: 'arsy-mcp',
        version: '0.1.0',
      },
    });
  }

  private handleToolsList(_id: string | number | null): JsonRpcResponse {
    const tools = toolRegistry.list().map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    }));
    return makeSuccessResponse(_id, { tools });
  }

  private async handleToolsCall(
    _id: string | number | null,
    params: Record<string, unknown>
  ): Promise<JsonRpcResponse> {
    const name = typeof params.name === 'string' ? params.name : undefined;
    const arguments_ = params.arguments && typeof params.arguments === 'object' ? (params.arguments as Record<string, unknown>) : {};

    if (!name) {
      return makeErrorResponse(_id, JSON_RPC_ERRORS.INVALID_PARAMS);
    }

    if (!toolRegistry.has(name)) {
      return makeErrorResponse(_id, JSON_RPC_ERRORS.METHOD_NOT_FOUND);
    }

    const result = await toolRegistry.execute(name, arguments_);

    const mcpResult: Record<string, unknown> = {
      structuredContent: {
        success: result.success,
        output: result.output,
        error: result.error ?? null,
        latencyMs: result.latencyMs,
      },
    };

    if (result.success) {
      mcpResult.content = [
        { type: 'text', text: JSON.stringify(result.output, null, 2) },
      ];
    } else {
      mcpResult.content = [
        { type: 'text', text: `Error: ${result.error}` },
      ];
      mcpResult.isError = true;
    }

    return makeSuccessResponse(_id, mcpResult);
  }
}

export const mcpHandler = new McpHandler();
