import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import {
  CONTRACT_SCHEMA,
  collectPackageExports,
  collectSources,
  listDiff,
  listUnitDirs,
  parseContractMarkdown,
  parseDefineModelsFromSource,
  readLayoutSkin,
  setsEqual,
  validateContractScalars,
  type ParsedContractDoc,
} from '../packages/lint/src/contract/parse.mjs';

/**
 * Unit-contract gate (`pnpm contract:check`).
 *
 * Every structural unit — each addon, each package, each app — must ship a
 * `CONTRACT.md` whose frontmatter is well-formed AND consistent with the real
 * code it describes. This mirrors the reporting style of `check-doc-contracts.ts`
 * but is a hard gate (exit 1 on any violation), not a scored doc lint.
 *
 * Frontmatter parsing and schema validation come from the shared module
 * (`packages/lint/src/contract/`), so all three contract gates read one schema;
 * this file keeps only the code cross-checks (manifest, exports, routes/skin).
 */

/** Read a JSON file, throwing a readable error on parse failure. */
function readJson(file: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as Record<string, unknown>;
}

function validateFrontmatter(
  errors: string[],
  rel: string,
  doc: ParsedContractDoc | null,
  expectedTier: string,
  expectedName: string,
): void {
  // This gate renders the shared schema findings in its historical wording.
  validateContractScalars(doc, expectedTier, {
    expectedName,
    report: (code, p) => {
      switch (code) {
        case 'malformed-frontmatter': errors.push(`${rel}: missing or malformed YAML frontmatter (---)`); break;
        case 'missing-field': errors.push(`${rel}: missing required frontmatter field '${p.field}'`); break;
        case 'tier': errors.push(`${rel}: tier '${p.actual}' expected '${p.tier}'`); break;
        case 'tier-unknown': errors.push(`${rel}: tier '${p.actual}' not in ${CONTRACT_SCHEMA.tiers.join(', ')}`); break;
        case 'id': errors.push(`${rel}: id '${p.actual}' must be UPPER_SNAKE`); break;
        case 'name': errors.push(`${rel}: name '${p.actual}' does not match unit identity '${p.expectedName}'`); break;
        case 'version': errors.push(`${rel}: version '${p.actual}' is not semver`); break;
        case 'status': errors.push(`${rel}: status '${p.actual}' not in ${CONTRACT_SCHEMA.statuses.join(', ')}`); break;
        case 'last_verified': errors.push(`${rel}: last_verified '${p.actual}' must be YYYY-MM-DD`); break;
      }
    },
  });
}

function checkAddon(repoRoot: string, name: string, errors: string[]): void {
  const dir = path.join(repoRoot, 'addons', name);
  const rel = `addons/${name}/CONTRACT.md`;
  const manifestPath = path.join(dir, '__manifest__.json');
  const contractPath = path.join(dir, 'CONTRACT.md');
  if (!fs.existsSync(manifestPath)) {
    errors.push(`${rel}: addon has no __manifest__.json`);
    return;
  }
  if (!fs.existsSync(contractPath)) {
    errors.push(`${rel}: CONTRACT.md is missing`);
    return;
  }
  const manifest = readJson(manifestPath) as { name: string; depends: string[]; models: string[]; data?: string[] };
  const doc = parseContractMarkdown(fs.readFileSync(contractPath, 'utf-8'));
  validateFrontmatter(errors, rel, doc, 'addon', manifest.name);
  if (!doc) return;

  const cModels = doc.lists.models;
  const cData = doc.lists.data;
  const cDepends = doc.lists.depends;
  if (cModels === undefined) errors.push(`${rel}: 'models' list field is required for an addon`);
  else if (!setsEqual(cModels, manifest.models)) errors.push(`${rel}: models mismatch vs manifest — ${listDiff(cModels, manifest.models)}`);

  if (cDepends === undefined) errors.push(`${rel}: 'depends' list field is required for an addon`);
  else if (!setsEqual(cDepends, manifest.depends)) errors.push(`${rel}: depends mismatch vs manifest — ${listDiff(cDepends, manifest.depends)}`);

  if (cData === undefined) errors.push(`${rel}: 'data' list field is required for an addon (empty is allowed, absent is not)`);
  else if (!setsEqual(cData, manifest.data ?? [])) errors.push(`${rel}: data mismatch vs manifest — ${listDiff(cData, manifest.data ?? [])}`);

  // Every declared data module path must exist on disk.
  for (const dataPath of cData ?? []) {
    if (!fs.existsSync(path.join(dir, dataPath))) errors.push(`${rel}: declared data module '${dataPath}' does not exist`);
  }

  // Deep: contract models must equal the defineModel names actually declared under the addon.
  const defined = new Set<string>();
  for (const file of collectSources(dir, ['.ts'])) {
    const src = fs.readFileSync(file, 'utf-8');
    if (!src.includes('defineModel')) continue;
    for (const model of parseDefineModelsFromSource(src)) defined.add(model);
  }
  // Deep: every model this addon declares via `defineModel` locally must appear in
  // the contract. Exact manifest==defineModel equality (including models whose
  // defineModel lives in the framework, e.g. res.users in @allah/arsy-orm) is the
  // arch gate's job, since only it sees the full registry.
  if (defined.size > 0 && cModels !== undefined) {
    const undeclared = [...defined].filter((model) => !cModels.includes(model));
    if (undeclared.length > 0) {
      errors.push(`${rel}: defineModel '${undeclared.join(', ')}' present in the addon but missing from CONTRACT models=[${cModels.join(', ')}]`);
    }
  }
}

