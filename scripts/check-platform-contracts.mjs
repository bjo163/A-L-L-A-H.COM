#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const failures = [];
const read = (path) => readFileSync(path, 'utf8');
const readJson = (path) => JSON.parse(read(path));
const apps = readdirSync(join(root, 'apps'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== 'server')
  .map((entry) => entry.name)
  .sort();

function serviceBlocks(source) {
  const blocks = new Map();
  const lines = source.split(/\r?\n/);
  let current;
  for (const line of lines) {
    const service = line.match(/^  ([a-z0-9-]+):$/);
    if (service) {
      current = service[1];
      blocks.set(current, []);
      continue;
    }
    if (current && /^  [a-z0-9-]+:$/.test(line)) current = undefined;
    if (current) blocks.get(current).push(line);
  }
  return blocks;
}

function composeEnvironment(lines) {
  const environment = new Set();
  const start = lines.findIndex((line) => line.trim() === 'environment:');
  if (start < 0) return environment;
  for (const line of lines.slice(start + 1)) {
    if (/^    [a-zA-Z0-9_-]+:/.test(line)) break;
    const listEntry = line.match(/^\s+- ([A-Z][A-Z0-9_]*)=/);
    const mappingEntry = line.match(/^\s+([A-Z][A-Z0-9_]*):/);
    const match = listEntry ?? mappingEntry;
    if (match) environment.add(match[1]);
  }
  return environment;
}

function dependencyNames(lines) {
  const start = lines.findIndex((line) => line.trim() === 'depends_on:');
  if (start < 0) return [];
  const result = [];
  for (const line of lines.slice(start + 1)) {
    if (/^    [a-zA-Z0-9_-]+:/.test(line)) break;
    const listName = line.match(/^\s+- ([a-z0-9-]+)$/);
    const mappingName = line.match(/^\s{6}([a-z0-9-]+):$/);
    const name = listName?.[1] ?? mappingName?.[1];
    if (name) result.push(name);
  }
  return result;
}

function contractList(path, key) {
  const frontmatter = read(path).split('---')[1] ?? '';
  const line = frontmatter.split(/\r?\n/).find((entry) => entry.startsWith(`${key}:`));
  return line ? [...line.slice(line.indexOf('[') + 1, line.lastIndexOf(']')).matchAll(/[^,\s]+/g)].map((m) => m[0]) : [];
}

function integerList(path, key) {
  return contractList(path, key).map(Number);
}

function portMappings(lines) {
  return lines.flatMap((line) => {
    const match = line.match(/^\s+- ["']?(\d+):(\d+)(?:\/(udp|tcp))?["']?$/);
    return match ? [{ host: Number(match[1]), container: Number(match[2]), protocol: match[3] ?? 'tcp' }] : [];
  });
}

function dockerExposedPorts(app) {
  const dockerfile = read(join(root, 'apps', app, 'Dockerfile'));
  const exposed = dockerfile.match(/^EXPOSE\s+(.+)$/m)?.[1]?.split(/\s+/) ?? [];
  return exposed.map((entry) => ({
    port: Number(entry.split('/')[0]),
    protocol: entry.split('/')[1] ?? 'tcp',
  })).filter((entry) => Number.isFinite(entry.port)).sort((a, b) => a.port - b.port);
}

function sourceText(directory) {
  const files = [];
  const visit = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (['node_modules', '.next', 'dist', 'coverage'].includes(entry.name)) continue;
      const path = join(current, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (/\.(ts|tsx|mjs)$/.test(entry.name) && !entry.name.includes('.test.')) files.push(read(path));
    }
  };
  visit(directory);
  return files.join('\n');
}

function checkComposeTopology() {
  const compose = read(join(root, 'docker-compose.yml'));
  const services = serviceBlocks(compose);
  const declaredVolumes = new Set(
    [...(compose.split(/^volumes:\s*$/m)[1] ?? '').matchAll(/^  ([a-z0-9_-]+):/gm)].map((match) => match[1]),
  );
  const expected = new Set(apps);
  for (const name of expected) {
    const lines = services.get(name);
    if (!lines) {
      failures.push(`docker-compose.yml: missing service '${name}'`);
      continue;
    }
    const dockerfile = lines.find((line) => line.trim().startsWith('dockerfile:'));
    if (dockerfile !== `      dockerfile: apps/${name}/Dockerfile`) {
      failures.push(`docker-compose.yml: ${name} must build apps/${name}/Dockerfile`);
    }
    if (!lines.some((line) => line.trim() === 'context: .')) {
      failures.push(`docker-compose.yml: ${name} build context must be the repository root`);
    }
    const declaredPorts = integerList(join(root, 'apps', name, 'CONTRACT.md'), 'ports').sort((a, b) => a - b);
    const mappings = portMappings(lines);
    const composePorts = [...new Set(mappings.map((port) => port.container))].sort((a, b) => a - b);
    if (JSON.stringify(composePorts) !== JSON.stringify(declaredPorts)) {
      failures.push(`docker-compose.yml: ${name} ports [${composePorts}] differ from app contract [${declaredPorts}]`);
    }
    const exposedPorts = dockerExposedPorts(name);
    if (JSON.stringify(exposedPorts.map(({ port }) => port)) !== JSON.stringify(declaredPorts)) {
      failures.push(`apps/${name}/Dockerfile: EXPOSE ports [${exposedPorts.map(({ port }) => port)}] differ from app contract [${declaredPorts}]`);
    }
    for (const exposed of exposedPorts) {
      const mapping = mappings.find(({ container }) => container === exposed.port);
      if (mapping && mapping.protocol !== exposed.protocol) {
        failures.push(`docker-compose.yml: ${name} port ${exposed.port} protocol '${mapping.protocol}' differs from Dockerfile '${exposed.protocol}'`);
      }
    }
    for (const volumeLine of lines.filter((line) => /^\s+- [a-z0-9_-]+:\/.+/.test(line))) {
      const volumeName = volumeLine.trim().match(/^- ([a-z0-9_-]+):/)?.[1];
      if (volumeName && !declaredVolumes.has(volumeName)) {
        failures.push(`docker-compose.yml: ${name} uses undeclared named volume '${volumeName}'`);
      }
    }
    if (!lines.some((line) => line.trim() === 'healthcheck:')) {
      failures.push(`docker-compose.yml: ${name} is missing a healthcheck`);
    }
    for (const dependency of dependencyNames(lines)) {
      if (!services.has(dependency)) failures.push(`docker-compose.yml: ${name} depends on unknown service '${dependency}'`);
    }
    const dependencies = dependencyNames(lines);
    const healthyDependencies = lines.filter((line) => line.trim() === 'condition: service_healthy').length;
    if (healthyDependencies !== dependencies.length) {
      failures.push(`docker-compose.yml: ${name} dependencies must all wait for service_healthy`);
    }
    for (const key of composeEnvironment(lines)) {
      if (/^(NEXT_PUBLIC_)?(.*(SECRET|TOKEN|PASSWORD|PRIVATE_KEY|API_KEY))$/i.test(key) && key.startsWith('NEXT_PUBLIC_')) {
        failures.push(`docker-compose.yml: secret-like environment '${key}' must not use NEXT_PUBLIC_`);
      }
    }
  }
  for (const service of services.keys()) {
    if (!expected.has(service)) failures.push(`docker-compose.yml: service '${service}' has no matching app`);
  }
}

function checkRuntimeHealth() {
  const compose = read(join(root, 'docker-compose.yml'));
  const services = serviceBlocks(compose);
  const expectedPaths = {
    arsy: '/ready',
    sentinel: '/health',
  };
  for (const [name, path] of Object.entries(expectedPaths)) {
    const lines = services.get(name) ?? [];
    if (!lines.some((line) => line.includes(path))) failures.push(`docker-compose.yml: ${name} healthcheck must probe ${path}`);
  }
  for (const name of apps.filter((app) => !expectedPaths[app])) {
    const lines = services.get(name) ?? [];
    const port = lines.find((line) => line.trim().startsWith('- "'))?.match(/:(\d+)/)?.[1];
    if (!port || !lines.some((line) => line.includes(`127.0.0.1:${port}`))) {
      failures.push(`docker-compose.yml: ${name} healthcheck must probe its published port ${port ?? '(unknown)'}`);
    }
  }
}

function checkEnvironmentContract() {
  const compose = read(join(root, 'docker-compose.yml'));
  const envExample = read(join(root, '.env.example'));
  const documentedEnv = new Set([...envExample.matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map((match) => match[1]));
  for (const [, key] of compose.matchAll(/\$\{([A-Z][A-Z0-9_]*)/g)) {
    if (!documentedEnv.has(key)) failures.push(`.env.example: missing Compose variable ${key}`);
  }
  const services = serviceBlocks(compose);
  const required = {
    arsy: ['JWT_SECRET', 'ARSY_MASTER_KEY', 'BETTER_AUTH_URL', 'BETTER_AUTH_SECRET', 'CORS_ORIGINS'],
    sentinel: ['ARSY_MASTER_KEY'],
  };
  for (const [service, keys] of Object.entries(required)) {
    const environment = composeEnvironment(services.get(service) ?? []);
    for (const key of keys) if (!environment.has(key)) failures.push(`docker-compose.yml: ${service} must declare ${key}`);
  }
  const jizzLines = services.get('jizz') ?? [];
  if (!jizzLines.some((line) => line.includes('host.docker.internal:host-gateway'))) {
    failures.push('docker-compose.yml: jizz must map host.docker.internal to the Docker host gateway');
  }
  if (!jizzLines.some((line) => line.includes('JIZZ_API_URL=${JIZZ_API_URL:-http://host.docker.internal:4000}'))) {
    failures.push('docker-compose.yml: jizz must declare its host-gateway upstream default');
  }
  const jizzRoute = read(join(root, 'apps/jizz/src/app/api/jizz/[...path]/route.ts'));
  if (jizzRoute.includes('new JizzClientAdapter') || !jizzRoute.includes('createJizzClientFromEnvironment()')) {
    failures.push('apps/jizz API proxy: upstream client must be created lazily at request time');
  }
  const sourcePattern = /process\.env(?:\.|\[['"])([A-Z][A-Z0-9_]+)/g;
  for (const app of apps) {
    const source = sourceText(join(root, 'apps', app));
    for (const match of source.matchAll(/NEXT_PUBLIC_[A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|PRIVATE_KEY|API_KEY)/g)) {
      failures.push(`apps/${app}: secret-like client environment '${match[0]}' is forbidden`);
    }
    const referenced = [...source.matchAll(sourcePattern)].map((match) => match[1]);
    const environment = composeEnvironment(services.get(app) ?? []);
    for (const key of new Set(referenced)) {
      if (key.startsWith('NEXT_PUBLIC_') || key === 'NODE_ENV' || key === 'PORT') continue;
      if (!environment.has(key) && !source.includes(`process.env.${key} ??`) && !source.includes(`process.env.${key} ||`) && !source.includes(`process.env.${key} ===`)) {
        failures.push(`docker-compose.yml: ${app} references ${key} without declaration or source fallback`);
      }
      const arsyEnv = serviceBlocks(compose).get('arsy') ?? [];
      const sentinelEnv = serviceBlocks(compose).get('sentinel') ?? [];
      const masterKey = (lines) => lines.find((line) => line.includes('ARSY_MASTER_KEY='))?.match(/\$\{(ARSY_MASTER_KEY):(\?|-)/)?.[0];
      if (masterKey(arsyEnv) !== masterKey(sentinelEnv) || !masterKey(arsyEnv)?.startsWith('${ARSY_MASTER_KEY:?')) {
        failures.push('docker-compose.yml: Arsy and Sentinel must receive the same ARSY_MASTER_KEY expression');
      }
    }
  }
}

function checkCiAndRelease() {
  const publish = read(join(root, '.github/workflows/publish-deploy.yml'));
  const ci = read(join(root, '.github/workflows/platform-contracts.yml'));
  const appCi = read(join(root, '.github/workflows/ci-dev.yml'));
  const sbom = read(join(root, '.github/workflows/sbom.yml'));
  const packageScripts = readJson(join(root, 'package.json')).scripts;
  for (const app of apps) {
    const buildScript = app === 'arsy' ? null : app === 'e-isp' ? 'esp:build' : `${app}:build`;
    const buildCommand = app === 'arsy' ? 'pnpm --filter @allah/arsy build' : `pnpm ${buildScript}`;
    if ((buildScript && !packageScripts[buildScript]) || !appCi.includes(`run: ${buildCommand}`)) {
      failures.push(`ci-dev.yml: missing build gate for app '${app}' (${buildCommand})`);
    }
  }
  const publishedApps = [...publish.matchAll(/dockerfile: apps\/([^/]+)\/Dockerfile/g)].map((match) => match[1]).sort();
  if (JSON.stringify(publishedApps) !== JSON.stringify(apps)) {
    failures.push(`publish-deploy.yml: image matrix differs from apps/: [${publishedApps}]`);
  }
  const publishedComponents = [...publish.matchAll(/component: ([a-z0-9-]+)/g)].map((match) => match[1]).sort();
  if (JSON.stringify(publishedComponents) !== JSON.stringify(apps)) {
    failures.push(`publish-deploy.yml: component matrix differs from apps/: [${publishedComponents}]`);
  }
  if (!ci.includes('pnpm docker:contract:check') || !ci.includes('pnpm platform:contract:check')) {
    failures.push('platform-contracts.yml: required Docker and platform contract gates are missing');
  }
  if (
    !appCi.includes('docker_matrix: ${{ steps.changes.outputs.docker_matrix }}') ||
    !appCi.includes('docker/build-push-action@') ||
    !appCi.includes('file: apps/${{ matrix.component }}/Dockerfile') ||
    !appCi.includes('push: false')
  ) {
    failures.push('ci-dev.yml: affected app Docker images must build without publishing');
  }
  for (const gate of ['pnpm docs:check', 'pnpm contract:check', 'pnpm lint:arch']) {
    if (!ci.includes(gate)) failures.push(`platform-contracts.yml: missing ${gate} API/model contract gate`);
  }
  if (!ci.includes('pnpm --filter @allah/arsy test')) failures.push('platform-contracts.yml: Arsy API and trust-boundary tests are missing');
  if (!ci.includes('pnpm --filter @allah/arsy-orm test')) failures.push('platform-contracts.yml: ORM model and persistence tests are missing');
  if (!sbom.includes('release:') || !sbom.includes('upload-sbom')) {
    failures.push('sbom.yml: release SBOM publication contract is incomplete');
  }
  if (!sbom.includes('attestations: write') || !sbom.includes('sbom.spdx.json')) {
    failures.push('sbom.yml: SBOM must be uploaded and attested');
  }
  for (const gate of ['pnpm docs:check', 'pnpm contract:check', 'pnpm lint:arch']) {
    if (!publish.includes(gate)) failures.push(`publish-deploy.yml: missing ${gate} API/model preflight`);
  }
  if (!publish.includes('pnpm platform:contract:check')) {
    failures.push('publish-deploy.yml: platform contract gate is missing');
  }
  if (!publish.includes('pnpm --filter @allah/arsy-orm test')) {
    failures.push('publish-deploy.yml: ORM model and persistence tests are missing');
  }
  if (!publish.includes('needs: [validate-compose, validate-docker-contracts, validate-platform-contracts]')) {
    failures.push('publish-deploy.yml: image publish must depend on all preflight contracts');
  }
  if (!publish.includes('type=raw,value=latest') || !publish.includes('type=sha,prefix=sha-')) {
    failures.push('publish-deploy.yml: images must have latest and commit-SHA tags');
  }
  if (!publish.includes('needs: publish')) failures.push('publish-deploy.yml: release must wait for every image publish');
}

function routeFiles(directory) {
  const files = [];
  const visit = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.name === 'route.ts' || entry.name === 'route.tsx') files.push(path);
    }
  };
  if (existsSync(directory)) visit(directory);
  return files;
}

function checkApiAndModelContracts() {
  const arsySource = read(join(root, 'apps/arsy/src/app.ts'));
  if (!arsySource.includes('createPrincipalGuard') || !arsySource.includes('isPublicRoute')) {
    failures.push('apps/arsy/src/app.ts: API must retain default-deny principal guard and explicit public route matching');
  }
  for (const app of apps) {
    const contract = join(root, 'apps', app, 'CONTRACT.md');
    if (!existsSync(contract)) {
      failures.push(`apps/${app}/CONTRACT.md: missing`);
      continue;
    }
    const appDir = join(root, 'apps', app, 'src', 'app');
    if (!existsSync(appDir)) continue;
    const actual = readdirSync(appDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('(') && !entry.name.startsWith('['))
      .map((entry) => entry.name)
      .sort();
    const declared = contractList(contract, 'routes').sort();
    if (JSON.stringify(actual) !== JSON.stringify(declared)) {
      failures.push(`apps/${app}/CONTRACT.md: routes mismatch, declared [${declared}] actual [${actual}]`);
    }
    for (const routeFile of routeFiles(appDir)) {
      const source = read(routeFile);
      if (!/export\s+(?:async\s+)?function\s+(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/.test(source)) {
        failures.push(`${routeFile.slice(root.length + 1)}: Next route must export an HTTP method handler`);
      }
    }
  }
  const addons = readdirSync(join(root, 'addons'), { withFileTypes: true }).filter((entry) => entry.isDirectory());
  const seedRegistry = read(join(root, 'addons/default-data.ts'));
  for (const addon of addons) {
    const manifest = readJson(join(root, 'addons', addon.name, '__manifest__.json'));
    if (!Array.isArray(manifest.models) || !Array.isArray(manifest.depends) || !Array.isArray(manifest.data)) {
      failures.push(`addons/${addon.name}/__manifest__.json: models, depends, and data arrays are required`);
    }
    if (!existsSync(join(root, 'addons', addon.name, 'CONTRACT.md'))) {
      failures.push(`addons/${addon.name}/CONTRACT.md: missing`);
    }
    if (!new RegExp(`^\\s*${addon.name}:`, 'm').test(seedRegistry)) {
      failures.push(`addons/default-data.ts: ${addon.name} is missing from DEFAULT_DATA_REGISTRY`);
    }
    const manifestContract = join(root, 'addons', addon.name, 'CONTRACT.md');
    for (const field of ['models', 'depends', 'data']) {
      const declared = contractList(manifestContract, field).sort();
      const actual = (manifest[field] ?? []).slice().sort();
      if (JSON.stringify(declared) !== JSON.stringify(actual)) {
        failures.push(`addons/${addon.name}/CONTRACT.md: ${field} differs from __manifest__.json`);
      }
    }
  }
}

checkComposeTopology();
checkRuntimeHealth();
checkEnvironmentContract();
checkCiAndRelease();
checkApiAndModelContracts();

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Platform contracts passed for ${apps.length} apps.`);
