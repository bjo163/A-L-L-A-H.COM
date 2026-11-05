export type AgentMode = 'ask' | 'plan' | 'code' | 'debug' | 'ideate' | 'autopilot';
export type AgentToolDecision = 'allow' | 'ask' | 'deny';
export type AgentToolName =
  | 'workspace.read'
  | 'workspace.search'
  | 'workspace.edit'
  | 'terminal.powershell'
  | 'git.write'
  | 'system.write';

export type AgentSessionState =
  | 'queued'
  | 'running'
  | 'awaiting_approval'
  | 'completed'
  | 'cancel_requested'
  | 'cancelled'
  | 'failed'
  | 'blocked';

export interface RemoteAgentMission {
  id: string;
  deviceId: string;
  mode: AgentMode;
  goal: string;
  state: AgentSessionState;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | Array<
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string } }
  >;
  name?: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
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
