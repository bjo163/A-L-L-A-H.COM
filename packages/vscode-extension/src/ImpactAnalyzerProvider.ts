/**
 * Impact Analyzer Webview Provider
 * Displays code dependency analysis and change impact assessment
 */

import * as vscode from 'vscode';
import { ImpactAnalyzerService, ImpactResult } from './services/ImpactAnalyzerService';

export class ImpactAnalyzerProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'allah.views.impactAnalyzer';

  private view?: vscode.WebviewView;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly analyzer: ImpactAnalyzerService
  ) {}

  async resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ): Promise<void> {
    this.view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };

    webviewView.webview.html = this.getHtmlContent(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message: any) => {
      if (message.type === 'analyzeSymbol') {
        try {
          const result = await this.analyzer.analyzeSymbolImpact(
            message.filePath,
            message.line,
            message.column,
            message.symbol
          );

          webviewView.webview.postMessage({
            type: 'analysisResult',
            result,
          });
        } catch (error) {
          webviewView.webview.postMessage({
            type: 'error',
            message: `Analysis failed: ${error instanceof Error ? error.message : String(error)}`,
          });
        }
      } else if (message.type === 'buildGraph') {
        try {
          const workspace = vscode.workspace.workspaceFolders?.[0];
          if (!workspace) {
            webviewView.webview.postMessage({
              type: 'error',
              message: 'No workspace folder open',
            });
            return;
          }

          const graph = await this.analyzer.buildDependencyGraph(workspace.uri.fsPath);

          webviewView.webview.postMessage({
            type: 'graphResult',
            graph: {
              nodeCount: graph.nodes.size,
              edgeCount: graph.edges.length,
              cycleCount: graph.cycles.length,
              cycles: graph.cycles,
            },
          });
        } catch (error) {
          webviewView.webview.postMessage({
            type: 'error',
            message: `Graph build failed: ${error instanceof Error ? error.message : String(error)}`,
          });
        }
      }
    });
  }

  private getHtmlContent(webview: vscode.Webview): string {
    const nonce = this.getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'">
    <title>Impact Analyzer</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            padding: 12px;
        }

        .container {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .section {
            background: var(--vscode-editorGroup-border);
            border: 1px solid var(--vscode-editorGroup-border);
            border-radius: 4px;
            padding: 12px;
        }

        .title {
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            color: var(--vscode-descriptionForeground);
        }

        .input-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 8px;
        }

        input, textarea {
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 3px;
            padding: 6px 8px;
            font-family: inherit;
            font-size: 12px;
        }

        input:focus, textarea:focus {
            outline: none;
            border-color: var(--vscode-focusBorder);
        }

        .button-group {
            display: flex;
            gap: 6px;
        }

        button {
            flex: 1;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 3px;
            padding: 6px 12px;
            font-size: 12px;
            cursor: pointer;
            transition: opacity 0.2s;
        }

        button:hover {
            opacity: 0.8;
        }

        button.secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        .result-card {
            background: var(--vscode-input-background);
            border-left: 3px solid var(--vscode-progressBar-background);
            padding: 12px;
            border-radius: 3px;
            margin-bottom: 8px;
        }

        .result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }

        .symbol-name {
            font-weight: 600;
            color: var(--vscode-symbolIcon-functionForeground);
        }

        .risk-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: 600;
        }

        .risk-low { background: rgba(76, 175, 80, 0.2); color: var(--vscode-testing-runAction); }
        .risk-medium { background: rgba(255, 193, 7, 0.2); color: var(--vscode-editorWarning-foreground); }
        .risk-high { background: rgba(244, 67, 54, 0.2); color: var(--vscode-editorError-foreground); }
        .risk-critical { background: rgba(156, 39, 176, 0.2); color: var(--vscode-editorError-foreground); }

        .metric {
            display: inline-block;
            margin-right: 12px;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
        }

        .metric-label {
            font-weight: 600;
        }

        .references {
            margin-top: 8px;
            font-size: 11px;
        }

        .reference-item {
            padding: 4px 6px;
            margin: 4px 0;
            background: var(--vscode-editorGroup-border);
            border-radius: 2px;
            font-family: 'Courier New', monospace;
        }

        .loading {
            text-align: center;
            color: var(--vscode-descriptionForeground);
            font-size: 12px;
            padding: 20px;
        }

        .graph-stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            font-size: 12px;
        }

        .stat-item {
            background: var(--vscode-input-background);
            padding: 8px;
            border-radius: 3px;
        }

        .stat-value {
            font-size: 18px;
            font-weight: 600;
            color: var(--vscode-progressBar-background);
        }

        .stat-label {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            margin-top: 4px;
        }

        .error {
            background: rgba(244, 67, 54, 0.1);
            border: 1px solid var(--vscode-editorError-foreground);
            color: var(--vscode-editorError-foreground);
            padding: 8px;
            border-radius: 3px;
            font-size: 12px;
            margin: 8px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="section">
            <div class="title">📊 Analyze Symbol Impact</div>

            <div class="input-group">
                <label style="font-size: 11px; color: var(--vscode-descriptionForeground);">Symbol Name</label>
                <input type="text" id="symbolInput" placeholder="Function, class, or variable name" />
            </div>

            <div class="input-group">
                <label style="font-size: 11px; color: var(--vscode-descriptionForeground);">File Path</label>
                <input type="text" id="fileInput" placeholder="Relative or absolute path" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                <div class="input-group">
                    <label style="font-size: 11px; color: var(--vscode-descriptionForeground);">Line</label>
                    <input type="number" id="lineInput" value="1" min="1" />
                </div>
                <div class="input-group">
                    <label style="font-size: 11px; color: var(--vscode-descriptionForeground);">Column</label>
                    <input type="number" id="columnInput" value="1" min="1" />
                </div>
            </div>

            <div class="button-group">
                <button onclick="analyzeSymbol()">Analyze Impact</button>
                <button class="secondary" onclick="buildGraph()">Build Graph</button>
            </div>
        </div>

        <div class="section">
            <div class="title">📈 Results</div>
            <div id="resultsContainer">
                <div style="color: var(--vscode-descriptionForeground); font-size: 12px; text-align: center; padding: 20px;">
                    Enter symbol details and click "Analyze Impact" to see results
                </div>
            </div>
        </div>
    </div>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();

        function analyzeSymbol() {
            const symbol = document.getElementById('symbolInput').value.trim();
            const file = document.getElementById('fileInput').value.trim();
            const line = parseInt(document.getElementById('lineInput').value) || 1;
            const column = parseInt(document.getElementById('columnInput').value) || 1;

            if (!symbol || !file) {
                alert('Please enter symbol name and file path');
                return;
            }

            showLoading();
            vscode.postMessage({
                type: 'analyzeSymbol',
                symbol,
                filePath: file,
                line,
                column,
            });
        }

        function buildGraph() {
            showLoading();
            vscode.postMessage({ type: 'buildGraph' });
        }

        function showLoading() {
            document.getElementById('resultsContainer').innerHTML = '<div class="loading">⏳ Analyzing...</div>';
        }

        function renderAnalysisResult(result) {
            const riskClass = \`risk-\${result.estimatedChangeRisk}\`;
            const incomingHtml = result.incomingDependencies
                .slice(0, 5)
                .map(ref => \`<div class="reference-item">\${ref.file}:\${ref.line} - \${ref.text}</div>\`)
                .join('');

            const outgoingHtml = result.outgoingDependencies
                .slice(0, 5)
                .map(ref => \`<div class="reference-item">\${ref.file}:\${ref.line} - \${ref.text}</div>\`)
                .join('');

            const html = \`
                <div class="result-card">
                    <div class="result-header">
                        <span class="symbol-name">\${result.symbol}</span>
                        <span class="risk-badge \${riskClass}">\${result.estimatedChangeRisk.toUpperCase()}</span>
                    </div>

                    <div style="margin-bottom: 12px;">
                        <div class="metric">
                            <span class="metric-label">Impact Radius:</span> \${result.impactRadius} files
                        </div>
                        <div class="metric">
                            <span class="metric-label">Incoming Refs:</span> \${result.incomingDependencies.length}
                        </div>
                        <div class="metric">
                            <span class="metric-label">Outgoing Refs:</span> \${result.outgoingDependencies.length}
                        </div>
                    </div>

                    <div style="background: var(--vscode-editorGroup-border); padding: 8px; border-radius: 3px; margin-bottom: 8px;">
                        <strong style="font-size: 11px;">Risk Reason:</strong><br>
                        <span style="font-size: 11px; color: var(--vscode-descriptionForeground);">\${result.changeRiskReason}</span>
                    </div>

                    \${incomingHtml ? \`
                        <div class="references">
                            <strong style="font-size: 11px;">🔗 Incoming Dependencies (top 5):</strong>
                            \${incomingHtml}
                        </div>
                    \` : ''}

                    \${outgoingHtml ? \`
                        <div class="references">
                            <strong style="font-size: 11px;">➜ Outgoing Dependencies (top 5):</strong>
                            \${outgoingHtml}
                        </div>
                    \` : ''}
                </div>
            \`;

            document.getElementById('resultsContainer').innerHTML = html;
        }

        function renderGraphResult(graph) {
            const html = \`
                <div class="result-card">
                    <div style="margin-bottom: 8px;">
                        <strong style="font-size: 11px;">📊 Dependency Graph Statistics</strong>
                    </div>

                    <div class="graph-stats">
                        <div class="stat-item">
                            <div class="stat-value">\${graph.nodeCount}</div>
                            <div class="stat-label">Modules/Functions</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">\${graph.edgeCount}</div>
                            <div class="stat-label">Dependencies</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">\${graph.cycleCount}</div>
                            <div class="stat-label">Circular Refs</div>
                        </div>
                    </div>

                    \${graph.cycleCount > 0 ? \`
                        <div class="error" style="margin-top: 12px;">
                            ⚠️ Warning: Found \${graph.cycleCount} circular dependency cycles!
                        </div>
                    \` : ''}
                </div>
            \`;

            document.getElementById('resultsContainer').innerHTML = html;
        }

        window.addEventListener('message', (event) => {
            const message = event.data;

            if (message.type === 'analysisResult') {
                renderAnalysisResult(message.result);
            } else if (message.type === 'graphResult') {
                renderGraphResult(message.graph);
            } else if (message.type === 'error') {
                document.getElementById('resultsContainer').innerHTML = \`<div class="error">\${message.message}</div>\`;
            }
        });
    </script>
</body>
</html>`;
  }

  private getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}
