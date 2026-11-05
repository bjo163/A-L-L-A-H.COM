export interface AiPlannedTask {
  id: string;
  title: string;
  acceptanceCriteria: string[];
  dependsOn: string[];
}

export interface AiTaskPlan {
  tasks: AiPlannedTask[];
  verification: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readTextList(value: unknown, label: string, maximum: number): string[] {
  if (
    !Array.isArray(value)
    || value.length === 0
    || value.length > maximum
    || value.some((entry) => typeof entry !== 'string' || entry.trim().length === 0 || entry.length > 240)
  ) {
    throw new Error(`${label} must contain between one and ${maximum} concise items.`);
  }
  return value.map((entry) => (entry as string).trim());
}

export function parseAiTaskPlan(raw: string, minimumTasks = 1): AiTaskPlan {
  if (raw.length > 12_000) throw new Error('The generated task plan exceeds the response limit.');
  if (!Number.isInteger(minimumTasks) || minimumTasks < 1 || minimumTasks > 8) {
    throw new Error('The minimum task count is invalid.');
  }

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error('The model must return the task plan as a JSON object.');
  }
  if (!isRecord(value) || !Array.isArray(value.tasks)) {
    throw new Error('The task plan must contain a tasks array.');
  }
  if (value.tasks.length < minimumTasks || value.tasks.length > 8) {
    throw new Error(`The task plan must contain between ${minimumTasks} and 8 tasks.`);
  }

  const taskIds = new Set<string>();
  const tasks = value.tasks.map((entry, index): AiPlannedTask => {
    if (
      !isRecord(entry)
      || entry.id !== `task-${index + 1}`
      || typeof entry.title !== 'string'
      || !entry.title.trim()
      || entry.title.length > 160
      || !Array.isArray(entry.dependsOn)
      || entry.dependsOn.some((dependency) => typeof dependency !== 'string')
    ) {
      throw new Error(`Task ${index + 1} does not match the required plan shape.`);
    }

    const dependsOn = entry.dependsOn as string[];
    if (new Set(dependsOn).size !== dependsOn.length || dependsOn.some((dependency) => !taskIds.has(dependency))) {
      throw new Error(`Task ${index + 1} has a duplicate, forward, or unknown dependency.`);
    }

    const task = {
      id: entry.id,
      title: entry.title.trim(),
      acceptanceCriteria: readTextList(entry.acceptanceCriteria, `Task ${index + 1} acceptance criteria`, 5),
      dependsOn: [...dependsOn],
    };
    taskIds.add(task.id);
    return task;
  });

  return {
    tasks,
    verification: readTextList(value.verification, 'Plan verification', 5),
  };
}

export function formatAiTaskPlan(plan: AiTaskPlan): string {
  const taskLines = plan.tasks.flatMap((task, index) => [
    `${index + 1}. ${task.title}`,
    ...task.acceptanceCriteria.map((criterion) => `   Acceptance: ${criterion}`),
    ...(task.dependsOn.length > 0 ? [`   Depends on: ${task.dependsOn.join(', ')}`] : []),
  ]);
  return [
    'Implementation plan',
    ...taskLines,
    'Verification',
    ...plan.verification.map((item) => `- ${item}`),
  ].join('\n');
}
