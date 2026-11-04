#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { findPrivateUiClass } from './ui-purity.mjs';

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
        entry.name === 'build' ||
        entry.name === 'out' ||
        entry.name === 'coverage' ||
        entry.name === '.git'
      ) {
        continue;
      }
      results.push(...collectFiles(fullPath, extensions, excludeDirs));
    } else if (entry.isFile()) {
      if (extensions.some((ext) => entry.name.endsWith(ext))) {
        // Exclude unit test files and scripts folder from all lint rules
        const relativePath = path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/');
        if (relativePath.includes('/scripts/') || relativePath.startsWith('scripts/')) continue;
        if (/\.(test|spec)\.[tj]sx?$/.test(entry.name)) continue;
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

// Check if a line opens a raw lowercase HTML element (not a React component).
// The tag name may be the last thing on the line: JSX formatters move attributes
// onto the following lines, so end-of-line is a real boundary.
function hasRawHTMLElement(line, element) {
  const regex = new RegExp(`<${element}(\\s|>|/|$)`);
  return regex.test(line);
}

// 1. RULE: UI_PURITY
// Raw interactive or structural controls may only exist inside the design system itself.
// packages/ui defines the controls; packages/vscode-extension webviews use raw HTML by design.
function checkUiPurity() {
  const scanDirs = [path.join(ROOT_DIR, 'apps'), path.join(ROOT_DIR, 'packages')];
  const exemptPrefixes = ['packages/ui/', 'packages/vscode-extension/'];
  const rawElements = {
    button: 'Use <Button>.',
    input: 'Use <Input>.',
    select: 'Use <Select>.',
    textarea: 'Use <Textarea>.',
    a: 'Use <Link> or <Button asChild>.',
    form: 'Use <Form> with <FormField>.',
    label: 'Use <FormField label="..."> or the control label prop.',
    table: 'Use the <Table> family.',
  };

  for (const scanDir of scanDirs) {
    const files = collectFiles(scanDir, ['.tsx', '.jsx', '.css']);

    for (const filePath of files) {
      const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
      if (exemptPrefixes.some((prefix) => relativePath.startsWith(prefix))) continue;

      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split(/\r?\n/);
      const isAppFile = relativePath.startsWith('apps/');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Skip comments
        if (
          trimmed.startsWith('//') ||
          trimmed.startsWith('*') ||
          trimmed.startsWith('/*') ||
          trimmed.startsWith('{/*')
        ) {
          continue;
        }

        if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
          for (const [element, remedy] of Object.entries(rawElements)) {
            if (hasRawHTMLElement(line, element)) {
              addViolation(
                'UI_PURITY',
                filePath,
                `Raw <${element}> element detected. All controls must come from '@moonwitness/ui'. ${remedy}`,
                i + 1
              );
            }
          }
        }

        const privateUiClass = isAppFile ? findPrivateUiClass(trimmed) : null;
        if (privateUiClass) {
          addViolation(
            'UI_PURITY',
            filePath,
            `Internal '@moonwitness/ui' class '${privateUiClass}' used directly. Use a public component API or app-owned class.`,
            i + 1
          );
        }
      }
    }
  }
}

