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

function addViolation(rule, file, message, line = null) {
  violations.push({
    rule,
    file: path.relative(ROOT_DIR, file).replace(/\\/g, '/'),
    message,
    line,
  });
}

// Helper: strip comments from content for more accurate matching
function stripComments(content) {
  return content
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
}

// Check if a line contains a raw lowercase HTML element (not a React component)
function hasRawHTMLElement(line, element) {
  // Match <button, <input, etc. but not <Button, <Input (capitalized = React component)
  const regex = new RegExp(`<${element}(\\s|>|/)`, 'i');
  if (!regex.test(line)) return false;
  // Make sure it's actually lowercase (raw HTML), not capitalized component
  return line.includes(`<${element}`);
}

// 1. RULE: UI_PURITY
// Scans apps/** for raw un-themed HTML interactive elements.
// Skips packages/vscode-extension (VS Code webviews use raw HTML by design).
function checkUiPurity() {
  const scanDirs = [path.join(ROOT_DIR, 'apps')];
  const rawElements = ['button', 'input', 'select', 'textarea'];

  for (const scanDir of scanDirs) {
    const files = collectFiles(scanDir, ['.tsx', '.jsx']);

    for (const filePath of files) {
      const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split(/\r?\n/);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Skip comments
        if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

        for (const element of rawElements) {
          if (hasRawHTMLElement(line, element)) {
            addViolation(
              'UI_PURITY',
              filePath,
              `Raw <${element}> element detected. All interactive controls must be imported from '@moonwitness/ui'.`,
              i + 1
            );
          }
        }
      }
    }
  }
}

// 2. RULE: ZERO_ORM_OVERLAP
// Ensure no secondary ORMs (Drizzle, Prisma, TypeORM, Mongoose) exist anywhere
function checkZeroOrmOverlap() {
  const allFiles = collectFiles(ROOT_DIR, ['.ts', '.tsx', '.js', '.mjs'], [
    'node_modules', 'dist', '.next', '.git', 'packages/lint',
  ]);

  const forbiddenPackages = ['drizzle-orm', '@prisma/client', 'typeorm', 'mongoose'];

  for (const filePath of allFiles) {
    const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath, 'utf8');

    for (const pkg of forbiddenPackages) {
      const patterns = [
        new RegExp(`from ['"]${pkg}['"]`),
        new RegExp(`require\\(['"]${pkg}['"]\\)`),
        new RegExp(`import ['"]${pkg}['"]`),
      ];

      for (const pattern of patterns) {
        if (pattern.test(content)) {
          addViolation(
            'ZERO_ORM_OVERLAP',
            filePath,
            `Forbidden ORM '${pkg}' imported. Only embedded PGlite via '@allah/arsy-orm' is permitted.`
          );
          break;
        }
      }
    }
  }
}

// 3. RULE: UNIVERSAL_SDK_CLIENT
// Ensure client applications communicate via @allah/sdk, not direct fetch
function checkSdkClientUsage() {
  const appsDir = path.join(ROOT_DIR, 'apps');
  const appClientFiles = collectFiles(appsDir, ['.ts', '.tsx']);

  for (const filePath of appClientFiles) {
    const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath, 'utf8');

    // Skip server-side API route files in apps/arsy (they're the server, not client)
    if (relativePath.startsWith('apps/arsy/')) continue;

    // Check for direct fetch() calls in client apps
    const fetchRegex = /fetch\s*\(/g;
    if (fetchRegex.test(content)) {
      addViolation(
        'UNIVERSAL_SDK_CLIENT',
        filePath,
        `Direct un-typed fetch() call detected. Client apps must route all API communication through '@allah/sdk'.`
      );
    }
  }
}

