#!/usr/bin/env node
/**
 * Workspace Scaffold Validation Script
 *
 * Validates that every app in the workspace has a valid project structure.
 * Exits with code 1 if any app fails validation.
 *
 * Usage: node scripts/validate-workspace-scaffolds.mjs
 */

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd());
const APPS_DIR = path.join(ROOT, 'apps');

/**
 * App type definitions with their required structures
 */
const APP_TYPES = {
  // Next.js App Router apps (require next.config.ts + src/app/ + Dockerfile)
  nextjs: {
    requiredFiles: ['next.config.ts', 'src/app', 'Dockerfile'],
    apps: ['dock', 'gate', 'harbor', 'headquarter', 'id', 'jizz', 'moonsky'],
  },
  // Fastify app (requires package.json with fastify, src/app.ts or similar)
  fastify: {
    requiredFiles: ['package.json', 'src/app.ts'],
    apps: ['arsy'],
  },
  // Sentinel RADIUS daemon (requires package.json + sentinel-radius dep)
  sentinel: {
    requiredFiles: ['package.json', 'src/main.ts'],
    apps: ['sentinel'],
  },
};

/**
 * Check if a path exists (file or directory)
 */
function exists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

/**
 * Validate a single app
 */
function validateApp(appName, appPath) {
  const errors = [];

  // Check package.json exists
  const pkgPath = path.join(appPath, 'package.json');
  if (!exists(pkgPath)) {
    errors.push(`Missing package.json`);
    return { valid: false, errors };
  }

  // Determine app type
  let appType = null;
  for (const [type, config] of Object.entries(APP_TYPES)) {
    if (config.apps.includes(appName)) {
      appType = type;
      break;
    }
  }

  // Unknown app type - skip strict validation but warn
  if (!appType) {
    errors.push(`Unknown app type "${appName}" — no validation rules defined`);
    return { valid: false, errors };
  }

  // Validate required files
  for (const req of APP_TYPES[appType].requiredFiles) {
    const reqPath = path.join(appPath, req);
    if (!exists(reqPath)) {
      errors.push(`Missing required ${req}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Main validation function
 */
function main() {
  console.log('========================================');
  console.log('  Workspace Scaffold Validation');
  console.log('========================================\n');

  if (!fs.existsSync(APPS_DIR)) {
    console.error(`❌ apps/ directory not found at ${APPS_DIR}`);
    process.exit(1);
  }

  const apps = fs.readdirSync(APPS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .filter(d => d.name !== 'server') // excluded from workspace
    .map(d => d.name);

  console.log(`Found ${apps.length} app(s): ${apps.join(', ')}\n`);

  let allValid = true;
  const results = [];

  for (const appName of apps) {
    const appPath = path.join(APPS_DIR, appName);
    const result = validateApp(appName, appPath);
    results.push({ name: appName, ...result });

    if (result.valid) {
      console.log(`✅ ${appName} — valid`);
    } else {
      allValid = false;
      console.log(`❌ ${appName} — INVALID`);
      for (const err of result.errors) {
        console.log(`   - ${err}`);
      }
    }
  }

  console.log('\n========================================');
  if (allValid) {
    console.log('✅ All apps pass scaffold validation');
    console.log('========================================');
    process.exit(0);
  } else {
    const invalidCount = results.filter(r => !r.valid).length;
    console.log(`❌ ${invalidCount} of ${apps.length} apps failed validation`);
    console.log('========================================');
    process.exit(1);
  }
}

main();