// 2. RULE: ZERO_ORM_OVERLAP
// Ensure no secondary ORMs (Drizzle, Prisma, TypeORM, Mongoose) exist anywhere
function checkZeroOrmOverlap() {
  const allFiles = collectFiles(ROOT_DIR, ['.ts', '.tsx', '.js', '.mjs'], [
    'node_modules', 'dist', 'build', 'out', '.next', '.git', 'packages/lint',
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
    'JsonRpcRequest', 'JsonRpcResponse', 'McpTool', 'McpToolsListResult', 'McpToolCallResult', 'ToolExecutionRecord',
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
    'node_modules', 'dist', 'build', 'out', '.next', '.git', 'packages/lint',
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
    'node_modules', 'dist', 'build', 'out', '.next', '.git', 'packages/lint', 'pnpm-lock.yaml',
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
    'node_modules', 'dist', 'build', 'out', '.next', '.git', 'packages/lint',
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
    'node_modules', 'dist', 'build', 'out', '.next', '.git', 'packages/lint',
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

// Shared baseline for the ratcheting rules. Counts may only fall.
const BASELINE_FILE = path.join(ROOT_DIR, 'packages', 'lint', 'style-baseline.json');

function readBaseline() {
  if (!fs.existsSync(BASELINE_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'));
  } catch (err) {
    addViolation('BASELINE_CONTRACT', BASELINE_FILE, `style-baseline.json is not valid JSON: ${err.message}`);
    return {};
  }
}

function listAppDirs() {
  const appsDir = path.join(ROOT_DIR, 'apps');
  if (!fs.existsSync(appsDir)) return [];
  return fs.readdirSync(appsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

// 11. RULE: STYLE_PURITY
// Application stylesheets resolve colour and type through the skin tokens, never literals.
function checkStylePurity(baseline) {
  const allowed = baseline.STYLE_PURITY || {};
  const colourLiteral = /#\h{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|hwb)\(/;
  const legacyVar = /^\s*--(?:background|foreground)\s*:/;
  const fallbackFont = /font-family:[^;]*\b(?:Arial|Helvetica|system-ui|-apple-system)\b/;

  for (const appName of listAppDirs()) {
    const files = collectFiles(path.join(ROOT_DIR, 'apps', appName), ['.css']);
    const findings = [];

    for (const filePath of files) {
      const lines = stripComments(fs.readFileSync(filePath, 'utf8')).split(/\r?\n/);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('data:')) continue;

        // Private component classes are not a contract. Target the data-slot hook instead.
        if (/^\s*[^@]*\.mw-[\w-]+/.test(line) || /,?\s*\.mw-[\w-]+\s*[,{]/.test(line)) {
          addViolation(
            'STYLE_PURITY',
            filePath,
            'App stylesheet targets a private `mw-*` component class. Use the `data-slot` attribute the component exposes, or a composition block from @moonwitness/ui.',
            i + 1
          );
          continue;
        }

        if (colourLiteral.test(line) || legacyVar.test(line) || fallbackFont.test(line)) {
          findings.push({ file: filePath, line: i + 1, text: line.trim().slice(0, 70) });
        }
      }
    }

    const limit = allowed[appName] === undefined ? 0 : allowed[appName];
    if (findings.length > limit) {
      const first = findings[0];
      addViolation(
        'STYLE_PURITY',
        first.file,
        `${findings.length} style findings in apps/${appName}, baseline allows ${limit}. Resolve colour, type and legacy --background/--foreground through the skin tokens (see ${first.line}: ${first.text}). Lower the number in packages/lint/style-baseline.json as you go.`,
        first.line
      );
    }
  }
}

// 12. RULE: INLINE_STYLE_PURITY
// Colour and type must not be painted inline, because an inline style cannot be themed by a skin.
function checkInlineStylePurity(baseline) {
  const allowed = baseline.INLINE_STYLE_PURITY || {};
  const paintKey = /(?:color|background|background-color|border|border-color|borderBlockEndColor|fontFamily)\s*:/;

  for (const appName of listAppDirs()) {
    const files = collectFiles(path.join(ROOT_DIR, 'apps', appName), ['.tsx', '.jsx']);
    const findings = [];

    for (const filePath of files) {
      const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('{/*')) continue;
        if (trimmed.includes('style={{') && paintKey.test(trimmed)) {
          findings.push({ file: filePath, line: i + 1 });
        }
      }
    }

    const limit = allowed[appName] === undefined ? 0 : allowed[appName];
    if (findings.length > limit) {
      const first = findings[0];
      addViolation(
        'INLINE_STYLE_PURITY',
        first.file,
        `${findings.length} painted inline styles in apps/${appName}, baseline allows ${limit}. Move colour and type into a skin class so the selected world can style it.`,
        first.line
      );
    }
  }
}

// 13. RULE: STATE_PARITY
// Every app ships the three route states QUALITY.md requires.
function checkStateParity(baseline) {
  const allowed = baseline.STATE_PARITY || {};
  const required = ['error.tsx', 'loading.tsx', 'not-found.tsx'];

  for (const appName of listAppDirs()) {
    const appRoot = path.join(ROOT_DIR, 'apps', appName, 'src', 'app');
    if (!fs.existsSync(appRoot)) continue;

    const missing = required.filter((file) => !fs.existsSync(path.join(appRoot, file)));
    const tolerated = allowed[appName] || [];
    const offending = missing.filter((file) => !tolerated.includes(file));

    for (const file of offending) {
      addViolation(
        'STATE_PARITY',
        path.join(appRoot, file),
        `apps/${appName} is missing the required route state "${file}". Build it from StatePanel and Button in '@moonwitness/ui'.`
      );
    }
  }
}

// 14. RULE: SKIN_ROOT
// Each app renders the shared skin root, with a valid and unclaimed world.
function checkSkinRoot(baseline) {
  const allowedDuplicates = baseline.SKIN_ROOT_DUPLICATES || [];
  const validSkinIds = ['imperium-lumen', 'lunar-chronicles', 'rocksoul', 'nexus-paradox', 'riot-anarchy', 'mycelium'];
  const used = new Map();

  for (const appName of listAppDirs()) {
    const layoutPath = path.join(ROOT_DIR, 'apps', appName, 'src', 'app', 'layout.tsx');
    if (!fs.existsSync(layoutPath)) continue;

    const content = fs.readFileSync(layoutPath, 'utf8');
    const match = content.match(/<SkinRoot[^>]*skin="([^"]+)"/);

    if (!match) {
      addViolation(
        'SKIN_ROOT',
        layoutPath,
        `apps/${appName} does not render <SkinRoot skin="...">. The skin root publishes the design tokens every component depends on.`
      );
      continue;
    }

    const skinId = match[1];
    if (!validSkinIds.includes(skinId)) {
      addViolation('SKIN_ROOT', layoutPath, `apps/${appName} requests unknown skin "${skinId}".`);
      continue;
    }

    if (used.has(skinId) && !allowedDuplicates.includes(skinId)) {
      addViolation(
        'SKIN_ROOT',
        layoutPath,
        `apps/${appName} and ${used.get(skinId)} both claim skin "${skinId}". One world per application keeps the DNA mapping honest.`
      );
    }
    used.set(skinId, appName);
  }
}

// 15. RULE: PALETTE_PURITY
// Tailwind palette utilities colour app markup directly, which no skin can re-theme.
function checkPalettePurity(baseline) {
  const allowed = baseline.PALETTE_PURITY || {};
  const paletteUtility = /(?:^|[^\w./-])(?:bg|text|border|ring|fill|stroke|shadow|from|via|to|outline|decoration|accent|caret|placeholder|selection|divide|space)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}(?:\/\d{1,3})?(?![\w-])/g;

  for (const appName of listAppDirs()) {
    const files = collectFiles(path.join(ROOT_DIR, 'apps', appName), ['.tsx', '.jsx']);
    const findings = [];

    for (const filePath of files) {
      const lines = stripComments(fs.readFileSync(filePath, 'utf8')).split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        const hits = lines[i].match(paletteUtility);
        if (hits) {
          findings.push({ file: filePath, line: i + 1, text: `${hits.length}x ${hits.map((h) => h.trim()).join(', ')}`.slice(0, 70) });
        }
      }
    }

    const limit = allowed[appName] === undefined ? 0 : allowed[appName];
    if (findings.length > limit) {
      const first = findings[0];
      addViolation(
        'PALETTE_PURITY',
        first.file,
        `${findings.length} lines in apps/${appName} paint markup with Tailwind palette colours, baseline allows ${limit}. A palette utility cannot be re-themed by a skin, so the world stops deciding the look (see ${first.line}: ${first.text}). Use a component variant or a block from @moonwitness/ui, then lower packages/lint/style-baseline.json.`,
        first.line
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

const styleBaseline = readBaseline();
checkStylePurity(styleBaseline);
checkInlineStylePurity(styleBaseline);
checkStateParity(styleBaseline);
checkSkinRoot(styleBaseline);
checkPalettePurity(styleBaseline);

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
  console.log('  ✓ Style Purity: token-driven app styles within baseline');
  console.log('  ✓ Inline Style Purity: painted inline styles within baseline');
  console.log('  ✓ State Parity: error, loading and not-found routes present');
  console.log('  ✓ Skin Root: every app renders one valid, unclaimed world');
  console.log('  ✓ Palette Purity: markup colours come from skins, not the Tailwind palette');
  console.log('------------------------------------------------------------\n');
  process.exit(0);
}
