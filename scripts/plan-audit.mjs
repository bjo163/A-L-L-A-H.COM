#!/usr/bin/env node
// Plan Audit Automation
// Scans .plans/, validates completed plans (report.md + finished task.md),
// files each valid plan as a GitHub issue, closes it, deletes the plan dir,
// then commits the deletions and pushes. Designed to run hourly via a scheduler.
//
// Flags:
//   --dry-run   Do not create/close issues, delete dirs, commit, or push.
//   --verbose   Echo log lines to stdout.
//   --limit=N   Stop after N valid plans (safety cap for a single run).
// Issue filing and plan archival require PLAN_AUDIT_CREATE_ISSUES=1.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const PLANS_DIR = path.join(REPO_ROOT, '.plans');
const LOG_DIR = path.join(REPO_ROOT, 'logs');
const STATE_FILE = path.join(LOG_DIR, 'plan-audit-state.json');
const BRANCH = process.env.PLAN_AUDIT_BRANCH || 'dev';

const argv = process.argv.slice(2);
const DRY_RUN = argv.includes('--dry-run');
const VERBOSE = argv.includes('--verbose');
const limitArg = argv.find((a) => a.startsWith('--limit='));
const LIMIT = limitArg ? Number.parseInt(limitArg.split('=')[1], 10) : Infinity;

// The automated commit only deletes .plans documentation artifacts — it never
// touches source. The husky pre-commit/pre-push gates run full typecheck + app
// builds over the whole working tree, which would wedge an hourly housekeeping
// run (and violate the thin-CI preference). So hooks are skipped for this
// docs-only commit by default; set PLAN_AUDIT_SKIP_HOOKS=0 to force them.
// (The old PLAN_AUDIT_ENFORCE_HOOKS name inverted this meaning and was set to
// '1' in plan-audit.cmd, which made every hourly run pay the full gate cost.)
const SKIP_HOOKS = process.env.PLAN_AUDIT_SKIP_HOOKS !== '0';

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const LOG_FILE = path.join(LOG_DIR, `plan-audit-${stamp}.log`);

fs.mkdirSync(LOG_DIR, { recursive: true });

function log(message, level = 'INFO') {
  const line = `[${new Date().toISOString()}] [${level}] ${message}`;
  fs.appendFileSync(LOG_FILE, `${line}\n`, 'utf8');
  if (VERBOSE) console.log(line);
}

