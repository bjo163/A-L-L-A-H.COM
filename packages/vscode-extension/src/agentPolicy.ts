import type { AgentMode, AgentToolDecision, AgentToolName } from '@moonwitness/types';

const policy: Record<AgentMode, Record<AgentToolName, AgentToolDecision>> = {
  ask: {
    'workspace.read': 'ask',
    'workspace.search': 'ask',
    'workspace.edit': 'deny',
    'terminal.powershell': 'deny',
    'git.write': 'deny',
    'system.write': 'deny',
  },
  plan: {
    'workspace.read': 'ask',
    'workspace.search': 'ask',
    'workspace.edit': 'deny',
    'terminal.powershell': 'deny',
    'git.write': 'deny',
    'system.write': 'deny',
  },
  ideate: {
    'workspace.read': 'ask',
    'workspace.search': 'ask',
    'workspace.edit': 'deny',
    'terminal.powershell': 'deny',
    'git.write': 'deny',
    'system.write': 'deny',
  },
  code: {
    'workspace.read': 'allow',
    'workspace.search': 'allow',
    'workspace.edit': 'ask',
    'terminal.powershell': 'ask',
    'git.write': 'deny',
    'system.write': 'deny',
  },
  debug: {
    'workspace.read': 'allow',
    'workspace.search': 'allow',
    'workspace.edit': 'ask',
    'terminal.powershell': 'ask',
    'git.write': 'deny',
    'system.write': 'deny',
  },
  autopilot: {
    'workspace.read': 'allow',
    'workspace.search': 'allow',
    'workspace.edit': 'allow',
    'terminal.powershell': 'ask',
    'git.write': 'deny',
    'system.write': 'deny',
  },
};

export function getAgentToolDecision(mode: AgentMode, tool: AgentToolName): AgentToolDecision {
  return policy[mode][tool];
}

export function isAgentMode(value: unknown): value is AgentMode {
  return value === 'ask'
    || value === 'plan'
    || value === 'code'
    || value === 'debug'
    || value === 'ideate'
    || value === 'autopilot';
}
