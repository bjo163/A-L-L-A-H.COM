import { modelRegistry } from '@allah/arsy-orm';
import { ProjectProject } from './models/project_project';
import { ProjectTaskStage } from './models/project_task_stage';
import { ProjectTask } from './models/project_task';
import { IrCron } from './models/ir_cron';
import { registerCronHandler } from './services/cron_registry';
import { syncLocalPlans } from './services/cron_jobs';

export function registerProjectAddon(): void {
  modelRegistry.register(ProjectProject);
  modelRegistry.register(ProjectTaskStage);
  modelRegistry.register(ProjectTask);
  modelRegistry.register(IrCron);
  // Dispatch handlers are registered the same moment the addon is, so "add a
  // scheduled job" means "register a handler here", never "edit the runner".
  registerCronHandler('sync_local_plans', syncLocalPlans);
}

export * from './models/project_project';
export * from './models/project_task_stage';
export * from './models/project_task';
export * from './models/ir_cron';
export * from './services/plan_scanner';
export * from './services/sync_worker';
export * from './services/cron_registry';
export * from './services/cron_runner';
