#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { components } from './affected-builds.mjs';

const root = resolve(import.meta.dirname, '..');
const component = process.env.BUILD_COMPONENT;
const target = components.find(([name]) => name === component);
if (!target) {
  console.error(`Unknown build component: ${component || '(missing)'}`);
  process.exit(2);
}
const [, , command] = target;
const [executable, ...args] = command.split(' ');
execFileSync(executable, args, { cwd: root, stdio: 'inherit' });
