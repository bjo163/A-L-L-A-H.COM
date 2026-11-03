import { modelRegistry } from '@allah/arsy-orm';
import { IspPlan } from './models/isp_plan';
import { IspSubscription } from './models/isp_subscription';
import { IspInvoice } from './models/isp_invoice';

export function registerWorksAddon(): void {
  modelRegistry.register(IspPlan);
  modelRegistry.register(IspSubscription);
  modelRegistry.register(IspInvoice);
}

export * from './models/isp_plan';
export * from './models/isp_subscription';
export * from './models/isp_invoice';