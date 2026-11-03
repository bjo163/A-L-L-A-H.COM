export type SwarmRole = 'planner' | 'researcher' | 'builder' | 'verifier';

export interface SwarmAgentMessage {
  id: string;
  from: SwarmRole;
  to: SwarmRole | 'supervisor' | 'all';
  role: SwarmRole;
  payload: Record<string, unknown>;
  timestamp: string;
  latency_ms?: number;
}

export interface SwarmStep {
  step: number;
  agent: SwarmRole;
  action: string;
  thought?: string;
  input?: Record<string, unknown>;
  output?: unknown;
  success: boolean;
  latency_ms?: number;
  timestamp: string;
}

export interface SwarmRunRequest {
  goal: string;
  system?: string;
  max_turns?: number;
  company_id?: string;
  allowed_tools?: string[];
  temperature?: number;
  context?: Record<string, unknown>;
}

export interface SwarmExecutionResult {
  success: boolean;
  mission_id: string;
  goal: string;
  summary: string;
  steps: SwarmStep[];
  messages: SwarmAgentMessage[];
  finish_reason: 'completed' | 'verifier_rejected' | 'max_turns' | 'human_intervention' | 'error';
  error?: string;
}

export interface SwarmStreamEvent {
  event: 'swarm_agent_step' | 'swarm_message' | 'swarm_verdict' | 'done' | 'error';
  data: SwarmStep | SwarmAgentMessage | SwarmExecutionResult | { error: string };
}