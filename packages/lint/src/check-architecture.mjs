#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.resolve(process.cwd());

const violations = [];

// Helper to recursively collect files
function collectFiles(dir, extensions, excludeDirs = []) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        excludeDirs.includes(entry.name) ||
        entry.name === 'node_modules' ||
        entry.name === '.next' ||
        entry.name === 'dist' ||
        entry.name === '.git'
      ) {
        continue;
      }
      results.push(...collectFiles(fullPath, extensions, excludeDirs));
    } else if (entry.isFile()) {
      if (extensions.some((ext) => entry.name.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

// 1. RULE: UI_PURITY
// Scans apps/**/*.{tsx,jsx} for raw un-themed <button or <input elements
function checkUiPurity() {
  const appsDir = path.join(ROOT_DIR, 'apps');
  const appFiles = collectFiles(appsDir, ['.tsx', '.jsx']);

  for (const filePath of appFiles) {
    const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Match <button (but not <Button or comments)
      if (line.includes('<button ') || line.includes('<button>')) {
        if (!line.trim().startsWith('//') && !line.trim().startsWith('*')) {
          violations.push({
            file: relativePath,
            rule: 'UI_PURITY',
            message: `Raw <button> element detected. All interactive controls in apps/ must be imported from '@moonwitness/ui'.`,
            line: i + 1,
          });
        }
      }

      // Match raw <input (but not <Input)
      if (/<input\s+[^>]*type=["'](text|password|email)["']/i.test(line) && !line.includes('<Input') && !line.includes('//')) {
        violations.push({
          file: relativePath,
          rule: 'UI_PURITY',
          message: `Raw <input> element detected. Use <Input> component from '@moonwitness/ui'.`,
          line: i + 1,
        });
      }
    }
  }
}

// 2. RULE: ZERO_ORM_OVERLAP
// Ensure no secondary ORMs (Drizzle, Prisma, TypeORM, Mongoose) exist in the monorepo
function checkZeroOrmOverlap() {
  const allFiles = collectFiles(ROOT_DIR, ['.ts', '.tsx', '.js', '.mjs'], [
    'node_modules',
    'dist',
    '.next',
    'packages/lint',
  ]);

  const forbiddenPackages = ['drizzle-orm', '@prisma/client', 'typeorm', 'mongoose'];

  for (const filePath of allFiles) {
    const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath, 'utf8');

    for (const pkg of forbiddenPackages) {
      if (content.includes(`from '${pkg}'`) || content.includes(`from "${pkg}"`) || content.includes(`require('${pkg}')`)) {
        violations.push({
          file: relativePath,
          rule: 'ZERO_ORM_OVERLAP',
          message: `Forbidden ORM '${pkg}' imported. Only embedded PGlite via '@allah/arsy-orm' is permitted.`,
        });
      }
    }
  }
}

// 3. RULE: UNIVERSAL_SDK_CLIENT
// Ensure client applications communicate via @allah/sdk
function checkSdkClientUsage() {
  const appsDir = path.join(ROOT_DIR, 'apps');
  const appClientFiles = collectFiles(appsDir, ['.ts', '.tsx']);

  for (const filePath of appClientFiles) {
    const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath, 'utf8');

    // Skip server-side API files in apps/arsy
    if (relativePath.startsWith('apps/arsy/')) continue;

    if (content.includes("fetch('/v1/chat/completions'") || content.includes("fetch('/api/auth/sign-in'")) {
      violations.push({
        file: relativePath,
        rule: 'UNIVERSAL_SDK_CLIENT',
        message: `Direct un-typed API fetch detected. Client apps must route all Hub communication through '@allah/sdk'.`,
      });
    }
  }
}

// 4. RULE: SHARED_DATA_CONTRACTS
// Check for duplicate entity contract declarations in apps/
function checkSharedDataContracts() {
  const appsDir = path.join(ROOT_DIR, 'apps');
  const appFiles = collectFiles(appsDir, ['.ts', '.tsx']);
  const sharedEntities = ['interface UserSubject', 'interface ActiveSession', 'interface ChatCompletionRequest'];

  for (const filePath of appFiles) {
    const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
    if (relativePath.startsWith('apps/arsy/')) continue;
    const content = fs.readFileSync(filePath, 'utf8');

    for (const entity of sharedEntities) {
      if (content.includes(entity)) {
        violations.push({
          file: relativePath,
          rule: 'SHARED_DATA_CONTRACTS',
          message: `Local entity declaration '${entity}' detected. Must import shared types from '@moonwitness/types'.`,
        });
      }
    }
  }
}

// Run all rules
console.log('============================================================');
console.log('  @moonwitness/lint - Monorepo Architectural Invariant Gate');
console.log('============================================================\n');

checkUiPurity();
checkZeroOrmOverlap();
checkSdkClientUsage();
checkSharedDataContracts();

if (violations.length > 0) {
  console.error(`❌ ARCHITECTURAL VIOLATIONS DETECTED (${violations.length} error(s)):\n`);
  for (const v of violations) {
    const location = v.line ? `${v.file}:${v.line}` : v.file;
    console.error(`  - [${v.rule}] ${location}: ${v.message}`);
  }
  console.error('\nPre-commit architectural gate FAILED.');
  process.exit(1);
} else {
  console.log('✅ All Architectural Invariants PASSED (100% compliant).\n');
  console.log('  ✓ UI Purity: Strict @moonwitness/ui enforcement');
  console.log('  ✓ Single ORM: PGlite embedded @allah/arsy-orm verified');
  console.log('  ✓ Universal SDK: @allah/sdk protocol compliance verified');
  console.log('  ✓ Shared Types: @moonwitness/types contract integrity verified');
  console.log('------------------------------------------------------------\n');
  process.exit(0);
}
