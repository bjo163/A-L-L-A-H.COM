import * as vscode from 'vscode';
import { MoonWitnessClient } from './client';
import { ModelTreeDataProvider, StorageTreeDataProvider } from './treeProvider';
import { PlanTreeDataProvider } from './planTreeProvider';
import { PlanManager, TaskItem } from './planManager';

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext): void {
  const client = new MoonWitnessClient();

  // 1. Status Bar Setup
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'allah.testConnection';
  context.subscriptions.push(statusBarItem);
  updateStatusBar(client);

  // 2. Tree Views Setup
  const planProvider = new PlanTreeDataProvider();
  const modelProvider = new ModelTreeDataProvider(client);
  const storageProvider = new StorageTreeDataProvider();

  vscode.window.registerTreeDataProvider('allah.views.plans', planProvider);
  vscode.window.registerTreeDataProvider('allah.views.models', modelProvider);
  vscode.window.registerTreeDataProvider('allah.views.storage', storageProvider);

  // 3. Register Commands
  const createPlanCmd = vscode.commands.registerCommand('allah.createPlan', async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage('No workspace folder open. Open a folder to create a plan.');
      return;
    }

    const title = await vscode.window.showInputBox({
      prompt: 'Enter feature or task title for the new plan',
      placeHolder: 'e.g. Implement User Authentication',
      validateInput: (val) => (!val || !val.trim() ? 'Title cannot be empty' : null),
    });

    if (!title) return;

    const targetDir = PlanManager.createPlan(workspaceFolders[0].uri.fsPath, title.trim());
    planProvider.refresh();
    vscode.window.showInformationMessage(`Created new Spec-Driven Plan: ${targetDir}`);

    // Open spec.md automatically
    const specUri = vscode.Uri.file(`${targetDir}/spec.md`);
    vscode.workspace.openTextDocument(specUri).then((doc) => {
      vscode.window.showTextDocument(doc);
    });
  });

  const refreshPlansCmd = vscode.commands.registerCommand('allah.refreshPlans', () => {
    planProvider.refresh();
    vscode.window.showInformationMessage('Project Management (.plans) refreshed.');
  });

  const toggleTaskCmd = vscode.commands.registerCommand('allah.toggleTask', (task: TaskItem) => {
    const success = PlanManager.toggleTask(task);
    if (success) {
      planProvider.refresh();
    } else {
      vscode.window.showErrorMessage(`Failed to update task in ${task.filePath}`);
    }
  });

  const testConnCmd = vscode.commands.registerCommand('allah.testConnection', async () => {
    vscode.window.showInformationMessage('Testing MoonWitness Gateway connection...');
    const result = await client.checkHealth();
    if (result.ok) {
      vscode.window.showInformationMessage(`MoonWitness Gateway connected (${result.latencyMs}ms).`);
    } else {
      vscode.window.showWarningMessage(`MoonWitness Gateway unreachable (${result.latencyMs}ms). Ensure apps/server is running.`);
    }
    updateStatusBar(client);
    modelProvider.refresh();
  });

  const listModelsCmd = vscode.commands.registerCommand('allah.listModels', async () => {
    const models = await client.fetchModels();
    if (models.length === 0) {
      vscode.window.showWarningMessage('No models returned from MoonWitness LLM Router.');
      return;
    }
    const chosen = await vscode.window.showQuickPick(
      models.map((m) => ({
        label: m.id,
        description: m.owned_by ? `Owner: ${m.owned_by}` : 'Gateway Model',
      })),
      { placeHolder: 'Select an active model from MoonWitness' }
    );
    if (chosen) {
      vscode.window.showInformationMessage(`Selected Model: ${chosen.label}`);
    }
  });

  const refreshStorageCmd = vscode.commands.registerCommand('allah.refreshStorage', () => {
    storageProvider.refresh();
    vscode.window.showInformationMessage('Echolog Storage view refreshed.');
  });

  context.subscriptions.push(
    createPlanCmd,
    refreshPlansCmd,
    toggleTaskCmd,
    testConnCmd,
    listModelsCmd,
    refreshStorageCmd
  );
}

async function updateStatusBar(client: MoonWitnessClient): Promise<void> {
  statusBarItem.text = '$(sync~spin) MoonWitness';
  statusBarItem.tooltip = 'Checking MoonWitness Gateway connection...';
  statusBarItem.show();

  const health = await client.checkHealth();
  if (health.ok) {
    statusBarItem.text = `$(pass-filled) MoonWitness (${health.latencyMs}ms)`;
    statusBarItem.tooltip = `Connected to MoonWitness Gateway\nLatency: ${health.latencyMs}ms`;
  } else {
    statusBarItem.text = `$(circle-slash) MoonWitness (offline)`;
    statusBarItem.tooltip = 'MoonWitness Gateway offline. Click to retry.';
  }
}

export function deactivate(): void {}
