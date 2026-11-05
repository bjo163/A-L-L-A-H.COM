#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const appsDir = join(root, 'apps');
const packagesDir = join(root, 'packages');
const failures = [];

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const appNames = readdirSync(appsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== 'server')
  .map((entry) => entry.name);
const workspacePackages = new Map(
  readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const directory = join(packagesDir, entry.name);
      const manifestPath = join(directory, 'package.json');
      return [readJson(manifestPath).name, { directory, name: entry.name }];
    }),
);

function dockerLines(path) {
  return readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+#.*$/, '').trim())
    .filter(Boolean);
}

function workspaceDependencies(manifest, seen = new Set()) {
  const direct = Object.entries({
    ...manifest.dependencies,
    ...manifest.optionalDependencies,
    ...manifest.devDependencies,
  })
    .filter(([, version]) => version === 'workspace:*' || version?.startsWith('workspace:'))
    .map(([name]) => name);
  const all = new Set();
  for (const dependency of direct) {
    if (seen.has(dependency)) continue;
    seen.add(dependency);
    all.add(dependency);
    const packageInfo = workspacePackages.get(dependency);
    if (packageInfo) {
      const dependencyManifest = readJson(join(packageInfo.directory, 'package.json'));
      for (const nested of workspaceDependencies(dependencyManifest, seen)) all.add(nested);
    }
  }
  return all;
}

function sourceFiles(directory) {
  const files = [];
  const visit = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory() && !['node_modules', '.next', 'dist'].includes(entry.name)) visit(path);
      else if (entry.isFile() && /\.(c|m)?tsx?$/.test(entry.name)) files.push(path);
    }
  };
  visit(directory);
  return files;
}

function importedRootDirectories(appDirectory) {
  const roots = new Set();
  for (const file of sourceFiles(appDirectory)) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/(?:from|import|export)\s*['"](\.{1,2}\/[^'"]+)['"]/g)) {
      const target = resolve(join(file, '..'), match[1]);
      const relativeTarget = relative(root, target).replaceAll('\\', '/');
      const topLevel = relativeTarget.split('/')[0];
      if (topLevel && topLevel !== 'apps' && topLevel !== 'packages' && topLevel !== 'node_modules') {
        roots.add(topLevel);
      }
    }
  }
  return roots;
}

for (const appName of appNames) {
  const appDirectory = join(appsDir, appName);
  const manifestPath = join(appDirectory, 'package.json');
  const dockerfilePath = join(appDirectory, 'Dockerfile');
  if (!statSync(manifestPath, { throwIfNoEntry: false })) {
    failures.push(`apps/${appName}: missing package.json`);
    continue;
  }
  if (!statSync(dockerfilePath, { throwIfNoEntry: false })) {
    failures.push(`apps/${appName}: missing Dockerfile`);
    continue;
  }

  const manifest = readJson(manifestPath);
  const lines = dockerLines(dockerfilePath);
  const hasLine = (pattern) => lines.some((line) => pattern.test(line));
  const prefix = `apps/${appName}/Dockerfile`;

  if (!hasLine(new RegExp(`^COPY apps/${appName} \\.\\/apps/${appName}$`))) {
    failures.push(`${prefix}: builder must copy the complete app source`);
  }
  if (!hasLine(new RegExp(`^COPY --from=builder(?: --chown=[^ ]+)? \\/app\\/apps\\/${appName} \\.\\/apps\\/${appName}$`))) {
    failures.push(`${prefix}: runner must copy the built app`);
  }
  if (!hasLine(/^RUN pnpm --filter /) || !lines.some((line) => line.includes(manifest.name))) {
    failures.push(`${prefix}: must build ${manifest.name} in the image`);
  }

  for (const dependency of workspaceDependencies(manifest)) {
    const packageInfo = workspacePackages.get(dependency);
    if (!packageInfo) {
      failures.push(`${prefix}: workspace dependency ${dependency} has no package directory`);
      continue;
    }
    const packagePath = `packages/${packageInfo.name}`;
    if (!hasLine(new RegExp(`^COPY ${packagePath.replace('/', '\\/')} \\.\\/${packagePath.replace('/', '\\/')}$`))) {
      failures.push(`${prefix}: builder must copy ${packagePath}`);
    }
  }

  for (const directory of importedRootDirectories(appDirectory)) {
    const sourceCopy = new RegExp(`^COPY ${directory.replace('/', '\\/')} \\.\\/${directory.replace('/', '\\/')}?$`);
    const runtimeCopy = new RegExp(`^COPY --from=builder(?: --chown=[^ ]+)? \\/app\\/${directory.replace('/', '\\/')} \\.\\/${directory.replace('/', '\\/')}?$`);
    if (!hasLine(sourceCopy)) failures.push(`${prefix}: builder must copy imported root ${directory}/`);
    if (!hasLine(runtimeCopy)) failures.push(`${prefix}: runner must copy imported root ${directory}/`);
  }
}

const publishWorkflow = readFileSync(join(root, '.github/workflows/publish-deploy.yml'), 'utf8');
for (const appName of appNames) {
  if (!publishWorkflow.includes(`dockerfile: apps/${appName}/Dockerfile`)) {
    failures.push(`.github/workflows/publish-deploy.yml: missing ${appName} image matrix entry`);
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Docker build contracts passed for ${appNames.length} apps.`);
