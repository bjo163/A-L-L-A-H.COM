import { promises as fs } from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import { isSensitiveWorkspacePath } from './localAgentCore';

export interface RepositoryContextIndex {
  workspacePath: string;
  generatedAt: string;
  files: string[];
  plans: string[];
  manifests: string[];
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
    const summary = [
      `Workspace: ${folder.name}`,
      `Files indexed: ${files.length}`,
      `Plans artifacts: ${plans.length}`,
      `Project manifests: ${manifests.length}`,
      'Excluded: .git, dependencies, build output, and sensitive paths.',
    ].join('\n');
    const index = { workspacePath: root, generatedAt: new Date().toISOString(), files, plans, manifests, summary };
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
    ].join('\n');
  }
}
