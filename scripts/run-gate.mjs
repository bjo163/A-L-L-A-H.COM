#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { performance } from 'node:perf_hooks';

const [label, command, ...args] = process.argv.slice(2);
if (!label || !command) {
  console.error('Usage: node scripts/run-gate.mjs <label> <command> [...args]');
  process.exit(2);
}

const start = performance.now();
const result = spawnSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });
const durationMs = Math.round(performance.now() - start);
const code = result.status ?? 1;
const record = { label, durationMs, exitCode: code };
const timingsFile = process.env.GATE_TIMINGS_FILE;
if (timingsFile) {
  mkdirSync(dirname(timingsFile), { recursive: true });
  appendFileSync(timingsFile, `${JSON.stringify(record)}\n`);
}
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `| ${label.replaceAll('|', '\\|')} | ${(durationMs / 1000).toFixed(1)}s | ${code} |\n`);
}
console.log(`[gate-time] ${label}: ${(durationMs / 1000).toFixed(1)}s (exit ${code})`);
process.exit(code);
