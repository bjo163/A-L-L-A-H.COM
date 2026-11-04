#!/usr/bin/env node
// Plan Selection Automation (execution side)
//
// Companion to scripts/plan-audit.mjs. The audit archives plans that are already
// `completed`; THIS script finds the next *pending* plan (spec status proposed /
// in_progress) that an agent should execute to completion, ranked smallest-first
// (fewest unchecked task.md boxes) per the owner's "smallest-contained only" choice.
//
// It is deterministic, read-only, and does NOT implement anything — implementing a
// plan is agent work. A Qoder cron agent runs `plan-next.mjs --json` to get exactly
// one plan, executes it, and either pushes green work or records a failure here so a
// repeatedly-failing plan is quarantined instead of retried forever.
//
// Modes:
//   --json          Print { plan, status, openTasks, reason } for the single chosen
//                   plan, or { plan: null, reason } when there is nothing safe to run.
//   --list          Print the ranked table of every execut-able pending plan.
//   --record-fail <dir> --reason "..."   Increment this plan's fail count in the
//                   quarantine state (the agent calls this after a gate failure).
//
// Flags / env:
//   --max-open=N    Cap on open-task count for a plan to be offered. Plans needing
//                   more than N tasks are deferred as too big to start unattended.
//                   Env PLAN_NEXT_MAX_OPEN, default 18.
//   --skip-after=N  Quarantine a plan after N recorded failures. Env
//                   PLAN_NEXT_SKIP_AFTER, default 3.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const PLANS_DIR = path.join(REPO_ROOT, '.plans');
const LOG_DIR = path.join(REPO_ROOT, 'logs');
const STATE_FILE = path.join(LOG_DIR, 'plan-exec-state.json');

const argv = process.argv.slice(2);
const MODE = argv.includes('--list')
  ? 'list'
  : argv.includes('--record-fail')
    ? 'record-fail'
    : 'json';

function flagValue(name, envName, fallback) {
  const arg = argv.find((a) => a.startsWith(`${name}=`));
  if (arg) return Number.parseInt(arg.split('=')[1], 10);
  if (process.env[envName]) return Number.parseInt(process.env[envName], 10);
  return fallback;
}
const MAX_OPEN = flagValue('--max-open', 'PLAN_NEXT_MAX_OPEN', 18);
const SKIP_AFTER = flagValue('--skip-after', 'PLAN_NEXT_SKIP_AFTER', 3);

// Same scaffold-detection signal the audit uses (plan-audit.mjs anti-slop guard) and
// the AUTONOMOUS.md §8.6 "NEW-PLATFORM-CAPABILITY-N" pile-up it calls out for exclusion.
const SCAFFOLD_RE = /new platform capability/i;

function readFrontmatter(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fm = {};
  if (match) {
    for (const line of match[1].split(/\r?\n/)) {
      const kv = line.match(/^\s*([A-Za-z0-9_]+)\s*:\s*(.*)$/);
      if (kv) fm[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '');
    }
  }
  return { fm, raw };
}

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { attempts: {} };
  }
}
function saveState(state) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

// A plan is execut-able iff: spec.md present + proposed/in_progress + not a scaffold +
// task.md present. Returns null with a reason otherwise, or the candidate object.
function inspectPlan(planDir) {
  const rel = path.posix.join('.plans', path.basename(planDir));
  const specPath = path.join(planDir, 'spec.md');
  if (!fs.existsSync(specPath)) return { skip: 'missing spec.md' };

  const { fm: specFm, raw: specRaw } = readFrontmatter(specPath);
  const status = String(specFm.status || '').toLowerCase();
  if (status !== 'proposed' && status !== 'in_progress') {
    return { skip: `not pending (status='${status || 'unknown'}')` };
  }
  if (SCAFFOLD_RE.test(specRaw) || SCAFFOLD_RE.test(path.basename(planDir))) {
    return { skip: 'simulated scaffold plan' };
  }

  const taskPath = path.join(planDir, 'task.md');
  if (!fs.existsSync(taskPath)) return { skip: 'missing task.md' };
  const task = fs.readFileSync(taskPath, 'utf8');
  const openTasks = (task.match(/^\s*-\s*\[(?: |\/)\]/gm) || []).length;
  if (openTasks === 0) return { skip: 'no open tasks (awaiting audit archive)' };

  // Directory timestamp prefix is the natural oldest-first tie-breaker.
  return {
    dir: planDir,
    rel,
    title: specFm.id || specFm.title || path.basename(planDir),
    status,
    openTasks,
    key: path.basename(planDir),
  };
}

