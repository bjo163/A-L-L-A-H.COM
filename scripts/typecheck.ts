#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.resolve(__dirname, '..');

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
  console.log(`  TypeScript Strict Type-Check Gate`);
  console.log(`============================================================\n`);
  console.log(`Found ${tsconfigs} tsconfig project(s) to check.\n`);

  let failed = false;

  for (const tsconfigPath of tsconfigs) {
    const relativePath = path.relative(ROOT_DIR, tsconfigPath).replace(/\\/g, '/');
    console.log(`  Checking: ${relativePath}`);

    const { execSync } = require('child_process');
    try {
      execSync(`npx tsc --noEmit --project "${tsconfigPath}"`, {
        stdio: 'pipe',
        cwd: ROOT_DIR,
        encoding: 'utf8',
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
    console.log('✅ All TypeScript projects PASSED strict type-check (100% compliant).');
    process.exit(0);
  }
}

main();
