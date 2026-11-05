export interface DelegationLimits {
  maxConcurrent: number;
  maxDepth: number;
  maxMessages: number;
}

export interface ReviewCheckpoint {
  id: string;
  action: 'workspace.edit' | 'terminal.powershell' | 'git.write' | 'network.request';
  summary: string;
  approved: boolean;
}

export const defaultDelegationLimits: Readonly<DelegationLimits> = {
  maxConcurrent: 2,
  maxDepth: 1,
  maxMessages: 100,
};

export function canDelegate(activeCount: number, depth: number, limits = defaultDelegationLimits): boolean {
  return activeCount < limits.maxConcurrent && depth < limits.maxDepth;
}

export function requireReview(checkpoint: ReviewCheckpoint): void {
  if (!checkpoint.summary.trim()) throw new Error('Review checkpoint requires a summary.');
  if (!checkpoint.approved) throw new Error(`Action requires approval: ${checkpoint.action}`);
}
