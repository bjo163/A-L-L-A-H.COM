import { modelRegistry } from '@allah/arsy-orm';
import { ProjectProject } from './models/project_project';
import { ProjectTaskStage } from './models/project_task_stage';
import { ProjectTask } from './models/project_task';
import { IrCron } from './models/ir_cron';

export function registerProjectAddon(): void {
  modelRegistry.register(ProjectProject);
  modelRegistry.register(ProjectTaskStage);
  modelRegistry.register(ProjectTask);
  modelRegistry.register(IrCron);
}

export * from './models/project_project';
export * from './models/project_task_stage';
export * from './models/project_task';
export * from './models/ir_cron';
export * from './services/plan_scanner';
export * from './services/sync_worker';
export * from './services/cron_runner';