function collectCandidates(state) {
  if (!fs.existsSync(PLANS_DIR)) return [];
  const dirs = fs
    .readdirSync(PLANS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => path.join(PLANS_DIR, e.name));

  const candidates = [];
  const excluded = [];
  for (const dir of dirs) {
    const info = inspectPlan(dir);
    if (info.skip) {
      excluded.push({ rel: path.posix.join('.plans', path.basename(dir)), reason: info.skip });
      continue;
    }
    const rel = path.posix.join('.plans', path.basename(dir));
    const fails = state.attempts[rel]?.fails || 0;
    if (fails >= SKIP_AFTER) {
      excluded.push({ rel, reason: `quarantined after ${fails} failed attempts` });
      continue;
    }
    candidates.push({ ...info, fails });
  }
  // Smallest first, then oldest timestamp prefix.
  candidates.sort((a, b) => a.openTasks - b.openTasks || a.key.localeCompare(b.key));
  return candidates;
}

function cmdList(state) {
  const candidates = collectCandidates(state);
  const rows = candidates.map(
    (c) => `${String(c.openTasks).padStart(4)}  ${c.status.padEnd(11)}  ${c.rel}`,
  );
  console.log(`Execut-able pending plans (smallest first), MAX_OPEN=${MAX_OPEN}:\n`);
  console.log(rows.length ? rows.join('\n') : '(none)');
  console.log(`\nTotal execut-able: ${candidates.length}`);
  const offered = candidates.filter((c) => c.openTasks <= MAX_OPEN).length;
  console.log(`Offered (<= MAX_OPEN): ${offered}`);
}

function cmdRecordFail(state) {
  const idx = argv.indexOf('--record-fail');
  const target = argv[idx + 1];
  if (!target) {
    console.error('record-fail requires a plan dir path after the flag');
    process.exit(1);
  }
  const relIdx = argv.indexOf('--reason');
  const reason = relIdx >= 0 ? argv[relIdx + 1] || '' : '';
  const rel = path.posix.basename(path.dirname(target)) === '.plans'
    ? path.posix.join('.plans', path.basename(target))
    : target.startsWith('.plans')
      ? target
      : path.posix.join('.plans', path.basename(target));

  const entry = state.attempts[rel] || { fails: 0, history: [] };
  entry.fails += 1;
  entry.lastReason = reason;
  entry.lastAt = new Date().toISOString();
  entry.history = [...(entry.history || []), { at: entry.lastAt, reason }].slice(-10);
  state.attempts[rel] = entry;
  saveState(state);
  console.log(`recorded fail #${entry.fails} for ${rel}${reason ? ` (${reason})` : ''}`);
  if (entry.fails >= SKIP_AFTER) console.log(`plan ${rel} now quarantined (>= ${SKIP_AFTER} fails)`);
}

function cmdJson(state) {
  const candidates = collectCandidates(state);
  if (candidates.length === 0) {
    console.log(JSON.stringify({ plan: null, reason: 'NO_PENDING_PLAN' }));
    return;
  }
  const smallest = candidates[0];
  if (smallest.openTasks > MAX_OPEN) {
    console.log(
      JSON.stringify({
        plan: null,
        reason: 'NONE_TOO_BIG',
        smallestOpenTasks: smallest.openTasks,
        maxOpen: MAX_OPEN,
        note: 'every pending plan exceeds MAX_OPEN; deferring — do not start a large feature unattended',
      }),
    );
    return;
  }
  console.log(
    JSON.stringify({
      plan: smallest.rel,
      absPath: smallest.dir,
      status: smallest.status,
      openTasks: smallest.openTasks,
      fails: smallest.fails,
      reason: 'smallest pending plan within MAX_OPEN',
    }),
  );
}

function main() {
  const state = loadState();
  if (MODE === 'list') cmdList(state);
  else if (MODE === 'record-fail') cmdRecordFail(state);
  else cmdJson(state);
}

main();
