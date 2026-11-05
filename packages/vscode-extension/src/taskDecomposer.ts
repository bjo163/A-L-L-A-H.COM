export interface DecomposedTask {
  id: string;
  title: string;
  acceptanceCriteria: string[];
  dependsOn: string[];
}

const actionConjunction = /\s+(?:and then|then)\s+|\s+and\s+(?=(?:also\s+)?(?:add|build|check|create|document|fix|implement|migrate|refactor|remove|run|test|update|verify)\b)/i;

export function decomposeTask(request: string, criteria: string[] = []): DecomposedTask[] {
  const normalized = request.trim();
  if (!normalized) throw new Error('Task request cannot be empty.');
  const boundedCriteria = criteria.map((criterion) => criterion.trim()).filter(Boolean).slice(0, 5);
  const steps = normalized
    .split(/\s*(?:\r?\n+|;\s*|\.\s+(?=[A-Z])|[!?]\s+)\s*/)
    .flatMap((step) => step.split(actionConjunction))
    .map((step) => step.trim().replace(/[.!?]+$/, ''))
    .filter(Boolean)
    .slice(0, 8);
  return steps.map((step, index) => ({
    id: `task-${index + 1}`,
    title: step.slice(0, 160),
    acceptanceCriteria: boundedCriteria.length > 0 ? boundedCriteria : [`Completed: ${step.slice(0, 120)}`],
    dependsOn: index === 0 ? [] : [`task-${index}`],
  }));
}