// 4. RULE: SHARED_DATA_CONTRACTS
// Check for duplicate entity contract declarations that should come from @moonwitness/types
// Only checks entities actually defined in @moonwitness/types/src/index.ts
function checkSharedDataContracts() {
  const scanDirs = [path.join(ROOT_DIR, 'apps'), path.join(ROOT_DIR, 'packages')];
  const sharedEntityInterfaces = [
    'UserSubject', 'ActiveSession', 'AuthResponse',
    'ChatMessage', 'ChatCompletionRequest', 'ChatCompletionResponse', 'ChatCompletionChunk',
    'GatewayModelInfo', 'GatewayTelemetry', 'GatewayProviderInfo', 'GatewayUsageLog',
    'SDUINode', 'SDUIRoot',
    'StorageItem',
    'ToolParameter', 'ToolFunction', 'ToolDefinition', 'ToolCallFunction', 'ToolCall', 'ToolChoice', 'ToolResult',
    'JsonRpcRequest', 'JsonRpcResponse', 'McpTool', 'McpToolsListResult', 'McpToolCallResult',
    'IspPlanRecord', 'IspSubscriptionRecord',
    'NexusNasRecord', 'NexusIpPoolRecord',
    'SentinelAccountRecord', 'SentinelAccessDecision', 'SentinelSessionRecord',
    'AgentThought', 'AgentToolCallEvent', 'AgentToolResultEvent', 'AgentSduiEvent', 'AgentStreamEvent', 'AgentStep',
    'AgentRunRequest', 'AgentRunResponse',
  ];

  for (const scanDir of scanDirs) {
    const files = collectFiles(scanDir, ['.ts', '.tsx']);

    for (const filePath of files) {
      const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');

      // Skip packages/types and packages/ui themselves
      if (relativePath.startsWith('packages/types/') || relativePath.startsWith('packages/ui/')) continue;
      // Skip sentinel-radius (defines its own RADIUS protocol types, not MoonWitness shared types)
      if (relativePath.startsWith('packages/sentinel-radius/')) continue;

      const content = fs.readFileSync(filePath, 'utf8');
      const stripped = stripComments(content);

      for (const entity of sharedEntityInterfaces) {
        const interfaceRegex = new RegExp(`(interface|type)\\s+${entity}\\b`);
        if (interfaceRegex.test(stripped)) {
          addViolation(
            'SHARED_DATA_CONTRACTS',
            filePath,
            `Local entity declaration '${entity}' detected. Must import shared types from '@moonwitness/types'.`
          );
        }
      }
    }
  }
}

// 5. RULE: TENANT_ISOLATION
// Storage models defined with defineModel must use company_id for multi-tenant isolation
function checkTenantIsolation() {
  const scanDirs = [
    path.join(ROOT_DIR, 'packages', 'arsy-orm'),
    path.join(ROOT_DIR, 'addons'),
  ];

  for (const scanDir of scanDirs) {
    if (!fs.existsSync(scanDir)) continue;
    const files = collectFiles(scanDir, ['.ts', '.tsx', '.js', '.mjs']);

    for (const filePath of files) {
      const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
      const content = fs.readFileSync(filePath, 'utf8');
      const stripped = stripComments(content);

      // Only check files that actually define a storage model via defineModel
      if (!stripped.includes('defineModel')) continue;

      if (!stripped.includes('company_id')) {
        addViolation(
          'TENANT_ISOLATION',
          filePath,
          'Storage model defined with defineModel but missing company_id field. Multi-tenant isolation requires company_id on all storage models.'
        );
      }
    }
  }
}

// 6. RULE: PARAMETERIZED_QUERIES
// No raw SQL string concatenation in query method calls; use parameterized queries
function checkParameterizedQueries() {
  const allFiles = collectFiles(ROOT_DIR, ['.ts', '.tsx', '.js', '.mjs'], [
    'node_modules', 'dist', '.next', '.git', 'packages/lint',
  ]);

  // Match .query(...) or .execute(...) calls with template literals containing SQL keywords
  const sqlQueryPatterns = [
    /(\.query|\.execute)\s*\([^)]*`[\s\S]*?(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)[\s\S]*\${/gi,
    /(\.query|\.execute)\s*\([^)]*`[\s\S]*\${[\s\S]*?(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)/gi,
  ];

  for (const filePath of allFiles) {
    const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath, 'utf8');

    for (const pattern of sqlQueryPatterns) {
      if (pattern.test(content)) {
        addViolation(
          'PARAMETERIZED_QUERIES',
          filePath,
          'Potential SQL injection: string interpolation in .query()/.execute() call detected. Use parameterized queries only.'
        );
        break;
      }
    }
  }
}

