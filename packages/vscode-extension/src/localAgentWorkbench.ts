import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import * as vscode from 'vscode';
import type { AgentMode } from '@moonwitness/types';
import { MoonWitnessClient } from './client';
import { getAgentToolDecision, isAgentMode } from './agentPolicy';
import {
  buildAgentSystemPrompt,
  isSensitiveWorkspacePath,
  parseAgentProposal,
  redactSensitiveContent,
  resolveWorkspaceTarget,
} from './localAgentCore';

interface LocalAgentSession {
  id: string;
  mode: AgentMode;
  state: 'running' | 'completed' | 'cancelled' | 'failed' | 'blocked';
  startedAt: string;
  updatedAt: string;
}

interface PreparedEdit {
  document: vscode.TextDocument;
  original: string;
  updated: string;
}

const SESSION_HISTORY_KEY = 'allah.localAgent.sessions';
const MAX_CONTEXT_CHARS = 20_000;
const MAX_EDIT_FILE_CHARS = 250_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isWithin(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return relative !== '..'
    && !relative.startsWith(`..${path.sep}`)
    && !path.isAbsolute(relative);
}

export class LocalAgentWorkbenchProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'allah.localAgentWorkbench';

  private view?: vscode.WebviewView;
  private activeRun: AbortController | undefined;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly client: MoonWitnessClient
  ) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this.getHtml(webviewView.webview);
    webviewView.onDidDispose(() => this.activeRun?.abort());

    webviewView.webview.onDidReceiveMessage(async (message: unknown) => {
      if (!isRecord(message) || typeof message.command !== 'string') return;
      if (message.command === 'stop') {
        this.activeRun?.abort();
        return;
      }
      if (
        message.command === 'run'
        && isAgentMode(message.mode)
        && typeof message.prompt === 'string'
      ) {
        await this.run(message.mode, message.prompt);
      }
    });
  }

  async executeRemoteMission(
    mission: { id: string; mode: AgentMode; goal: string },
    signal: AbortSignal
  ): Promise<LocalAgentSession['state'] | undefined> {
    if (this.activeRun) return 'blocked';
    return this.run(mission.mode, mission.goal, signal);
  }

  private async chooseWorkspace(): Promise<vscode.WorkspaceFolder | undefined> {
    const folders = vscode.workspace.workspaceFolders || [];
    if (folders.length === 0) {
      vscode.window.showErrorMessage('Open a workspace folder before running a local agent session.');
      return undefined;
    }
    if (folders.length === 1) return folders[0];
    const selection = await vscode.window.showQuickPick(
      folders.map((folder) => ({ label: folder.name, description: folder.uri.fsPath, folder })),
      { placeHolder: 'Choose the workspace for this agent session' }
    );
    return selection?.folder;
  }

  private async getWorkspaceContext(folder: vscode.WorkspaceFolder): Promise<string> {
    const editor = vscode.window.activeTextEditor;
    if (!editor || vscode.workspace.getWorkspaceFolder(editor.document.uri)?.uri.toString() !== folder.uri.toString()) {
      const choice = await vscode.window.showWarningMessage(
        'No active file from this workspace will be sent to the model gateway.',
        { modal: true, detail: 'You can continue without workspace context or cancel this session.' },
        'Continue without context'
      );
      if (choice !== 'Continue without context') throw new Error('Agent session cancelled before sending context.');
      return '';
    }

    const relativePath = path.relative(folder.uri.fsPath, editor.document.uri.fsPath);
    if (isSensitiveWorkspacePath(relativePath)) {
      const choice = await vscode.window.showWarningMessage(
        'The active file is excluded because its path may contain credentials or private data.',
        { modal: true, detail: 'Continue without sending this file to the model gateway?' },
        'Continue without context'
      );
      if (choice !== 'Continue without context') throw new Error('Agent session cancelled because the active file is sensitive.');
      return '';
    }

    const rawContent = editor.document.getText();
    const content = redactSensitiveContent(rawContent).slice(0, MAX_CONTEXT_CHARS);
    const truncated = rawContent.length > MAX_CONTEXT_CHARS;
    const choice = await vscode.window.showWarningMessage(
      `Send the active file "${relativePath}" to the configured model gateway?`,
      {
        modal: true,
        detail: `Only this file is included. Credential-like values are redacted${truncated ? `; content is limited to ${MAX_CONTEXT_CHARS} characters` : ''}.`,
      },
      'Send active file',
      'Continue without context'
    );
    if (choice === 'Continue without context') return '';
    if (choice !== 'Send active file') throw new Error('Agent session cancelled before sending context.');
    return `\n\nWorkspace file: ${relativePath}\n\`\`\`\n${content}\n\`\`\``;
  }

  private async run(
    mode: AgentMode,
    prompt: string,
    externalSignal?: AbortSignal
  ): Promise<LocalAgentSession['state'] | undefined> {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || this.activeRun || externalSignal?.aborted) return 'cancelled';

    const folder = await this.chooseWorkspace();
    if (!folder) return 'blocked';

    const controller = new AbortController();
    const abort = () => controller.abort();
    externalSignal?.addEventListener('abort', abort, { once: true });
    if (externalSignal?.aborted) controller.abort();
    const session: LocalAgentSession = {
      id: randomUUID(),
      mode,
      state: 'running',
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.activeRun = controller;
    this.post({ type: 'started', sessionId: session.id, mode });

    try {
      await this.persistSession(session);
      const workspaceContext = await this.getWorkspaceContext(folder);
      const response = await this.client.completeAgent(
        buildAgentSystemPrompt(mode),
        `${trimmedPrompt}${workspaceContext}`,
        controller.signal
      );
      if (controller.signal.aborted) {
        session.state = 'cancelled';
        this.post({ type: 'cancelled' });
        return session.state;
      }

      if (mode === 'ask' || mode === 'plan' || mode === 'ideate') {
        session.state = 'completed';
        this.post({ type: 'result', response });
        return session.state;
      }

      const proposal = parseAgentProposal(response);
      if (proposal.edits.length === 0) {
        session.state = 'completed';
        this.post({ type: 'result', response: proposal.response });
        return session.state;
      }

      const edits = await this.prepareEdits(folder, proposal.edits);
      if (edits.length === 0) {
        session.state = 'blocked';
        this.post({ type: 'blocked', message: 'No valid workspace edits were produced.' });
        return session.state;
      }

      await this.previewEdits(edits);
      if (getAgentToolDecision(mode, 'workspace.edit') === 'ask') {
        const approval = await vscode.window.showWarningMessage(
          `Apply ${edits.length} proposed workspace file change${edits.length === 1 ? '' : 's'}?`,
          { modal: true, detail: 'Review the opened diff before approving. Changes will remain unsaved in VS Code.' },
          'Apply changes'
        );
        if (approval !== 'Apply changes') {
          session.state = 'blocked';
          this.post({ type: 'blocked', message: 'The proposed edits were not applied.' });
          return session.state;
        }
      }

      if (controller.signal.aborted) {
        session.state = 'cancelled';
        this.post({ type: 'cancelled' });
        return session.state;
      }
      await this.applyEdits(edits);
      session.state = 'completed';
      this.post({
        type: 'result',
        response: proposal.response,
        appliedEdits: edits.length,
        message: 'Workspace edits were applied and remain unsaved.',
      });
      return session.state;
    } catch (error) {
      if (controller.signal.aborted) {
        session.state = 'cancelled';
        this.post({ type: 'cancelled' });
      } else {
        session.state = error instanceof Error && error.message.startsWith('Agent session cancelled')
          ? 'cancelled'
          : 'failed';
        this.post({ type: session.state, message: error instanceof Error ? error.message : String(error) });
      }
      return session.state;
    } finally {
      session.updatedAt = new Date().toISOString();
      externalSignal?.removeEventListener('abort', abort);
      try {
        await this.persistSession(session);
      } catch (error) {
        this.post({
          type: 'history-error',
          message: `Could not persist local session history: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
      if (this.activeRun === controller) this.activeRun = undefined;
    }
  }

  private async prepareEdits(
    folder: vscode.WorkspaceFolder,
    proposals: ReturnType<typeof parseAgentProposal>['edits']
  ): Promise<PreparedEdit[]> {
    const workspacePath = await fs.realpath(folder.uri.fsPath);
    const prepared: PreparedEdit[] = [];
    const editedPaths = new Set<string>();

    for (const proposal of proposals) {
      if (isSensitiveWorkspacePath(proposal.path)) {
        throw new Error(`The proposed edit targets a restricted path: ${proposal.path}`);
      }
      if (/[*?{}\[\]]/.test(proposal.path)) {
        throw new Error('Agent edit paths cannot contain glob expressions.');
      }
      const targetPath = resolveWorkspaceTarget(workspacePath, proposal.path);
      const workspaceMatches = await vscode.workspace.findFiles(
        new vscode.RelativePattern(folder, proposal.path.replace(/\\/g, '/')),
        undefined,
        2
      );
      const matchesTarget = workspaceMatches.some((uri) => process.platform === 'win32'
        ? uri.fsPath.toLowerCase() === targetPath.toLowerCase()
        : path.resolve(uri.fsPath) === path.resolve(targetPath));
      if (!matchesTarget) {
        throw new Error(`The target is missing, ignored, or excluded from workspace search: ${proposal.path}`);
      }
      const canonicalPath = await fs.realpath(targetPath);
      if (!isWithin(workspacePath, canonicalPath)) {
        throw new Error(`The proposed edit resolves outside the selected workspace: ${proposal.path}`);
      }
      const canonicalKey = process.platform === 'win32' ? canonicalPath.toLowerCase() : canonicalPath;
      if (editedPaths.has(canonicalKey)) {
        throw new Error(`The agent proposed multiple edits to the same file: ${proposal.path}`);
      }
      editedPaths.add(canonicalKey);
      const uri = vscode.Uri.file(canonicalPath);
      const document = await vscode.workspace.openTextDocument(uri);
      const original = document.getText();
      if (original.length > MAX_EDIT_FILE_CHARS) {
        throw new Error(`The target file exceeds the ${MAX_EDIT_FILE_CHARS}-character edit limit.`);
      }
      const firstMatch = original.indexOf(proposal.oldText);
      if (firstMatch < 0 || original.indexOf(proposal.oldText, firstMatch + proposal.oldText.length) >= 0) {
        throw new Error(`The exact text for "${proposal.path}" must match exactly once.`);
      }
      const updated = original.replace(proposal.oldText, proposal.newText);
      if (updated.length > MAX_EDIT_FILE_CHARS) {
        throw new Error(`The proposed result for "${proposal.path}" exceeds the edit limit.`);
      }
      prepared.push({ document, original, updated });
    }
    return prepared;
  }

  private async previewEdits(edits: PreparedEdit[]): Promise<void> {
    for (const edit of edits) {
      const preview = await vscode.workspace.openTextDocument({
        language: edit.document.languageId,
        content: edit.updated,
      });
      await vscode.commands.executeCommand(
        'vscode.diff',
        edit.document.uri,
        preview.uri,
        `Proposed: ${path.basename(edit.document.uri.fsPath)}`
      );
    }
  }

  private async applyEdits(edits: PreparedEdit[]): Promise<void> {
    const workspaceEdit = new vscode.WorkspaceEdit();
    for (const edit of edits) {
      if (edit.document.getText() !== edit.original) {
        throw new Error(`The file changed while its diff was being reviewed: ${edit.document.uri.fsPath}`);
      }
      const end = edit.document.positionAt(edit.original.length);
      workspaceEdit.replace(
        edit.document.uri,
        new vscode.Range(new vscode.Position(0, 0), end),
        edit.updated
      );
    }
    if (!(await vscode.workspace.applyEdit(workspaceEdit))) {
      throw new Error('VS Code could not apply the proposed workspace edits.');
    }
  }

  private async persistSession(session: LocalAgentSession): Promise<void> {
    const previous = this.context.globalState.get<LocalAgentSession[]>(SESSION_HISTORY_KEY, []);
    const next = [session, ...previous.filter((entry) => entry.id !== session.id)].slice(0, 50);
    await this.context.globalState.update(SESSION_HISTORY_KEY, next);
  }

  private post(data: Record<string, unknown>): void {
    if (this.view) void this.view.webview.postMessage(data);
  }

  private getHtml(webview: vscode.Webview): string {
    const nonce = Buffer.from(randomUUID()).toString('base64');
    const script = `
      const vscode = acquireVsCodeApi();
      const mode = document.getElementById('mode');
      const prompt = document.getElementById('prompt');
      const run = document.getElementById('run');
      const stop = document.getElementById('stop');
      const status = document.getElementById('status');
      const output = document.getElementById('output');

      window.addEventListener('message', (message) => {
        const data = message.data;
        if (data.type === 'started') {
          status.textContent = 'Requesting workspace-context consent';
          run.disabled = true;
          stop.disabled = false;
          output.replaceChildren();
        } else if (data.type === 'result') {
          status.textContent = data.appliedEdits ? 'Completed — edits are unsaved' : 'Completed';
          const result = document.createElement('pre');
          result.textContent = data.response || data.message || '';
          output.appendChild(result);
          run.disabled = false;
          stop.disabled = true;
        } else if (data.type === 'blocked' || data.type === 'failed' || data.type === 'cancelled') {
          status.textContent = data.type === 'blocked' ? 'Blocked' : data.type;
          const messageNode = document.createElement('p');
          messageNode.textContent = data.message || 'Session cancelled.';
          output.appendChild(messageNode);
          run.disabled = false;
          stop.disabled = true;
        } else if (data.type === 'history-error') {
          const messageNode = document.createElement('p');
          messageNode.textContent = data.message;
          output.appendChild(messageNode);
        }
      });

      run.addEventListener('click', () => {
        if (!prompt.value.trim()) return;
        vscode.postMessage({ command: 'run', mode: mode.value, prompt: prompt.value });
      });
      stop.addEventListener('click', () => vscode.postMessage({ command: 'stop' }));
    `;

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
<style>
  body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); padding: 12px; }
  label { display: block; margin: 10px 0 4px; color: var(--vscode-descriptionForeground); font-size: 11px; text-transform: uppercase; }
  select, textarea, button { width: 100%; box-sizing: border-box; font: inherit; }
  select, textarea { color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border); padding: 7px; }
  textarea { min-height: 100px; resize: vertical; }
  button { margin-top: 6px; padding: 8px; border: 0; color: var(--vscode-button-foreground); background: var(--vscode-button-background); cursor: pointer; }
  button:disabled { opacity: .5; cursor: default; }
  #status { margin: 10px 0; color: var(--vscode-descriptionForeground); }
  pre { white-space: pre-wrap; overflow-wrap: anywhere; padding: 8px; background: var(--vscode-textCodeBlock-background); }
</style>
</head>
<body>
<h3>Workspace Agent</h3>
<label for="mode">Mode</label>
<select id="mode">
  <option value="ask">Ask — read-only</option>
  <option value="plan">Plan — read-only</option>
  <option value="ideate">Ideate / brainstorm — read-only</option>
  <option value="code">Code — review edits before apply</option>
  <option value="debug">Debug — review edits before apply</option>
  <option value="autopilot">Autopilot — scoped workspace edits</option>
</select>
<label for="prompt">Task</label>
<textarea id="prompt" placeholder="Describe the question or workspace task"></textarea>
<button id="run">Start session</button>
<button id="stop" disabled>Cancel</button>
<div id="status" role="status" aria-live="polite">Ready</div>
<div id="output" aria-live="polite"></div>
<script nonce="${nonce}">${script}</script>
</body>
</html>`;
  }
}
