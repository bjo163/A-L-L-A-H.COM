import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import {
  CONTRACT_SCHEMA,
  listUnits,
  parseContractMarkdown,
  setsEqual,
  validateContractScalars,
} from '../packages/lint/src/contract/parse.mjs';

interface DocMetadata {
  contract?: string;
  id?: string;
  version?: string;
  owner?: string;
  status?: string;
  last_verified?: string;
}

interface DocInspection {
  filePath: string;
  id: string;
  metadata?: DocMetadata;
  errors: string[];
  warnings: string[];
}

const REQUIRED_DOCS: Array<{ path: string; expectedId: string; owner: string }> = [
  { path: 'README.md', expectedId: 'README', owner: 'ecosystem' },
  { path: 'AUTONOMOUS.md', expectedId: 'AUTONOMOUS', owner: 'engineering' },
  { path: 'AGENTS.md', expectedId: 'AGENTS', owner: 'engineering' },
  { path: 'GOAL.md', expectedId: 'GOAL', owner: 'leadership' },
  { path: 'DOCUMENTATION_CONTRACT.md', expectedId: 'DOCUMENTATION_CONTRACT', owner: 'engineering' },
  { path: 'BLUEPRINT.md', expectedId: 'BLUEPRINT', owner: 'architecture' },
  { path: 'DESIGN.md', expectedId: 'DESIGN', owner: 'product-design' },
  { path: 'BACKLOG.md', expectedId: 'BACKLOG', owner: 'product' },
  { path: 'ROADMAP.md', expectedId: 'ROADMAP', owner: 'product-management' },
  { path: 'CHANGELOG.md', expectedId: 'CHANGELOG', owner: 'engineering' },
  { path: 'DECISIONS.md', expectedId: 'DECISIONS', owner: 'architecture' },
  { path: 'QUALITY.md', expectedId: 'QUALITY', owner: 'qa' },
  { path: 'LEGACY_RECONCILIATION.md', expectedId: 'LEGACY_RECONCILIATION', owner: 'engineering' },
  { path: 'apps/dock/README.md', expectedId: 'APP_DOCK_README', owner: 'frontend' },
  { path: 'apps/headquarter/README.md', expectedId: 'APP_HEADQUARTER_README', owner: 'frontend' },
  { path: 'apps/jizz/README.md', expectedId: 'APP_JIZZ_README', owner: 'frontend' },
];

const VALID_STATUSES = ['discovered', 'ready', 'in_progress', 'implemented', 'verified', 'released'];
// DNA canon files carry their own lifecycle vocabulary (approved/engine-contract).
const VALID_DNA_STATUSES = [...VALID_STATUSES, 'approved', 'engine-contract', 'draft'];
const SLOP_PATTERNS = [
  /\blorem ipsum\b/i,
  /\bTODO: write description\b/i,
  /\bplaceholder for future\b/i,
  /\b\[insert .*? here\]\b/i,
];

function parseFrontmatter(content: string): { metadata?: DocMetadata; body: string } {
  const cleanContent = content.charCodeAt(0) === 0xFEFF ? content.slice(1) : content;
  const match = cleanContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { body: cleanContent };
  }

  const rawYaml = match[1];
  const body = match[2];
  const metadata: Record<string, string> = {};

  for (const line of rawYaml.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const kv = trimmed.match(/^([a-zA-Z0-9_-]+)\s*:\s*"?([^"]*)"?$/);
    if (kv) {
      metadata[kv[1]] = kv[2].trim();
    }
  }

  return { metadata: metadata as DocMetadata, body };
}

function checkRelativeLinks(filePath: string, body: string, repoRoot: string): string[] {
  const errors: string[] = [];
  const dir = path.dirname(path.resolve(repoRoot, filePath));

  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(body)) !== null) {
    const rawLink = match[2].trim();

    if (
      rawLink.startsWith('http://') ||
      rawLink.startsWith('https://') ||
      rawLink.startsWith('mailto:') ||
      rawLink.startsWith('#') ||
      rawLink.startsWith('conversation://') ||
      rawLink.startsWith('file://')
    ) {
      continue;
    }

    const linkPath = rawLink.split('#')[0];
    if (!linkPath) continue;

    const resolved = path.resolve(dir, linkPath);
    if (!fs.existsSync(resolved)) {
      errors.push(`Broken link in ${filePath}: "${rawLink}" (target not found at ${path.relative(repoRoot, resolved)})`);
    }
  }

  return errors;
}

