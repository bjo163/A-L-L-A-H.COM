import * as vscode from 'vscode';
import { PlanItem, PlanManager, TaskItem } from './planManager';

export type PlanTreeElement = PlanItem | { type: 'task'; task: TaskItem; plan: PlanItem };

export class PlanTreeDataProvider implements vscode.TreeDataProvider<PlanTreeElement> {
  private _onDidChangeTreeData = new vscode.EventEmitter<PlanTreeElement | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor() {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: PlanTreeElement): vscode.TreeItem {
    if ('folderName' in element) {
      // Plan item
      const completedCount = element.tasks.filter((t) => t.completed).length;
      const totalCount = element.tasks.length;
      const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      const item = new vscode.TreeItem(element.title, vscode.TreeItemCollapsibleState.Expanded);
      item.description = totalCount > 0 ? `[${completedCount}/${totalCount} - ${pct}%]` : `[${element.status}]`;
      item.tooltip = `${element.folderName}\nStatus: ${element.status}\nProgress: ${pct}%`;
      item.iconPath = pct === 100 ? new vscode.ThemeIcon('check-all') : new vscode.ThemeIcon('checklist');
      item.contextValue = 'planItem';
      return item;
    } else {
      // Task item
      const task = element.task;
      const item = new vscode.TreeItem(task.text, vscode.TreeItemCollapsibleState.None);
      item.iconPath = task.completed
        ? new vscode.ThemeIcon('pass-filled', new vscode.ThemeColor('testing.iconPassed'))
        : new vscode.ThemeIcon('circle-outline');
      item.description = task.completed ? 'done' : 'pending';
      item.tooltip = `Click to toggle task state\nFile: ${task.filePath}:${task.lineIndex + 1}`;
      item.command = {
        command: 'allah.toggleTask',
        title: 'Toggle Task',
        arguments: [task],
      };
      item.contextValue = 'taskItem';
      return item;
    }
  }

  async getChildren(element?: PlanTreeElement): Promise<PlanTreeElement[]> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return [];
    }

    if (!element) {
      // Root level: return all plans from all open workspace folders
      const allPlans: PlanItem[] = [];
      for (const folder of workspaceFolders) {
        const plans = PlanManager.scanWorkspace(folder.uri.fsPath);
        allPlans.push(...plans);
      }
      return allPlans;
    } else if ('folderName' in element) {
      // Plan level: return its tasks
      return element.tasks.map((t) => ({ type: 'task' as const, task: t, plan: element }));
    }

    return [];
  }
}

