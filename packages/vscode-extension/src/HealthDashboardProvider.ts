/**
 * Health Dashboard Webview Provider
 * Displays real-time provider health status
 */

import * as vscode from 'vscode';
import { HealthMonitorService } from './services/HealthMonitorService';
import { ProviderRegistry } from './providers';

export class HealthDashboardProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'allah.views.health';

  private view?: vscode.WebviewView;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly healthMonitor: HealthMonitorService
  ) {
    // Listen for health changes and update webview
    this.healthMonitor.onHealthChanged((health) => {
      this.view?.webview.postMessage({
        type: 'healthUpdate',
        health,
      });
    });
  }

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
      if (message.type === 'ready') {
        const allHealth = this.healthMonitor.getAllHealth();
        webviewView.webview.postMessage({
          type: 'initialLoad',
          health: allHealth,
        });
      } else if (message.type === 'refresh') {
        // Manually refresh health check
        this.healthMonitor.stop();
        this.healthMonitor.start();

        const allHealth = this.healthMonitor.getAllHealth();
        webviewView.webview.postMessage({
          type: 'refreshed',
          health: allHealth,
        });
      }
    });

    // Start monitoring
    this.healthMonitor.start();
  }

  private getHtmlContent(webview: vscode.Webview): string {
    const nonce = this.getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'">
    <title>Provider Health</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            padding: 12px;
            margin: 0;
        }

        .health-container {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .health-card {
            background: var(--vscode-editorGroup-border);
            border: 1px solid var(--vscode-editorGroup-border);
            border-radius: 4px;
            padding: 12px;
            display: grid;
            grid-template-columns: 1fr 60px;
            gap: 12px;
            align-items: center;
        }

        .health-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .provider-name {
            font-weight: 600;
            font-size: 13px;
        }

        .health-metrics {
            display: flex;
            gap: 16px;
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
        }

        .metric {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .status-badge {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 50px;
            height: 50px;
            border-radius: 4px;
            font-size: 24px;
        }

        .status-healthy {
            background: rgba(76, 175, 80, 0.2);
            color: var(--vscode-testing-runAction);
        }

        .status-unhealthy {
            background: rgba(244, 67, 54, 0.2);
            color: var(--vscode-statusBarItem-errorForeground);
        }

        .latency-graph {
            width: 100%;
            height: 40px;
            background: var(--vscode-input-background);
            border-radius: 2px;
            display: flex;
            align-items: flex-end;
            gap: 1px;
            padding: 2px;
            box-sizing: border-box;
            margin-top: 4px;
        }

        .latency-bar {
            flex: 1;
            background: var(--vscode-progressBar-background);
            border-radius: 2px;
            opacity: 0.8;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }

        .title {
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        button {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border: none;
            border-radius: 3px;
            padding: 4px 8px;
            font-size: 11px;
            cursor: pointer;
            transition: opacity 0.2s;
        }

        button:hover {
            opacity: 0.8;
        }

        .no-providers {
            color: var(--vscode-descriptionForeground);
            font-size: 12px;
            text-align: center;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Provider Health</div>
        <button onclick="refresh()">Refresh</button>
    </div>
    <div id="healthContainer" class="health-container">
        <div class="no-providers">Loading...</div>
    </div>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();

        function refresh() {
            vscode.postMessage({ type: 'refresh' });
        }

        function renderHealth(health) {
            const container = document.getElementById('healthContainer');

            if (!health || health.length === 0) {
                container.innerHTML = '<div class="no-providers">No providers configured</div>';
                return;
            }

            container.innerHTML = health.map(h => \`
                <div class="health-card">
                    <div class="health-info">
                        <div class="provider-name">\${h.provider.charAt(0).toUpperCase() + h.provider.slice(1)}</div>
                        <div class="health-metrics">
                            <span class="metric">
                                <span>⏱️</span>
                                <span>\${h.avgLatencyMs}ms</span>
                            </span>
                            <span class="metric">
                                <span>📊</span>
                                <span>\${(h.errorRate * 100).toFixed(1)}% errors</span>
                            </span>
                            <span class="metric">
                                <span>❌</span>
                                <span>\${h.errorCount24h} (24h)</span>
                            </span>
                        </div>
                        <div class="latency-graph">
                            \${h.recentLatencies.map(latency => {
                                const maxLatency = 5000;
                                const height = Math.min((latency / maxLatency) * 100, 100);
                                return \`<div class="latency-bar" style="height: \${height}%;" title="\${latency}ms"></div>\`;
                            }).join('')}
                        </div>
                    </div>
                    <div class="status-badge \${h.isHealthy ? 'status-healthy' : 'status-unhealthy'}">
                        \${h.isHealthy ? '✓' : '✗'}
                    </div>
                </div>
            \`).join('');
        }

        window.addEventListener('message', (event) => {
            const message = event.data;

            if (message.type === 'initialLoad' || message.type === 'refreshed') {
                renderHealth(message.health);
            } else if (message.type === 'healthUpdate') {
                renderHealth([message.health]);
            }
        });

        vscode.postMessage({ type: 'ready' });
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
