import * as vscode from 'vscode';
import { PlanItem, PlanManager, TaskItem } from './planManager';

interface PlanMessage {
  type: 'message';
  label: string;
  description: string;
  state: 'info' | 'error';
  command?: vscode.Command;
}

export type PlanTreeElement = PlanItem | { type: 'task'; task: TaskItem; plan: PlanItem } | PlanMessage;

export class PlanTreeDataProvider implements vscode.TreeDataProvider<PlanTreeElement>, vscode.Disposable {
  private readonly onDidChangeEmitter = new vscode.EventEmitter<PlanTreeElement | undefined | null | void>();
  readonly onDidChangeTreeData = this.onDidChangeEmitter.event;

  refresh(): void {
    this.onDidChangeEmitter.fire();
  }

  getTreeItem(element: PlanTreeElement): vscode.TreeItem {
    if ('type' in element && element.type === 'message') {
      const item = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.None);
      item.description = element.description;
      item.tooltip = element.description;
      item.iconPath = new vscode.ThemeIcon(element.state === 'error' ? 'warning' : 'info');
      item.command = element.command;
      return item;
    }

    if ('folderName' in element) {
      const pending = element.tasks.filter((task) => task.status === 'pending').length;
      const inProgress = element.tasks.filter((task) => task.status === 'in-progress').length;
      const completed = element.tasks.filter((task) => task.status === 'completed').length;
      const item = new vscode.TreeItem(element.title, vscode.TreeItemCollapsibleState.Expanded);
      item.id = element.dirPath;
      item.description = `${element.workspaceName} · ${pending} pending · ${inProgress} active · ${completed} complete`;
      item.tooltip = [
        element.folderName,
        `Workspace: ${element.workspaceRoot}`,
        `Spec status: ${element.status}`,
        `Tasks: ${pending} pending, ${inProgress} in progress, ${completed} completed`,
      ].join('\n');
      item.iconPath = new vscode.ThemeIcon('checklist');
      item.contextValue = 'planItem';
      item.command = {
        command: 'allah.openPlanSpec',
        title: 'Open Plan Specification',
        arguments: [element],
      };
      return item;
    }

    const task = element.task;
    const item = new vscode.TreeItem(task.text, vscode.TreeItemCollapsibleState.None);
    item.id = `${task.filePath}:${task.lineIndex}`;
    item.iconPath = new vscode.ThemeIcon(
      task.status === 'completed' ? 'pass' : task.status === 'in-progress' ? 'play' : 'circle-outline'
    );
    item.description = task.status;
    item.tooltip = `${task.status}\n${task.filePath}:${task.lineIndex + 1}`;
    item.command = {
      command: 'allah.openPlanTask',
      title: 'Open Task in Checklist',
      arguments: [task],
    };
    item.contextValue = 'taskItem';
    return item;
  }

  getChildren(element?: PlanTreeElement): PlanTreeElement[] {
    if (!element) {
      const workspaceFolders = vscode.workspace.workspaceFolders || [];
      if (workspaceFolders.length === 0) {
        return [];
      }

      const plans: PlanItem[] = [];
      const failures: string[] = [];
      for (const folder of workspaceFolders) {
        try {
          plans.push(...PlanManager.scanWorkspace(folder.uri.fsPath));
        } catch (error) {
          failures.push(`${folder.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      if (plans.length === 0 && failures.length === 0) {
        return [];
      }

      const messages: PlanMessage[] = failures.map((failure) => ({
        type: 'message',
        label: 'Could not read workspace plans.',
        description: failure,
        state: 'error',
        command: {
          command: 'allah.refreshPlans',
          title: 'Retry Reading Plans',
        },
      }));
      return [...plans, ...messages];
    }

    if ('folderName' in element) {
      if (!element.taskPath) {
        return [
          {
            type: 'message',
            label: 'task.md is missing.',
            description: `Create the required checklist in ${element.dirPath}.`,
            state: 'error',
          },
        ];
      }
      if (element.tasks.length === 0) {
        return [
          {
            type: 'message',
            label: 'No checklist items found.',
            description: element.taskPath,
            state: 'info',
          },
        ];
      }
      return element.tasks.map((task) => ({ type: 'task' as const, task, plan: element }));
    }

    return [];
  }

  dispose(): void {
    this.onDidChangeEmitter.dispose();
  }
}
