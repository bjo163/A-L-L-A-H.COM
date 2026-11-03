import { toolRegistry } from '../tools';
import { SmartRouter } from '../router';
import { dbEngine } from '@allah/arsy-orm';
import crypto from 'crypto';
import { logger } from '@allah/arsy-core';
import type { Tool, ToolContext, ToolResult } from '../tools';
import type { AgentThought, AgentToolCallEvent, AgentToolResultEvent, AgentSduiEvent, AgentStreamEvent, AgentStep, AgentRunRequest, AgentRunResponse } from '@moonwitness/types';

type SSECallback = (event: string, data: string) => void;

interface AgentSession {
  id: string;
  prompt: string;
  max_steps: number;
  timeoutMs: number;
  allowedTools: string[];
  temperature: number;
  step: number;
  consecutiveSameCalls: Map<string, number>;
  startedAt: number;
  timeoutId: ReturnType<typeof setTimeout> | null;
  status: 'running' | 'completed' | 'max_steps' | 'loop_detected' | 'timeout' | 'error';
  thoughts: AgentThought[];
  toolCalls: AgentToolCallEvent[];
  toolResults: AgentToolResultEvent[];
  sduiEvents: AgentSduiEvent[];
  finalResponse: string;
  company_id?: string;
}

const MAX_STEPS_DEFAULT = 8;
const MAX_CONSECUTIVE_SAME_CALLS = 3;
const DEFAULT_STEP_TIMEOUT_MS = 30000;

class AgentLoop {
  private sessions = new Map<string, AgentSession>();

  createSession(request: AgentRunRequest): string {
    const sessionId = `agent_${crypto.randomBytes(8).toString('hex')}`;
    const session: AgentSession = {
      id: sessionId,
      prompt: request.prompt,
      max_steps: request.max_steps ?? MAX_STEPS_DEFAULT,
      timeoutMs: request.timeout_ms ?? DEFAULT_STEP_TIMEOUT_MS,
      allowedTools: request.allowed_tools ?? [],
      temperature: request.temperature ?? 0.2,
      step: 1,
      consecutiveSameCalls: new Map(),
      startedAt: Date.now(),
      timeoutId: null,
      status: 'running',
      thoughts: [],
      toolCalls: [],
      toolResults: [],
      sduiEvents: [],
      finalResponse: '',
      company_id: request.company_id,
    };

    this.sessions.set(sessionId, session);
    this.executeStep(sessionId);
    return sessionId;
  }

  getSession(sessionId: string): AgentSession | undefined {
    return this.sessions.get(sessionId);
  }

  run(request: AgentRunRequest, callback: SSECallback): void {
    const sessionId = this.createSession(request);
    this.streamSessionEvents(sessionId, callback);
  }

  async executeStep(sessionId: string): Promise<void> {
    const session = this.getSession(sessionId);
    if (!session || session.status !== 'running') return;

    if (session.step > session.max_steps) {
      await this.completeSession(sessionId, 'max_steps');
      return;
    }

    // Loop detection: check if same tool args executed 3 times consecutively
    const key = `${session.toolCalls[session.toolCalls.length - 1]?.call_id || ''}:${JSON.stringify(session.toolResults[session.toolResults.length - 1]?.result || '')}`;
    if (key) {
      const count = session.consecutiveSameCalls.get(key) ?? 0;
      if (count >= MAX_CONSECUTIVE_SAME_CALLS) {
        await this.completeSession(sessionId, 'loop_detected');
        return;
      }
      session.consecutiveSameCalls.set(key, count + 1);
    }

    // Step timeout check
    if (session.timeoutId) {
      clearTimeout(session.timeoutId);
    }
    session.timeoutId = setTimeout(async () => {
      await this.completeSession(sessionId, 'timeout');
    }, session.timeoutMs);

    // Emit thought event
    this.emitSSE(sessionId, 'thought', JSON.stringify({
      step: session.step,
      thought: `Step ${session.step}: Reasoning about prompt and selecting tools...`,
    }));

    // Get model response with available tools
    try {
      const resolution = await this.resolveRoute('dx-default');
      const model = resolution.targetChain[0]?.adapter;

      // Build tool definitions from registry for the model
      const toolDefinitions = this.buildToolDefinitions();

      const response = await model.chat({
        model: resolution.targetChain[0]?.model?.model_id || 'dx-default',
        messages: this.buildConversationHistory(session),
        temperature: session.temperature,
        stream: false,
        tools: toolDefinitions,
      });

      // Parse tool calls from response
      const toolCalls = this.extractToolCalls(response);

      if (toolCalls.length > 0) {
        // Execute each tool call
        for (const tc of toolCalls) {
          await this.executeToolCall(sessionId, session.step, tc);
        }
      } else {
        // No tool calls - final response
        const finalText = response.choices?.[0]?.message?.content || '';
        await this.finalizeSession(sessionId, finalText);
      }
    } catch (err: any) {
      logger.error({ err, sessionId }, 'Agent step failed');
      await this.completeSession(sessionId, 'error');
    }
  }

