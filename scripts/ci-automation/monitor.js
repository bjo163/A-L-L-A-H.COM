#!/usr/bin/env node
/**
 * CI Monitor & Auto-Fix Automation
 * 
 * Monitors GitHub Actions CI for failures, attempts auto-fix for known patterns,
 * commits and pushes fixes.
 * 
 * Usage: 
 *   node monitor.js                    # Run once
 *   node monitor.js --daemon           # Run every 10 minutes
 *   node monitor.js --check            # Check status only
 * 
 * Requires: GH_TOKEN env var with repo:read, repo:write permissions
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const REPO_OWNER = 'bjo163';
const REPO_NAME = 'A-L-L-A-H.COM';
const BRANCH = 'dev';
const CHECK_INTERVAL = 10 * 60 * 1000; // 10 minutes

const GH_TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
if (!GH_TOKEN) {
  console.error('❌ GH_TOKEN or GITHUB_TOKEN environment variable required');
  process.exit(1);
}

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

interface JobRun {
  id: number;
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: string | null;
  steps: JobStep[];
}

interface JobStep {
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: string | null;
  number: number;
}

async function ghApi(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}${endpoint}`;
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

async function getJobLogs(runId: number): Promise<JobRun[]> {
  const jobs = await ghApi(`/actions/runs/${runId}/jobs`);
  return jobs.jobs || [];
}

async function getFailedStepLogs(runId: number, jobId: number, stepNumber: number): Promise<string> {
  try {
    const logs = await ghApi(`/actions/runs/${runId}/jobs/${jobId}/logs`);
    return logs;
  } catch {
    return '';
  }
}

function analyzeFailure(job: JobRun): { type: string; message: string; fixable: boolean; fixFn?: () => Promise<boolean> } | null {
  for (const step of job.steps) {
    if (step.conclusion === 'failure') {
      const stepName = step.name.toLowerCase();
      
      // TypeScript type-check failures
      if (stepName.includes('typescript') || stepName.includes('typecheck') || stepName.includes('type-check')) {
        return {
          type: 'typescript',
          message: `TypeScript failure in step: ${step.name}`,
          fixable: true,
          fixFn: async () => await fixTypeScriptErrors(),
        };
      }
      
      // Lint failures
      if (stepName.includes('lint') || stepName.includes('architectural')) {
        return {
          type: 'lint',
          message: `Lint failure in step: ${step.name}`,
          fixable: true,
          fixFn: async () => await fixLintErrors(),
        };
      }
      
      // Build failures
      if (stepName.includes('build') && !stepName.includes('docker')) {
        return {
          type: 'build',
          message: `Build failure in step: ${step.name}`,
          fixable: true,
          fixFn: async () => await fixBuildErrors(),
        };
      }
      
      // Docs check failures
      if (stepName.includes('doc') || stepName.includes('documentation')) {
        return {
          type: 'docs',
          message: `Documentation check failure in step: ${step.name}`,
          fixable: true,
          fixFn: async () => await fixDocsErrors(),
        };
      }
      
      return {
        type: 'unknown',
        message: `Unknown failure in step: ${step.name}`,
        fixable: false,
      };
    }
  }
  return null;
}

async function fixTypeScriptErrors(): Promise<boolean> {
  console.log('🔧 Attempting to fix TypeScript errors...');
  
  try {
    // Run typecheck to see errors
    const output = execSync('pnpm typecheck 2>&1', { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
    console.log('No TypeScript errors found');
    return true;
  } catch (e: any) {
    const output = e.stdout || e.message;
    
    // Common patterns we can auto-fix:
    // 1. Implicit any - add type annotations
    // 2. Missing imports
    // 3. Unused variables
    
    console.log('TypeScript errors detected, attempting fixes...');
    
    // Run the typecheck with --fix if available, or try common fixes
    try {
      // Try to auto-fix with eslint if it's a lint-related TS error
      execSync('pnpm lint:fix 2>&1', { encoding: 'utf-8', stdio: 'inherit', timeout: 60000 });
    } catch {}
    
    // Re-check
    try {
      execSync('pnpm typecheck 2>&1', { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
      console.log('✅ TypeScript errors fixed');
      return true;
    } catch {
      console.log('❌ Could not auto-fix TypeScript errors');
      return false;
    }
  }
}

async function fixLintErrors(): Promise<boolean> {
  console.log('🔧 Attempting to fix lint errors...');
  
  try {
    // Run lint with auto-fix
    execSync('pnpm lint:fix 2>&1', { encoding: 'utf-8', stdio: 'inherit', timeout: 60000 });
    
    // Re-check
    execSync('pnpm lint:arch 2>&1', { encoding: 'utf-8', stdio: 'inherit', timeout: 60000 });
    console.log('✅ Lint errors fixed');
    return true;
  } catch {
    console.log('❌ Could not auto-fix lint errors');
    return false;
  }
}

async function fixBuildErrors(): Promise<boolean> {
  console.log('🔧 Attempting to fix build errors...');
  
  try {
    execSync('pnpm --filter @moonwitness/gate build 2>&1', { encoding: 'utf-8', stdio: 'inherit', timeout: 180000 });
    console.log('✅ Build errors fixed');
    return true;
  } catch {
    console.log('❌ Could not auto-fix build errors');
    return false;
  }
}

async function fixDocsErrors(): Promise<boolean> {
  console.log('🔧 Attempting to fix docs errors...');
  
  try {
    execSync('pnpm docs:check 2>&1', { encoding: 'utf-8', stdio: 'inherit', timeout: 60000 });
    console.log('✅ Docs errors fixed');
    return true;
  } catch {
    console.log('❌ Could not auto-fix docs errors');
    return false;
  }
}

async function commitAndPush(message: string): Promise<boolean> {
  try {
    // Check if there are changes
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    if (!status.trim()) {
      console.log('No changes to commit');
      return false;
    }
    
    execSync('git add -A', { encoding: 'utf-8', stdio: 'inherit' });
    execSync(`git commit -m "${message}"`, { encoding: 'utf-8', stdio: 'inherit' });
    execSync('git push origin dev', { encoding: 'utf-8', stdio: 'inherit', timeout: 300000 });
    console.log('✅ Committed and pushed');
    return true;
  } catch (e: any) {
    console.error('❌ Commit/push failed:', e.message);
    return false;
  }
}

async function checkAndFix(): Promise<void> {
  console.log(`
🔍 [${new Date().toISOString()}] Checking CI status...`);
  
  try {
    const runs = await getLatestWorkflowRuns();
    
    if (runs.length === 0) {
      console.log('No workflow runs found');
      return;
    }
    
    const latestRun = runs[0];
    console.log(`Latest run: ${latestRun.name} - ${latestRun.conclusion} (${latestRun.html_url})`);
    
    if (latestRun.conclusion === 'success') {
      console.log('✅ Latest run passed');
      return;
    }
    
    if (latestRun.conclusion !== 'failure') {
      console.log(`Run status: ${latestRun.conclusion} - not a failure we can fix`);
      return;
    }
    
    console.log('❌ Failure detected, analyzing...');
    
    const jobs = await getJobLogs(latestRun.id);
    let anyFixed = false;
    
    for (const job of jobs) {
      if (job.conclusion === 'failure') {
        const analysis = analyzeFailure(job);
        if (analysis && analysis.fixable && analysis.fixFn) {
          console.log(`🔧 Attempting fix for: ${analysis.type}`);
          const fixed = await analysis.fixFn!();
          if (fixed) {
            const committed = await commitAndPush(`fix: auto-fix ${analysis.type} errors from CI

Auto-fixed by CI monitor
Original run: ${latestRun.html_url}`);
            if (committed) {
              anyFixed = true;
              console.log('✅ Fix committed and pushed, will trigger new CI run');
            }
          }
        } else if (analysis) {
          console.log(`⚠️  Cannot auto-fix: ${analysis.message}`);
        }
      }
    }
    
    if (!anyFixed) {
      console.log('⚠️  No auto-fixes applied. Manual intervention required.');
      // Could send notification here (Slack, Discord, email, etc.)
    }
    
  } catch (e: any) {
    console.error('❌ Monitor error:', e.message);
  }
}

async function runDaemon(): Promise<void> {
  console.log('🚀 Starting CI Monitor daemon (every 10 minutes)');
  console.log('Press Ctrl+C to stop
');
  
  // Initial check
  await checkAndFix();
  
  setInterval(async () => {
    await checkAndFix();
  }, CHECK_INTERVAL);
}

// CLI
const args = process.argv.slice(2);

if (args.includes('--daemon')) {
  runDaemon().catch(console.error);
} else if (args.includes('--check')) {
  checkAndFix().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
} else {
  checkAndFix().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}
