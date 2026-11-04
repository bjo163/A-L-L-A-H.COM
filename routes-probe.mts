import { buildArsyApp } from './apps/arsy/src/app.ts';
const app = await buildArsyApp({ enableLogging: false });
console.log(app.printRoutes({ commonPrefix: false }));
await app.close();
process.exit(0);
