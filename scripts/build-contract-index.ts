import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'url';
import {
  listUnits,
  parseContractMarkdown,
  type ParsedContractDoc,
} from '../packages/lint/src/contract/parse.mjs';

/**
 * Machine-derived contract index (`pnpm contract:index`).
 *
 * CONTRACT.md is and stays the canonical, hand-authored source of truth. This
 * script only *reads* the per-unit contracts (and addon manifests) and emits a
 * derived, read-only view at `.contracts/units.json` so tooling and gates can
 * answer "which units exist, at what status, over what models/data/views"
 * without re-parsing every markdown file. It is a projection, never a source:
 * nothing here mutates a CONTRACT.md, and the gates keep reading the markdown.
 *
 * A `source_digest` (sha256 over the exact files that feed the index) is stored
 * alongside the projection. `pnpm contract:index:check` re-derives that digest
 * and fails (exit 1) when the committed index no longer matches the contracts,
 * so a stale artifact is always detectable — never silently trusted.
 */

interface IndexUnit {
  dir: string;
  tier: string;
  id?: string;
  name?: string;
  owner?: string;
  version?: string;
  status?: string;
  last_verified?: string;
  summary?: string;
  lists: Record<string, string[]>;
  manifest?: { name?: string; models?: string[]; data?: string[]; views?: string[] };
}

interface ContractIndex {
  generated_by: string;
  schema_version: string;
  source_digest: string;
  units: IndexUnit[];
}

const SCHEMA_VERSION = '1.0.0';
const GENERATED_BY = 'scripts/build-contract-index.ts';

function readJson(file: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as Record<string, unknown>;
}

function toIndexUnit(repoRoot: string, dir: string, tier: string, doc: ParsedContractDoc | null): IndexUnit {
  const s = doc?.scalars ?? {};
  const unit: IndexUnit = { dir, tier, lists: doc?.lists ?? {} };
  for (const key of ['id', 'name', 'owner', 'version', 'status', 'last_verified', 'summary'] as const) {
    if (s[key] !== undefined) unit[key] = s[key];
  }
  if (tier === 'addon') {
    const manifestPath = path.join(repoRoot, dir, '__manifest__.json');
    if (fs.existsSync(manifestPath)) {
      const m = readJson(manifestPath) as Record<string, unknown>;
      unit.manifest = {
        name: typeof m.name === 'string' ? m.name : undefined,
        models: Array.isArray(m.models) ? (m.models as string[]) : undefined,
        data: Array.isArray(m.data) ? (m.data as string[]) : undefined,
        views: Array.isArray(m.views) ? (m.views as string[]) : undefined,
      };
    }
  }
  return unit;
}

/** Build the projection plus the digest of every file that fed it. */
function deriveIndex(repoRoot: string): ContractIndex {
  const hash = createHash('sha256');
  const units: IndexUnit[] = [];
  // listUnits returns a deterministic order (addons, packages, apps; each sorted
  // by readdir). Sort again defensively so the digest is stable across platforms.
  const sorted = [...listUnits(repoRoot)].sort((a, b) => a.dir.localeCompare(b.dir));
  for (const unit of sorted) {
    const contractPath = path.join(repoRoot, unit.dir, 'CONTRACT.md');
    const content = fs.existsSync(contractPath) ? fs.readFileSync(contractPath, 'utf-8') : '';
    hash.update(unit.dir).update('\0').update(content).update('\0');
    const doc = content ? parseContractMarkdown(content) : null;
    units.push(toIndexUnit(repoRoot, unit.dir, unit.tier, doc));
    if (unit.tier === 'addon') {
      const manifestPath = path.join(repoRoot, unit.dir, '__manifest__.json');
      const manifestRaw = fs.existsSync(manifestPath) ? fs.readFileSync(manifestPath, 'utf-8') : '';
      hash.update(`${unit.dir}/__manifest__.json`).update('\0').update(manifestRaw).update('\0');
    }
  }
  return {
    generated_by: GENERATED_BY,
    schema_version: SCHEMA_VERSION,
    source_digest: hash.digest('hex'),
    units,
  };
}

function main(): void {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const outDir = path.join(repoRoot, '.contracts');
  const outPath = path.join(outDir, 'units.json');
  const checkMode = process.argv.includes('--check');

  const index = deriveIndex(repoRoot);
  const serialized = `${JSON.stringify(index, null, 2)}\n`;

  if (checkMode) {
    if (!fs.existsSync(outPath)) {
      console.error(`❌ Contract index is missing (.contracts/units.json). Run "pnpm contract:index".`);
      process.exit(1);
    }
    let committed: ContractIndex | null = null;
    try {
      committed = JSON.parse(fs.readFileSync(outPath, 'utf-8')) as ContractIndex;
    } catch {
      console.error(`❌ .contracts/units.json is not valid JSON. Run "pnpm contract:index" to regenerate.`);
      process.exit(1);
    }
    if (committed?.source_digest !== index.source_digest) {
      console.error(
        `❌ Contract index is STALE: committed digest ${committed?.source_digest?.slice(0, 12) || 'none'} ` +
          `!= derived digest ${index.source_digest.slice(0, 12)}. Run "pnpm contract:index" and commit the result.`,
      );
      process.exit(1);
    }
    console.log(`✅ Contract index is fresh (${index.units.length} units, digest ${index.source_digest.slice(0, 12)}).`);
    return;
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, serialized, 'utf-8');
  const byTier = index.units.reduce<Record<string, number>>((acc, u) => {
    acc[u.tier] = (acc[u.tier] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`\n============================================================`);
  console.log(`  Contract Index Builder (contract:index) — derived view only`);
  console.log(`============================================================\n`);
  console.log(`Wrote .contracts/units.json with ${index.units.length} unit(s):`);
  for (const tier of ['addon', 'package', 'app']) {
    if (byTier[tier]) console.log(`  - ${tier}: ${byTier[tier]}`);
  }
  console.log(`\nSource digest: ${index.source_digest}`);
  console.log(`CONTRACT.md remains canonical; this artifact is regenerated from it.\n`);
}

main();