  private async executeToolCall(sessionId: string, step: number, toolCall: { name: string; arguments: Record<string, unknown> }): Promise<void> {
    const session = this.getSession(sessionId);
    if (!session) return;

    const { name: toolName, arguments: args } = toolCall;

    // Emit tool_call event
    this.emitSSE(sessionId, 'tool_call', JSON.stringify({
      step,
      call_id: `call_${crypto.randomBytes(6).toString('hex')}`,
      tool: toolName,
      arguments: args,
    }));

    try {
      const result: ToolResult = await toolRegistry.execute(toolName, args, { virtualKeyId: 1 });

      // Emit tool_result event
      this.emitSSE(sessionId, 'tool_result', JSON.stringify({
        step,
        call_id: `call_${crypto.randomBytes(6).toString('hex')}`,
        tool: toolName,
        success: result.success,
        output: result.output,
        error: result.error ?? undefined,
        latency_ms: result.latencyMs,
      }));

      // Continue loop with observation
      if (result.success && result.output) {
        await this.executeStep(sessionId);
      } else {
        await this.finalizeSession(sessionId, result.error || 'Tool execution failed' || '');
      }
    } catch (err: any) {
      logger.error({ err, sessionId, tool: toolName }, 'Tool execution failed');

      this.emitSSE(sessionId, 'tool_result', JSON.stringify({
        step,
        call_id: `call_${crypto.randomBytes(6).toString('hex')}`,
        tool: toolName,
        success: false,
        output: null,
        error: err.message || 'Tool execution threw an exception',
        latency_ms: 0,
      }));

      await this.finalizeSession(sessionId, err.message || 'Tool execution failed');
    }
  }

  async streamSessionEvents(sessionId: string, callback: SSECallback): Promise<void> {
    const session = this.getSession(sessionId);
    if (!session) return;

    // Stream initial thought
    this.emitSSE(sessionId, 'thought', JSON.stringify({
      step: session.step,
      thought: `Step ${session.step}: Reasoning about prompt and selecting tools...`,
    }));

    // Execute step-by-step, emitting events via callback
    await this.executeStepWithCallbacks(sessionId, callback);
  }

