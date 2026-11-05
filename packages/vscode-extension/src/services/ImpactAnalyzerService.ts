/**
 * Impact Analyzer Service
 * Traces cross-file references, dependency chains, and code impact
 * Helps identify what code changes affect and what depends on them
 */

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export interface CodeReference {
  file: string;
  line: number;
  column: number;
  text: string;
  type: 'import' | 'export' | 'function-call' | 'class-usage' | 'variable-reference';
}

export interface ImpactResult {
  symbol: string;
  file: string;
  incomingDependencies: CodeReference[];
  outgoingDependencies: CodeReference[];
  affectedFiles: Set<string>;
  impactRadius: number; // How many files would be affected by a change
  estimatedChangeRisk: 'low' | 'medium' | 'high' | 'critical';
  changeRiskReason: string;
}

export interface DependencyGraph {
  nodes: Map<string, { file: string; type: 'module' | 'function' | 'class' | 'variable' }>;
  edges: Array<{ from: string; to: string; type: 'imports' | 'calls' | 'extends' | 'uses' }>;
  cycles: string[][];
}

/**
 * Singleton service for analyzing code impact and dependencies
 */
export class ImpactAnalyzerService {
  private static instance: ImpactAnalyzerService;
  private dependencyCache: Map<string, ImpactResult> = new Map();
  private graphCache: DependencyGraph | null = null;
  private lastAnalysisTime: number = 0;
  private analysisTimeout: number = 30000; // 30 second cache

  private constructor() {}

  public static getInstance(): ImpactAnalyzerService {
    if (!ImpactAnalyzerService.instance) {
      ImpactAnalyzerService.instance = new ImpactAnalyzerService();
    }
    return ImpactAnalyzerService.instance;
  }

  /**
   * Analyze impact of changing a symbol at specific location
   */
  public async analyzeSymbolImpact(
    filePath: string,
    line: number,
    column: number,
    symbol: string
  ): Promise<ImpactResult> {
    const cacheKey = `${filePath}:${line}:${column}:${symbol}`;

    // Check cache
    if (this.dependencyCache.has(cacheKey)) {
      const cached = this.dependencyCache.get(cacheKey)!;
      if (Date.now() - this.lastAnalysisTime < this.analysisTimeout) {
        return cached;
      }
    }

    const incoming = await this.findIncomingDependencies(filePath, symbol);
    const outgoing = await this.findOutgoingDependencies(filePath, symbol);
    const affectedFiles = this.calculateAffectedFiles(incoming, outgoing);

    const result: ImpactResult = {
      symbol,
      file: filePath,
      incomingDependencies: incoming,
      outgoingDependencies: outgoing,
      affectedFiles,
      impactRadius: affectedFiles.size,
      estimatedChangeRisk: this.estimateRisk(affectedFiles.size, incoming.length),
      changeRiskReason: this.generateRiskReason(affectedFiles.size, incoming.length),
    };

    this.dependencyCache.set(cacheKey, result);
    this.lastAnalysisTime = Date.now();

    return result;
  }

  /**
   * Build complete dependency graph for workspace
   */
  public async buildDependencyGraph(workspaceRoot: string): Promise<DependencyGraph> {
    if (this.graphCache && Date.now() - this.lastAnalysisTime < this.analysisTimeout) {
      return this.graphCache;
    }

    const nodes = new Map<string, { file: string; type: 'module' | 'function' | 'class' | 'variable' }>();
    const edges: Array<{ from: string; to: string; type: 'imports' | 'calls' | 'extends' | 'uses' }> = [];
    const cycles: string[][] = [];

    // Find all TypeScript/JavaScript files
    const files = await this.findSourceFiles(workspaceRoot);

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const localRefs = this.extractReferences(content, file);

        // Add nodes
        for (const ref of localRefs) {
          const nodeId = `${ref.file}:${ref.text}`;
          if (!nodes.has(nodeId)) {
            nodes.set(nodeId, {
              file: ref.file,
              type: this.inferType(ref.type),
            });
          }
        }

        // Add edges (imports and calls)
        const imports = this.extractImports(content, file);
        for (const imp of imports) {
          edges.push({
            from: `${file}:${imp.symbol}`,
            to: imp.target,
            type: 'imports',
          });
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    // Detect cycles
    const detectedCycles = this.detectCycles(nodes, edges);
    cycles.push(...detectedCycles);

    this.graphCache = {
      nodes,
      edges,
      cycles,
    };

    this.lastAnalysisTime = Date.now();
    return this.graphCache;
  }

  /**
   * Find all files that import or depend on a specific file
   */
  public async findDependents(filePath: string, workspaceRoot: string): Promise<string[]> {
    const graph = await this.buildDependencyGraph(workspaceRoot);
    const dependents = new Set<string>();

    // Find all edges pointing to this file
    const normalizedPath = this.normalizePath(filePath);
    for (const edge of graph.edges) {
      if (edge.to.includes(normalizedPath)) {
        const sourceFile = edge.from.split(':')[0];
        dependents.add(sourceFile);
      }
    }

    return Array.from(dependents);
  }

  /**
   * Estimate change risk based on impact radius
   */
  private estimateRisk(affectedFileCount: number, dependencyCount: number): 'low' | 'medium' | 'high' | 'critical' {
    if (affectedFileCount > 50 || dependencyCount > 100) return 'critical';
    if (affectedFileCount > 20 || dependencyCount > 50) return 'high';
    if (affectedFileCount > 5 || dependencyCount > 10) return 'medium';
    return 'low';
  }

  /**
   * Generate human-readable risk explanation
   */
  private generateRiskReason(affectedFileCount: number, dependencyCount: number): string {
    if (affectedFileCount > 50) return 'Changes affect more than 50 files - widespread impact';
    if (dependencyCount > 100) return 'This symbol is referenced in 100+ places - high coupling';
    if (affectedFileCount > 20) return 'Changes affect 20+ files - significant impact';
    if (dependencyCount > 50) return 'This symbol is referenced in 50+ places - moderate coupling';
    if (affectedFileCount > 5) return 'Changes affect 5+ files - localized impact';
    return 'Isolated symbol with minimal external dependencies';
  }

  /**
   * Find files that reference this symbol (incoming dependencies)
   */
  private async findIncomingDependencies(filePath: string, symbol: string): Promise<CodeReference[]> {
    const references: CodeReference[] = [];
    const workspace = vscode.workspace.workspaceFolders?.[0];
    if (!workspace) return references;

    try {
      // Use VSCode's symbol search
      const pattern = new vscode.RelativePattern(workspace, '**/*.{ts,tsx,js,jsx}');
      const files = await vscode.workspace.findFiles(pattern);

      for (const file of files) {
        if (file.fsPath === filePath) continue;

        try {
          const content = fs.readFileSync(file.fsPath, 'utf-8');
          const lines = content.split('\n');

          // Simple regex search for symbol usage
          const regex = new RegExp(`\\b${symbol}\\b`, 'g');
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (regex.test(line)) {
              references.push({
                file: file.fsPath,
                line: i + 1,
                column: line.indexOf(symbol) + 1,
                text: line.trim(),
                type: 'variable-reference',
              });
            }
          }
        } catch (error) {
          // Skip unreadable files
        }
      }
    } catch (error) {
      // Ignore workspace search errors
    }

    return references;
  }

