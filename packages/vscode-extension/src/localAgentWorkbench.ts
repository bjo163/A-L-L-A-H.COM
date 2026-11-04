import { randomUUID } from 'crypto';
import { spawn } from 'child_process';
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
  getValidationCommand,
  validationCommands,
} from './localAgentCore';
import {
  appendMissionTimelineEvent,
  createMissionTimelineEvent,
  normalizeInterruptedMissions,
  type MissionTimelineEvent,
} from './missionTimeline';

interface LocalAgentSession {
  id: string;
  mode: AgentMode;
  state: 'running' | 'completed' | 'cancelled' | 'failed' | 'blocked';
  startedAt: string;
  updatedAt: string;
  timeline?: MissionTimelineEvent[];
}

interface PreparedEdit {
  document: vscode.TextDocument;
  original: string;
  updated: string;
}

const SESSION_HISTORY_KEY = 'allah.localAgent.sessions';
const MAX_CONTEXT_CHARS = 20_000;
const MAX_CONTEXT_FILE_CHARS = 250_000;
const MAX_CONTEXT_FILES = 200;
const MAX_EDIT_FILE_CHARS = 250_000;
const MAX_COMMAND_OUTPUT_CHARS = 20_000;
const COMMAND_TIMEOUT_MS = 5 * 60_000;

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
      if (message.command === 'ready') {
        this.post({ type: 'history', sessions: this.getSessionHistory() });
        return;
      }
      if (message.command === 'stop') {
        this.activeRun?.abort();
        return;
      }
      if (message.command === 'runValidation' && isAgentMode(message.mode)) {
        await this.runValidation(message.mode, message.validationCommand);
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
    const activeEditorIsInWorkspace = editor
      && vscode.workspace.getWorkspaceFolder(editor.document.uri)?.uri.toString() === folder.uri.toString();
    const activeRelativePath = activeEditorIsInWorkspace
      ? path.relative(folder.uri.fsPath, editor.document.uri.fsPath)
      : '';
    const activeFileIsAvailable = Boolean(activeEditorIsInWorkspace && !isSensitiveWorkspacePath(activeRelativePath));
    const contextChoice = await vscode.window.showQuickPick(
      [
        ...(activeFileIsAvailable ? [{ label: 'Active editor file', description: activeRelativePath, value: 'active' }] : []),
        { label: 'Choose workspace files', description: 'Filter and select up to five files', value: 'files' },
        { label: 'No workspace context', description: 'Send only the task text', value: 'none' },
      ],
      { placeHolder: 'Choose which workspace context this session may send' }
    );
    if (!contextChoice) throw new Error('Agent session cancelled before selecting workspace context.');
    if (contextChoice.value === 'none') return '';

    const selectedFiles: Array<{ relativePath: string; document: vscode.TextDocument }> = [];
    if (contextChoice.value === 'active' && editor && activeFileIsAvailable) {
      selectedFiles.push({ relativePath: activeRelativePath, document: editor.document });
    } else {
      const candidates = await vscode.workspace.findFiles(
        new vscode.RelativePattern(folder, '**/*'),
        '**/{.git,node_modules}/**',
        MAX_CONTEXT_FILES
      );
      const items = candidates
        .map((uri) => ({ uri, relativePath: path.relative(folder.uri.fsPath, uri.fsPath) }))
        .filter((item) => !isSensitiveWorkspacePath(item.relativePath))
        .map((item) => ({ label: item.relativePath, uri: item.uri, relativePath: item.relativePath }));
      if (items.length === 0) {
        throw new Error('No readable, non-sensitive files were found in the selected workspace.');
      }
      const selection = await vscode.window.showQuickPick(items, {
        canPickMany: true,
        placeHolder: 'Select up to five workspace files. Search by typing part of a file path.',
      });
      if (!selection || selection.length === 0) {
        throw new Error('Agent session cancelled before selecting workspace files.');
      }
      if (selection.length > 5) throw new Error('Select no more than five workspace files for one session.');

      const workspacePath = await fs.realpath(folder.uri.fsPath);
      for (const item of selection) {
        if (isSensitiveWorkspacePath(item.relativePath)) {
          throw new Error(`The selected file is restricted: ${item.relativePath}`);
        }
        const targetPath = resolveWorkspaceTarget(workspacePath, item.relativePath);
        const canonicalPath = await fs.realpath(targetPath);
        if (!isWithin(workspacePath, canonicalPath)) {
          throw new Error(`The selected file resolves outside the workspace: ${item.relativePath}`);
        }
        const stats = await fs.stat(canonicalPath);
        if (!stats.isFile() || stats.size > MAX_CONTEXT_FILE_CHARS) {
          throw new Error(`The selected file is not a regular file or exceeds the ${MAX_CONTEXT_FILE_CHARS}-byte context limit: ${item.relativePath}`);
        }
        const document = await vscode.workspace.openTextDocument(vscode.Uri.file(canonicalPath));
        selectedFiles.push({ relativePath: item.relativePath, document });
      }
    }

    const workspacePath = await fs.realpath(folder.uri.fsPath);
    let remainingChars = MAX_CONTEXT_CHARS;
    let truncated = false;
    const sections = [];
    for (const { relativePath, document } of selectedFiles) {
      const canonicalPath = await fs.realpath(document.uri.fsPath);
      const canonicalRelativePath = path.relative(workspacePath, canonicalPath);
      if (!isWithin(workspacePath, canonicalPath) || isSensitiveWorkspacePath(canonicalRelativePath)) {
        throw new Error(`The selected file resolves to a restricted path: ${relativePath}`);
      }
      const rawContent = document.getText();
      const safeContent = redactSensitiveContent(rawContent);
      const content = safeContent.slice(0, Math.max(remainingChars, 0));
      remainingChars -= content.length;
      truncated ||= content.length < safeContent.length;
      sections.push(`Workspace file: ${relativePath}\n\`\`\`\n${content}\n\`\`\``);
    }
    const choice = await vscode.window.showWarningMessage(
      `Send ${selectedFiles.length} selected workspace file${selectedFiles.length === 1 ? '' : 's'} to the configured model gateway?`,
      {
        modal: true,
        detail: `Files: ${selectedFiles.map((file) => file.relativePath).join(', ')}. Credential-like values are redacted${truncated ? `; combined content is limited to ${MAX_CONTEXT_CHARS} characters` : ''}.`,
      },
      'Send selected files',
      'Continue without context'
    );
    if (choice === 'Continue without context') return '';
    if (choice !== 'Send selected files') throw new Error('Agent session cancelled before sending context.');
    return `\n\n${sections.join('\n\n')}`;
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
      timeline: [],
    };
    this.activeRun = controller;
    this.post({ type: 'started', sessionId: session.id, mode });
    this.postMissionEvent(session, 'mission.started', 'Mission started', 'Workspace mission accepted.');

    try {
      await this.persistSession(session);
      const workspaceContext = await this.getWorkspaceContext(folder);
      this.postMissionEvent(session, 'context.selected', 'Workspace context selected');
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
        this.postMissionEvent(session, 'mission.completed', 'Mission completed');
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
      this.postMissionEvent(session, 'edits.previewed', 'Edits prepared', `${edits.length} workspace file change(s) ready for review.`);
      if (getAgentToolDecision(mode, 'workspace.edit') === 'ask') {
        const approval = await vscode.window.showWarningMessage(
          `Apply ${edits.length} proposed workspace file change${edits.length === 1 ? '' : 's'}?`,
          { modal: true, detail: 'Review the opened diff before approving. Changes will remain unsaved in VS Code.' },
          'Apply changes'
        );
        if (approval !== 'Apply changes') {
          session.state = 'blocked';
          this.postMissionEvent(session, 'approval.rejected', 'Edit approval rejected');
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
      this.postMissionEvent(session, 'edits.applied', 'Workspace edits applied', `${edits.length} file change(s) remain unsaved.`);
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

  private async runValidation(mode: AgentMode, commandId: unknown): Promise<void> {
    const selectedCommand = getValidationCommand(commandId);
    if (!selectedCommand) {
      this.post({ type: 'validation-blocked', message: 'That validation command is not available.' });
      return;
    }
    if (getAgentToolDecision(mode, 'terminal.powershell') === 'deny') {
      this.post({ type: 'validation-blocked', message: `PowerShell validation is denied in ${mode} mode.` });
      return;
    }
    if (process.platform !== 'win32') {
      this.post({ type: 'validation-blocked', message: 'PowerShell validation is only available on Windows.' });
      return;
    }
    if (this.activeRun) {
      this.post({ type: 'validation-blocked', message: 'Another local agent action is already running.' });
      return;
    }

    const controller = new AbortController();
    this.activeRun = controller;
    try {
      const folder = await this.chooseWorkspace();
      if (!folder) {
        this.post({ type: 'validation-blocked', message: 'Open or select a workspace before running a validation command.' });
        return;
      }

      this.post({
        type: 'validation-approval',
        message: `Requesting approval to run ${selectedCommand.command} in ${folder.name}.`,
      });
      if (getAgentToolDecision(mode, 'terminal.powershell') === 'ask') {
        const approval = await vscode.window.showWarningMessage(
          `Run ${selectedCommand.command} in the selected workspace?`,
          {
            modal: true,
            detail: `The command runs in "${folder.uri.fsPath}" for at most ${COMMAND_TIMEOUT_MS / 60_000} minutes. It can change files through the project scripts.`,
          },
          'Run command'
        );
        if (approval !== 'Run command' || controller.signal.aborted) {
          this.post({ type: 'validation-blocked', message: 'The validation command was not approved.' });
          return;
        }
      }

      this.post({ type: 'validation-started', command: selectedCommand.command });
      const result = await this.executePowerShell(selectedCommand.command, folder.uri.fsPath, controller.signal);
      if (result.cancelled) {
        this.post({ type: 'cancelled', message: 'Validation command cancelled.' });
      } else if (result.timedOut) {
        this.post({ type: 'validation-failed', message: 'Validation command exceeded its time limit and was stopped.', output: result.output });
      } else if (result.outputLimitExceeded) {
        this.post({ type: 'validation-failed', message: 'Validation command exceeded the output limit and was stopped.', output: result.output });
      } else {
        this.post({
          type: 'validation-result',
          exitCode: result.exitCode,
          output: result.output,
          message: result.exitCode === 0
            ? 'Command exited successfully. This does not independently verify the agent mission.'
            : `Command exited with code ${result.exitCode ?? 'unknown'}.`,
        });
      }
    } catch (error) {
      this.post({
        type: 'validation-failed',
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      if (this.activeRun === controller) this.activeRun = undefined;
    }
  }

  private executePowerShell(
    command: string,
    cwd: string,
    signal: AbortSignal
  ): Promise<{
    exitCode: number | null;
    output: string;
    timedOut: boolean;
    outputLimitExceeded: boolean;
    cancelled: boolean;
  }> {
    return new Promise((resolve, reject) => {
      const child = spawn(
        'powershell.exe',
        ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', command],
        { cwd, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] }
      );
      let output = '';
      let timedOut = false;
      let outputLimitExceeded = false;
      let cancelled = signal.aborted;
      let settled = false;

      const stopProcessTree = () => {
        if (child.pid === undefined) {
          child.kill();
          return;
        }
        const killer = spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], {
          windowsHide: true,
          stdio: 'ignore',
        });
        killer.on('error', () => child.kill());
      };

      const appendOutput = (value: Buffer | string) => {
        const text = value.toString();
        const remaining = MAX_COMMAND_OUTPUT_CHARS - output.length;
        output += text.slice(0, Math.max(remaining, 0));
        if (text.length > remaining && !outputLimitExceeded) {
          outputLimitExceeded = true;
          stopProcessTree();
        }
      };
      const onAbort = () => {
        cancelled = true;
        stopProcessTree();
      };
      const timeout = setTimeout(() => {
        timedOut = true;
        stopProcessTree();
      }, COMMAND_TIMEOUT_MS);
      const finish = (exitCode: number | null) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        signal.removeEventListener('abort', onAbort);
        resolve({
          exitCode,
          output: redactSensitiveContent(output),
          timedOut,
          outputLimitExceeded,
          cancelled,
        });
      };

      child.stdout?.on('data', appendOutput);
      child.stderr?.on('data', appendOutput);
      child.once('error', (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        signal.removeEventListener('abort', onAbort);
        reject(error);
      });
      child.once('close', (exitCode) => finish(exitCode));
      signal.addEventListener('abort', onAbort, { once: true });
      if (signal.aborted) onAbort();
    });
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
    const previous = this.getSessionHistory();
    const next = [session, ...previous.filter((entry) => entry.id !== session.id)].slice(0, 50);
    await this.context.globalState.update(SESSION_HISTORY_KEY, next);
    this.post({ type: 'history', sessions: next });
  }

  private getSessionHistory(): LocalAgentSession[] {
    const value = this.context.globalState.get<unknown>(SESSION_HISTORY_KEY, []);
    if (!Array.isArray(value)) return [];
    const sessions = value.filter((entry): entry is LocalAgentSession => (
      isRecord(entry)
      && typeof entry.id === 'string'
      && typeof entry.mode === 'string'
      && isAgentMode(entry.mode)
      && (entry.state === 'running'
        || entry.state === 'completed'
        || entry.state === 'cancelled'
        || entry.state === 'failed'
        || entry.state === 'blocked')
      && typeof entry.startedAt === 'string'
      && typeof entry.updatedAt === 'string'
    )).slice(0, 50);
    return normalizeInterruptedMissions(sessions);
  }

  private postMissionEvent(
    session: LocalAgentSession,
    type: string,
    title: string,
    detail?: string
  ): void {
    const event = createMissionTimelineEvent(session.timeline || [], type, title, detail);
    session.timeline = appendMissionTimelineEvent(session.timeline || [], event);
    session.updatedAt = event.createdAt;
    this.post({ type: 'mission-event', event });
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
      const validationCommand = document.getElementById('validation-command');
      const runValidation = document.getElementById('run-validation');
      const status = document.getElementById('status');
      const output = document.getElementById('output');
      const history = document.getElementById('history');
      const timeline = document.getElementById('mission-timeline');

      const renderTimelineEvent = (event) => {
        const item = document.createElement('li');
        const title = document.createElement('strong');
        title.textContent = event.title || event.type;
        item.appendChild(title);
        if (event.detail) {
          const detail = document.createElement('span');
          detail.textContent = event.detail;
          item.appendChild(detail);
        }
        timeline.appendChild(item);
      };

      const renderHistory = (sessions) => {
        history.replaceChildren();
        if (!Array.isArray(sessions) || sessions.length === 0) {
          const empty = document.createElement('p');
          empty.textContent = 'No local sessions yet.';
          history.appendChild(empty);
          return;
        }
        for (const session of sessions) {
          const item = document.createElement('li');
          const updated = new Date(session.updatedAt);
          const time = Number.isNaN(updated.getTime()) ? 'time unavailable' : updated.toLocaleString();
          item.textContent = session.mode + ' · ' + session.state + ' · ' + time;
          history.appendChild(item);
        }
      };

      const updateValidationAvailability = () => {
        const readOnly = ['ask', 'plan', 'ideate'].includes(mode.value);
        runValidation.disabled = readOnly || run.disabled;
        validationCommand.disabled = readOnly || run.disabled;
      };

      window.addEventListener('message', (message) => {
        const data = message.data;
        if (data.type === 'history') {
          renderHistory(data.sessions);
        } else if (data.type === 'mission-event' && data.event) {
          if (timeline.querySelector('[data-empty]')) timeline.replaceChildren();
          renderTimelineEvent(data.event);
        } else if (data.type === 'started') {
          status.textContent = 'Requesting workspace-context consent';
          run.disabled = true;
          runValidation.disabled = true;
          validationCommand.disabled = true;
          stop.disabled = false;
          output.replaceChildren();
          timeline.replaceChildren();
        } else if (data.type === 'validation-approval') {
          status.textContent = data.message;
          run.disabled = true;
          runValidation.disabled = true;
          validationCommand.disabled = true;
          stop.disabled = false;
          output.replaceChildren();
        } else if (data.type === 'validation-started') {
          status.textContent = 'Running ' + data.command;
          run.disabled = true;
          runValidation.disabled = true;
          validationCommand.disabled = true;
          stop.disabled = false;
        } else if (data.type === 'result') {
          status.textContent = data.appliedEdits
            ? 'Edits applied, not independently validated'
            : 'Model response received, not independently verified';
          const result = document.createElement('pre');
          result.textContent = data.response || data.message || '';
          output.appendChild(result);
          run.disabled = false;
          stop.disabled = true;
          updateValidationAvailability();
        } else if (data.type === 'validation-result' || data.type === 'validation-failed') {
          status.textContent = data.message;
          if (data.output) {
            const result = document.createElement('pre');
            result.textContent = data.output;
            output.appendChild(result);
          }
          run.disabled = false;
          stop.disabled = true;
          updateValidationAvailability();
        } else if (data.type === 'blocked' || data.type === 'failed' || data.type === 'cancelled') {
          status.textContent = data.type === 'blocked' ? 'Blocked' : data.type;
          const messageNode = document.createElement('p');
          messageNode.textContent = data.message || 'Session cancelled.';
          output.appendChild(messageNode);
          run.disabled = false;
          runValidation.disabled = false;
          validationCommand.disabled = false;
          stop.disabled = true;
          updateValidationAvailability();
        } else if (data.type === 'validation-blocked') {
          status.textContent = data.message;
          run.disabled = false;
          stop.disabled = true;
          updateValidationAvailability();
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
      runValidation.addEventListener('click', () => {
        vscode.postMessage({
          command: 'runValidation',
          mode: mode.value,
          validationCommand: validationCommand.value,
        });
      });
      mode.addEventListener('change', updateValidationAvailability);
      stop.addEventListener('click', () => vscode.postMessage({ command: 'stop' }));
      window.addEventListener('load', () => vscode.postMessage({ command: 'ready' }));
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
  .mission-list { margin: 10px 0 0; padding: 0; list-style: none; }
  .mission-list li { position: relative; padding: 8px 0 8px 14px; border-left: 2px solid var(--vscode-focusBorder); }
  .mission-list li strong, .mission-list li span { display: block; overflow-wrap: anywhere; }
  .mission-list li span { margin-top: 2px; color: var(--vscode-descriptionForeground); }
  .mission-list li:focus-visible { outline: 2px solid var(--vscode-focusBorder); outline-offset: 2px; }
</style>
</head>
<body>
<h3>Workspace Agent</h3>
<label for="mode">Mode</label>
<select id="mode">
  <option value="ask">Ask, read-only</option>
  <option value="plan">Plan, read-only</option>
  <option value="ideate">Ideate / brainstorm, read-only</option>
  <option value="code">Code, review edits before apply</option>
  <option value="debug">Debug, review edits before apply</option>
  <option value="autopilot">Autopilot, scoped workspace edits</option>
</select>
<label for="prompt">Task</label>
<textarea id="prompt" placeholder="Describe the question or workspace task"></textarea>
<button id="run">Start session</button>
<label for="validation-command">Approved workspace validation</label>
<select id="validation-command">
  ${validationCommands.map((item) => `<option value="${item.id}">${item.label} (${item.command})</option>`).join('')}
</select>
<button id="run-validation">Run validation with approval</button>
<button id="stop" disabled>Cancel</button>
<div id="status" role="status" aria-live="polite">Ready</div>
<div id="output" aria-live="polite"></div>
<section aria-labelledby="mission-heading">
  <h4 id="mission-heading">Mission timeline</h4>
  <ol id="mission-timeline" class="mission-list" aria-live="polite"><li data-empty>Start a mission to see progress.</li></ol>
</section>
<section aria-labelledby="history-heading">
  <h4 id="history-heading">Local session history</h4>
  <ol id="history" aria-live="polite"><li>Loading session history…</li></ol>
</section>
<script nonce="${nonce}">${script}</script>
</body>
</html>`;
  }
}
