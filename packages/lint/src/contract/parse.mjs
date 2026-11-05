/**
 * Shared unit-contract parsing & validation — the single implementation behind
 * `docs:check`, `contract:check`, and `lint:arch`. Previously each of the three
 * gates hand-rolled its own frontmatter reader and required-field list, and they
 * drifted (8 required keys in one, 9 in another). The schema lives in
 * `./schema.json`; this module is pure reading + comparison, so each entrypoint
 * keeps its own message formatting and exit behavior while sharing one truth.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/** The machine-readable contract schema (per-tier required scalars/lists). */
export const CONTRACT_SCHEMA = require('./schema.json');

/** Directories never walked by the unit scanners. */
const SKIP_DIRS = new Set(['node_modules', 'dist', '.next', 'build']);

/**
 * Frontmatter reader supporting scalar (`key: value`) and inline-list
 * (`key: [a, b]` / `key: []`) lines. Returns null when the doc has no
 * `---` block at all, and a half-empty result when the block exists but the
 * closing fence is missing — callers treat both as "malformed".
 */
export function parseContractMarkdown(content) {
  const clean = content.charCodeAt(0) === 0xfeff ? content.slice(1) : content;
  const match = clean.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return null;
  const scalars = {};
  const lists = {};
  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf(':');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (!/^[a-zA-Z0-9_-]+$/.test(key)) continue;
    if (value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1).trim();
      lists[key] = inner ? inner.split(',').map((s) => s.trim()).filter(Boolean) : [];
    } else {
      value = value.replace(/^"|"$/g, '');
      scalars[key] = value;
    }
  }
  return { scalars, lists, body: match[2] };
}

/** Parse a unit's CONTRACT.md; returns the doc plus its repo-relative path. */
export function loadContractDoc(unitDir, repoRoot) {
  const contractPath = path.join(unitDir, 'CONTRACT.md');
  const rel = `${path.relative(repoRoot, contractPath).replace(/\\/g, '/')}`;
  if (!fs.existsSync(contractPath)) return { doc: null, rel, contractPath };
  return { doc: parseContractMarkdown(fs.readFileSync(contractPath, 'utf-8')), rel, contractPath };
}

/**
 * Schema-driven scalar validation. The module never formats messages: each
 * finding is handed to `report(code, params)` and the calling gate renders
 * its own wording. Codes: `missing-field`, `malformed-frontmatter`, `tier`,
 * `tier-unknown`, `id`, `name`, `version`, `status`, `last_verified`.
 * (Rule names/exit codes are contractual per gate; keeping each gate's message
 * text stable avoids log drift while sharing one schema.)
 */
export function validateContractScalars(doc, tier, { expectedName, report } = {}) {
  const fire = (code, params = {}) => report?.(code, { tier, expectedName, ...params });
  if (!doc) {
    fire('malformed-frontmatter');
    return;
  }
  const s = doc.scalars;
  for (const field of CONTRACT_SCHEMA.requiredScalars) {
    if (!s[field]) fire('missing-field', { field });
  }
  if (s.tier && s.tier !== tier) fire('tier', { actual: s.tier });
  if (s.tier && !CONTRACT_SCHEMA.tiers.includes(s.tier)) fire('tier-unknown', { actual: s.tier });
  if (s.id && !new RegExp(CONTRACT_SCHEMA.scalarPatterns.id).test(s.id)) fire('id', { actual: s.id });
  if (s.name && expectedName !== undefined && s.name !== expectedName) fire('name', { actual: s.name });
  if (s.version && !new RegExp(CONTRACT_SCHEMA.scalarPatterns.version).test(s.version)) fire('version', { actual: s.version });
  if (s.status && !CONTRACT_SCHEMA.statuses.includes(s.status)) fire('status', { actual: s.status });
  if (s.last_verified && !new RegExp(CONTRACT_SCHEMA.scalarPatterns.last_verified).test(s.last_verified)) {
    fire('last_verified', { actual: s.last_verified });
  }
}

/** Required-list presence check for a tier (values are compared by callers). */
export function requiredListsFor(tier) {
  const tierSchema = CONTRACT_SCHEMA.tierSchema[tier];
  return tierSchema ? tierSchema.requiredLists : [];
}

