export type AgentRole = 'supervisor' | 'researcher' | 'builder' | 'reviewer';

export interface AgentRoleDefinition {
  role: AgentRole;
  purpose: string;
  allowedModes: Array<'ask' | 'plan' | 'code' | 'debug' | 'ideate' | 'autopilot'>;
  requiresApproval: boolean;
}

export interface AgentMessage {
  id: string;
  correlationId: string;
  from: AgentRole;
  to: AgentRole;
  type: 'request' | 'result' | 'review' | 'blocked';
  payload: string;
  createdAt: string;
}

export const agentRoleDefinitions: readonly AgentRoleDefinition[] = [
  { role: 'supervisor', purpose: 'Coordinate bounded work and approvals.', allowedModes: ['plan', 'autopilot'], requiresApproval: true },
  { role: 'researcher', purpose: 'Collect bounded repository facts.', allowedModes: ['ask', 'plan', 'ideate'], requiresApproval: false },
  { role: 'builder', purpose: 'Prepare reviewable workspace edits.', allowedModes: ['code', 'debug'], requiresApproval: true },
  { role: 'reviewer', purpose: 'Inspect proposed changes and validation evidence.', allowedModes: ['ask', 'plan'], requiresApproval: false },
];

export function createAgentMessage(input: Omit<AgentMessage, 'createdAt'>, now = new Date()): AgentMessage {
  if (!input.payload.trim()) throw new Error('Agent message payload cannot be empty.');
  return { ...input, payload: input.payload.slice(0, 20_000), createdAt: now.toISOString() };
}
