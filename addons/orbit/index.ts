import { modelRegistry } from '@allah/arsy-orm';
import { OrbitInstance, OrbitTemplate, OrbitVolume } from './models/orbit_instance';

export function registerOrbitAddon(): void {
  modelRegistry.register(OrbitInstance);
  modelRegistry.register(OrbitTemplate);
  modelRegistry.register(OrbitVolume);
}

export * from './models/orbit_instance';
