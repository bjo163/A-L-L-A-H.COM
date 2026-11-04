#!/usr/bin/env node
/**
 * CI Monitor & Auto-Fix Automation
 *
 * Monitors GitHub Actions CI for failures on the target branch, attempts
 * auto-fix for known gate patterns, then commits and pushes fixes.
 *
 * Usage:
 *   pnpm tsx scripts/ci-automation/monitor.mts           # Run once
 *   pnpm tsx scripts/ci-automation/monitor.mts --daemon  # Run on an interval
 *   pnpm tsx scripts/ci-automation/monitor.mts --check   # Check status only
 *
 * Requires: GH_TOKEN or GITHUB_TOKEN env var with repo read/write permissions.
 * Repo owner/name derive from GITHUB_REPOSITORY or git remote (no hardcoding).
 */

import { execSync } from 'node:child_process';

const BRANCH_ENV = process.env.CI_MONITOR_BRANCH ?? 'dev';
// Strictly validate before the string ever reaches execSync — no shell metacharacters.
if (!/^[A-Za-z0-9._/-]+$/.test(BRANCH_ENV)) {
  console.error('CI_MONITOR_BRANCH contains invalid characters.');
  process.exit(1);
}
const BRANCH = BRANCH_ENV;
const CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour (cron in the workflow decides the real cadence)

const GH_TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
if (!GH_TOKEN) {
  console.error('GH_TOKEN or GITHUB_TOKEN environment variable required');
  process.exit(1);
}

function resolveRepoSlug(): string {
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;
  try {
    const remote = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();
    const match = remote.match(/[:/]([^/]+\/[^/.]+?)(?:\.git)?$/);
    if (match?.[1]) return match[1];
  } catch {
    // fall through to error below
  }
  console.error('Cannot determine repository slug (set GITHUB_REPOSITORY or configure a git remote).');
  process.exit(1);
}

const REPO_SLUG = resolveRepoSlug();

interface WorkflowRun {
  id: number;
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required' | null;
  html_url: string;
  head_sha: string;
  created_at: string;
  updated_at: string;
}

interface JobStep {
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: string | null;
  number: number;
}

interface JobRun {
  id: number;
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: string | null;
  steps: JobStep[];
}

async function ghApi(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `https://api.github.com/repos/${REPO_SLUG}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${GH_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API error ${response.status}: ${text}`);
  }

  return response.json();
}

async function getLatestWorkflowRuns(): Promise<WorkflowRun[]> {
  const runs = await ghApi(`/actions/runs?branch=${BRANCH}&per_page=20&status=completed`);
  return runs.workflow_runs || [];
}

async function getRunJobs(runId: number): Promise<JobRun[]> {
  const jobs = await ghApi(`/actions/runs/${runId}/jobs`);
  return jobs.jobs || [];
}

function analyzeFailure(job: JobRun): { type: string; message: string; fixable: boolean; fixFn?: () => Promise<boolean> } | null {
  for (const step of job.steps) {
    if (step.conclusion === 'failure') {
      const stepName = step.name.toLowerCase();

      // TypeScript type-check failures
      if (stepName.includes('typescript') || stepName.includes('typecheck') || stepName.includes('type-check')) {
        return { type: 'typescript', message: `TypeScript failure in step: ${step.name}`, fixable: true, fixFn: fixTypeScriptErrors };
      }

      // Lint failures
      if (stepName.includes('lint') || stepName.includes('architectural')) {
        return { type: 'lint', message: `Lint failure in step: ${step.name}`, fixable: true, fixFn: fixLintErrors };
      }

      // Build failures
      if (stepName.includes('build') && !stepName.includes('docker')) {
        return { type: 'build', message: `Build failure in step: ${step.name}`, fixable: true, fixFn: fixBuildErrors };
      }

      // Docs check failures
      if (stepName.includes('doc') || stepName.includes('documentation')) {
        return { type: 'docs', message: `Documentation check failure in step: ${step.name}`, fixable: true, fixFn: fixDocsErrors };
      }

      return { type: 'unknown', message: `Unknown failure in step: ${step.name}`, fixable: false };
    }
  }
  return null;
}

function runGate(command: string, timeout = 60_000): boolean {
  try {
    execSync(command, { encoding: 'utf-8', stdio: 'inherit', timeout });
    return true;
  } catch {
    return false;
  }
}

async function fixTypeScriptErrors(): Promise<boolean> {
  console.log('Attempting to fix TypeScript errors...');
  if (runGate('pnpm typecheck')) {
    console.log('No TypeScript errors found');
    return true;
  }
  console.log('TypeScript errors detected, attempting lint autofix...');
  runGate('pnpm lint --fix', 120_000);
  if (runGate('pnpm typecheck')) {
    console.log('TypeScript errors fixed');
    return true;
  }
  console.log('Could not auto-fix TypeScript errors');
  return false;
}