function collectPackageExportsFrom(srcDir: string): Set<string> {
  // Shared implementation lives in the contract module; kept as a thin wrapper
  // so the arch gate and this gate resolve package surfaces identically.
  return collectPackageExports(srcDir);
}

function checkPackage(repoRoot: string, name: string, errors: string[]): void {
  const dir = path.join(repoRoot, 'packages', name);
  const rel = `packages/${name}/CONTRACT.md`;
  const pkg = readJson(path.join(dir, 'package.json')) as { name: string };
  const contractPath = path.join(dir, 'CONTRACT.md');
  if (!fs.existsSync(contractPath)) {
    errors.push(`${rel}: CONTRACT.md is missing`);
    return;
  }
  const doc = parseContractMarkdown(fs.readFileSync(contractPath, 'utf-8'));
  validateFrontmatter(errors, rel, doc, 'package', pkg.name);
  if (!doc) return;

  if (doc.lists.publicSurface === undefined) {
    errors.push(`${rel}: 'publicSurface' list field is required for a package`);
    return;
  }
  const srcDir = path.join(dir, 'src');
  if (!fs.existsSync(srcDir)) {
    if (doc.lists.publicSurface.length > 0) errors.push(`${rel}: publicSurface declared but package has no src/ dir`);
    return;
  }
  const exported = collectPackageExportsFrom(srcDir);
  for (const sym of doc.lists.publicSurface) {
    if (!exported.has(sym)) errors.push(`${rel}: publicSurface symbol '${sym}' is not exported from the package src`);
  }
}

function checkApp(repoRoot: string, name: string, errors: string[]): void {
  const dir = path.join(repoRoot, 'apps', name);
  const rel = `apps/${name}/CONTRACT.md`;
  const pkg = readJson(path.join(dir, 'package.json')) as { name: string };
  const contractPath = path.join(dir, 'CONTRACT.md');
  if (!fs.existsSync(contractPath)) {
    errors.push(`${rel}: CONTRACT.md is missing`);
    return;
  }
  const doc = parseContractMarkdown(fs.readFileSync(contractPath, 'utf-8'));
  validateFrontmatter(errors, rel, doc, 'app', pkg.name);
  if (!doc) return;

  const appDir = path.join(dir, 'src', 'app');
  const isNext = fs.existsSync(appDir);

  // Ports: numeric only, no secrets / NEXT_PUBLIC_ tokens.
  if (doc.lists.ports !== undefined) {
    for (const p of doc.lists.ports) {
      if (!/^\d+$/.test(p)) errors.push(`${rel}: port '${p}' must be numeric`);
    }
  }

  if (!isNext) {
    // Backend/service app: no route tree or skin to verify.
    return;
  }

  if (doc.lists.routes === undefined) {
    errors.push(`${rel}: 'routes' list field is required for a Next app`);
  } else {
    const actualDirs = fs
      .readdirSync(appDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
    for (const route of doc.lists.routes) {
      if (!actualDirs.includes(route)) errors.push(`${rel}: declared route '${route}' does not exist under src/app`);
    }
  }

  const actualSkin = readLayoutSkin(appDir);
  const skin = doc.scalars.skin;
  if (actualSkin) {
    if (!skin) errors.push(`${rel}: app renders <SkinRoot> but CONTRACT declares no 'skin'`);
    else if (skin !== actualSkin) errors.push(`${rel}: skin '${skin}' does not match layout.tsx <SkinRoot skin="${actualSkin}">`);
  } else if (fs.existsSync(path.join(appDir, 'layout.tsx')) && skin) {
    errors.push(`${rel}: CONTRACT declares skin '${skin}' but layout.tsx has no <SkinRoot>`);
  }
}

function main(): void {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const addonDirs = listUnitDirs(path.join(repoRoot, 'addons'), false);
  const pkgDirs = listUnitDirs(path.join(repoRoot, 'packages'), true);
  const appDirs = listUnitDirs(path.join(repoRoot, 'apps'), true);

  const errors: string[] = [];
  for (const name of addonDirs) checkAddon(repoRoot, name, errors);
  for (const name of pkgDirs) checkPackage(repoRoot, name, errors);
  for (const name of appDirs) checkApp(repoRoot, name, errors);

  console.log(`\n============================================================`);
  console.log(`  Unit Contract Consistency Gate (contract:check)`);
  console.log(`============================================================\n`);
  console.log(`Units inspected: ${addonDirs.length} addon(s), ${pkgDirs.length} package(s), ${appDirs.length} app(s).`);
  console.log(`  Addons:   ${addonDirs.join(', ')}`);
  console.log(`  Packages: ${pkgDirs.join(', ')}`);
  console.log(`  Apps:     ${appDirs.join(', ')}`);

  if (errors.length > 0) {
    console.error(`\nViolations Found (${errors.length}):`);
    for (const e of errors) console.error(`  - ${e}`);
    console.error(`\n❌ Unit Contract Validation FAILED with ${errors.length} violation(s).`);
    process.exit(1);
  }

  console.log(`\n✅ Unit Contract Validation PASSED — every unit ships a consistent CONTRACT.md.`);
}

main();
