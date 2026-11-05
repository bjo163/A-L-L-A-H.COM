export interface DecomposedTask {
  id: string;
  title: string;
  acceptanceCriteria: string[];
  dependsOn: string[];
}

export function decomposeTask(request: string, criteria: string[] = []): DecomposedTask[] {
  const normalized = request.trim();
  if (!normalized) throw new Error('Task request cannot be empty.');
  const boundedCriteria = criteria.map((criterion) => criterion.trim()).filter(Boolean).slice(0, 5);
  const steps = normalized.split(/\s*(?:\n+|;\s+|\.\s+(?=[A-Z]))\s*/).map((step) => step.trim()).filter(Boolean).slice(0, 8);
  return steps.map((step, index) => ({
    id: `task-${index + 1}`,
    title: step.slice(0, 160),
    acceptanceCriteria: boundedCriteria.length > 0 ? boundedCriteria : [`Completed: ${step.slice(0, 120)}`],
    dependsOn: index === 0 ? [] : [`task-${index}`],
  }));
}
