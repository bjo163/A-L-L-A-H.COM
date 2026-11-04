#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { findPrivateUiClass } from './ui-purity.mjs';

const ROOT_DIR = path.resolve(process.cwd());

const violations = [];

// Gate health: every collectFiles() push counts toward this total. If the
// collector ever regresses to scanning nothing, the gate fails loudly instead
// of reporting hollow compliance.
let filesScanned = 0;

// Exclude paths may be directory names ('node_modules') or repo-relative paths
// ('packages/lint'). Match on the normalised relative path so multi-segment
// entries actually match.
function isExcludedPath(relativePath, excludeDirs) {
  return excludeDirs.some((dir) => relativePath === dir || relativePath.startsWith(`${dir}/`));
}

// Helper to recursively collect files
function collectFiles(dir, extensions, excludeDirs = []) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const relativeDir = path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/');
      if (
        isExcludedPath(relativeDir, excludeDirs) ||
        excludeDirs.includes(entry.name) ||
        entry.name === 'node_modules' ||
        entry.name === '.next' ||
        entry.name === 'dist' ||
        entry.name === 'build' ||
        entry.name === 'out' ||
        entry.name === 'coverage' ||
        entry.name === '.git' ||
        entry.name === '.plans' ||
        entry.name === '.qoder' ||
        entry.name === 'logs'
      ) {
        continue;
      }
      results.push(...collectFiles(fullPath, extensions, excludeDirs));
    } else if (entry.isFile()) {
      if (extensions.some((ext) => entry.name.endsWith(ext))) {
        // Exclude unit test files and scripts folder from all lint rules
        const relativePath = path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/');
        if (isExcludedPath(relativePath, excludeDirs)) continue;
        if (relativePath.includes('/scripts/') || relativePath.startsWith('scripts/')) continue;
        if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(entry.name)) continue;
        results.push(fullPath);
        filesScanned += 1;
      }
    }
  }
  return results;
}

/**
 * @param {string} rule
 * @param {string} file
 * @param {string} message
 * @param {number | null} [line]
 */
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

// ---- shared ORM model introspection -------------------------------------
// These helpers parse `defineModel({...})` blocks so the tenant-scope and
// manifest-consistency gates can reason about registered model names, their
// backing tables, whether they carry `company_id`, and their `many2one`
// targets without importing the ORM.

// Return the substring starting at `open` (a '(') through its matching ')'.
function extractBalanced(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    const ch = text[i];
    if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      if (depth === 0) return text.slice(open, i + 1);
    }
  }
  return text.slice(open);
}

