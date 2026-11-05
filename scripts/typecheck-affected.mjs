#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { delimiter, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { selectTsconfigs } from './affected-tsconfigs.mjs';
import { getChangedFiles } from './changed-files.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const excluded = new Set(['node_modules', 'dist', '.next', '.git']);

function findTsconfigs(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...findTsconfigs(path));
    else if (entry.name === 'tsconfig.json') found.push(path);
  }
  return found;
}

function runPnpm(args) {
  let executable = 'pnpm';
  if (process.platform === 'win32') {
    for (const directory of (process.env.PATH || '').split(delimiter)) {
      const candidate = join(directory, 'node_modules', 'pnpm', 'pnpm.exe');
      if (existsSync(candidate)) {
        executable = candidate;
        break;
      }
    }
  }
  try {
    execFileSync(executable, args, { cwd: root, stdio: 'inherit' });
    return 0;
  } catch (error) {
    return error.status ?? 1;
  }
}

const projects = findTsconfigs(root).map((path) => relative(root, path).replaceAll('\\', '/')).sort();
const choice = selectTsconfigs(getChangedFiles(), projects);
if (choice.all) {
  console.log('Shared, unknown, or unclassified change; running full typecheck.');
  process.exit(runPnpm(['typecheck']));
}
if (choice.selected.length === 0) {
  console.log('Documentation-only changes; no TypeScript project is affected.');
  process.exit(0);
}

const workspaceNames = choice.selected
  .filter((project) => project.startsWith('apps/') || project === 'packages/vscode-extension/tsconfig.json')
  .map((project) => {
    const directory = dirname(join(root, project));
    return JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8')).name;
  });
const filters = workspaceNames.flatMap((name) => ['--filter', `${name}^...`]);
if (filters.length > 0) {
  const code = runPnpm(['-r', ...filters, 'run', 'build']);
  if (code !== 0) process.exit(code);
}

const tsc = join(root, 'node_modules', 'typescript', 'bin', 'tsc');
const cacheDir = join(root, '.cache', 'typecheck');
mkdirSync(cacheDir, { recursive: true });
let failed = false;
for (const project of choice.selected) {
  const cacheName = project.replace(/[^a-zA-Z0-9_-]+/g, '-');
  const config = join(root, project);
  console.log(`Checking affected TypeScript project: ${project}`);
  try {
    execFileSync(process.execPath, [tsc, '--noEmit', '--incremental', '--tsBuildInfoFile', join(cacheDir, `${cacheName}.tsbuildinfo`), '--project', config], {
      cwd: root,
      stdio: 'inherit',
    });
  } catch {
    failed = true;
  }
}
process.exit(failed ? 1 : 0);
