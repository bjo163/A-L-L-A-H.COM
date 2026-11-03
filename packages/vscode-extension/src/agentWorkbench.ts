import * as vscode from 'vscode';

interface SwarmStep {
  step: number;
  agent: 'planner' | 'researcher' | 'builder' | 'verifier';
  action: string;
  thought?: string;
  output?: unknown;
  success: boolean;
  latency_ms?: number;
  timestamp: string;
}

interface SwarmMessage {
  id: string;
  from: SwarmStep['agent'];
  to: SwarmStep['agent'] | 'supervisor' | 'all';
  payload: Record<string, unknown>;
  timestamp: string;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export class AgentWorkbenchProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'allah.agentWorkbench';

  private view?: vscode.WebviewView;

  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this.getHtml(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'runSwarm':
          await this.runSwarm(message.goal as string, message.maxTurns as number);
          break;
        case 'stopSwarm':
          await vscode.window.showInformationMessage('Swarm stop requested. The Arsy stream will close on its own. ');
          break;
      }
    });
  }

  private getArsyBaseUrl(): string {
    const config = vscode.workspace.getConfiguration('allah');
    return (config.get<string>('arsyUrl') || 'http://127.0.0.1:5150').replace(/\/+$/, '');
  }

  private getApiKey(): string {
    const config = vscode.workspace.getConfiguration('allah');
    return config.get<string>('apiKey') || '';
  }

  private async runSwarm(goal: string, maxTurns: number): Promise<void> {
    if (!goal.trim()) {
      return;
    }
    const view = this.view;
    if (!view) {
      return;
    }

    const baseUrl = this.getArsyBaseUrl();
    const apiKey = this.getApiKey();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    try {
      const response = await fetch(`${baseUrl}/v1/swarm/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ goal, max_turns: maxTurns }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Swarm stream failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split('\n\n');
        buffer = blocks.pop() || '';

        for (const block of blocks) {
          const trimmed = block.trim();
          if (!trimmed) {
            continue;
          }
          let currentEvent = 'message';
          let currentData = '';
          for (const line of trimmed.split('\n')) {
            if (line.startsWith('event: ')) {
              currentEvent = line.replace('event: ', '').trim();
            } else if (line.startsWith('data: ')) {
              currentData = line.replace('data: ', '').trim();
            }
          }
          if (!currentData) {
            continue;
          }
          let payload: unknown;
          try {
            payload = JSON.parse(currentData);
          } catch {
            payload = currentData;
          }
          this.post({ type: 'event', event: currentEvent, payload });
        }
      }

      this.post({ type: 'event', event: 'done', payload: { message: 'Swarm stream closed.' } });
    } catch (error) {
      this.post({ type: 'error', error: errorMessage(error) });
    }
  }

  private post(data: Record<string, unknown>): void {
    if (this.view) {
      void this.view.webview.postMessage(data);
    }
  }

  private getHtml(webview: vscode.Webview): string {
    const script = `
      const vscode = acquireVsCodeApi();
      const goalInput = document.getElementById('goal');
      const turnsInput = document.getElementById('maxTurns');
      const runBtn = document.getElementById('runBtn');
      const statusEl = document.getElementById('status');
      const logEl = document.getElementById('log');

      const roleMeta = {
        planner: { label: 'Supervisor', color: '#f59e0b', icon: '🧭' },
        researcher: { label: 'Researcher', color: '#38bdf8', icon: '🔍' },
        builder: { label: 'Builder', color: '#a3e635', icon: '🔨' },
        verifier: { label: 'Reviewer', color: '#f472b6', icon: '✅' },
      };

      function addRow(html) {
        const row = document.createElement('div');
        row.className = 'row';
        row.innerHTML = html;
        logEl.appendChild(row);
        logEl.scrollTop = logEl.scrollHeight;
      }

      function renderStep(step) {
        const meta = roleMeta[step.agent] || roleMeta.planner;
        const lat = step.latency_ms ? '<span class="lat">' + step.latency_ms + 'ms</span>' : '';
        addRow(
          '<span class="badge" style="color:' + meta.color + '">' + meta.icon + ' ' + meta.label + '</span>' +
          '<span class="action">' + step.action + '</span>' + lat +
          '<span class="text">' + (step.thought || '') + '</span>' +
          (step.output ? '<pre>' + (typeof step.output === 'string' ? step.output : JSON.stringify(step.output, null, 2)) + '</pre>' : '')
        );
      }

      function renderMessage(msg) {
        const fromMeta = roleMeta[msg.from] || roleMeta.planner;
        addRow(
          '<span class="badge" style="color:' + fromMeta.color + '">' + fromMeta.icon + ' ' + fromMeta.label + ' → ' + (msg.to || 'all') + '</span>' +
          '<pre>' + JSON.stringify(msg.payload, null, 2) + '</pre>'
        );
      }

      window.addEventListener('message', (event) => {
        const msg = event.data;
        if (msg.type === 'event') {
          if (msg.event === 'swarm_agent_step') renderStep(msg.payload);
          else if (msg.event === 'swarm_message') renderMessage(msg.payload);
          else if (msg.event === 'swarm_verdict') {
            statusEl.textContent = (msg.payload && msg.payload.thought) || 'Verdict';
          }
          else if (msg.event === 'done') {
            statusEl.textContent = 'Complete';
            runBtn.disabled = false;
          }
        } else if (msg.type === 'error') {
          statusEl.textContent = 'Error';
          addRow('<span class="err">' + msg.error + '</span>');
          runBtn.disabled = false;
        }
      });

      runBtn.addEventListener('click', () => {
        const goal = goalInput.value.trim();
        if (!goal) return;
        logEl.innerHTML = '';
        statusEl.textContent = 'Running…';
        runBtn.disabled = true;
        vscode.postMessage({ command: 'runSwarm', goal, maxTurns: parseInt(turnsInput.value || '12', 10) });
      });
    `;

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); padding: 12px; }
  h3 { margin: 0 0 12px; font-size: 14px; font-weight: 600; }
  .field { margin-bottom: 8px; }
  label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: var(--vscode-descriptionForeground); margin-bottom: 4px; }
  input, button { width: 100%; box-sizing: border-box; font-family: var(--vscode-font-family); }
  input { background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); padding: 6px 8px; border-radius: 4px; }
  button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 8px; border-radius: 4px; cursor: pointer; margin-top: 4px; }
  button:disabled { opacity: .5; cursor: default; }
  .status { font-size: 12px; margin: 10px 0; color: var(--vscode-descriptionForeground); }
  #log { margin-top: 6px; }
  .row { border: 1px solid var(--vscode-panel-border); border-radius: 6px; padding: 8px; margin-bottom: 6px; font-size: 12px; }
  .badge { font-weight: 600; margin-right: 6px; }
  .action { color: var(--vscode-textLink-foreground); }
  .lat { color: var(--vscode-descriptionForeground); font-size: 11px; margin-left: 6px; }
  .text { display: block; color: var(--vscode-foreground); margin-top: 6px; }
  pre { white-space: pre-wrap; word-break: break-word; font-size: 11px; background: var(--vscode-textCodeBlock-background); padding: 6px; border-radius: 4px; margin: 6px 0 0; }
  .err { color: var(--vscode-errorForeground); }
</style>
</head>
<body>
<h3>Autonomous Agent Workbench</h3>
<div class="field"><label>Mission Goal</label><input id="goal" type="text" placeholder="Describe the mission for the swarm…"></div>
<div class="field"><label>Max Turns</label><input id="maxTurns" type="number" value="12" min="1" max="24"></div>
<button id="runBtn">Run Swarm</button>
<div class="status" id="status">Idle</div>
<div id="log"></div>
<script>${script}</script>
</body>
</html>`;
  }
}