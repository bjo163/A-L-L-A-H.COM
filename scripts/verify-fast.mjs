#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { appendFileSync } from 'node:fs';
const timings = [];

async function measure(label, action) {
  const start = performance.now();
  const exitCode = await action();
  const durationMs = Math.round(performance.now() - start);
  timings.push({ label, durationMs, exitCode });
  console.log(`[gate-time] ${label}: ${(durationMs / 1000).toFixed(1)}s (exit ${exitCode})`);
  return exitCode;
}

function runPnpm(args) {
  const result = spawnSync('pnpm', args, { stdio: 'inherit', shell: process.platform === 'win32' });
  return result.status ?? 1;
}

let failed = false;
for (const [label, action] of [
  ['Documentation contract', () => runPnpm(['docs:check'])],
  ['Unit contract', () => runPnpm(['contract:check'])],
  ['Architecture invariants', () => runPnpm(['lint:arch'])],
  ['Changed-file ESLint', () => runPnpm(['lint:affected'])],
  ['Incremental TypeScript', () => runPnpm(['typecheck'])],
]) {
  const code = await measure(label, action);
  if (code !== 0) {
    failed = true;
    break;
  }
}

const totalMs = timings.reduce((total, timing) => total + timing.durationMs, 0);
console.log(`[gate-time] Total: ${(totalMs / 1000).toFixed(1)}s`);
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n## Fast verification timing\n\n| Gate | Duration | Exit |\n|---|---:|---:|\n${timings.map((item) => `| ${item.label} | ${(item.durationMs / 1000).toFixed(1)}s | ${item.exitCode} |`).join('\n')}\n| Total | ${(totalMs / 1000).toFixed(1)}s | ${failed ? 1 : 0} |\n`);
}
process.exit(failed ? 1 : 0);