  private async executeStepWithCallbacks(sessionId: string, callback: SSECallback): Promise<void> {
    const session = this.getSession(sessionId);
    if (!session || session.status !== 'running') return;

    if (session.step > session.max_steps) {
      await this.completeSession(sessionId, 'max_steps');
      callback('done', JSON.stringify({
        total_steps: session.step - 1,
        tools_called: this.getToolsCalled(session),
        finish_reason: 'max_steps',
      }));
      return;
    }

    // Loop detection: check if same tool args executed 3 times consecutively
    const key = `${session.toolCalls[session.toolCalls.length - 1]?.call_id || ''}:${JSON.stringify(session.toolResults[session.toolResults.length - 1]?.result || '')}`;
    if (key) {
      const count = session.consecutiveSameCalls.get(key) ?? 0;
      if (count >= MAX_CONSECUTIVE_SAME_CALLS) {
        await this.completeSession(sessionId, 'loop_detected');
        callback('done', JSON.stringify({
          total_steps: session.step - 1,
          tools_called: this.getToolsCalled(session),
          finish_reason: 'loop_detected',
        }));
        return;
      }
      session.consecutiveSameCalls.set(key, count + 1);
    }

    // Step timeout check
    if (session.timeoutId) {
      clearTimeout(session.timeoutId);
    }
    session.timeoutId = setTimeout(async () => {
      await this.completeSession(sessionId, 'timeout');
      callback('done', JSON.stringify({
        total_steps: session.step - 1,
        tools_called: this.getToolsCalled(session),
        finish_reason: 'timeout',
      }));
    }, session.timeoutMs);

    // Emit thought event
    callback('thought', JSON.stringify({
      step: session.step,
      thought: `Step ${session.step}: Reasoning about prompt and selecting tools...`,
    }));

    // Get model response with available tools
    try {
      const resolution = await this.resolveRoute('dx-default');
      const model = resolution.targetChain[0]?.adapter;

      // Build tool definitions from registry for the model
      const toolDefinitions = this.buildToolDefinitions();

      const response = await model.chat({
        model: resolution.targetChain[0]?.model?.model_id || 'dx-default',
        messages: this.buildConversationHistory(session),
        temperature: session.temperature,
        stream: false,
        tools: toolDefinitions,
      });

      // Parse tool calls from response
      const toolCalls = this.extractToolCalls(response);

      if (toolCalls.length > 0) {
        // Execute each tool call
        for (const tc of toolCalls) {
          await this.executeToolCallWithCallbacks(sessionId, session.step, tc, callback);
        }
      } else {
        // No tool calls - final response
        const finalText = response.choices?.[0]?.message?.content || '';
        await this.finalizeSession(sessionId, finalText);
        callback('message', JSON.stringify({
          step: session.step,
          delta: finalText,
        }));
        callback('done', JSON.stringify({
          total_steps: session.step,
          tools_called: this.getToolsCalled(session),
          finish_reason: 'completed',
        }));
      }
    } catch (err: any) {
      logger.error({ err, sessionId }, 'Agent step failed');
      await this.completeSession(sessionId, 'error');
      callback('done', JSON.stringify({
        total_steps: session.step - 1,
        tools_called: this.getToolsCalled(session),
        finish_reason: 'error',
        error: err.message || 'Agent execution failed',
      }));
    }
  }

  private async executeToolCallWithCallbacks(sessionId: string, step: number, toolCall: { name: string; arguments: Record<string, unknown> }, callback: SSECallback): Promise<void> {
    const session = this.getSession(sessionId);
    if (!session) return;

    const { name: toolName, arguments: args } = toolCall;

    // Emit tool_call event
    callback('tool_call', JSON.stringify({
      step,
      call_id: `call_${crypto.randomBytes(6).toString('hex')}`,
      tool: toolName,
      arguments: args,
    }));

    try {
      const result: ToolResult = await toolRegistry.execute(toolName, args, { virtualKeyId: 1 });

      // Emit tool_result event
      callback('tool_result', JSON.stringify({
        step,
        call_id: `call_${crypto.randomBytes(6).toString('hex')}`,
        tool: toolName,
        success: result.success,
        output: result.output,
        error: result.error ?? undefined,
        latency_ms: result.latencyMs,
      }));

      // Continue loop with observation
      if (result.success && result.output) {
        await this.executeStepWithCallbacks(sessionId, callback);
      } else {
        await this.finalizeSession(sessionId, result.error || 'Tool execution failed' || '');
        callback('message', JSON.stringify({
          step,
          delta: result.error || 'Tool execution failed' || '',
        }));
        callback('done', JSON.stringify({
          total_steps: session.step,
          tools_called: this.getToolsCalled(session),
          finish_reason: 'completed',
        }));
      }
    } catch (err: any) {
      logger.error({ err, sessionId, tool: toolName }, 'Tool execution failed');

      callback('tool_result', JSON.stringify({
        step,
        call_id: `call_${crypto.randomBytes(6).toString('hex')}`,
        tool: toolName,
        success: false,
        output: null,
        error: err.message || 'Tool execution threw an exception',
        latency_ms: 0,
      }));

      callback('message', JSON.stringify({
        step,
        delta: err.message || 'Tool execution failed',
      }));
      callback('done', JSON.stringify({
        total_steps: session.step,
        tools_called: this.getToolsCalled(session),
        finish_reason: 'error',
        error: err.message || 'Tool execution failed',
      }));
    }
  }

