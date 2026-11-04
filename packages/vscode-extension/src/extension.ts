import * as path from 'path';
import * as vscode from 'vscode';
import { MoonWitnessClient } from './client';
import { ArsyStatusTreeDataProvider, ModelTreeDataProvider } from './treeProvider';
import { PlanTreeDataProvider } from './planTreeProvider';
import { PlanManager, type PlanItem, type TaskItem, type TaskStatus } from './planManager';
import { AgentWorkbenchProvider } from './agentWorkbench';
import { LocalAgentWorkbenchProvider } from './localAgentWorkbench';
import { RemoteMissionService } from './remoteMissionService';


function isTaskItem(value: unknown): value is TaskItem {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  return (
    'id' in value &&
    typeof value.id === 'number' &&
    'filePath' in value &&
    typeof value.filePath === 'string' &&
    value.filePath.length > 0 &&
    'lineIndex' in value &&
    typeof value.lineIndex === 'number' &&
    Number.isInteger(value.lineIndex) &&
    value.lineIndex >= 0 &&
    'sourceLine' in value &&
    typeof value.sourceLine === 'string' &&
    'text' in value &&
    typeof value.text === 'string' &&
    'status' in value &&
    (value.status === 'pending' || value.status === 'in-progress' || value.status === 'completed')
  );
}

function isPlanItem(value: unknown): value is PlanItem {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  return (
    'id' in value &&
    typeof value.id === 'string' &&
    'dirPath' in value &&
    typeof value.dirPath === 'string' &&
    'folderName' in value &&
    typeof value.folderName === 'string' &&
    'title' in value &&
    typeof value.title === 'string' &&
    'tasks' in value &&
    Array.isArray(value.tasks) &&
    (!('specPath' in value) || typeof value.specPath === 'string' || value.specPath === undefined)
  );
}

function getTaskItem(value: unknown): TaskItem | undefined {
  if (isTaskItem(value)) {
    return value;
  }
  if (typeof value === 'object' && value !== null && 'task' in value && isTaskItem(value.task)) {
    return value.task;
  }
  return undefined;
}

function hasUnsavedTaskDocument(filePath: string): boolean {
  const expectedPath = path.resolve(filePath);
  return vscode.workspace.textDocuments.some((document) => {
    const documentPath = path.resolve(document.uri.fsPath);
    const matches =
      process.platform === 'win32'
        ? documentPath.toLowerCase() === expectedPath.toLowerCase()
        : documentPath === expectedPath;
    return matches && document.isDirty;
  });
}

async function chooseWorkspaceFolder(): Promise<vscode.WorkspaceFolder | undefined> {
  const folders = vscode.workspace.workspaceFolders || [];
  if (folders.length === 0) {
    vscode.window.showErrorMessage('Open a workspace folder before creating or generating a plan.');
    return undefined;
  }
  if (folders.length === 1) {
    return folders[0];
  }

  const selected = await vscode.window.showQuickPick(
    folders.map((folder) => ({
      label: folder.name,
      description: folder.uri.fsPath,
      folder,
    })),
    { placeHolder: 'Choose the workspace folder for this plan' }
  );
  return selected?.folder;
}

async function openMarkdownFile(filePath: string, lineIndex?: number): Promise<void> {
  const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
  const editor = await vscode.window.showTextDocument(document);
  if (lineIndex !== undefined && document.lineCount > 0) {
    const position = new vscode.Position(Math.min(lineIndex, document.lineCount - 1), 0);
    editor.selection = new vscode.Selection(position, position);
    editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenterIfOutsideViewport);
  }
}