function checkAntislop(filePath: string, body: string): string[] {
  const errors: string[] = [];
  for (const pattern of SLOP_PATTERNS) {
    if (pattern.test(body)) {
      errors.push(`Antislop violation in ${filePath}: contains forbidden placeholder pattern matching ${pattern}`);
    }
  }
  return errors;
}

function checkDnaCanon(repoRoot: string): string[] {
  const dnaDir = path.resolve(repoRoot, 'DNA');
  const errors: string[] = [];
  if (!fs.existsSync(dnaDir)) {
    return ['DNA/ canon directory is missing entirely'];
  }
  const files = fs.readdirSync(dnaDir).filter((name) => name.endsWith('.md'));
  if (files.length === 0) {
    return ['DNA/ contains no Markdown canon files'];
  }
  for (const name of files) {
    const relPath = `DNA/${name}`;
    const content = fs.readFileSync(path.join(dnaDir, name), 'utf-8');
    const { metadata, body } = parseFrontmatter(content);
    if (!metadata) {
      errors.push(`[${relPath}] Missing YAML frontmatter standard (---)`);
      continue;
    }
    if (!metadata.version || !/^\d+\.\d+\.\d+$/.test(metadata.version)) {
      errors.push(`[${relPath}] Invalid semantic version: "${metadata.version}"`);
    }
    if (!metadata.owner) {
      errors.push(`[${relPath}] Missing owner field in frontmatter`);
    }
    if (!metadata.status || !VALID_DNA_STATUSES.includes(metadata.status)) {
      errors.push(`[${relPath}] Invalid status: "${metadata.status}". Allowed: ${VALID_DNA_STATUSES.join(', ')}`);
    }
    if (!metadata.last_verified || !/^\d{4}-\d{2}-\d{2}$/.test(metadata.last_verified)) {
      errors.push(`[${relPath}] Invalid date format for last_verified (expected YYYY-MM-DD): "${metadata.last_verified}"`);
    }
    errors.push(...checkRelativeLinks(relPath, body, repoRoot));
    errors.push(...checkAntislop(relPath, body));
  }
  return errors;
}

/**
 * Per-unit CONTRACT.md coverage and thin consistency.
 *
 * Every structural unit (addon, package, app) must ship a CONTRACT.md whose
 * frontmatter obeys the shared schema (`packages/lint/src/contract/schema.json`
 * — the same one `contract:check` and the arch gate read): a `tier` field,
 * `owner`, semver `version`, ISO `last_verified`, a valid `status`, and the
 * fields that name it. For addons we also cross-check that the declared
 * `models`/`data` mirror `__manifest__.json` (the deep defineModel-vs-code check
 * lives in `contract:check` / the arch gate). This is the documentation-side
 * gate; a missing or malformed contract is a hard error.
 */
