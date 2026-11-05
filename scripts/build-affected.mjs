#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { selectChangedBuilds } from './affected-builds.mjs';

const root = resolve(import.meta.dirname, '..');

const { all, selected } = selectChangedBuilds();
if (selected.length === 0) {
  console.log('No application build is affected by documentation-only changes.');
  process.exit(0);
}
console.log(`Building ${all ? 'all components' : 'affected components'}: ${selected.map(([prefix]) => prefix).join(', ')}`);
for (const [, , command] of selected) {
  const [, ...args] = command.split(' ');
  if (process.platform === 'win32') {
    execFileSync('pnpm.cmd', args, { cwd: root, stdio: 'inherit', shell: true });
  } else {
    execFileSync('pnpm', args, { cwd: root, stdio: 'inherit' });
  }
}
