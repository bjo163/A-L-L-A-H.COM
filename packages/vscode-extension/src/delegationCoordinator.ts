import { createAgentMessage, type AgentMessage, type AgentRole } from './agentRoles';
import { canDelegate, defaultDelegationLimits, type DelegationLimits, type ReviewCheckpoint } from './delegationPolicy';

export class DelegationCoordinator {
  private readonly messages: AgentMessage[] = [];
  private activeCount = 0;

  constructor(private readonly limits: DelegationLimits = defaultDelegationLimits) {}

  start(depth: number): void {
    if (!canDelegate(this.activeCount, depth, this.limits)) throw new Error('Delegation limit reached.');
    this.activeCount += 1;
  }

  finish(): void {
    this.activeCount = Math.max(0, this.activeCount - 1);
  }

  send(input: Omit<AgentMessage, 'createdAt'>): AgentMessage {
    if (this.messages.length >= this.limits.maxMessages) throw new Error('Delegation message limit reached.');
    const message = createAgentMessage(input);
    this.messages.push(message);
    return message;
  }

  approve(checkpoint: ReviewCheckpoint): ReviewCheckpoint {
    if (!checkpoint.summary.trim()) throw new Error('Review checkpoint requires a summary.');
    return { ...checkpoint, approved: true };
  }

  getMessages(correlationId: string): AgentMessage[] {
    return this.messages.filter((message) => message.correlationId === correlationId);
  }
}

export type { AgentRole };
