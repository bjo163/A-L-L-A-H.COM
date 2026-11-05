import { modelRegistry } from '@allah/arsy-orm';
import { NotifyChannel, NotifyTemplate, NotifyEvent } from './models/notify';
import { registerCronHandler } from '../project/services/cron_registry';
import { notifyDispatch } from './services/cron_dispatch';

export function registerMwNotifyAddon(): void {
  modelRegistry.register(NotifyChannel);
  modelRegistry.register(NotifyTemplate);
  modelRegistry.register(NotifyEvent);
  // Delivery rides the shared cron dispatch registry (roadmap T3.2): registering
  // the handler here (not editing the runner) is the same ownership model project
  // uses for `sync_local_plans`.
  registerCronHandler('notify_dispatch', notifyDispatch);
}

export * from './models/notify';
export * from './services/events';
export * from './services/webhook';
