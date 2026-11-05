/**
 * Timeline Replay Webview Provider
 * Displays audit trail and allows replay of LLM interactions
 */

import * as vscode from 'vscode';
import { TimelineReplayService, TimelineFilter, ReplaySession } from './services/TimelineReplayService';

export class TimelineReplayProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'allah.views.timelineReplay';

  private view?: vscode.WebviewView;
  private currentSession: ReplaySession | null = null;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly replay: TimelineReplayService
  ) {
    // Listen for replay events
    this.replay.on('replayStarted', (data) => {
      this.view?.webview.postMessage({
        type: 'replayStarted',
        data,
      });
    });

    this.replay.on('eventReplaying', (data) => {
      this.view?.webview.postMessage({
        type: 'eventReplaying',
        data,
      });
    });

    this.replay.on('replayStopped', (data) => {
      this.view?.webview.postMessage({
        type: 'replayStopped',
        data,
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
      if (message.type === 'loadSessions') {
        const sessions = this.replay.getAllReplaySessions();
        webviewView.webview.postMessage({
          type: 'sessionsLoaded',
          sessions,
        });
      } else if (message.type === 'createSession') {
        try {
          const filter: TimelineFilter = {
            startTime: message.filter?.startTime,
            endTime: message.filter?.endTime,
            eventTypes: message.filter?.eventTypes,
            providers: message.filter?.providers,
            searchText: message.filter?.searchText,
          };

          const session = this.replay.createReplaySession(message.name, filter);
          this.currentSession = session;

          webviewView.webview.postMessage({
            type: 'sessionCreated',
            session,
          });
        } catch (error) {
          webviewView.webview.postMessage({
            type: 'error',
            message: `Failed to create session: ${error instanceof Error ? error.message : String(error)}`,
          });
        }
      } else if (message.type === 'startReplay') {
        try {
          await this.replay.replaySession(message.sessionId);
        } catch (error) {
          webviewView.webview.postMessage({
            type: 'error',
            message: `Replay failed: ${error instanceof Error ? error.message : String(error)}`,
          });
        }
      } else if (message.type === 'stopReplay') {
        this.replay.stopReplay();
      } else if (message.type === 'exportSession') {
        try {
          let data: string;
          if (message.format === 'json') {
            data = this.replay.exportSessionAsJSON(message.sessionId);
          } else {
            data = this.replay.exportSessionAsCSV(message.sessionId);
          }

          webviewView.webview.postMessage({
            type: 'exportReady',
            data,
            format: message.format,
            sessionId: message.sessionId,
          });
        } catch (error) {
          webviewView.webview.postMessage({
            type: 'error',
            message: `Export failed: ${error instanceof Error ? error.message : String(error)}`,
          });
        }
      } else if (message.type === 'queryEvents') {
        try {
          const events = this.replay.queryEvents(message.filter);
          webviewView.webview.postMessage({
            type: 'eventsQueried',
            events: events.slice(0, 50), // Limit to 50 for UI
            total: events.length,
          });
        } catch (error) {
          webviewView.webview.postMessage({
            type: 'error',
            message: `Query failed: ${error instanceof Error ? error.message : String(error)}`,
          });
        }
      } else if (message.type === 'getStatistics') {
        try {
          const stats = this.replay.getTimelineStatistics(message.startTime, message.endTime);
          webviewView.webview.postMessage({
            type: 'statisticsReady',
            stats,
          });
        } catch (error) {
          webviewView.webview.postMessage({
            type: 'error',
            message: `Statistics failed: ${error instanceof Error ? error.message : String(error)}`,
          });
        }
      }
    });

    // Load initial sessions
    const sessions = this.replay.getAllReplaySessions();
    webviewView.webview.postMessage({
      type: 'sessionsLoaded',
      sessions,
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
    <title>Timeline Replay</title>
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
        }

        .tab.active {
            color: var(--vscode-editor-foreground);
            border-bottom-color: var(--vscode-progressBar-background);
        }

        .card {
            background: var(--vscode-editorGroup-border);
            border: 1px solid var(--vscode-editorGroup-border);
            border-radius: 4px;
            padding: 12px;
            margin-bottom: 12px;
        }

        .card-title {
            font-weight: 600;
            font-size: 12px;
            margin-bottom: 12px;
        }

        .session-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .session-item {
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: 3px;
            padding: 8px;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .session-item:hover {
            background: var(--vscode-editorGroup-border);
        }

        .session-header {
            font-weight: 600;
            margin-bottom: 4px;
        }

        .session-meta {
            display: flex;
            justify-content: space-between;
            color: var(--vscode-descriptionForeground);
            font-size: 10px;
        }

        .progress-bar {
            width: 100%;
            height: 20px;
            background: var(--vscode-input-background);
            border-radius: 3px;
            overflow: hidden;
            margin: 8px 0;
            position: relative;
        }

        .progress-fill {
            height: 100%;
            background: var(--vscode-progressBar-background);
            transition: width 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: white;
            font-weight: 600;
        }

        .event-timeline {
            display: flex;
            flex-direction: column;
            gap: 6px;
            max-height: 400px;
            overflow-y: auto;
            margin: 8px 0;
        }

        .event-item {
            background: var(--vscode-input-background);
            padding: 6px 8px;
            border-radius: 3px;
            font-size: 10px;
            font-family: 'Courier New', monospace;
            border-left: 2px solid var(--vscode-progressBar-background);
        }

        .event-time {
            color: var(--vscode-descriptionForeground);
        }

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
            padding: 4px 8px;
            font-size: 10px;
        }

        button.secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        .button-group {
            display: flex;
            gap: 6px;
            margin-top: 8px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            margin: 8px 0;
        }

        .stat-item {
            background: var(--vscode-input-background);
            padding: 8px;
            border-radius: 3px;
            text-align: center;
        }

        .stat-value {
            font-size: 14px;
            font-weight: 600;
            color: var(--vscode-progressBar-background);
        }

        .stat-label {
            font-size: 10px;
            color: var(--vscode-descriptionForeground);
            margin-top: 2px;
        }

        input, textarea {
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 3px;
            padding: 6px 8px;
            font-family: inherit;
            font-size: 11px;
            width: 100%;
            margin-bottom: 6px;
        }

        input:focus, textarea:focus {
            outline: none;
            border-color: var(--vscode-focusBorder);
        }

        .error {
            background: rgba(244, 67, 54, 0.1);
            border: 1px solid var(--vscode-editorError-foreground);
            color: var(--vscode-editorError-foreground);
            padding: 8px;
            border-radius: 3px;
            font-size: 11px;
            margin: 8px 0;
        }

        .empty-state {
            text-align: center;
            color: var(--vscode-descriptionForeground);
            padding: 20px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="tabs">
        <button class="tab active" onclick="switchTab('sessions')">Sessions</button>
        <button class="tab" onclick="switchTab('query')">Query Events</button>
        <button class="tab" onclick="switchTab('statistics')">Statistics</button>
    </div>

    <!-- Sessions Tab -->
    <div id="sessionsTab">
        <div class="card">
            <div class="card-title">📝 Create New Session</div>
            <input type="text" id="sessionName" placeholder="Session name" />
            <div class="button-group">
                <button onclick="createSession()">Create Session</button>
            </div>
        </div>

        <div class="card">
            <div class="card-title">📋 Saved Sessions</div>
            <div id="sessionsList" class="session-list">
                <div class="empty-state">No sessions yet</div>
            </div>
        </div>
    </div>

    <!-- Query Tab -->
    <div id="queryTab" style="display: none;">
        <div class="card">
            <div class="card-title">🔍 Query Events</div>
            <textarea id="queryText" placeholder="Search in event descriptions..." rows="2"></textarea>
            <div class="button-group">
                <button onclick="queryEvents()">Search Events</button>
            </div>
        </div>

        <div class="card">
            <div class="card-title">Results</div>
            <div id="queryResults" class="empty-state">Enter search query above</div>
        </div>
    </div>

    <!-- Statistics Tab -->
    <div id="statisticsTab" style="display: none;">
        <div class="card">
            <div class="card-title">📊 Timeline Statistics</div>
            <div class="button-group">
                <button onclick="getStatistics()">Load Statistics</button>
            </div>
        </div>

        <div class="card">
            <div id="statisticsContent" class="empty-state">Click "Load Statistics" to refresh</div>
        </div>
    </div>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();

        function switchTab(tabName) {
            document.querySelectorAll('[id\$="Tab"]').forEach(tab => tab.style.display = 'none');
            document.getElementById(tabName + 'Tab').style.display = 'block';

            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            event.target.classList.add('active');
        }

        function createSession() {
            const name = document.getElementById('sessionName').value.trim();
            if (!name) {
                alert('Enter session name');
                return;
            }

            vscode.postMessage({
                type: 'createSession',
                name,
                filter: {},
            });

            document.getElementById('sessionName').value = '';
        }

        function startReplay(sessionId) {
            vscode.postMessage({ type: 'startReplay', sessionId });
        }

        function exportSession(sessionId, format) {
            vscode.postMessage({
                type: 'exportSession',
                sessionId,
                format,
            });
        }

        function queryEvents() {
            const text = document.getElementById('queryText').value;
            vscode.postMessage({
                type: 'queryEvents',
                filter: { searchText: text },
            });
        }

        function getStatistics() {
            const now = Date.now();
            vscode.postMessage({
                type: 'getStatistics',
                startTime: now - 24 * 60 * 60 * 1000, // Last 24 hours
                endTime: now,
            });
        }

        function renderSessions(sessions) {
            const html = sessions.length === 0
                ? '<div class="empty-state">No sessions created yet</div>'
                : sessions.map(s => \`
                    <div class="session-item">
                        <div class="session-header">\${s.name}</div>
                        <div class="session-meta">
                            <span>\${s.events.length} events • \${(s.statistics.totalCost).toFixed(4)} • \${s.statistics.successRate.toFixed(1)}% success</span>
                        </div>
                        <div class="button-group">
                            <button class="small" onclick="startReplay('\${s.id}')">▶️ Replay</button>
                            <button class="small secondary" onclick="exportSession('\${s.id}', 'json')">JSON</button>
                            <button class="small secondary" onclick="exportSession('\${s.id}', 'csv')">CSV</button>
                        </div>
                    </div>
                \`).join('');

            document.getElementById('sessionsList').innerHTML = html;
        }

        function renderStatistics(stats) {
            const html = \`
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">\${stats.totalEvents}</div>
                        <div class="stat-label">Events</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">\\\$\${stats.totalCost.toFixed(2)}</div>
                        <div class="stat-label">Total Cost</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">\${Math.round(stats.averageLatency)}ms</div>
                        <div class="stat-label">Avg Latency</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">\${stats.successRate.toFixed(1)}%</div>
                        <div class="stat-label">Success Rate</div>
                    </div>
                </div>

                <div style="margin-top: 12px;">
                    <strong style="font-size: 11px;">Top Providers:</strong>
                    \${stats.topProviders.map(p => \`<div style="font-size: 10px; margin: 2px 0;">\${p.name}: \${p.count}</div>\`).join('')}
                </div>

                <div style="margin-top: 12px;">
                    <strong style="font-size: 11px;">Top Models:</strong>
                    \${stats.topModels.map(m => \`<div style="font-size: 10px; margin: 2px 0;">\${m.name}: \${m.count}</div>\`).join('')}
                </div>
            \`;

            document.getElementById('statisticsContent').innerHTML = html;
        }

        window.addEventListener('message', (event) => {
            const message = event.data;

            if (message.type === 'sessionsLoaded') {
                renderSessions(message.sessions);
            } else if (message.type === 'sessionCreated') {
                renderSessions([message.session]);
                vscode.postMessage({ type: 'loadSessions' });
            } else if (message.type === 'eventsQueried') {
                const html = message.events.length === 0
                    ? '<div class="empty-state">No events found</div>'
                    : \`<div class="event-timeline">\${message.events.map(e => \`
                        <div class="event-item">
                            <span class="event-time">\${new Date(e.timestamp).toLocaleTimeString()}</span>
                            • \${e.type} • \${e.description}
                        </div>
                    \`).join('')}</div>\`;

                document.getElementById('queryResults').innerHTML = html;
            } else if (message.type === 'statisticsReady') {
                renderStatistics(message.stats);
            } else if (message.type === 'error') {
                alert('Error: ' + message.message);
            }
        });

        vscode.postMessage({ type: 'loadSessions' });
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
