import { modelRegistry } from '@allah/arsy-orm';
import { NexusSite } from './models/nexus_site';
import { NexusDevice } from './models/nexus_device';
import { NexusNas } from './models/nexus_nas';
import { NexusIpPool } from './models/nexus_ip_pool';
import { NexusNasSecretLog } from './models/nexus_nas_secret_log';

export function registerNexusAddon(): void {
  modelRegistry.register(NexusSite);
  modelRegistry.register(NexusDevice);
  modelRegistry.register(NexusNas);
  modelRegistry.register(NexusIpPool);
  modelRegistry.register(NexusNasSecretLog);
}

export * from './models/nexus_site';
export * from './models/nexus_device';
export * from './models/nexus_nas';
export * from './models/nexus_ip_pool';
export * from './models/nexus_nas_secret_log';