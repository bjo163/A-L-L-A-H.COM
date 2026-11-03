import crypto from 'crypto';
import { logger } from '@allah/arsy-core';
import { toolRegistry } from '../tools';
import { SmartRouter } from '../router';
import type { ChatMessage, ToolDefinition, ToolCall } from '../types';

export interface AgentRunOptions {
  prompt: string;
  system?: string;
  max_steps?: number;
  allowed_tools?: string[];
  temperature?: number;
  company_id?: string;
}

export interface AgentStep {
  step: number;
  thought?: string;
  tool_calls?: ToolCall[];
  tool_results?: Array<{
    call_id: string;
    tool: string;
    success: boolean;
    result: unknown;
    error?: string;
  }>;
  sdui_payload?: unknown;
}

export interface AgentRunResult {
  session_id: string;
  success: boolean;
  total_steps: number;
  steps: AgentStep[];
  final_response: string;
  finish_reason: 'completed' | 'max_steps_exceeded' | 'loop_detected' | 'error';
  sdui_payloads: unknown[];
  error?: string;
}

export type AgentEventCallback = (event: {
  event: 'thought' | 'tool_call' | 'tool_result' | 'sdui' | 'chunk' | 'done' | 'error';
  data: Record<string, unknown>;
}) => void;

export class AgentLoop {
  constructor(private router: SmartRouter) {}