function registerPlanWatchers(context: vscode.ExtensionContext, planProvider: PlanTreeDataProvider): void {
  let watcherDisposables: vscode.Disposable[] = [];
  let refreshTimer: ReturnType<typeof setTimeout> | undefined;

  const scheduleRefresh = () => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }
    refreshTimer = setTimeout(() => {
      refreshTimer = undefined;
      planProvider.refresh();
    }, 100);
  };

  const resetWatchers = () => {
    for (const watcher of watcherDisposables) {
      watcher.dispose();
    }
    watcherDisposables = [];

    for (const folder of vscode.workspace.workspaceFolders || []) {
      for (const pattern of ['.plans/**/spec.md', '.plans/**/task.md']) {
        const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(folder, pattern));
        watcherDisposables.push(
          vscode.Disposable.from(
            watcher,
            watcher.onDidCreate(scheduleRefresh),
            watcher.onDidChange(scheduleRefresh),
            watcher.onDidDelete(scheduleRefresh)
          )
        );
      }
    }
  };

  resetWatchers();
  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      resetWatchers();
      planProvider.refresh();
    }),
    new vscode.Disposable(() => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
      for (const watcher of watcherDisposables) {
        watcher.dispose();
      }
      watcherDisposables = [];
    })
  );
}

async function updateStatusBar(
  statusBarItem: vscode.StatusBarItem,
  client: MoonWitnessClient
): Promise<Awaited<ReturnType<MoonWitnessClient['checkHealth']>>> {
  statusBarItem.text = '$(sync~spin) MoonWitness';
  statusBarItem.tooltip = 'Checking the gateway health endpoint.';
  statusBarItem.show();

  const health = await client.checkHealth();
  if (health.ok) {
    statusBarItem.text = `$(pass-filled) MoonWitness (${health.latencyMs}ms)`;
    statusBarItem.tooltip = `Connected to the gateway.\nLatency: ${health.latencyMs}ms`;
  } else {
    statusBarItem.text = '$(circle-slash) MoonWitness (offline)';
    statusBarItem.tooltip = `Gateway health check failed: ${health.message || 'Unknown error'}. Click to retry.`;
  }
  return health;
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const activationLog = vscode.window.createOutputChannel('A-L-L-A-H.COM Extension');
  context.subscriptions.push(activationLog);
  activationLog.appendLine(`[${new Date().toISOString()}] Activation started.`);
  try {
  const client = new MoonWitnessClient(context);
  try {
    await client.migrateLegacyApiKey();
  } catch (error) {
    vscode.window.showErrorMessage(
      `Could not move the legacy MoonWitness API key to SecretStorage: ${error instanceof Error ? error.message : String(error)}`
    );
  }
  const planProvider = new PlanTreeDataProvider();
  const modelProvider = new ModelTreeDataProvider(client);
  const arsyStatusProvider = new ArsyStatusTreeDataProvider(client);
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  const workbenchProvider = new AgentWorkbenchProvider(client);
  const localAgentProvider = new LocalAgentWorkbenchProvider(context, client);
  const remoteMissionService = new RemoteMissionService(client, localAgentProvider);

  statusBarItem.command = 'allah.testConnection';
  context.subscriptions.push(
    statusBarItem,
    planProvider,
    modelProvider,
    arsyStatusProvider,
    remoteMissionService,
    vscode.window.registerWebviewViewProvider(AgentWorkbenchProvider.viewType, workbenchProvider),
    vscode.window.registerWebviewViewProvider(LocalAgentWorkbenchProvider.viewType, localAgentProvider),
    vscode.window.registerTreeDataProvider('allah.views.plans', planProvider),
    vscode.window.registerTreeDataProvider('allah.views.models', modelProvider),
    vscode.window.registerTreeDataProvider('allah.views.arsy', arsyStatusProvider)
  );
  registerPlanWatchers(context, planProvider);
  remoteMissionService.start();
  void updateStatusBar(statusBarItem, client);

  context.subscriptions.push(
    vscode.commands.registerCommand('allah.createPlan', async () => {
      const title = await vscode.window.showInputBox({
        prompt: 'Enter a feature or task title for the new plan.',
        placeHolder: 'A specific feature or problem',
        validateInput: (value) => (value.trim() ? undefined : 'Title cannot be empty.'),
      });
      if (!title) {
        return;
      }

      const folder = await chooseWorkspaceFolder();
      if (!folder) {
        return;
      }

      try {
        const targetDir = PlanManager.createPlan(folder.uri.fsPath, title);
        planProvider.refresh();
        vscode.window.showInformationMessage(`Created plan in ${targetDir}.`);
        await openMarkdownFile(path.join(targetDir, 'spec.md'));
      } catch (error) {
        vscode.window.showErrorMessage(`Could not create the plan: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),
    vscode.commands.registerCommand('allah.generatePlanWithAI', async () => {
      const title = await vscode.window.showInputBox({
        prompt: 'Describe the feature or problem for the plan.',
        placeHolder: 'A specific feature or problem',
        validateInput: (value) => (value.trim() ? undefined : 'Description cannot be empty.'),
      });
      if (!title) {
        return;
      }

      const folder = await chooseWorkspaceFolder();
      if (!folder) {
        return;
      }

      try {
        const targetDir = await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Generating a plan from the gateway response.',
            cancellable: false,
          },
          async () => {
            const bodies = await client.generatePlanSpec(title.trim());
            return PlanManager.createPlanWithContent(folder.uri.fsPath, title, bodies);
          }
        );
        planProvider.refresh();
        vscode.window.showInformationMessage(`Created plan from gateway response in ${targetDir}.`);
        await openMarkdownFile(path.join(targetDir, 'spec.md'));
      } catch (error) {
        vscode.window.showErrorMessage(`Could not generate the plan: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),
    vscode.commands.registerCommand('allah.refreshPlans', () => planProvider.refresh()),
    vscode.commands.registerCommand('allah.openPlanSpec', async (value: unknown) => {
      if (!isPlanItem(value) || !value.specPath) {
        vscode.window.showErrorMessage('The selected plan has no readable spec.md file.');
        return;
      }
      try {
        await openMarkdownFile(value.specPath);
      } catch (error) {
        vscode.window.showErrorMessage(`Could not open the plan specification: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),
    vscode.commands.registerCommand('allah.openPlanTask', async (value: unknown) => {
      const task = getTaskItem(value);
      if (!task) {
        vscode.window.showErrorMessage('Select a task in the Plans view before opening its checklist line.');
        return;
      }
      try {
        await openMarkdownFile(task.filePath, task.lineIndex);
      } catch (error) {
        vscode.window.showErrorMessage(`Could not open the task checklist: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),
    vscode.commands.registerCommand('allah.markTaskInProgress', (value: unknown) => {
      setTaskStatus(value, 'in-progress', planProvider);
    }),
    vscode.commands.registerCommand('allah.markTaskCompleted', (value: unknown) => {
      setTaskStatus(value, 'completed', planProvider);
    }),
    vscode.commands.registerCommand('allah.resetTaskToPending', (value: unknown) => {
      setTaskStatus(value, 'pending', planProvider);
    }),
    vscode.commands.registerCommand('allah.testConnection', async () => {
      const health = await updateStatusBar(statusBarItem, client);
      if (health.ok) {
        vscode.window.showInformationMessage(`MoonWitness gateway connected (${health.latencyMs}ms).`);
      } else {
        vscode.window.showWarningMessage(`MoonWitness gateway unavailable: ${health.message || 'Unknown error'}.`);
      }
      modelProvider.refresh();
    }),
    vscode.commands.registerCommand('allah.setApiKey', async () => {
      const apiKey = await vscode.window.showInputBox({
        prompt: 'Enter the MoonWitness virtual API key. It will be stored in VS Code SecretStorage.',
        password: true,
        ignoreFocusOut: true,
      });
      if (apiKey === undefined) return;
      try {
        await client.setApiKey(apiKey);
        vscode.window.showInformationMessage(apiKey.trim()
          ? 'MoonWitness API key saved securely.'
          : 'MoonWitness API key removed.');
      } catch (error) {
        vscode.window.showErrorMessage(
          `Could not update the MoonWitness API key: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }),
    vscode.commands.registerCommand('allah.pairAgentDevice', async () => {
      if (process.platform !== 'win32') {
        vscode.window.showWarningMessage('Remote agent pairing is currently supported only by the Windows extension host.');
        return;
      }
      const code = await vscode.window.showInputBox({
        prompt: 'Enter the short-lived pairing code from Headquarter.',
        password: true,
        ignoreFocusOut: true,
        validateInput: (value) => (/^[a-f0-9]{48}$/i.test(value.trim())
          ? undefined
          : 'Enter the 48-character pairing code shown in Headquarter.'),
      });
      if (!code) return;
      const deviceName = await vscode.window.showInputBox({
        prompt: 'Choose a name for this paired Windows device.',
        value: 'Windows VS Code',
        validateInput: (value) => (value.trim().length > 0 && value.trim().length <= 100
          ? undefined
          : 'Device name must be between 1 and 100 characters.'),
      });
      if (!deviceName) return;
      try {
        const deviceId = await client.claimAgentDevice(code, deviceName);
        vscode.window.showInformationMessage(`This Windows extension is paired as device ${deviceId}.`);
      } catch (error) {
        vscode.window.showErrorMessage(
          `Could not pair this Windows device: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }),
    vscode.commands.registerCommand('allah.listModels', async () => {
      try {
        const models = await client.fetchModels();
        if (models.length === 0) {
          vscode.window.showInformationMessage('The gateway model catalog is empty.');
          return;
        }

        const selected = await vscode.window.showQuickPick(
          models.map((model) => ({
            label: model.id,
            description: model.owned_by ? `Catalog entry: ${model.owned_by}` : 'Gateway catalog entry',
          })),
          { placeHolder: 'Choose a model identifier for plan requests' }
        );
        if (!selected) {
          return;
        }

        await vscode.workspace
          .getConfiguration('allah')
          .update('plannerModel', selected.label, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`Plan requests will use model identifier ${selected.label}.`);
      } catch (error) {
        vscode.window.showErrorMessage(`Could not load or select a gateway model: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),
    vscode.commands.registerCommand('allah.refreshArsyStatus', () => arsyStatusProvider.refresh()),
    vscode.commands.registerCommand('allah.openArsyDocs', async () => {
      try {
        const opened = await vscode.env.openExternal(vscode.Uri.parse(client.arsyDocsUrl));
        if (!opened) {
          vscode.window.showErrorMessage(`Could not open Arsy API documentation at ${client.arsyDocsUrl}.`);
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Could not open Arsy API documentation: ${error instanceof Error ? error.message : String(error)}`);
      }
    })
  );
    activationLog.appendLine(`[${new Date().toISOString()}] Activation completed.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    activationLog.appendLine(`[${new Date().toISOString()}] Activation failed: ${message}`);
    activationLog.appendLine(error instanceof Error ? (error.stack || '') : '');
    vscode.window.showErrorMessage(`A-L-L-A-H.COM extension activation failed: ${message}`);
    throw error;
  }
}

function setTaskStatus(value: unknown, status: TaskStatus, planProvider: PlanTreeDataProvider): void {
  const task = getTaskItem(value);
  if (!task) {
    vscode.window.showErrorMessage('Select a task in the Plans view before changing its status.');
    return;
  }

  if (hasUnsavedTaskDocument(task.filePath)) {
    vscode.window.showErrorMessage(`Save or discard the unsaved changes in ${task.filePath} before changing task status.`);
    return;
  }

  try {
    PlanManager.setTaskStatus(task, status);
    planProvider.refresh();
  } catch (error) {
    vscode.window.showErrorMessage(`Could not set task status: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function deactivate(): void {}
