#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const EXCLUDE_DIRS = new Set([
  'node_modules',
  'dist',
  '.next',
  '.git',
]);

function collectTsconfigs(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectTsconfigs(fullPath));
    } else if (entry.name === 'tsconfig.json') {
      results.push(fullPath);
    }
  }
  return results;
}

function main() {
  const tsconfigs = collectTsconfigs(ROOT_DIR)
    .filter(p => !p.includes('node_modules'))
    .sort();

  console.log(`============================================================`);
  console.log(`  TypeScript Type-Check Gate`);
  console.log(`============================================================\n`);
  console.log(`Found ${tsconfigs.length} tsconfig project(s) to check.\n`);

  let failed = false;

  for (const tsconfigPath of tsconfigs) {
    const relativePath = path.relative(ROOT_DIR, tsconfigPath).replace(/\\/g, '/');
    console.log(`  Checking: ${relativePath}`);

    // Resolve the workspace tsc binary directly: spawning `npx` via
    // execFileSync fails on Windows (npx.cmd is not resolvable without a shell).
    const tscBin = path.join(ROOT_DIR, 'node_modules', 'typescript', 'bin', 'tsc');
    try {
      const cacheRelative = relativePath.replace(/[^a-zA-Z0-9_-]+/g, '-');
      const cacheDir = path.join(ROOT_DIR, '.cache', 'typecheck');
      fs.mkdirSync(cacheDir, { recursive: true });
      execFileSync(process.execPath, [
        tscBin,
        '--noEmit',
        '--incremental',
        '--tsBuildInfoFile', path.join(cacheDir, `${cacheRelative}.tsbuildinfo`),
        '--project', tsconfigPath,
      ], {
        stdio: 'pipe',
        cwd: ROOT_DIR,
        encoding: 'utf8',
        maxBuffer: 20 * 1024 * 1024,
      });
    } catch (err: any) {
      failed = true;
      console.error(`    ❌ FAILED: ${relativePath}`);
      if (err.stdout) console.error(err.stdout.toString());
      if (err.stderr) console.error(err.stderr.toString());
      console.error('');
    }
  }

  console.log('------------------------------------------------------------\n');

  if (failed) {
    console.error('❌ TypeScript type-check FAILED. One or more projects have errors.');
    process.exit(1);
  } else {
    // Report the real strict coverage instead of claiming it for the whole monorepo.
    const strictCount = tsconfigs.filter(p => fs.readFileSync(p, 'utf8').includes('"strict": true')).length;
    console.log(`✅ All TypeScript projects passed. Strict mode is enabled in ${strictCount} of ${tsconfigs.length}.`);
    process.exit(0);
  }
}

main();
