import type { AgentToolCallEvent, AgentToolResultEvent, SDUINode } from '@moonwitness/types';

/** A single grouped step in the Agent Studio reasoning timeline. */
export interface AgentStepUI {
  step: number;
  thought?: string;
  tool_calls: AgentToolCallEvent[];
  tool_results: AgentToolResultEvent[];
  sdui: SDUINode[];
  response?: string;
  finish_reason?: string;
}

export type AgentTimelineAction =
  | { type: 'reset' }
  | { type: 'thought'; step: number; thought: string }
  | { type: 'tool_call'; step: number; call: AgentToolCallEvent }
  | { type: 'tool_result'; step: number; result: AgentToolResultEvent }
  | { type: 'sdui'; node: SDUINode }
  | { type: 'chunk'; delta: string }
  | { type: 'done'; finishReason: string };

export const initialAgentSteps: AgentStepUI[] = [];

function makeStep(step: number): AgentStepUI {
  return { step, tool_calls: [], tool_results: [], sdui: [] };
}

/** Return a steps array that contains an entry for `step`, kept in ascending order. */
function ensureStep(steps: AgentStepUI[], step: number): AgentStepUI[] {
  if (steps.some((entry) => entry.step === step)) return steps;
  const next = [...steps, makeStep(step)];
  next.sort((a, b) => a.step - b.step);
  return next;
}

/** Replace one step by number while leaving the other entries referentially stable. */
function patchStep(steps: AgentStepUI[], step: number, patch: (entry: AgentStepUI) => AgentStepUI): AgentStepUI[] {
  return steps.map((entry) => (entry.step === step ? patch(entry) : entry));
}

/** The step a step-less event (chunk/sdui) belongs to: the latest one, else step 0. */
function currentStepNumber(steps: AgentStepUI[]): number {
  return steps.length === 0 ? 0 : steps[steps.length - 1].step;
}

/**
 * Groups streamed agent events by their `step` number. This replaces the four
 * near-identical `splice` blocks that keyed everything off a `currentStep` that was
 * read but never advanced, which made the timeline grouping unreliable.
 */
export function agentStepsReducer(state: AgentStepUI[], action: AgentTimelineAction): AgentStepUI[] {
  switch (action.type) {
    case 'reset':
      return initialAgentSteps;

    case 'thought':
      return patchStep(ensureStep(state, action.step), action.step, (entry) => ({ ...entry, thought: action.thought }));

    case 'tool_call':
      return patchStep(ensureStep(state, action.step), action.step, (entry) => ({
        ...entry,
        tool_calls: [...entry.tool_calls, action.call],
      }));

    case 'tool_result':
      return patchStep(ensureStep(state, action.step), action.step, (entry) => ({
        ...entry,
        tool_results: [...entry.tool_results, action.result],
      }));

    case 'sdui': {
      const step = currentStepNumber(state);
      return patchStep(ensureStep(state, step), step, (entry) => ({ ...entry, sdui: [...entry.sdui, action.node] }));
    }

    case 'chunk': {
      const step = currentStepNumber(state);
      return patchStep(ensureStep(state, step), step, (entry) => ({ ...entry, response: (entry.response ?? '') + action.delta }));
    }

    case 'done':
      return state.map((entry) => ({ ...entry, finish_reason: action.finishReason }));

    default:
      return state;
  }
}

function asRecord(data: unknown): Record<string, unknown> | null {
  if (typeof data === 'string') {
    try {
      const parsed: unknown = JSON.parse(data);
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }
  return data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
}

function readStepValue(record: Record<string, unknown>, fallback: number): number {
  const value = record.step;
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/**
 * Translates one streamed `(event, data)` pair into a timeline action, or null when
 * the event is not renderable. The SDK already parses each SSE payload into an
 * object, so this never re-parses an object (the old page did and threw at runtime).
 */
export function eventToAction(event: string, data: unknown): AgentTimelineAction | null {
  const record = asRecord(data);

  switch (event) {
    case 'thought': {
      if (!record) return null;
      return { type: 'thought', step: readStepValue(record, 0), thought: typeof record.thought === 'string' ? record.thought : '' };
    }
    case 'tool_call': {
      if (!record) return null;
      const call: AgentToolCallEvent = {
        step: readStepValue(record, 0),
        call_id: typeof record.call_id === 'string' ? record.call_id : '',
        tool: typeof record.tool === 'string' ? record.tool : 'unknown tool',
        arguments: record.arguments && typeof record.arguments === 'object' ? (record.arguments as Record<string, unknown>) : {},
      };
      return { type: 'tool_call', step: call.step, call };
    }
    case 'tool_result': {
      if (!record) return null;
      const result: AgentToolResultEvent = {
        step: readStepValue(record, 0),
        call_id: typeof record.call_id === 'string' ? record.call_id : '',
        tool: typeof record.tool === 'string' ? record.tool : 'unknown tool',
        success: record.success === true,
        result: record.result ?? null,
        error: typeof record.error === 'string' ? record.error : null,
        latency_ms: typeof record.latency_ms === 'number' ? record.latency_ms : 0,
      };
      return { type: 'tool_result', step: result.step, result };
    }
    case 'sdui': {
      if (!record) return null;
      const node: SDUINode = {
        type: typeof record.type === 'string' ? record.type : 'unknown',
        props: record.props && typeof record.props === 'object' ? (record.props as Record<string, unknown>) : undefined,
      };
      return { type: 'sdui', node };
    }
    case 'chunk': {
      if (!record) return null;
      return { type: 'chunk', delta: typeof record.delta === 'string' ? record.delta : '' };
    }
    case 'done': {
      const finishReason = record && typeof record.finish_reason === 'string' ? record.finish_reason : 'completed';
      return { type: 'done', finishReason };
    }
    default:
      return null;
  }
}
