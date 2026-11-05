import * as vscode from 'vscode';
import { getValidationCommand, validationCommands } from './localAgentCore';

async function chooseWorkspaceFolder(): Promise<vscode.WorkspaceFolder | undefined> {
  const folders = vscode.workspace.workspaceFolders ?? [];
  if (folders.length === 1) return folders[0];
  if (folders.length === 0) {
    void vscode.window.showWarningMessage('Open a workspace folder first.');
    return undefined;
  }
  const selected = await vscode.window.showQuickPick(
    folders.map((folder) => ({ label: folder.name, description: folder.uri.fsPath, folder })),
    { placeHolder: 'Choose a workspace folder' }
  );
  return selected?.folder;
}

export function registerOfflineWorkbench(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('allah.searchWorkspace', async () => {
      if (!vscode.workspace.isTrusted) {
        void vscode.window.showWarningMessage('Workspace Trust is required before searching files.');
        return;
      }
      const folder = await chooseWorkspaceFolder();
      if (!folder) return;
      const query = await vscode.window.showInputBox({
        prompt: 'Search workspace files',
        validateInput: (value) => value.trim() ? undefined : 'Enter a search pattern.',
      });
      if (!query) return;
      const files = await vscode.workspace.findFiles(
        new vscode.RelativePattern(folder, `**/*${query.trim()}*`),
        '**/{.git,node_modules,dist,build}/**',
        100
      );
      if (files.length === 0) {
        void vscode.window.showInformationMessage(`No workspace files matched "${query}".`);
        return;
      }
      const selected = await vscode.window.showQuickPick(
        files.map((uri) => ({ label: vscode.workspace.asRelativePath(uri, false), uri })),
        { placeHolder: 'Open a matching workspace file' }
      );
      if (selected) {
        await vscode.window.showTextDocument(selected.uri);
      }
    }),
    vscode.commands.registerCommand('allah.showGitStatus', async () => {
      if (!vscode.workspace.isTrusted) {
        void vscode.window.showWarningMessage('Workspace Trust is required before opening a Git terminal.');
        return;
      }
      const folder = await chooseWorkspaceFolder();
      if (!folder) return;
      const terminal = vscode.window.createTerminal({ name: 'A-L-L-A-H Git', cwd: folder.uri });
      context.subscriptions.push(terminal);
      terminal.show();
      terminal.sendText('git status --short', true);
    }),
    vscode.commands.registerCommand('allah.runApprovedTask', async () => {
      if (!vscode.workspace.isTrusted) {
        void vscode.window.showWarningMessage('Workspace Trust is required before running validation.');
        return;
      }
      const folder = await chooseWorkspaceFolder();
      if (!folder) return;
      const selected = await vscode.window.showQuickPick(
        validationCommands.map((command) => ({ label: command.label, description: command.command, command })),
        { placeHolder: 'Choose an allowlisted validation task' }
      );
      if (!selected || !getValidationCommand(selected.command.id)) return;
      const confirmation = await vscode.window.showWarningMessage(
        `Run "${selected.command.command}" in ${folder.name}?`,
        { modal: true },
        'Run'
      );
      if (confirmation !== 'Run') return;
      const terminal = vscode.window.createTerminal({ name: `A-L-L-A-H: ${selected.command.label}`, cwd: folder.uri });
      context.subscriptions.push(terminal);
      terminal.show();
      terminal.sendText(selected.command.command, true);
    })
  );
}
