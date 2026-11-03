import * as vscode from 'vscode';
import { MoonWitnessClient } from './client';

export class ModelItem extends vscode.TreeItem {
  constructor(
    label: string,
    description: string,
    state: 'model' | 'empty' | 'error' | 'loading'
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.description = description;
    this.contextValue = state;
    this.iconPath = new vscode.ThemeIcon(
      state === 'model'
        ? 'symbol-property'
        : state === 'error'
          ? 'warning'
          : state === 'loading'
            ? 'sync~spin'
            : 'info'
    );
    this.tooltip = state === 'model'
      ? `${label} is listed in the gateway catalog. This does not confirm an upstream provider is configured.`
      : description;
  }
}

export class ModelTreeDataProvider implements vscode.TreeDataProvider<ModelItem>, vscode.Disposable {
  private readonly onDidChangeEmitter = new vscode.EventEmitter<ModelItem | undefined | null | void>();
  readonly onDidChangeTreeData = this.onDidChangeEmitter.event;
  private result?: { models?: Awaited<ReturnType<MoonWitnessClient['fetchModels']>>; error?: string };
  private loading = false;

  constructor(private readonly client: MoonWitnessClient) {}

  refresh(): void {
    this.result = undefined;
    this.onDidChangeEmitter.fire();
  }

  getTreeItem(element: ModelItem): vscode.TreeItem {
    return element;
  }

  getChildren(): ModelItem[] {
    if (!this.result) {
      if (!this.loading) {
        void this.loadModels();
      }
      return [new ModelItem('Loading gateway catalog', 'Fetching the model list from Arsy.', 'loading')];
    }

    if (this.result.error) {
      return [new ModelItem('Gateway catalog unavailable', this.result.error, 'error')];
    }

    const models = this.result.models || [];
    if (models.length === 0) {
      return [new ModelItem('No gateway models listed', 'The model catalog is empty.', 'empty')];
    }
    return models.map((model) =>
      new ModelItem(model.id, model.owned_by ? `Catalog · ${model.owned_by}` : 'Gateway catalog', 'model')
    );
  }

  private async loadModels(): Promise<void> {
    this.loading = true;
    try {
      this.result = { models: await this.client.fetchModels() };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.result = { error: message };
    } finally {
      this.loading = false;
      this.onDidChangeEmitter.fire();
    }
  }

  dispose(): void {
    this.onDidChangeEmitter.dispose();
  }
}

export class ArsyStatusItem extends vscode.TreeItem {
  constructor(label: string, message: string, state: 'loading' | 'healthy' | 'error' | 'action') {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.description = message;
    this.tooltip = `${label}: ${message}`;
    this.iconPath = new vscode.ThemeIcon(
      state === 'healthy' ? 'pass' : state === 'error' ? 'error' : state === 'loading' ? 'sync~spin' : 'book'
    );
  }
}

export class ArsyStatusTreeDataProvider implements vscode.TreeDataProvider<ArsyStatusItem>, vscode.Disposable {
  private readonly onDidChangeEmitter = new vscode.EventEmitter<ArsyStatusItem | undefined | null | void>();
  readonly onDidChangeTreeData = this.onDidChangeEmitter.event;
  private status?: Awaited<ReturnType<MoonWitnessClient['checkArsyReadiness']>>;
  private statusError?: string;
  private loading = false;

  constructor(private readonly client: MoonWitnessClient) {}

  refresh(): void {
    this.status = undefined;
    this.statusError = undefined;
    this.onDidChangeEmitter.fire();
  }

  getTreeItem(element: ArsyStatusItem): vscode.TreeItem {
    return element;
  }

  getChildren(): ArsyStatusItem[] {
    const docsItem = new ArsyStatusItem('OpenAPI documentation', 'Open /docs', 'action');
    docsItem.command = {
      command: 'allah.openArsyDocs',
      title: 'Open Arsy API Documentation',
    };

    if (!this.status && this.statusError) {
      return [
        new ArsyStatusItem('Arsy health', this.statusError, 'error'),
        new ArsyStatusItem('Arsy readiness', this.statusError, 'error'),
        docsItem,
      ];
    }

    if (!this.status) {
      if (!this.loading) {
        void this.loadStatus();
      }
      return [
        new ArsyStatusItem('Arsy health', 'Checking /health', 'loading'),
        new ArsyStatusItem('Arsy readiness', 'Checking /ready', 'loading'),
        docsItem,
      ];
    }

    return [
      new ArsyStatusItem(
        'Arsy health',
        this.status.health.ok ? 'healthy' : `unavailable: ${this.status.health.message}`,
        this.status.health.ok ? 'healthy' : 'error'
      ),
      new ArsyStatusItem(
        'Arsy readiness',
        this.status.readiness.ok ? 'ready' : `unavailable: ${this.status.readiness.message}`,
        this.status.readiness.ok ? 'healthy' : 'error'
      ),
      docsItem,
    ];
  }

  private async loadStatus(): Promise<void> {
    this.loading = true;
    try {
      this.status = await this.client.checkArsyReadiness();
    } catch (error) {
      this.statusError = error instanceof Error ? error.message : String(error);
    } finally {
      this.loading = false;
      this.onDidChangeEmitter.fire();
    }
  }

  dispose(): void {
    this.onDidChangeEmitter.dispose();
  }
}
