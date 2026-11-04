import { modelRegistry } from '@allah/arsy-orm';
import { IspPlan, IspSubscription, IspInvoice } from './models/isp_commercial';

export function registerWorksAddon(): void {
  modelRegistry.register(IspPlan);
  modelRegistry.register(IspSubscription);
  modelRegistry.register(IspInvoice);
}

export * from './models/isp_commercial';
