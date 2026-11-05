import { modelRegistry } from '@allah/arsy-orm';
import { HeLiGridSite } from './models/heliogrid_site';
import { HeLiGridInverter } from './models/heliogrid_inverter';
import { HeLiGridBattery } from './models/heliogrid_battery';
import { HeLiGridTelemetry } from './models/heliogrid_telemetry';

export function registerHeliogridAddon(): void {
  modelRegistry.register(HeLiGridSite);
  modelRegistry.register(HeLiGridInverter);
  modelRegistry.register(HeLiGridBattery);
  modelRegistry.register(HeLiGridTelemetry);
}

export * from './models/heliogrid_site';
export * from './models/heliogrid_inverter';
export * from './models/heliogrid_battery';
export * from './models/heliogrid_telemetry';