  private async completeSession(sessionId: string, finishReason: AgentRunResponse['finish_reason']): Promise<void> {
    const session = this.getSession(sessionId);
    if (!session) return;

    session.status = finishReason as any;
    if (session.timeoutId) {
      clearTimeout(session.timeoutId);
    }

    this.sessions.delete(sessionId);
  }

  private getToolsCalled(session: AgentSession): string[] {
    const called = new Set<string>();
    for (const tc of session.toolCalls) {
      called.add(tc.tool);
    }
    for (const tr of session.toolResults) {
      called.add(tr.tool);
    }
    return Array.from(called);
  }

  private async finalizeSession(sessionId: string, finalResponse: string): Promise<void> {
    const session = this.getSession(sessionId);
    if (!session) return;

    session.finalResponse = finalResponse;
    session.status = 'completed';

    await this.completeSession(sessionId, 'completed');
  }

  private emitSSE(sessionId: string, event: string, data: string): void {
    const session = this.getSession(sessionId);
    if (!session) return;

    // Store the event
    switch (event) {
      case 'thought':
        session.thoughts.push({
          step: session.step,
          thought: data,
          timestamp: new Date().toISOString(),
        });
        break;
      case 'tool_call':
        const callEvent = JSON.parse(data) as AgentToolCallEvent;
        session.toolCalls.push(callEvent);
        break;
      case 'tool_result':
        const resultEvent = JSON.parse(data) as AgentToolResultEvent;
        session.toolResults.push(resultEvent);
        break;
      case 'sdui':
        const sduiEvent = JSON.parse(data) as AgentSduiEvent;
        session.sduiEvents.push(sduiEvent);
        break;
    }

    logger.info({ sessionId, event, data }, 'Agent SSE event');
  }

  private buildConversationHistory(session: AgentSession): Array<{ role: string; content: string }> {
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: session.prompt },
    ];

    // Append previous thoughts and tool results as messages
    for (let i = 0; i < session.thoughts.length; i++) {
      messages.push({ role: 'user', content: `Thought step ${session.thoughts[i].step}: ${session.thoughts[i].thought}` });
    }
    for (let i = 0; i < session.toolResults.length; i++) {
      const tr = session.toolResults[i];
      messages.push({ role: 'user', content: `Tool result step ${tr.step}: ${JSON.stringify(tr.result || null)}` });
    }

    return messages;
  }

  private buildToolDefinitions(): Array<{ type: 'function'; function: { name: string; description: string; parameters: Record<string, unknown> } }> {
    const tools = toolRegistry.list();
    return tools.map((t) => ({
      type: 'function' as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.inputSchema,
      },
    }));
  }

  private extractToolCalls(response: any): Array<{ name: string; arguments: Record<string, unknown> }> {
    const choices = response.choices || [];
    if (choices.length === 0) return [];

    const message = choices[0]?.message;
    if (!message || !message.tool_calls) return [];

    return message.tool_calls.map((tc: any) => ({
      name: tc.function?.name || '',
      arguments: JSON.parse(tc.function?.arguments || '{}'),
    }));
  }

  private async resolveRoute(model: string): Promise<{ targetChain: Array<{ adapter: any; model: any }> }> {
    const router = new SmartRouter({});
    return router.resolveRoute(model);
  }
}

// Export singleton for SDK use
export const agentLoop = new AgentLoop();

export async function runAgent(request: AgentRunRequest): Promise<AgentRunResponse> {
  const sessionId = agentLoop.createSession(request);

  // Return immediate response - in production this would be SSE or polled
  const session = agentLoop.getSession(sessionId);
  if (!session) {
    throw new Error('Failed to create agent session');
  }

  return {
    success: session.status === 'completed',
    session_id: sessionId,
    steps: [], // Would be populated after completion in polling model
    final_response: session.finalResponse,
    total_steps: session.max_steps,
    tools_called: [],
    finish_reason: session.status as AgentRunResponse['finish_reason'],
    error: session.status !== 'completed' ? 'Agent execution in progress' : undefined,
    sdui_views: session.sduiEvents,
    usage: undefined,
  };
}

export async function streamAgent(request: AgentRunRequest, onEvent: (event: string, data: string) => void): Promise<void> {
  const sessionId = agentLoop.createSession(request);

  // Execute the agent loop and emit events synchronously
  await agentLoop.streamSessionEvents(sessionId, onEvent);
}