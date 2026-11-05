import { modelRegistry } from '@allah/arsy-orm';
import { IspPlan, IspSubscription, IspInvoice } from './models/isp_commercial';
import { IspCoverage } from './models/isp_coverage';

export function registerWorksAddon(): void {
  modelRegistry.register(IspPlan);
  modelRegistry.register(IspSubscription);
  modelRegistry.register(IspInvoice);
  modelRegistry.register(IspCoverage);
}

export * from './models/isp_commercial';
export * from './models/isp_coverage';