// 7. RULE: NO_SECRETS
// No hardcoded API keys, tokens, passwords, or connection strings
function checkNoSecrets() {
  const allFiles = collectFiles(ROOT_DIR, ['.ts', '.tsx', '.js', '.mjs', '.json'], [
    'node_modules', 'dist', '.next', '.git', 'packages/lint', 'pnpm-lock.yaml',
  ]);

  const secretPatterns = [
    /(api_?key|apikey)\s*[:=]\s*["'][A-Za-z0-9_\-\.]{20,}["']/gi,
    /(secret|token|password|passwd)\s*[:=]\s*["'][A-Za-z0-9_\-\.]{20,}["']/gi,
    /sk_live_[A-Za-z0-9]{20,}/gi,
    /sk_test_[A-Za-z0-9]{20,}/gi,
    /ghp_[A-Za-z0-9]{20,}/gi,
    /github_pat_[A-Za-z0-9_]{20,}/gi,
    /AKIA[0-9A-Z]{16}/gi,
  ];

  for (const filePath of allFiles) {
    const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');

    // Skip .env.example files (they're templates, not real secrets)
    if (relativePath.includes('.env.example')) continue;

    const content = fs.readFileSync(filePath, 'utf8');

    for (const pattern of secretPatterns) {
      if (pattern.test(content)) {
        addViolation(
          'NO_SECRETS',
          filePath,
          'Potential hardcoded secret detected. Use environment variables or secret management instead.'
        );
        break;
      }
    }
  }
}

// 8. RULE: NO_DEBUGGER
// No debugger statements in committed code
function checkNoDebugger() {
  const allFiles = collectFiles(ROOT_DIR, ['.ts', '.tsx', '.js', '.mjs'], [
    'node_modules', 'dist', '.next', '.git', 'packages/lint',
  ]);

  for (const filePath of allFiles) {
    const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath, 'utf8');
    const stripped = stripComments(content);

    if (/^\s*debugger\s*;?/m.test(stripped)) {
      addViolation(
        'NO_DEBUGGER',
        filePath,
        'debugger statement detected. Remove before committing.'
      );
    }
  }
}

// 9. RULE: TODO_FIXME_HACK
// No blocking TODO/FIXME/HACK comments in code files (not .md docs)
function checkTodoFixmeHack() {
  const allFiles = collectFiles(ROOT_DIR, ['.ts', '.tsx', '.js', '.mjs'], [
    'node_modules', 'dist', '.next', '.git', 'packages/lint',
  ]);

  const blockingPatterns = [
    /\bTODO:\s*(?!.*(?:refactor|cleanup|minor|polish|placeholder)).*/gi,
    /\bFIXME:/gi,
    /\bHACK\x3A/gi,
  ];

  for (const filePath of allFiles) {
    const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath, 'utf8');

    for (const pattern of blockingPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          const lineNum = content.substring(0, content.indexOf(match)).split(/\r?\n/).length;
          addViolation(
            'TODO_FIXME_HACK',
            filePath,
            `Blocking comment detected: "${match.trim()}"`,
            lineNum
          );
        }
      }
    }
  }
}

// 10. RULE: ADDON_MANIFEST_CONSISTENCY
// Every addon must have a valid __manifest__.json
function checkAddonManifests() {
  const addonsDir = path.join(ROOT_DIR, 'addons');
  if (!fs.existsSync(addonsDir)) return;

  const entries = fs.readdirSync(addonsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const addonDir = path.join(addonsDir, entry.name);
    const manifestPath = path.join(addonDir, '__manifest__.json');
    const indexPath = path.join(addonDir, 'index.ts');

    if (!fs.existsSync(manifestPath)) {
      addViolation(
        'ADDON_MANIFEST_CONSISTENCY',
        addonDir,
        `Addon '${entry.name}' missing __manifest__.json`
      );
      continue;
    }

    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (!manifest.name || !manifest.version) {
        addViolation(
          'ADDON_MANIFEST_CONSISTENCY',
          manifestPath,
          `Addon '${entry.name}' manifest missing required fields: name, version`
        );
      }
    } catch (err) {
      addViolation(
        'ADDON_MANIFEST_CONSISTENCY',
        manifestPath,
        `Addon '${entry.name}' has invalid __manifest__.json: ${err.message}`
      );
    }

    if (!fs.existsSync(indexPath)) {
      addViolation(
        'ADDON_MANIFEST_CONSISTENCY',
        addonDir,
        `Addon '${entry.name}' missing index.ts entry point`
      );
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
checkTenantIsolation();
checkParameterizedQueries();
checkNoSecrets();
checkNoDebugger();
checkTodoFixmeHack();
checkAddonManifests();

if (violations.length > 0) {
  console.error(`❌ ARCHITECTURAL VIOLATIONS DETECTED (${violations.length} error(s)):\n`);
  for (const v of violations) {
    const location = v.line ? `${v.file}:${v.line}` : v.file;
    console.error(`  - [${v.rule}] ${location}: ${v.message}`);
  }
  console.error('\nArchitectural gate FAILED.');
  process.exit(1);
} else {
  console.log('✅ All Architectural Invariants PASSED (100% compliant).\n');
  console.log('  ✓ UI Purity: Strict @moonwitness/ui enforcement');
  console.log('  ✓ Single ORM: PGlite embedded @allah/arsy-orm verified');
  console.log('  ✓ Universal SDK: @allah/sdk protocol compliance verified');
  console.log('  ✓ Shared Types: @moonwitness/types contract integrity verified');
  console.log('  ✓ Tenant Isolation: company_id enforcement verified');
  console.log('  ✓ Parameterized Queries: SQL injection guard verified');
  console.log('  ✓ No Secrets: Hardcoded secret scan verified');
  console.log('  ✓ No Debugger: debugger statement scan verified');
  console.log('  ✓ Blocking comments: scan verified');
  console.log('  ✓ Addon Manifest: Addon consistency verified');
  console.log('------------------------------------------------------------\n');
  process.exit(0);
}