/** Set equality on string arrays. */
export function setsEqual(a, b) {
  const sa = new Set(a);
  const sb = new Set(b);
  return sa.size === sb.size && [...sa].every((x) => sb.has(x));
}

/** Human-readable contract-vs-actual diff for mismatch messages. */
export function listDiff(a, b) {
  const onlyA = a.filter((x) => !b.includes(x));
  const onlyB = b.filter((x) => !a.includes(x));
  return `contract=[${a.join(', ')}] actual=[${b.join(', ')}]` +
    (onlyA.length ? ` missing=[${onlyA.join(', ')}]` : '') +
    (onlyB.length ? ` extra=[${onlyB.join(', ')}]` : '');
}

/** Immediate child directories of a tier root, optionally requiring a package.json. */
export function listUnitDirs(base, requirePackageJson) {
  if (!fs.existsSync(base)) return [];
  return fs
    .readdirSync(base, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .filter((e) => !requirePackageJson || fs.existsSync(path.join(base, e.name, 'package.json')))
    .map((e) => e.name);
}

/** Every structural unit in the repo: { dir (relative), tier, name }. */
export function listUnits(repoRoot) {
  return [
    ...listUnitDirs(path.join(repoRoot, 'addons'), false).map((n) => ({ dir: `addons/${n}`, tier: 'addon', name: n })),
    ...listUnitDirs(path.join(repoRoot, 'packages'), true).map((n) => ({ dir: `packages/${n}`, tier: 'package', name: n })),
    ...listUnitDirs(path.join(repoRoot, 'apps'), true).map((n) => ({ dir: `apps/${n}`, tier: 'app', name: n })),
  ];
}

/** Recursively collect source files under a dir, skipping build/dep folders. */
export function collectSources(dir, exts, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectSources(full, exts, acc);
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      acc.push(full);
    }
  }
  return acc;
}

/**
 * Public symbols exported anywhere under a package's src tree: declaration
 * exports, named export lists, and re-exports (`export { x } from './y'`).
 */
export function collectPackageExports(srcDir) {
  const names = new Set();
  for (const file of collectSources(srcDir, ['.ts', '.tsx'])) {
    const src = fs.readFileSync(file, 'utf-8');
    const decl = /export\s+(?:async\s+)?(?:default\s+)?(?:class|function|const|let|var|interface|type|enum)\s+([A-Za-z0-9_]+)/g;
    let m;
    while ((m = decl.exec(src)) !== null) names.add(m[1]);
    const braces = /export\s*\{([^}]*)\}(?!\s*from)/g;
    while ((m = braces.exec(src)) !== null) {
      for (const part of m[1].split(',')) {
        const token = part.trim().replace(/^type\s+/, '');
        if (!token) continue;
        const asSplit = token.split(/\s+as\s+/);
        names.add((asSplit[1] ?? asSplit[0]).trim());
      }
    }
    const reExport = /export\s*\{([^}]*)\}\s*from/g;
    while ((m = reExport.exec(src)) !== null) {
      for (const part of m[1].split(',')) {
        const token = part.trim().replace(/^type\s+/, '');
        if (!token) continue;
        const asSplit = token.split(/\s+as\s+/);
        names.add((asSplit[1] ?? asSplit[0]).trim());
      }
    }
  }
  return names;
}

/** Model names declared via `defineModel({ name …, tableName … })` in a source file. */
export function parseDefineModelsFromSource(src) {
  const defined = new Set();
  const re = /defineModel\s*\(\s*\{[\s\S]*?name:\s*['"]([^'"]+)['"][\s\S]*?tableName\s*:/g;
  let m;
  while ((m = re.exec(src)) !== null) defined.add(m[1]);
  return defined;
}

/** Skin declared by an app's root layout, or null when there is no <SkinRoot>. */
export function readLayoutSkin(appDir) {
  const layout = path.join(appDir, 'layout.tsx');
  if (!fs.existsSync(layout)) return null;
  const m = fs.readFileSync(layout, 'utf-8').match(/<SkinRoot\s+skin=["']([^"']+)["']/);
  return m ? m[1] : null;
}