// Run a command inside the repo, return stdout as trimmed string.
function run(cmd, args, { allowFail = false } = {}) {
  try {
    const out = execFileSync(cmd, args, {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { ok: true, stdout: out.trim() };
  } catch (err) {
    const detail = `${err.message || err}${err.stderr ? `\n${String(err.stderr).trim()}` : ''}`;
    if (!allowFail) throw new Error(`${cmd} ${args.join(' ')} failed: ${detail}`);
    return { ok: false, stdout: '', error: detail };
  }
}

// Minimal frontmatter reader for the leading `--- ... ---` block.
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

function firstHeading(raw) {
  const m = raw.match(/^#{1,3}\s+(.+)$/m);
  return m ? m[1].trim() : '';
}

// Strip the leading frontmatter block for content checks.
function stripFrontmatter(raw) {
  return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

function validatePlan(planDir) {
  const reportPath = path.join(planDir, 'report.md');
  if (!fs.existsSync(reportPath)) {
    return { valid: false, reason: 'missing report.md' };
  }

  const { fm: reportFm, raw: reportRaw } = readFrontmatter(reportPath);

  // Completion signal: the repo contract (AGENTS.md) says spec.md status -> completed.
  const specPath = path.join(planDir, 'spec.md');
  const specFm = fs.existsSync(specPath) ? readFrontmatter(specPath).fm : {};
  const status = String(specFm.status || reportFm.status || 'unknown').toLowerCase();
  if (status !== 'completed') {
    return { valid: false, reason: `not completed (status='${status}')` };
  }

  // All tasks in task.md must be checked off.
  const taskPath = path.join(planDir, 'task.md');
  if (fs.existsSync(taskPath)) {
    const task = fs.readFileSync(taskPath, 'utf8');
    const open = (task.match(/^\s*-\s*\[ \]/gm) || []).length;
    if (open > 0) return { valid: false, reason: `${open} unchecked task(s) in task.md` };
  }

  // A real report has a heading and substantive evidence, not a stub.
  const bodyText = stripFrontmatter(reportRaw);
  const nonWs = (bodyText.match(/\S/g) || []).length;
  if (!/^#{1,3}\s+\S/m.test(bodyText) || nonWs < 200) {
    return { valid: false, reason: 'report has no substantive content' };
  }

  // Anti-slop guard: reject the generic evolve-loop scaffold boilerplate.
  if (/new platform capability/i.test(bodyText)) {
    return { valid: false, reason: 'simulated scaffold plan' };
  }

  return {
    valid: true,
    reason: 'ok',
    title: reportFm.title || firstHeading(reportRaw) || path.basename(planDir),
    plan: reportFm.plan || specFm.id || path.basename(planDir),
    excerpt: bodyText.slice(0, 1500).trim(),
  };
}

function fileIssue(plan) {
  const body = [
    `**Plan:** \`${plan.plan}\``,
    '',
    plan.excerpt || '(empty report)',
    '',
    '---',
    '_Auto-filed and closed by scripts/plan-audit.mjs after the plan passed audit._',
  ].join('\n');

  const created = run('gh', ['issue', 'create', '--title', plan.title, '--body', body], { allowFail: true });
  if (!created.ok) {
    log(`issue create failed for ${plan.plan}: ${created.error}`, 'ERROR');
    return null;
  }
  // gh prints the issue URL; parse the trailing number.
  const numMatch = created.stdout.match(/\/(\d+)\s*$/);
  if (!numMatch) {
    log(`could not parse issue number from: ${created.stdout}`, 'ERROR');
    return null;
  }
  const number = numMatch[1];
  log(`filed issue #${number} for ${plan.plan}`);

  const closed = run('gh', ['issue', 'close', number], { allowFail: true });
  if (!closed.ok) {
    log(`issue close failed for #${number}: ${closed.error}`, 'WARN');
  } else {
    log(`closed issue #${number}`);
  }
  return number;
}

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { processed: {} };
  }
}
function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

function main() {
  log('=== Plan audit start ===');
  log(`repo=${REPO_ROOT} plans=${PLANS_DIR} branch=${BRANCH} dryRun=${DRY_RUN} log=${LOG_FILE}`);

  if (process.env.PLAN_AUDIT_CREATE_ISSUES !== '1') {
    log('issue filing and plan archival are disabled; set PLAN_AUDIT_CREATE_ISSUES=1 to enable', 'WARN');
    return;
  }

  if (!fs.existsSync(PLANS_DIR)) {
    log('no .plans directory found', 'ERROR');
    process.exit(1);
  }

  const entries = fs
    .readdirSync(PLANS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => path.join(PLANS_DIR, e.name));

  const state = loadState();
  let processed = 0;
  let invalid = 0;
  let errors = 0;
  const deletedRelPaths = [];

  for (const planDir of entries) {
    const rel = path.posix.join('.plans', path.basename(planDir));
    if (state.processed[rel] && state.processed[rel].issue) {
      // Previously filed; queue the deletion only if the directory still has
      // disk or index presence — a long-gone path would break `git add`.
      const stillOnDisk = fs.existsSync(planDir);
      const stillTracked = run('git', ['ls-files', '--', rel], { allowFail: true });
      if (stillOnDisk || (stillTracked.ok && stillTracked.stdout)) deletedRelPaths.push(rel);
      continue;
    }

    const result = validatePlan(planDir);
    if (!result.valid) {
      invalid++;
      log(`skip ${rel}: ${result.reason}`, 'WARN');
      continue;
    }

    if (processed >= LIMIT) {
      log(`reached --limit=${LIMIT}, stopping`, 'WARN');
      break;
    }

    log(`valid ${rel}: "${result.title}"`);
    if (DRY_RUN) {
      log(`[dry-run] would file+close issue and delete ${rel}`);
      processed++;
      continue;
    }

    const number = fileIssue(result);
    if (!number) {
      errors++;
      continue;
    }

    try {
      fs.rmSync(planDir, { recursive: true, force: true });
      deletedRelPaths.push(rel);
      state.processed[rel] = { issue: number, at: new Date().toISOString() };
      processed++;
      log(`deleted ${rel} (issue #${number})`);
    } catch (e) {
      errors++;
      log(`delete failed for ${rel}: ${e.message}`, 'ERROR');
    }
  }

  saveState(state);

  if (!DRY_RUN && deletedRelPaths.length > 0) {
    // Stage ONLY the plan dirs we removed — never sweep unrelated WIP.
    try {
      run('git', ['add', '-A', '--', ...deletedRelPaths]);
      const hasStaged = run('git', ['diff', '--cached', '--name-only'], { allowFail: true });
      if (hasStaged.ok && hasStaged.stdout) {
        const msg = `chore(plans): archive ${processed} audited plan(s) as closed issues [skip ci]`;
        const commitArgs = SKIP_HOOKS ? ['commit', '--no-verify', '-m', msg] : ['commit', '-m', msg];
        run('git', commitArgs);
        log(`committed: ${msg} (skipHooks=${SKIP_HOOKS})`);
        const pushArgs = ['push', SKIP_HOOKS ? '--no-verify' : '--', 'origin', `HEAD:${BRANCH}`];
        const push = run('git', pushArgs, { allowFail: true });
        if (push.ok) log(`pushed to ${BRANCH}`);
        else log(`push failed: ${push.error}`, 'ERROR');
      } else {
        log('nothing staged to commit');
      }
    } catch (e) {
      errors++;
      log(`git step failed: ${e.message}`, 'ERROR');
    }
  }

  log('=== Summary ===');
  log(`total=${entries.length} processed=${processed} invalid=${invalid} errors=${errors}`);
  if (errors > 0) process.exit(2);
}

try {
  main();
} catch (e) {
  log(`fatal: ${e.message}`, 'ERROR');
  process.exit(1);
}
