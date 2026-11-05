export interface GraphTask {
  id: string;
  dependsOn: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
}

export function getReadyTasks(tasks: GraphTask[]): GraphTask[] {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  return tasks.filter((task) => task.status === 'pending'
    && task.dependsOn.every((dependency) => byId.get(dependency)?.status === 'completed'));
}

export function getTaskProgress(tasks: GraphTask[]): { completed: number; total: number; percent: number } {
  const completed = tasks.filter((task) => task.status === 'completed').length;
  return { completed, total: tasks.length, percent: tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100) };
}