  async run(options: AgentRunOptions, onEvent?: AgentEventCallback): Promise<AgentRunResult> {
    const sessionId = `agent_${crypto.randomBytes(8).toString('hex')}`;
    const maxSteps = Math.min(options.max_steps || 8, 20);
    const steps: AgentStep[] = [];
    const sduiPayloads: unknown[] = [];
    let consecutiveDuplicateCalls = 0;
    let lastToolCallSignature = '';

    const systemPrompt =
      options.system ||
      `You are the MoonWitness Autonomous Cognitive AGI Agent operating within the A-L-L-A-H.COM enterprise platform.
You have executive tools at your disposal to inspect the database, retrieve documents, read/write storage, fetch web data, and synthesize dynamic UI.
Reason step-by-step:
1. Formulate a concise plan.
2. Select and execute tools if information or action is needed.
3. Observe tool results and evaluate progress.
4. When you have the complete answer or if UI is required, use render_sdui tool and synthesize the final answer.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: options.prompt },
    ];

    // Filter tools based on allowed_tools if specified
    const allTools = toolRegistry.getDefinitions();
    const activeTools: ToolDefinition[] = options.allowed_tools
      ? allTools.filter((t) => options.allowed_tools!.includes(t.function.name))
      : allTools;

    let finalResponse = '';
    let finishReason: AgentRunResult['finish_reason'] = 'completed';

    try {
      for (let stepIndex = 1; stepIndex <= maxSteps; stepIndex++) {
        // Emit thought event
        onEvent?.({
          event: 'thought',
          data: {
            step: stepIndex,
            session_id: sessionId,
            message: `Executing cognitive reasoning step ${stepIndex}/${maxSteps}`,
          },
        });

        const stepRecord: AgentStep = { step: stepIndex };

        // Invoke Router for reasoning & potential tool calls
        const completion = await this.router.routeChat({
          model: 'dx-default',
          messages,
          tools: activeTools,
          tool_choice: 'auto',
          temperature: options.temperature ?? 0.2,
        });

        const choice = completion.choices?.[0];
        const assistantMessage = choice?.message;
        const toolCalls = assistantMessage?.tool_calls;

        if (toolCalls && toolCalls.length > 0) {
          stepRecord.tool_calls = toolCalls;

          // Loop Detection Check: compare call signature
          const currentSignature = JSON.stringify(
            toolCalls.map((tc: ToolCall) => ({ name: tc.function.name, args: tc.function.arguments }))
          );
          if (currentSignature === lastToolCallSignature) {
            consecutiveDuplicateCalls++;
            if (consecutiveDuplicateCalls >= 3) {
              finishReason = 'loop_detected';
              stepRecord.thought = 'Loop detected: identical tool calls executed 3 times. Terminating loop.';
              steps.push(stepRecord);
              break;
            }
          } else {
            consecutiveDuplicateCalls = 0;
            lastToolCallSignature = currentSignature;
          }

          // Emit tool_call events
          for (const tc of toolCalls) {
            onEvent?.({
              event: 'tool_call',
              data: {
                step: stepIndex,
                call_id: tc.id,
                tool: tc.function.name,
                arguments: tc.function.arguments,
              },
            });
          }

          // Record assistant message with tool calls
          messages.push({
            role: 'assistant',
            content: assistantMessage?.content || '',
            tool_calls: toolCalls,
          });

          // Execute tool calls sequentially
          const toolResults: AgentStep['tool_results'] = [];
          for (const tc of toolCalls) {
            let parsedArgs: Record<string, unknown> = {};
            try {
              parsedArgs = JSON.parse(tc.function.arguments || '{}');
            } catch {
              parsedArgs = {};
            }

            const startTime = Date.now();
            const execResult = await toolRegistry.execute(tc.function.name, parsedArgs, {
              actor: options.company_id || 'default',
            });
            const latencyMs = Date.now() - startTime;

            toolResults.push({
              call_id: tc.id,
              tool: tc.function.name,
              success: execResult.success,
              result: execResult.output,
              error: execResult.error || undefined,
            });

            // If tool is render_sdui, capture payload
            if (tc.function.name === 'render_sdui' && execResult.success && execResult.output) {
              sduiPayloads.push(execResult.output);
              stepRecord.sdui_payload = execResult.output;
              onEvent?.({
                event: 'sdui',
                data: {
                  step: stepIndex,
                  call_id: tc.id,
                  payload: execResult.output,
                },
              });
            }

            // Emit tool_result event
            onEvent?.({
              event: 'tool_result',
              data: {
                step: stepIndex,
                call_id: tc.id,
                tool: tc.function.name,
                success: execResult.success,
                latency_ms: latencyMs,
                data: execResult.output,
                error: execResult.error,
              },
            });

            // Append tool observation back into conversation
            messages.push({
              role: 'tool',
              tool_call_id: tc.id,
              name: tc.function.name,
              content: JSON.stringify(execResult.success ? execResult.output : { error: execResult.error }),
            });
          }

          stepRecord.tool_results = toolResults;
          steps.push(stepRecord);
        } else {
          // No tool calls requested: final reasoning synthesis achieved
          finalResponse = assistantMessage?.content || '';
          stepRecord.thought = 'Goal achieved. Final answer generated.';
          steps.push(stepRecord);

          // Emit chunk events for final text
          onEvent?.({
            event: 'chunk',
            data: {
              step: stepIndex,
              delta: finalResponse,
            },
          });

          finishReason = 'completed';
          break;
        }

        if (stepIndex === maxSteps && !finalResponse) {
          finishReason = 'max_steps_exceeded';
          finalResponse =
            'Cognitive loop reached maximum allowed steps before full conclusion. Intermediate steps have been recorded.';
        }
      }

      onEvent?.({
        event: 'done',
        data: {
          session_id: sessionId,
          success: finishReason === 'completed',
          total_steps: steps.length,
          finish_reason: finishReason,
        },
      });

      return {
        session_id: sessionId,
        success: finishReason === 'completed',
        total_steps: steps.length,
        steps,
        final_response: finalResponse,
        finish_reason: finishReason,
        sdui_payloads: sduiPayloads,
      };
    } catch (err: any) {
      logger.error({ err, sessionId }, 'AgentLoop fatal execution error');
      onEvent?.({
        event: 'error',
        data: {
          session_id: sessionId,
          error: err.message,
        },
      });

      return {
        session_id: sessionId,
        success: false,
        total_steps: steps.length,
        steps,
        final_response: '',
        finish_reason: 'error',
        sdui_payloads: sduiPayloads,
        error: err.message,
      };
    }
  }
}
