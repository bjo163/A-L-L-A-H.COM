import * as fs from 'fs';
import * as path from 'path';

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
  { path: 'BACKLOG.md', expectedId: 'BACKLOG', owner: 'product-management' },
  { path: 'ROADMAP.md', expectedId: 'ROADMAP', owner: 'product-management' },
  { path: 'CHANGELOG.md', expectedId: 'CHANGELOG', owner: 'engineering' },
  { path: 'DECISIONS.md', expectedId: 'DECISIONS', owner: 'architecture' },
  { path: 'QUALITY.md', expectedId: 'QUALITY', owner: 'qa' },
  { path: 'LEGACY_RECONCILIATION.md', expectedId: 'LEGACY_RECONCILIATION', owner: 'engineering' },
  { path: 'apps/dock/README.md', expectedId: 'APP_DOCK_README', owner: 'frontend' },
  { path: 'apps/headquarter/README.md', expectedId: 'APP_HEADQUARTER_README', owner: 'frontend' },
  { path: 'apps/jizz/README.md', expectedId: 'APP_JIZZ_README', owner: 'frontend' },
  { path: 'apps/server/README.md', expectedId: 'APP_SERVER_README', owner: 'backend' },
];

const VALID_STATUSES = ['discovered', 'ready', 'in_progress', 'implemented', 'verified', 'released'];
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

function checkPlansStandard(repoRoot: string): { errors: string[]; plansChecked: number } {
  const plansDir = path.resolve(repoRoot, '.plans');
  const errors: string[] = [];
  let plansChecked = 0;

  if (!fs.existsSync(plansDir)) {
    return { errors, plansChecked };
  }

  const entries = fs.readdirSync(plansDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    plansChecked++;
    const planFolder = entry.name;
    const planPath = path.join(plansDir, planFolder);

    const specPath = path.join(planPath, 'spec.md');
    const taskPath = path.join(planPath, 'task.md');
    const designPath = path.join(planPath, 'design.md');
    const rulesPath = path.join(planPath, 'rules.md');
    const reportPath = path.join(planPath, 'report.md');

    // Canonical 4-artifact standard
    if (!fs.existsSync(specPath)) errors.push(`[.plans/${planFolder}] Missing mandatory artifact: spec.md`);
    if (!fs.existsSync(taskPath)) errors.push(`[.plans/${planFolder}] Missing mandatory artifact: task.md`);
    if (!fs.existsSync(designPath)) errors.push(`[.plans/${planFolder}] Missing mandatory artifact: design.md`);
    if (!fs.existsSync(rulesPath)) errors.push(`[.plans/${planFolder}] Missing mandatory artifact: rules.md`);

    // Completed plan requires report.md
    if (fs.existsSync(specPath)) {
      const specContent = fs.readFileSync(specPath, 'utf-8');
      const { metadata } = parseFrontmatter(specContent);
      if (metadata?.status === 'completed') {
        if (!fs.existsSync(reportPath)) {
          errors.push(`[.plans/${planFolder}] Plan is marked 'completed' in spec.md but missing mandatory audit artifact: report.md`);
        }
      }
    }

  }

  return { errors, plansChecked };
}

function main() {
  const repoRoot = path.resolve(__dirname, '..');
  console.log(`\n============================================================`);
  console.log(`  A-L-L-A-H.COM Documentation Contract & Linter Engine`);
  console.log(`============================================================\n`);

  let frontmatterScore = 35;
  let linkScore = 25;
  let changeSyncScore = 20;
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

  // Check Spec-Driven Plans Standard (.plans/)
  const planCheck = checkPlansStandard(repoRoot);
  if (planCheck.errors.length > 0) {
    totalErrors.push(...planCheck.errors);
    changeSyncScore = Math.max(0, changeSyncScore - planCheck.errors.length * 5);
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
  console.log(`  Plan Inspection: ${planCheck.plansChecked} plan(s) audited.`);

  console.log(`\n------------------------------------------------------------`);
  console.log(`  Score Breakdown:`);
  console.log(`  - Frontmatter & Metadata:   ${frontmatterScore} / 35 pts`);
  console.log(`  - Relative Link Integrity:  ${linkScore} / 25 pts`);
  console.log(`  - Change Matrix & Plans:    ${changeSyncScore} / 20 pts`);
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
    console.error(`❌ Documentation Contract Validation FAILED. Score ${finalScore} < 95 or violations present.`);
    process.exit(1);
  }

  console.log(`✅ Documentation Contract Validation PASSED (100% compliant).\n`);
}

main();
