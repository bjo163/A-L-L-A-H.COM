#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { selectBuilds } from './affected-builds.mjs';

const root = resolve(import.meta.dirname, '..');
let files = [];
const base = process.env.BUILD_AFFECTED_BASE;
if (base) {
  files = execFileSync('git', ['diff', '--name-only', `${base}...HEAD`], { cwd: root, encoding: 'utf8' })
    .split(/\r?\n/).filter(Boolean);
} else {
  files = execFileSync('git', ['diff', '--name-only', 'HEAD'], { cwd: root, encoding: 'utf8' })
    .split(/\r?\n/).filter(Boolean);
}

const { all, selected } = selectBuilds(files);
if (selected.length === 0) {
  console.log('No application build is affected by documentation-only changes.');
  process.exit(0);
}
console.log(`Building ${all ? 'all components' : 'affected components'}: ${selected.map(([prefix]) => prefix).join(', ')}`);
for (const [, command] of selected) {
  const [, ...args] = command.split(' ');
  if (process.platform === 'win32') {
    execFileSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', `pnpm ${args.join(' ')}`], { cwd: root, stdio: 'inherit' });
  } else {
    execFileSync('pnpm', args, { cwd: root, stdio: 'inherit' });
  }
}
