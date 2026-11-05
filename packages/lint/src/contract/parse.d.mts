/** Type surface for the shared contract module (implementation: parse.mjs). */

export interface ParsedContractDoc {
  scalars: Record<string, string>;
  lists: Record<string, string[]>;
  body: string;
}

export interface ContractSchema {
  tiers: string[];
  statuses: string[];
  scalarPatterns: Record<string, string>;
  requiredScalars: string[];
  tierSchema: Record<string, { requiredLists: string[]; optionalLists: string[]; optionalScalars: string[] }>;
}

export const CONTRACT_SCHEMA: ContractSchema;

export function parseContractMarkdown(content: string): ParsedContractDoc | null;

export function loadContractDoc(
  unitDir: string,
  repoRoot: string,
): { doc: ParsedContractDoc | null; rel: string; contractPath: string };

export interface ScalarFindingParams {
  tier: string;
  expectedName?: string;
  field?: string;
  actual?: string;
}

export function validateContractScalars(
  doc: ParsedContractDoc | null,
  tier: string,
  opts?: { expectedName?: string; report?: (code: string, params: ScalarFindingParams) => void },
): void;

export function requiredListsFor(tier: string): string[];

export function setsEqual(a: string[], b: string[]): boolean;

export function listDiff(a: string[], b: string[]): string;

export function listUnitDirs(base: string, requirePackageJson: boolean): string[];

export function listUnits(repoRoot: string): Array<{ dir: string; tier: string; name: string }>;

export function collectSources(dir: string, exts: string[], acc?: string[]): string[];

export function collectPackageExports(srcDir: string): Set<string>;

export function parseDefineModelsFromSource(src: string): Set<string>;

export function readLayoutSkin(appDir: string): string | null;
