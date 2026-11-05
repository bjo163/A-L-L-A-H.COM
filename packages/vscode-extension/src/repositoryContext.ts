import { promises as fs } from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import { isSensitiveWorkspacePath } from './localAgentCore';
import { buildRepositoryDna, type RepositoryDna } from './repositoryDna';
import { findDocumentationDrift, type DocumentationDrift } from './documentationDrift';

export interface RepositoryContextIndex {
  workspacePath: string;
  generatedAt: string;
  files: string[];
  plans: string[];
  manifests: string[];
  dna: RepositoryDna;
  drift: DocumentationDrift[];
  summary: string;
}

const INDEX_KEY = 'allah.repositoryContext.index';
const MAX_FILES = 400;

export class RepositoryContextService {
  constructor(private readonly context: vscode.ExtensionContext) {}

  async build(folder: vscode.WorkspaceFolder): Promise<RepositoryContextIndex> {
    const root = await fs.realpath(folder.uri.fsPath);
    const uris = await vscode.workspace.findFiles(
      new vscode.RelativePattern(folder, '**/*'),
      '**/{.git,node_modules,dist,build,.next,coverage}/**',
      MAX_FILES
    );
    const files = uris
      .map((uri) => path.relative(root, uri.fsPath))
      .filter((relativePath) => relativePath && !isSensitiveWorkspacePath(relativePath))
      .sort((left, right) => left.localeCompare(right));
    const plans = files.filter((file) => file.startsWith('.plans' + path.sep) && /(?:spec|task|design|rules)\.md$/i.test(file));
    const manifests = files.filter((file) => /(?:^|[\\/])(?:package\.json|tsconfig(?:\..+)?\.json|pnpm-workspace\.yaml|Cargo\.toml|pyproject\.toml|go\.mod)$/.test(file));
    const packageManifest = await this.readPackageManifest(root, files);
    const dna = buildRepositoryDna(files, packageManifest);
    const drift = findDocumentationDrift(dna.scripts, manifests, dna.documentation);
    const summary = [
      `Workspace: ${folder.name}`,
      `Files indexed: ${files.length}`,
      `Plans artifacts: ${plans.length}`,
      `Project manifests: ${manifests.length}`,
      `Detected: ${[dna.packageManager, ...dna.frameworks].filter(Boolean).join(', ') || 'no known framework metadata'}.`,
      'Excluded: .git, dependencies, build output, and sensitive paths.',
      `Documentation suggestions: ${drift.length}.`,
    ].join('\n');
    const index = { workspacePath: root, generatedAt: new Date().toISOString(), files, plans, manifests, dna, drift, summary };
    await this.context.workspaceState.update(INDEX_KEY, index);
    return index;
  }

  get(folder: vscode.WorkspaceFolder): RepositoryContextIndex | undefined {
    const stored = this.context.workspaceState.get<RepositoryContextIndex>(INDEX_KEY);
    if (!stored || path.resolve(stored.workspacePath) !== path.resolve(folder.uri.fsPath)) return undefined;
    return stored;
  }

  format(index: RepositoryContextIndex): string {
    return [
      'Repository context index:',
      index.summary,
      '',
      'Key manifests:',
      ...index.manifests.slice(0, 80).map((file) => `- ${file}`),
      '',
      'Plans artifacts:',
      ...index.plans.slice(0, 120).map((file) => `- ${file}`),
      '',
      'Repository DNA:',
      `- Package manager: ${index.dna.packageManager ?? 'not detected'}`,
      `- Frameworks: ${index.dna.frameworks.join(', ') || 'none detected'}`,
      `- Languages: ${index.dna.languages.join(', ') || 'none detected'}`,
      `- Scripts: ${index.dna.scripts.slice(0, 40).join(', ') || 'none detected'}`,
      `- Dependencies: ${index.dna.dependencies.slice(0, 80).join(', ') || 'none detected'}`,
      `- Documentation: ${index.dna.documentation.slice(0, 80).join(', ') || 'none detected'}`,
      '',
      'Proposed documentation updates:',
      ...(index.drift ?? []).map((finding) => `- ${finding.value}: ${finding.suggestion}`),
    ].join('\n');
  }

  private async readPackageManifest(root: string, files: string[]): Promise<Record<string, unknown> | undefined> {
    const packageFile = files.includes('package.json')
      ? 'package.json'
      : files.find((file) => /(^|[\\/])package\.json$/.test(file));
    if (!packageFile) return undefined;
    try {
      const raw = await fs.readFile(path.join(root, packageFile), 'utf8');
      const parsed: unknown = JSON.parse(raw);
      return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
        ? parsed as Record<string, unknown>
        : undefined;
    } catch {
      return undefined;
    }
  }
}
