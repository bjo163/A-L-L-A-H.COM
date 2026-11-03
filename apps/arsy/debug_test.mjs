import { buildArsyApp } from './src/app.ts';

// Set master key for encryption before creating the app
process.env.ARSY_MASTER_KEY = 'testmasterkey1234567890abcdef';

const app = await buildArsyApp({ enableLogging: true });

// Check model registry
const nasModel = (await import('@allah/arsy-orm')).modelRegistry.get('nexus.nas');
console.log('nexus.nas model from registry:', nasModel ? 'found' : 'NOT FOUND');
const allModels = (await import('@allah/arsy-orm')).modelRegistry.getAll();
console.log('Total models in registry:', allModels.length);
console.log('Model names:', allModels.map(m => m.name));

// Test the ready endpoint first
const ready = await app.inject({ method: 'GET', url: '/ready' });
console.log('Ready status:', ready.statusCode);

// Test NAS list with company_id
const list = await app.inject({ method: 'GET', url: '/v1/nexus/nas?company_id=1' });
console.log('NAS list status:', list.statusCode);
console.log('NAS list payload:', list.payload.substring(0, 200));

// Test NAS create
const create = await app.inject({
  method: 'POST',
  url: '/v1/nexus/nas',
  payload: {
    nas_identifier: 'mikrotik-test',
    ip_address: '10.0.0.1',
    secret: 'test-secret',
    vendor: 'mikrotik',
    company_id: 1,
  },
});
console.log('NAS create status:', create.statusCode);
console.log('NAS create payload:', create.payload.substring(0, 200));

app.close();