function checkUnitContracts(repoRoot: string): string[] {
  const errors: string[] = [];
  const units = listUnits(repoRoot);

  for (const unit of units) {
    const contractPath = path.join(repoRoot, unit.dir, 'CONTRACT.md');
    if (!fs.existsSync(contractPath)) {
      errors.push(`[${unit.dir}/CONTRACT.md] Missing required unit contract document`);
      continue;
    }
    const content = fs.readFileSync(contractPath, 'utf-8');
    const doc = parseContractMarkdown(content);

    const prefix = `[${unit.dir}/CONTRACT.md]`;
    // Shared schema, rendered in this gate's historical wording.
    validateContractScalars(doc, unit.tier, {
      report: (code, p) => {
        switch (code) {
          case 'malformed-frontmatter': errors.push(`${prefix} Missing required unit contract document frontmatter`); break;
          case 'missing-field': errors.push(`${prefix} Missing required frontmatter field '${p.field}'`); break;
          case 'tier': errors.push(`${prefix} tier '${p.actual}' does not match unit location '${p.tier}'`); break;
          case 'tier-unknown': errors.push(`${prefix} tier '${p.actual}' not in ${CONTRACT_SCHEMA.tiers.join(', ')}`); break;
          case 'id': errors.push(`${prefix} id '${p.actual}' must be UPPER_SNAKE`); break;
          case 'version': errors.push(`${prefix} Invalid semantic version: "${p.actual}"`); break;
          case 'status': errors.push(`${prefix} Invalid status: "${p.actual}". Allowed: ${CONTRACT_SCHEMA.statuses.join(', ')}`); break;
          case 'last_verified': errors.push(`${prefix} Invalid date format for last_verified (expected YYYY-MM-DD): "${p.actual}"`); break;
        }
      },
    });

    errors.push(...checkAntislop(`${unit.dir}/CONTRACT.md`, doc ? doc.body : content.split('---').slice(2).join('---')));

    // Thin addon consistency vs manifest (deep check is contract:check / lint:arch).
    if (unit.tier === 'addon' && doc) {
      const manifestPath = path.join(repoRoot, unit.dir, '__manifest__.json');
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as { name?: string; models?: string[]; data?: string[] };
        if (doc.scalars.name && manifest.name && doc.scalars.name !== manifest.name) {
          errors.push(`${prefix} name '${doc.scalars.name}' != manifest name '${manifest.name}'`);
        }
        const lists = doc.lists;
        if (!Array.isArray(lists.models)) {
          errors.push(`${prefix} addon must declare a 'models' list`);
        } else if (Array.isArray(manifest.models) && !setsEqual(lists.models, manifest.models)) {
          errors.push(`${prefix} models list does not mirror __manifest__.json`);
        }
        if (!Array.isArray(lists.data)) {
          errors.push(`${prefix} addon must declare a 'data' list (empty allowed)`);
        } else if (Array.isArray(manifest.data) && !setsEqual(lists.data, manifest.data)) {
          errors.push(`${prefix} data list does not mirror __manifest__.json`);
        }
      }
    }
  }
  return errors;
}