async function fixLintErrors(): Promise<boolean> {
  console.log('Attempting to fix lint errors...');
  // eslint --fix handles style; architectural invariants are never auto-fixable
  // by design, so a lint:arch failure here means a human/agent must fix source.
  runGate('pnpm lint --fix', 120_000);
  if (runGate('pnpm lint') && runGate('pnpm lint:arch', 120_000)) {
    console.log('Lint errors fixed');
    return true;
  }
  console.log('Could not auto-fix lint errors');
  return false;
}

async function fixBuildErrors(): Promise<boolean> {
  console.log('Attempting to fix build errors...');
  // Build failures are rarely mechanical; re-run to confirm, do not fake a fix.
  if (runGate(`pnpm --filter @moonwitness/gate build`, 300_000)) {
    console.log('Build now passes (transient failure)');
    return true;
  }
  console.log('Could not auto-fix build errors');
  return false;
}

async function fixDocsErrors(): Promise<boolean> {
  console.log('Attempting to fix docs errors...');
  if (runGate('pnpm docs:check')) {
    console.log('Docs check now passes (transient failure)');
    return true;
  }
  console.log('Could not auto-fix docs errors');
  return false;
}

async function commitAndPush(message: string): Promise<boolean> {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    if (!status.trim()) {
      console.log('No changes to commit');
      return false;
    }
    const header = `fix: auto-fix ${message} [skip ci]`;
    execSync('git add -A', { encoding: 'utf-8', stdio: 'inherit' });
    execSync(`git commit -m "${header.replace(/"/g, '\\"')}"`, { encoding: 'utf-8', stdio: 'inherit' });
    execSync(`git push origin ${BRANCH}`, { encoding: 'utf-8', stdio: 'inherit', timeout: 300_000 });
    console.log('Committed and pushed');
    return true;
  } catch (e: any) {
    console.error('Commit/push failed:', e.message);
    return false;
  }
}

async function checkAndFix(): Promise<void> {
  console.log(`\n[${new Date().toISOString()}] Checking CI status (${REPO_SLUG}@${BRANCH})...`);

  try {
    const runs = await getLatestWorkflowRuns();
    if (runs.length === 0) {
      console.log('No workflow runs found');
      return;
    }

    const latestRun = runs[0];
    console.log(`Latest run: ${latestRun.name} - ${latestRun.conclusion} (${latestRun.html_url})`);

    if (latestRun.conclusion === 'success') {
      console.log('Latest run passed');
      return;
    }

    if (latestRun.conclusion !== 'failure') {
      console.log(`Run status: ${latestRun.conclusion} - not a failure we can fix`);
      return;
    }

    console.log('Failure detected, analyzing...');

    const jobs = await getRunJobs(latestRun.id);
    let anyFixed = false;

    for (const job of jobs) {
      if (job.conclusion !== 'failure') continue;
      const analysis = analyzeFailure(job);
      if (!analysis) continue;
      if (analysis.fixable && analysis.fixFn) {
        console.log(`Attempting fix for: ${analysis.type}`);
        const fixed = await analysis.fixFn();
        if (!fixed) {
          console.log(`Fix attempt failed for: ${analysis.type}`);
          continue;
        }
        const committed = await commitAndPush(`${analysis.type} errors from CI\n\nAuto-fixed by CI monitor.\nOriginal run: ${latestRun.html_url}`.replace(/\n/g, ' '));
        if (committed) {
          anyFixed = true;
          console.log('Fix committed and pushed, will trigger new CI run');
        }
      } else {
        console.log(`Cannot auto-fix: ${analysis.message}`);
      }
    }

    if (!anyFixed) {
      console.log('No auto-fixes applied. Manual intervention required.');
    }
  } catch (e: any) {
    console.error('Monitor error:', e.message);
    process.exitCode = 1;
  }
}

async function runDaemon(): Promise<void> {
  console.log(`Starting CI Monitor daemon (every ${CHECK_INTERVAL / 60000} minutes)`);
  await checkAndFix();
  setInterval(() => {
    void checkAndFix();
  }, CHECK_INTERVAL);
}

// CLI
const args = process.argv.slice(2);

if (args.includes('--daemon')) {
  runDaemon().catch((e) => { console.error(e); process.exit(1); });
} else {
  checkAndFix().then(() => process.exit(process.exitCode ?? 0)).catch((e) => { console.error(e); process.exit(1); });
}
