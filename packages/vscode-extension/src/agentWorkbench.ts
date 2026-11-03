import { randomBytes } from 'crypto';
import * as vscode from 'vscode';
import { MoonWitnessClient } from './client';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export class AgentWorkbenchProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'allah.agentWorkbench';

  private view?: vscode.WebviewView;
  private activeRun: AbortController | undefined;

  constructor(private readonly client: MoonWitnessClient) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this.getHtml(webviewView.webview);
    webviewView.onDidDispose(() => this.activeRun?.abort());

    webviewView.webview.onDidReceiveMessage(async (message: unknown) => {
      if (!this.isCommand(message)) return;
      if (message.command === 'stopSwarm') {
        this.activeRun?.abort();
        return;
      }
      if (message.command === 'runSwarm') {
        await this.runSwarm(message.goal, message.maxTurns);
      }
    });
  }

  private isCommand(value: unknown): value is {
    command: 'runSwarm';
    goal: string;
    maxTurns: number;
  } | {
    command: 'stopSwarm';
  } {
    if (typeof value !== 'object' || value === null || !('command' in value)) return false;
    if (value.command === 'stopSwarm') return true;
    return value.command === 'runSwarm'
      && 'goal' in value
      && typeof value.goal === 'string'
      && 'maxTurns' in value
      && typeof value.maxTurns === 'number'
      && Number.isInteger(value.maxTurns)
      && value.maxTurns >= 1
      && value.maxTurns <= 24;
  }

  private async runSwarm(goal: string, maxTurns: number): Promise<void> {
    if (!goal.trim() || !this.view || this.activeRun) return;

    const controller = new AbortController();
    this.activeRun = controller;
    this.post({ type: 'started' });

    try {
      await this.client.streamSwarm(
        goal.trim(),
        maxTurns,
        (event, payload) => this.post({ type: 'event', event, payload }),
        controller.signal
      );
      if (controller.signal.aborted) {
        this.post({ type: 'cancelled' });
      } else {
        this.post({ type: 'done' });
      }
    } catch (error) {
      if (controller.signal.aborted) {
        this.post({ type: 'cancelled' });
      } else {
        this.post({ type: 'error', error: errorMessage(error) });
      }
    } finally {
      if (this.activeRun === controller) this.activeRun = undefined;
    }
  }

  private post(data: Record<string, unknown>): void {
    if (this.view) void this.view.webview.postMessage(data);
  }

  private getHtml(webview: vscode.Webview): string {
    const nonce = randomBytes(16).toString('base64');
    const script = `
      const vscode = acquireVsCodeApi();
      const goalInput = document.getElementById('goal');
      const turnsInput = document.getElementById('maxTurns');
      const runBtn = document.getElementById('runBtn');
      const stopBtn = document.getElementById('stopBtn');
      const statusEl = document.getElementById('status');
      const logEl = document.getElementById('log');

      function addRow(label, detail) {
        const row = document.createElement('div');
        row.className = 'row';
        const heading = document.createElement('strong');
        heading.textContent = label;
        row.appendChild(heading);
        if (detail !== undefined && detail !== null) {
          const content = document.createElement('pre');
          content.textContent = typeof detail === 'string' ? detail : JSON.stringify(detail, null, 2);
          row.appendChild(content);
        }
        logEl.appendChild(row);
        logEl.scrollTop = logEl.scrollHeight;
      }

      window.addEventListener('message', (message) => {
        const data = message.data;
        if (data.type === 'started') {
          statusEl.textContent = 'Running';
          runBtn.disabled = true;
          stopBtn.disabled = false;
        } else if (data.type === 'event') {
          const payload = data.payload || {};
          const detail = payload.action
            ? [payload.thought, payload.output].filter(Boolean).join('\\n')
            : payload.payload || payload;
          addRow(String(data.event || 'Agent event'), detail);
        } else if (data.type === 'done') {
          statusEl.textContent = 'Complete';
          runBtn.disabled = false;
          stopBtn.disabled = true;
        } else if (data.type === 'cancelled') {
          statusEl.textContent = 'Cancelled';
          runBtn.disabled = false;
          stopBtn.disabled = true;
        } else if (data.type === 'error') {
          statusEl.textContent = 'Failed';
          addRow('Error', data.error);
          runBtn.disabled = false;
          stopBtn.disabled = true;
        }
      });

      runBtn.addEventListener('click', () => {
        const goal = goalInput.value.trim();
        const maxTurns = Number.parseInt(turnsInput.value, 10);
        if (!goal || !Number.isInteger(maxTurns) || maxTurns < 1 || maxTurns > 24) return;
        logEl.replaceChildren();
        vscode.postMessage({ command: 'runSwarm', goal, maxTurns });
      });
      stopBtn.addEventListener('click', () => vscode.postMessage({ command: 'stopSwarm' }));
    `;

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
<style>
  body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); padding: 12px; }
  h3 { margin: 0 0 12px; font-size: 14px; font-weight: 600; }
  label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: var(--vscode-descriptionForeground); margin-bottom: 4px; }
  input, button { width: 100%; box-sizing: border-box; font-family: var(--vscode-font-family); }
  input { margin-bottom: 8px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); padding: 6px 8px; }
  button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 8px; cursor: pointer; margin-top: 4px; }
  button:disabled { opacity: .5; cursor: default; }
  .status { font-size: 12px; margin: 10px 0; color: var(--vscode-descriptionForeground); }
  #log { margin-top: 6px; }
  .row { border: 1px solid var(--vscode-panel-border); padding: 8px; margin-bottom: 6px; font-size: 12px; }
  pre { white-space: pre-wrap; word-break: break-word; font-size: 11px; background: var(--vscode-textCodeBlock-background); padding: 6px; margin: 6px 0 0; }
</style>
</head>
<body>
<h3>Swarm Operations</h3>
<label for="goal">Mission goal</label>
<input id="goal" type="text" placeholder="Describe the mission for the swarm">
<label for="maxTurns">Maximum turns</label>
<input id="maxTurns" type="number" value="12" min="1" max="24">
<button id="runBtn">Run Swarm</button>
<button id="stopBtn" disabled>Stop</button>
<div class="status" id="status" role="status" aria-live="polite">Idle</div>
<div id="log" aria-live="polite"></div>
<script nonce="${nonce}">${script}</script>
</body>
</html>`;
  }
}