function main() {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  console.log(`\n============================================================`);
  console.log(`  A-L-L-A-H.COM Documentation Contract & Linter Engine`);
  console.log(`============================================================\n`);

  let frontmatterScore = 35;
  let linkScore = 25;
  const changeSyncScore = 20;
  let antislopScore = 20;

  const inspections: DocInspection[] = [];
  const totalErrors: string[] = [];

  for (const req of REQUIRED_DOCS) {
    const fullPath = path.resolve(repoRoot, req.path);
    const insp: DocInspection = {
      filePath: req.path,
      id: req.expectedId,
      errors: [],
      warnings: [],
    };

    if (!fs.existsSync(fullPath)) {
      insp.errors.push(`Missing required document: ${req.path}`);
      frontmatterScore = Math.max(0, frontmatterScore - 10);
      inspections.push(insp);
      continue;
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    const { metadata, body } = parseFrontmatter(content);
    insp.metadata = metadata;

    if (!metadata) {
      insp.errors.push(`Missing YAML frontmatter standard (---)`);
      frontmatterScore = Math.max(0, frontmatterScore - 5);
    } else {
      if (metadata.id !== req.expectedId) {
        insp.errors.push(`Invalid id: expected "${req.expectedId}", got "${metadata.id}"`);
        frontmatterScore = Math.max(0, frontmatterScore - 2);
      }
      if (!metadata.version || !/^\d+\.\d+\.\d+$/.test(metadata.version)) {
        insp.errors.push(`Invalid semantic version: "${metadata.version}"`);
        frontmatterScore = Math.max(0, frontmatterScore - 2);
      }
      if (!metadata.status || !VALID_STATUSES.includes(metadata.status)) {
        insp.errors.push(`Invalid status: "${metadata.status}". Allowed: ${VALID_STATUSES.join(', ')}`);
        frontmatterScore = Math.max(0, frontmatterScore - 2);
      }
      if (!metadata.last_verified || !/^\d{4}-\d{2}-\d{2}$/.test(metadata.last_verified)) {
        insp.errors.push(`Invalid date format for last_verified (expected YYYY-MM-DD): "${metadata.last_verified}"`);
        frontmatterScore = Math.max(0, frontmatterScore - 1);
      }
      // The contract declares owner on every governed document — enforce it,
      // and against the expected owner when the register names one.
      if (!metadata.owner) {
        insp.errors.push(`Missing owner field in frontmatter`);
        frontmatterScore = Math.max(0, frontmatterScore - 2);
      } else if (req.owner && metadata.owner !== req.owner) {
        insp.errors.push(`Invalid owner: expected "${req.owner}", got "${metadata.owner}"`);
        frontmatterScore = Math.max(0, frontmatterScore - 2);
      }
    }

    const linkErrors = checkRelativeLinks(req.path, body, repoRoot);
    if (linkErrors.length > 0) {
      insp.errors.push(...linkErrors);
      linkScore = Math.max(0, linkScore - linkErrors.length * 5);
    }

    const slopErrors = checkAntislop(req.path, body);
    if (slopErrors.length > 0) {
      insp.errors.push(...slopErrors);
      antislopScore = Math.max(0, antislopScore - slopErrors.length * 10);
    }

    inspections.push(insp);
  }

  // DNA canon coverage: every design-DNA document must obey the same contract.
  const dnaErrors = checkDnaCanon(repoRoot);
  if (dnaErrors.length > 0) {
    totalErrors.push(...dnaErrors);
    frontmatterScore = Math.max(0, frontmatterScore - dnaErrors.length * 2);
  }

  // Per-unit CONTRACT.md coverage + stricter schema + thin manifest consistency.
  const unitContractErrors = checkUnitContracts(repoRoot);
  if (unitContractErrors.length > 0) {
    totalErrors.push(...unitContractErrors);
    frontmatterScore = Math.max(0, frontmatterScore - unitContractErrors.length * 2);
  }

  for (const insp of inspections) {
    if (insp.errors.length > 0) {
      totalErrors.push(...insp.errors.map((e) => `[${insp.filePath}] ${e}`));
    }
  }

  const finalScore = frontmatterScore + linkScore + changeSyncScore + antislopScore;

  console.log(`Canonical Document Inspection Results (${REQUIRED_DOCS.length} files):`);
  for (const insp of inspections) {
    const status = insp.errors.length === 0 ? '✓ PASS' : '✗ FAIL';
    console.log(`  ${status.padEnd(8)} ${insp.filePath.padEnd(30)} [ID: ${insp.id}] (v${insp.metadata?.version || 'N/A'})`);
  }
  console.log(`\n------------------------------------------------------------`);
  console.log(`  Score Breakdown:`);
  console.log(`  - Frontmatter & Metadata:   ${frontmatterScore} / 35 pts`);
  console.log(`  - Relative Link Integrity:  ${linkScore} / 25 pts`);
  console.log(`  - Change Matrix & Sync:     ${changeSyncScore} / 20 pts`);
  console.log(`  - Antislop Conformance:     ${antislopScore} / 20 pts`);
  console.log(`  ----------------------------------------------------------`);
  console.log(`  TOTAL COMPLIANCE SCORE:     ${finalScore} / 100 pts (Threshold: 100 pts)`);
  console.log(`------------------------------------------------------------\n`);

  if (totalErrors.length > 0) {
    console.error(`Violations Found (${totalErrors.length}):`);
    for (const err of totalErrors) {
      console.error(`  - ${err}`);
    }
    console.log('');
  }

  if (finalScore < 100 || totalErrors.length > 0) {
    console.error(`❌ Documentation Contract Validation FAILED. Score ${finalScore}/100 (threshold: 100)${totalErrors.length > 0 ? ` with ${totalErrors.length} violation(s)` : ''}.`);
    process.exit(1);
  }

  console.log(`✅ Documentation Contract Validation PASSED (100% compliant).\n`);
}

main();