  /**
   * Find symbols that this file depends on (outgoing dependencies)
   */
  private async findOutgoingDependencies(filePath: string, symbol: string): Promise<CodeReference[]> {
    const references: CodeReference[] = [];

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      // Extract imports and function calls
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Import statements
        if (line.includes('import') || line.includes('require')) {
          references.push({
            file: filePath,
            line: i + 1,
            column: 1,
            text: line.trim(),
            type: 'import',
          });
        }

        // Function/class definitions and calls related to symbol
        if (line.includes(symbol)) {
          references.push({
            file: filePath,
            line: i + 1,
            column: line.indexOf(symbol) + 1,
            text: line.trim(),
            type: 'function-call',
          });
        }
      }
    } catch (error) {
      // Ignore file read errors
    }

    return references;
  }

  /**
   * Calculate which files would be affected by a change
   */
  private calculateAffectedFiles(incoming: CodeReference[], outgoing: CodeReference[]): Set<string> {
    const affected = new Set<string>();

    for (const ref of incoming) {
      affected.add(ref.file);
    }

    for (const ref of outgoing) {
      affected.add(ref.file);
    }

    return affected;
  }

  /**
   * Extract code references from file content
   */
  private extractReferences(content: string, filePath: string): CodeReference[] {
    const references: CodeReference[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Export declarations
      if (line.includes('export ')) {
        references.push({
          file: filePath,
          line: i + 1,
          column: 1,
          text: line.trim(),
          type: 'export',
        });
      }
    }

    return references;
  }

  /**
   * Extract import statements from file
   */
  private extractImports(
    content: string,
    filePath: string
  ): Array<{ symbol: string; target: string }> {
    const imports: Array<{ symbol: string; target: string }> = [];
    const importRegex = /import\s+(?:{[^}]+}|[^\s]+)\s+from\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      imports.push({
        symbol: match[0],
        target: match[1],
      });
    }

    return imports;
  }

  /**
   * Detect circular dependencies in dependency graph
   */
  private detectCycles(
    nodes: Map<string, any>,
    edges: Array<{ from: string; to: string; type: string }>
  ): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (node: string, path: string[]): void => {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      for (const edge of edges) {
        if (edge.from === node) {
          const target = edge.to;
          if (!visited.has(target)) {
            dfs(target, path);
          } else if (recursionStack.has(target)) {
            const cycleStart = path.indexOf(target);
            cycles.push(path.slice(cycleStart).concat([target]));
          }
        }
      }

      path.pop();
      recursionStack.delete(node);
    };

    for (const node of nodes.keys()) {
      if (!visited.has(node)) {
        dfs(node, []);
      }
    }

    return cycles;
  }

  /**
   * Find all source files in workspace
   */
  private async findSourceFiles(workspaceRoot: string): Promise<string[]> {
    const files: string[] = [];

    const walkDir = (dir: string): void => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          if (entry.name.startsWith('.')) continue;
          if (entry.name === 'node_modules') continue;

          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            walkDir(fullPath);
          } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Ignore directory read errors
      }
    };

    walkDir(workspaceRoot);
    return files;
  }

  /**
   * Infer type of code reference
   */
  private inferType(
    refType: string
  ): 'module' | 'function' | 'class' | 'variable' {
    if (refType.includes('export')) return 'function';
    if (refType.includes('class')) return 'class';
    if (refType.includes('const') || refType.includes('let')) return 'variable';
    return 'module';
  }

  /**
   * Normalize file path for comparison
   */
  private normalizePath(filePath: string): string {
    return filePath.toLowerCase().replace(/\\/g, '/');
  }

  /**
   * Clear caches
   */
  public clearCache(): void {
    this.dependencyCache.clear();
    this.graphCache = null;
    this.lastAnalysisTime = 0;
  }
}
