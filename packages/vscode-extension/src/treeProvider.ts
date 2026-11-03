import * as vscode from 'vscode';
import { MoonWitnessClient } from './client';

export class ModelItem extends vscode.TreeItem {
  constructor(
    public readonly modelId: string,
    public readonly ownedBy?: string
  ) {
    super(modelId, vscode.TreeItemCollapsibleState.None);
    this.tooltip = `Model: ${modelId} (${ownedBy || 'system'})`;
    this.description = ownedBy || 'gateway';
    this.iconPath = new vscode.ThemeIcon('symbol-property');
  }
}

export class ModelTreeDataProvider implements vscode.TreeDataProvider<ModelItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<ModelItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private client: MoonWitnessClient) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ModelItem): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<ModelItem[]> {
    const models = await this.client.fetchModels();
    if (models.length === 0) {
      return [];
    }
    return models.map((m) => new ModelItem(m.id, m.owned_by));
  }
}

export class StorageItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly checksum: string,
    public readonly descriptionText: string
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.tooltip = `SHA-256: ${checksum}`;
    this.description = descriptionText;
    this.iconPath = new vscode.ThemeIcon('file-binary');
  }
}

export class StorageTreeDataProvider implements vscode.TreeDataProvider<StorageItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<StorageItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor() {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: StorageItem): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<StorageItem[]> {
    return [
      new StorageItem(
        'genesis_manifest.json',
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        'content-addressed (Echolog)'
      )
    ];
  }
}

