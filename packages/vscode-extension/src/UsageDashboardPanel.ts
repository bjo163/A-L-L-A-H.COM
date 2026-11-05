/**
 * Usage Dashboard Webview Provider
 * Displays token usage, costs, and budget enforcement
 */

import * as vscode from 'vscode';
import { UsageDashboardService, UsageMetrics } from './services/UsageDashboardService';

export class UsageDashboardPanel implements vscode.WebviewViewProvider {
  public static readonly viewType = 'allah.views.usageDashboard';

  private view?: vscode.WebviewView;
  private updateInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly dashboard: UsageDashboardService
  ) {
    // Listen for budget alerts
    this.dashboard.on('alert', (alert) => {
      this.view?.webview.postMessage({
        type: 'budgetAlert',
        alert,
      });
    });

    // Listen for usage updates
    this.dashboard.on('usageReset', (data) => {
      this.updateDashboard();
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
        this.updateDashboard();
      } else if (message.type === 'setPeriod') {
        const metrics = this.dashboard.getMetrics(message.period);
        webviewView.webview.postMessage({
          type: 'metricsUpdate',
          period: message.period,
          metrics,
        });
      } else if (message.type === 'setBudget') {
        this.dashboard.setBudgetLimit(message.period, message.limit);
        this.updateDashboard();
      } else if (message.type === 'exportData') {
        try {
          const data = this.dashboard.exportUsageData(message.period);
          webviewView.webview.postMessage({
            type: 'exportReady',
            data,
            period: message.period,
          });
        } catch (error) {
          webviewView.webview.postMessage({
            type: 'error',
            message: `Export failed: ${error instanceof Error ? error.message : String(error)}`,
          });
        }
      } else if (message.type === 'resetUsage') {
        this.dashboard.resetUsage(message.period);
      }
    });

    // Start auto-update
    this.updateInterval = setInterval(() => {
      this.updateDashboard();
    }, 5000);
  }

  private updateDashboard(): void {
    const daily = this.dashboard.getMetrics('daily');
    const weekly = this.dashboard.getMetrics('weekly');
    const monthly = this.dashboard.getMetrics('monthly');
    const alerts = this.dashboard.getAlerts();

    this.view?.webview.postMessage({
      type: 'dashboardUpdate',
      daily,
      weekly,
      monthly,
      alerts,
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
    <title>Usage Dashboard</title>
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

        .tabs {
            display: flex;
            gap: 8px;
            border-bottom: 1px solid var(--vscode-editorGroup-border);
            margin-bottom: 12px;
        }

        .tab {
            padding: 6px 12px;
            font-size: 12px;
            border: none;
            background: transparent;
            color: var(--vscode-descriptionForeground);
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: all 0.2s;
        }

        .tab.active {
            color: var(--vscode-editor-foreground);
            border-bottom-color: var(--vscode-progressBar-background);
        }

        .tab:hover {
            color: var(--vscode-editor-foreground);
        }

        .card {
            background: var(--vscode-editorGroup-border);
            border: 1px solid var(--vscode-editorGroup-border);
            border-radius: 4px;
            padding: 12px;
        }

        .card-title {
            font-weight: 600;
            font-size: 12px;
            margin-bottom: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-bottom: 12px;
        }

        .metric-item {
            background: var(--vscode-input-background);
            padding: 12px;
            border-radius: 4px;
        }

        .metric-value {
            font-size: 18px;
            font-weight: 600;
            color: var(--vscode-progressBar-background);
        }

        .metric-label {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            margin-top: 4px;
        }

        .progress-bar {
            width: 100%;
            height: 6px;
            background: var(--vscode-input-background);
            border-radius: 3px;
            overflow: hidden;
            margin: 8px 0;
        }

        .progress-fill {
            height: 100%;
            background: var(--vscode-progressBar-background);
            transition: width 0.3s;
        }

        .budget-status {
            font-size: 11px;
            margin-top: 4px;
            padding: 6px;
            border-radius: 3px;
            background: var(--vscode-editorGroup-border);
        }

        .status-healthy { background: rgba(76, 175, 80, 0.1); color: var(--vscode-testing-runAction); }
        .status-warning { background: rgba(255, 193, 7, 0.1); color: var(--vscode-editorWarning-foreground); }
        .status-critical { background: rgba(244, 67, 54, 0.1); color: var(--vscode-editorError-foreground); }
        .status-exceeded { background: rgba(156, 39, 176, 0.1); color: var(--vscode-editorError-foreground); }

        .model-list {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .model-item {
            background: var(--vscode-input-background);
            padding: 8px;
            border-radius: 3px;
            font-size: 11px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .model-name {
            font-weight: 600;
            flex: 1;
        }

        .model-stats {
            font-size: 10px;
            color: var(--vscode-descriptionForeground);
        }

        .alerts {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .alert {
            background: var(--vscode-input-background);
            border-left: 3px solid;
            padding: 8px;
            border-radius: 3px;
            font-size: 11px;
        }

        .alert-warning { border-color: var(--vscode-editorWarning-foreground); }
        .alert-critical { border-color: var(--vscode-editorError-foreground); }
        .alert-exceeded { border-color: var(--vscode-editorError-foreground); }

        button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 3px;
            padding: 6px 12px;
            font-size: 11px;
            cursor: pointer;
            transition: opacity 0.2s;
        }

        button:hover {
            opacity: 0.8;
        }

        button.small {
            padding: 2px 6px;
            font-size: 10px;
        }

        .button-group {
            display: flex;
            gap: 6px;
            margin-top: 8px;
        }

        .title {
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--vscode-descriptionForeground);
            margin-top: 12px;
            margin-bottom: 8px;
        }

        input {
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 3px;
            padding: 6px 8px;
            font-family: inherit;
            font-size: 11px;
            width: 100%;
        }

        input:focus {
            outline: none;
            border-color: var(--vscode-focusBorder);
        }

        .budget-setup {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .budget-input-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="tabs">
            <button class="tab active" onclick="switchPeriod('daily')">Daily</button>
            <button class="tab" onclick="switchPeriod('weekly')">Weekly</button>
            <button class="tab" onclick="switchPeriod('monthly')">Monthly</button>
        </div>

        <div class="card">
            <div class="card-title">
                <span>💰 Usage & Budget</span>
            </div>

            <div class="metrics-grid">
                <div class="metric-item">
                    <div class="metric-value" id="tokensUsed">0</div>
                    <div class="metric-label">Tokens Used</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value" id="costIncurred">\$0.00</div>
                    <div class="metric-label">Cost Incurred</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value" id="requestCount">0</div>
                    <div class="metric-label">Requests</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value" id="avgLatency">0ms</div>
                    <div class="metric-label">Avg Latency</div>
                </div>
            </div>

            <div>
                <div style="font-size: 11px; font-weight: 600; margin-bottom: 4px;">Budget Status</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="budgetFill" style="width: 0%;"></div>
                </div>
                <div class="budget-status" id="budgetStatus">Healthy - 0%</div>
            </div>

            <div class="button-group">
                <button class="small" onclick="exportData()">📥 Export</button>
                <button class="small" onclick="resetUsage()">🔄 Reset</button>
            </div>
        </div>

        <div class="card">
            <div class="card-title">
                <span>🎯 Top Models</span>
            </div>
            <div class="model-list" id="modelList">
                <div style="color: var(--vscode-descriptionForeground); font-size: 11px; text-align: center; padding: 12px;">
                    No data yet
                </div>
            </div>
        </div>

        <div class="card" id="alertsCard" style="display: none;">
            <div class="card-title">
                <span>⚠️ Alerts</span>
            </div>
            <div class="alerts" id="alertsList"></div>
        </div>

        <div class="card">
            <div class="card-title">
                <span>⚙️ Budget Settings</span>
            </div>

            <div class="budget-setup">
                <div>
                    <label style="font-size: 11px; color: var(--vscode-descriptionForeground); display: block; margin-bottom: 4px;">
                        Max Cost (\$)
                    </label>
                    <input type="number" id="maxCostInput" placeholder="e.g., 50" step="0.01" />
                </div>

                <div>
                    <label style="font-size: 11px; color: var(--vscode-descriptionForeground); display: block; margin-bottom: 4px;">
                        Alert Threshold (%)
                    </label>
                    <input type="number" id="alertThresholdInput" placeholder="e.g., 75" min="0" max="100" />
                </div>

                <button onclick="updateBudget()">Save Budget Settings</button>
            </div>
        </div>
    </div>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        let currentPeriod = 'daily';

        function switchPeriod(period) {
            currentPeriod = period;

            // Update tabs
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            event.target.classList.add('active');

            vscode.postMessage({ type: 'setPeriod', period });
        }

        function exportData() {
            vscode.postMessage({ type: 'exportData', period: currentPeriod });
        }

        function resetUsage() {
            if (confirm('Reset usage for this period?')) {
                vscode.postMessage({ type: 'resetUsage', period: currentPeriod });
            }
        }

        function updateBudget() {
            const maxCost = parseFloat(document.getElementById('maxCostInput').value);
            const alertThreshold = parseFloat(document.getElementById('alertThresholdInput').value);

            if (isNaN(maxCost) || isNaN(alertThreshold)) {
                alert('Please enter valid values');
                return;
            }

            vscode.postMessage({
                type: 'setBudget',
                period: currentPeriod,
                limit: {
                    period: currentPeriod,
                    maxTokens: 0,
                    maxCost,
                    alertThreshold,
                },
            });
        }

        function renderMetrics(metrics) {
            document.getElementById('tokensUsed').textContent = metrics.tokensUsed.toLocaleString();
            document.getElementById('costIncurred').textContent = \`\\\$\${metrics.costIncurred.toFixed(2)}\`;
            document.getElementById('requestCount').textContent = metrics.requestCount.toLocaleString();
            document.getElementById('avgLatency').textContent = \`\${Math.round(metrics.averageLatencyMs)}ms\`;

            const percentage = metrics.costIncurred / (metrics.estimatedCostRemaining + metrics.costIncurred) * 100;
            document.getElementById('budgetFill').style.width = \`\${Math.min(100, percentage)}%\`;

            const statusClass = \`status-\${metrics.budgetStatus}\`;
            document.getElementById('budgetStatus').className = \`budget-status \${statusClass}\`;
            document.getElementById('budgetStatus').textContent = \`\${metrics.budgetStatus.charAt(0).toUpperCase() + metrics.budgetStatus.slice(1)} - \${percentage.toFixed(1)}%\`;

            // Render models
            const modelHtml = metrics.topModels
                .map(m => \`
                    <div class="model-item">
                        <span class="model-name">\${m.model}</span>
                        <span class="model-stats">\${m.tokenCount} tokens • \\\$\${m.cost.toFixed(4)}</span>
                    </div>
                \`)
                .join('');

            document.getElementById('modelList').innerHTML = modelHtml || '<div style="color: var(--vscode-descriptionForeground); font-size: 11px; text-align: center; padding: 12px;">No data yet</div>';
        }

        function renderAlerts(alerts) {
            const alertsCard = document.getElementById('alertsCard');
            if (alerts.length === 0) {
                alertsCard.style.display = 'none';
                return;
            }

            alertsCard.style.display = 'block';

            const alertHtml = alerts
                .map(a => \`
                    <div class="alert alert-\${a.severity}">
                        <strong>\${a.severity.toUpperCase()}</strong><br>
                        \${a.message}
                    </div>
                \`)
                .join('');

            document.getElementById('alertsList').innerHTML = alertHtml;
        }

        window.addEventListener('message', (event) => {
            const message = event.data;

            if (message.type === 'dashboardUpdate') {
                const metrics = message[currentPeriod];
                renderMetrics(metrics);
                renderAlerts(message.alerts);
            } else if (message.type === 'metricsUpdate') {
                renderMetrics(message.metrics);
            } else if (message.type === 'budgetAlert') {
                // Auto-update when alert occurs
                vscode.postMessage({ type: 'setPeriod', period: currentPeriod });
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