// Parse every defineModel block in a file.
function parseDefineModels(content) {
  const stripped = stripComments(content);
  const models = [];
  const marker = 'defineModel(';
  let idx = 0;
  while ((idx = stripped.indexOf(marker, idx)) !== -1) {
    const open = idx + marker.length - 1; // index of the '('
    const block = extractBalanced(stripped, open);
    const nameMatch = block.match(/\bname:\s*['"]([\w.]+)['"]/);
    const tableMatch = block.match(/\btableName:\s*['"](\w+)['"]/);
    const hasCompanyId = /\bcompany_id:\s*fields\./.test(block);
    const many2one = [...block.matchAll(/\bmany2one\(\s*['"]([\w.]+)['"]/g)].map((m) => m[1]);
    if (nameMatch) {
      models.push({
        name: nameMatch[1],
        table: tableMatch ? tableMatch[1] : null,
        hasCompanyId,
        many2one,
      });
    }
    idx = open + 1;
  }
  return models;
}

// Walk a set of directories collecting every defineModel across the repo.
function collectAllModels(scanDirs) {
  const files = [];
  for (const dir of scanDirs) files.push(...collectFiles(dir, ['.ts', '.tsx', '.js', '.mjs']));
  const models = [];
  for (const filePath of files) {
    const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
    if (relativePath.startsWith('packages/lint/')) continue;
    for (const model of parseDefineModels(fs.readFileSync(filePath, 'utf8'))) {
      models.push({ ...model, file: relativePath });
    }
  }
  return models;
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
// Browser code talks to the hub through @allah/sdk, never with ad-hoc fetch.
// Server-marked modules ('server-only') and app-owned route handlers under
// src/app/api are server surfaces; same-origin relative fetch there is the
// documented proxy pattern, not a hub bypass.
function checkSdkClientUsage() {
  const appsDir = path.join(ROOT_DIR, 'apps');
  const appClientFiles = collectFiles(appsDir, ['.ts', '.tsx']);

  for (const filePath of appClientFiles) {
    const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');

    // Skip server-side API route files in apps/arsy (they're the server, not client)
    if (relativePath.startsWith('apps/arsy/')) continue;
    // Next route handlers under src/app/api execute on the server.
    if (relativePath.includes('/app/api/')) continue;

    const content = fs.readFileSync(filePath, 'utf8');

    // Modules that declare 'server-only' run on the server by construction.
    if (/import\s*['"]server-only['"]/.test(content)) continue;

    // Inspect every fetch() target: a root-relative literal is the app
    // talking to its own server; anything else must be '@allah/sdk'.
    const strippedContent = stripComments(content);
    const callRe = /(?<![\w$.])fetch\s*\(\s*/g;
    let call;
    let flagged = false;
    while ((call = callRe.exec(strippedContent)) !== null && !flagged) {
      const rest = strippedContent.slice(callRe.lastIndex);
      const opener = rest[0];
      if (opener === '"' || opener === "'" || opener === '`') {
        const target = rest.slice(1).match(/^[^'"`]*/);
        if (target && !target[0].startsWith('/')) {
          addViolation(
            'UNIVERSAL_SDK_CLIENT',
            filePath,
            `Direct un-typed fetch() to '${target[0].slice(0, 48)}' detected. Client apps must route API communication through '@allah/sdk', or through a same-origin server route when the upstream needs a secret.`
          );
          flagged = true;
        }
      } else if (/[A-Za-z_$]/.test(opener ?? '')) {
        addViolation(
          'UNIVERSAL_SDK_CLIENT',
          filePath,
          `fetch() called with a non-literal target. Client apps must route API communication through '@allah/sdk', or through a same-origin server route.`
        );
        flagged = true;
      }
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
      // Import bindings like `import { type Foo }` consume shared types;
      // they are not local declarations. Strip import statements first.
      const stripped = stripComments(content).replace(/\bimport\s+[^;]*?\bfrom\s*['"][^'"]+['"];?/g, '');

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
// (a) Storage models defined with defineModel must use company_id.
// (b) Raw SELECT reads against a company_id table (outside the ORM builder) must
//     carry a company_id predicate, or be an explicitly documented system read.
function checkTenantIsolation() {
  const scanDirs = [
    path.join(ROOT_DIR, 'packages', 'arsy-orm'),
    path.join(ROOT_DIR, 'addons'),
  ];

  for (const scanDir of scanDirs) {
    if (!fs.existsSync(scanDir)) continue;
    const files = collectFiles(scanDir, ['.ts', '.tsx', '.js', '.mjs']);

    for (const filePath of files) {
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

  // (b) Tenant scope on raw reads.
  const allModels = collectAllModels([
    path.join(ROOT_DIR, 'addons'),
    path.join(ROOT_DIR, 'packages'),
  ]);
  const companyTables = new Set(
    allModels.filter((m) => m.hasCompanyId && m.table).map((m) => m.table)
  );

  // Documented system / platform-global reads. Each entry is a table that is
  // seeded at company_id=0 and read as global configuration rather than
  // per-tenant data; adding a NEW unscoped business read still fails closed.
  const SYSTEM_READ_ALLOWLIST = new Set([
    'packages/arsy-plugin-llm-gateway/src/index.ts::ai_route',
    'packages/arsy-plugin-llm-gateway/src/index.ts::ai_model',
    'packages/arsy-plugin-llm-gateway/src/index.ts::ai_provider',
    'packages/arsy-plugin-auth/src/bootstrap.ts::auth_setup',
    // Virtual-key authentication: the key itself identifies the tenant, so
    // company_id is not known until the row is read (like login by email).
    'packages/arsy-plugin-llm-gateway/src/usage.ts::ai_virtual_key',
  ]);

  const readDirs = [
    path.join(ROOT_DIR, 'addons'),
    path.join(ROOT_DIR, 'apps'),
    path.join(ROOT_DIR, 'packages'),
  ];
  const readFiles = [];
  for (const dir of readDirs) readFiles.push(...collectFiles(dir, ['.ts', '.tsx', '.js', '.mjs']));

  for (const filePath of readFiles) {
    const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
    // The ORM builder and migrator own SQL generation; they are not the target.
    if (relativePath.startsWith('packages/arsy-orm/') || relativePath.startsWith('packages/lint/')) continue;

    const content = stripComments(fs.readFileSync(filePath, 'utf8'));
    const callRe = /\.(?:query|execute|exec)\s*\(/gi;
    let call;
    while ((call = callRe.exec(content)) !== null) {
      const open = callRe.lastIndex - 1;
      const argRegion = extractBalanced(content, open);
      if (!/\bSELECT\b/i.test(argRegion)) continue;
      if (/\bcompany_id\b/i.test(argRegion)) continue;
      const refs = [...argRegion.matchAll(/\b(?:FROM|JOIN)\s+"?(\w+)"?/gi)].map((m) => m[1]);
      for (const table of refs) {
        if (!companyTables.has(table)) continue;
        if (SYSTEM_READ_ALLOWLIST.has(`${relativePath}::${table}`)) continue;
        addViolation(
          'TENANT_ISOLATION',
          filePath,
          `Raw SELECT on tenant-scoped table '${table}' carries no company_id predicate. Route through BaseRepository (which injects the tenant scope) or add an explicit company_id filter.`
        );
      }
    }
  }
}

// 6. RULE: PARAMETERIZED_QUERIES
// No raw SQL string concatenation or interpolation in query/exec calls; the
// ORM builder (packages/arsy-orm) is the sanctioned SQL layer and is exempt.
function checkParameterizedQueries() {
  const allFiles = collectFiles(ROOT_DIR, ['.ts', '.tsx', '.js', '.mjs'], [
    'node_modules', 'dist', 'build', 'out', '.next', '.git', 'packages/lint',
  ]);

  for (const filePath of allFiles) {
    const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
    // The ORM core owns SQL generation (DDL + the parameterized builder); its
    // internal concatenation is the sanctioned escape hatch, not a violation.
    if (relativePath.startsWith('packages/arsy-orm/')) continue;

    const content = fs.readFileSync(filePath, 'utf8');

    // (a) Interpolation inside a .query()/.execute()/.exec() template literal.
    // Detection now covers `.exec(` too, so concat/exec SQL is no longer
    // invisible to the gate (roadmap T7).
    const templateRe = /\.(?:query|execute|exec)\s*\([^)]*`([^`]*)`/gi;
    let match;
    let flaggedInterpolation = false;
    while ((match = templateRe.exec(content)) !== null && !flaggedInterpolation) {
      const templateBody = match[1];
      const hasInterpolation = /\$\{/.test(templateBody);
      const hasSqlKeyword = /(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)/i.test(templateBody);
      if (hasInterpolation && hasSqlKeyword) {
        addViolation(
          'PARAMETERIZED_QUERIES',
          filePath,
          'Potential SQL injection: string interpolation in a .query()/.execute()/.exec() template literal. Use parameterized ($1) values only.'
        );
        flaggedInterpolation = true;
      }
    }

    // (b) SQL fragments stitched with `+` outside a template literal (e.g. the
    // single-quote `'…' + variable` INSERTs that bypassed the backtick-only rule).
    if (!flaggedInterpolation) {
      const concatRe = /\.(?:query|execute|exec)\s*\(\s*(?:['"][^'"]*['"]\s*\+|\+\s*['"])/i;
      if (concatRe.test(content)) {
        addViolation(
          'PARAMETERIZED_QUERIES',
          filePath,
          'Potential SQL injection: raw query built by string concatenation via .query()/.execute()/.exec(). Route through @allah/arsy-orm or use parameterized ($1) values.'
        );
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
// Every addon must have a valid __manifest__.json using the single canonical
// schema, declare every model it registers, and reference only real models.
function checkAddonManifests() {
  const addonsDir = path.join(ROOT_DIR, 'addons');
  if (!fs.existsSync(addonsDir)) return;

  // Canonical keys required on every manifest (the `base` schema, roadmap T8).
  const REQUIRED_KEYS = ['name', 'version', 'depends', 'models', 'installable'];
  // Legacy keys that belong to the old second schema — must be normalized away.
  const LEGACY_KEYS = ['dependencies', 'description'];

  // Global universe of every registered model name, so cross-addon many2one
  // references (e.g. `res.users`) resolve against all addons, not just one.
  const allModels = collectAllModels([addonsDir, path.join(ROOT_DIR, 'packages')]);
  const knownModelNames = new Set(allModels.map((m) => m.name).filter(Boolean));

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

    let manifest = null;
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (err) {
      addViolation(
        'ADDON_MANIFEST_CONSISTENCY',
        manifestPath,
        `Addon '${entry.name}' has invalid __manifest__.json: ${err instanceof Error ? err.message : String(err)}`
      );
    }

    if (manifest) {
      const missing = REQUIRED_KEYS.filter((key) => manifest[key] === undefined);
      if (missing.length > 0) {
        addViolation(
          'ADDON_MANIFEST_CONSISTENCY',
          manifestPath,
          `Addon '${entry.name}' manifest missing canonical keys: ${missing.join(', ')}. Use the base schema (depends/models/installable).`
        );
      }
      for (const legacy of LEGACY_KEYS) {
        if (manifest[legacy] !== undefined) {
          const canonical = legacy === 'dependencies' ? 'depends' : 'summary';
          addViolation(
            'ADDON_MANIFEST_CONSISTENCY',
            manifestPath,
            `Addon '${entry.name}' manifest uses legacy key '${legacy}'. Normalize to the single schema: '${canonical}'.`
          );
        }
      }
      if (manifest.depends !== undefined && !Array.isArray(manifest.depends)) {
        addViolation('ADDON_MANIFEST_CONSISTENCY', manifestPath, `Addon '${entry.name}' manifest 'depends' must be an array.`);
      }
      if (manifest.models !== undefined && !Array.isArray(manifest.models)) {
        addViolation('ADDON_MANIFEST_CONSISTENCY', manifestPath, `Addon '${entry.name}' manifest 'models' must be an array.`);
      }

      // Every model the addon registers must be declared (catches the T6-class
      // under-declaration where 8 models were registered but 5 declared).
      const declared = new Set(Array.isArray(manifest.models) ? manifest.models : []);
      const addonModelFiles = collectFiles(addonDir, ['.ts']);
      for (const filePath of addonModelFiles) {
        for (const model of parseDefineModels(fs.readFileSync(filePath, 'utf8'))) {
          if (model.name && !declared.has(model.name)) {
            addViolation(
              'ADDON_MANIFEST_CONSISTENCY',
              manifestPath,
              `Addon '${entry.name}' registers model '${model.name}' (${path.relative(ROOT_DIR, filePath).replace(/\\/g, '/')}) but does not declare it in the manifest 'models' array.`
            );
          }
        }
      }
    }

    if (!fs.existsSync(indexPath)) {
      addViolation(
        'ADDON_MANIFEST_CONSISTENCY',
        addonDir,
        `Addon '${entry.name}' missing index.ts entry point`
      );
    }
  }

  // many2one targets must resolve to a real registered model (no dangling refs).
  for (const model of allModels) {
    for (const target of model.many2one) {
      if (!knownModelNames.has(target)) {
        addViolation(
          'ADDON_MANIFEST_CONSISTENCY',
          path.join(ROOT_DIR, model.file),
          `Model '${model.name}' has a many2one to '${target}', which is not a registered model. Dangling relation (e.g. 'res.user' vs 'res.users').`
        );
      }
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
    addViolation('BASELINE_CONTRACT', BASELINE_FILE, `style-baseline.json is not valid JSON: ${err instanceof Error ? err.message : String(err)}`);
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
  const colourLiteral = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|hwb)\(/;
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
  const paintKey = /(?:\bcolor|\bbackground[A-Za-z-]*|\bborder[A-Za-z-]*|\boutline[A-Za-z-]*|\bfill|\bstroke|\bfontFamily|\baccentColor)\s*:/;

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

// 16. RULE: ICON_PURITY
// Icon libraries are owned by packages/ui (icon.tsx). Apps must render glyphs
// through <Icon name="..."> so the design system keeps glyph governance.
function checkIconPurity() {
  const scanDirs = [path.join(ROOT_DIR, 'apps'), path.join(ROOT_DIR, 'addons'), path.join(ROOT_DIR, 'packages')];
  const iconLibraries = ['lucide-react', 'react-icons', '@tabler/icons-react', 'heroicons'];

  for (const scanDir of scanDirs) {
    const files = collectFiles(scanDir, ['.ts', '.tsx', '.js', '.jsx']);
    for (const filePath of files) {
      const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
      // packages/ui owns the one sanctioned icon binding.
      if (relativePath.startsWith('packages/ui/src/components/icon.tsx')) continue;

      const content = stripComments(fs.readFileSync(filePath, 'utf8'));
      for (const lib of iconLibraries) {
        if (new RegExp(`from ['"]${lib.replace('/', '\\/')}(?:/[^'"]*)?['"]`).test(content) ||
            new RegExp(`require\(['"]${lib.replace('/', '\\/')}(?:/[^'"]*)?['"]\)`).test(content)) {
          addViolation(
            'ICON_PURITY',
            filePath,
            `Direct '${lib}' import outside packages/ui. Use <Icon name="..."> from '@moonwitness/ui' so the design system owns the glyph set.`
          );
        }
      }
    }
  }
}

// 17. RULE: LANDMARK_PURITY
// The skip-link target `id="main-content"` is a packages/ui concern (RouteShell
// / SkipLink). Apps that hand-write it drift out of the shared contract.
function checkLandmarkPurity() {
  const files = collectFiles(path.join(ROOT_DIR, 'apps'), ['.tsx', '.jsx']);
  for (const filePath of files) {
    const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('{/*')) continue;
      if (/id=["']main-content["']/.test(lines[i])) {
        addViolation(
          'LANDMARK_PURITY',
          filePath,
          'App markup hand-writes the skip-link landmark. Use <RouteShell as="main"> from @moonwitness/ui, which owns id="main-content".',
          i + 1
        );
      }
    }
  }
}

// 18. RULE: NO_PUBLIC_CLIENT_SECRETS
// NEXT_PUBLIC_* values are inlined into the browser bundle at build time, so a
// key/secret/token shaped name may never be read from a client component.
function checkPublicClientSecrets() {
  const files = collectFiles(path.join(ROOT_DIR, 'apps'), ['.ts', '.tsx']);
  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (!/['"]use client['"]/.test(content)) continue;
    const match = content.match(/NEXT_PUBLIC_[A-Z0-9_]*(?:KEY|SECRET|TOKEN)[A-Z0-9_]*/);
    if (match) {
      const lineNum = content.substring(0, content.indexOf(match[0])).split(/\r?\n/).length;
      addViolation(
        'NO_PUBLIC_CLIENT_SECRETS',
        filePath,
        `Client component reads '${match[0]}'. NEXT_PUBLIC_* vars ship in the browser bundle; secrets must stay server-only and be reached through a route handler or Server Component.`,
        lineNum
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

checkIconPurity();
checkLandmarkPurity();
checkPublicClientSecrets();

// Gate health: a collector regression must fail the gate, never fake compliance.
if (filesScanned < 100) {
  addViolation(
    'GATE_HEALTH',
    path.join(ROOT_DIR, 'packages', 'lint', 'src', 'check-architecture.mjs'),
    `Invariant gate collected only ${filesScanned} files (expected >= 100). The file collector is broken; fix collectFiles() before trusting any PASS.`
  );
}

if (violations.length > 0) {
  console.error(`❌ ARCHITECTURAL VIOLATIONS DETECTED (${violations.length} error(s)):\n`);
  for (const v of violations) {
    const location = v.line ? `${v.file}:${v.line}` : v.file;
    console.error(`  - [${v.rule}] ${location}: ${v.message}`);
  }
  console.error('\nArchitectural gate FAILED.');
  process.exit(1);
} else {
  console.log(`✅ All Architectural Invariants PASSED (100% compliant). Scanned ${filesScanned} files.\n`);
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
  console.log('  ✓ Icon Purity: icon libraries stay inside packages/ui');
  console.log('  ✓ Landmark Purity: skip-link main owned by RouteShell');
  console.log('  ✓ Public Client Secrets: no NEXT_PUBLIC_* secrets in client components');
  console.log('------------------------------------------------------------\n');
  process.exit(0);
}
