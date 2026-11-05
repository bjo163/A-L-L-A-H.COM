import { randomUUID } from 'crypto';
import * as path from 'path';
import * as vscode from 'vscode';
import { MoonWitnessClient } from './client';
import { PlanTreeDataProvider } from './planTreeProvider';
import { PlanManager, type PlanItem, type TaskItem, type TaskStatus } from './planManager';
import { LocalAgentWorkbenchProvider, WORKSPACE_MEMORY_KEY } from './localAgentWorkbench';
import { ContextMemory } from './contextMemory';
import { redactSensitiveContent } from './localAgentCore';
export { LocalAgentWorkbenchProvider, WORKSPACE_MEMORY_KEY };

// Phase 1 Providers
import { ProviderRegistry } from './providers/ProviderRegistry';

// Phase 2 Services
import { CredentialManager } from './services/CredentialManager';
import { HealthMonitorService } from './services/HealthMonitorService';
import { ProviderIntegration } from './services/ProviderIntegration';

// Phase 3 Services & UI
import { MissionTimelineService } from './services/MissionTimelineService';
import { MissionTemplateService } from './services/MissionTemplateService';
import { TokenCounterService } from './services/TokenCounterService';
import { OnboardingWizardProvider } from './OnboardingWizardProvider';
import { HealthDashboardProvider } from './HealthDashboardProvider';
import { ProviderConfigPanel } from './ProviderConfigPanel';
import { AgentCodeActionProvider, registerCodeActionCommands } from './CodeActionProvider';
import { EnhancedClientWrapper } from './services/EnhancedClientWrapper';
import { FirstTimeSetupDetector } from './FirstTimeSetupDetector';

// Phase 4 Services & UI
import { ImpactAnalyzerService } from './services/ImpactAnalyzerService';
import { UsageDashboardService } from './services/UsageDashboardService';
import { TimelineReplayService } from './services/TimelineReplayService';
import { ImpactAnalyzerProvider } from './ImpactAnalyzerProvider';
import { UsageDashboardPanel } from './UsageDashboardPanel';
import { TimelineReplayProvider } from './TimelineReplayProvider';
import { TursoClient } from './tursoClient';
import { registerOfflineWorkbench } from './offlineWorkbench';
import { RepositoryContextService } from './repositoryContext';
import { matchMissionTemplates } from './missionTemplateMatcher';

export { MoonWitnessClient };

const WORKSPACE_MEMORY_RETENTION_MS = 30 * 24 * 60 * 60 * 1_000;

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

  // Phase 1-3 Service Initialization
  const providerRegistry = ProviderRegistry.getInstance();
  const credentialManager = new CredentialManager(context.secrets);
  const healthMonitor = HealthMonitorService.getInstance(providerRegistry);
  const missionTimeline = MissionTimelineService.getInstance();
  const missionTemplates = MissionTemplateService.getInstance();
  const tokenCounter = TokenCounterService.getInstance();
  const firstTimeSetupDetector = new FirstTimeSetupDetector(context);

  // Initialize provider integration with VSCode settings
  const providerIntegration = ProviderIntegration.getInstance(credentialManager);
  await providerIntegration.initialize();

  // Start health monitoring
  healthMonitor.start();

  // Phase 4 Service Initialization
  const impactAnalyzer = ImpactAnalyzerService.getInstance();
  const usageDashboard = UsageDashboardService.getInstance(tokenCounter, missionTimeline);
  const timelineReplay = TimelineReplayService.getInstance(missionTimeline);

  // Register Phase 3 UI Providers
  const onboardingWizard = new OnboardingWizardProvider(context, credentialManager, providerIntegration);
  const healthDashboard = new HealthDashboardProvider(context, healthMonitor);
  const providerConfig = new ProviderConfigPanel(context, credentialManager);
  const enhancedClient = new EnhancedClientWrapper(providerRegistry, healthMonitor);
  const codeActionProvider = new AgentCodeActionProvider(enhancedClient);
  registerCodeActionCommands(context, enhancedClient);

  // Register Phase 4 UI Providers
  const impactAnalyzerProvider = new ImpactAnalyzerProvider(context, impactAnalyzer);
  const usageDashboardPanel = new UsageDashboardPanel(context, usageDashboard);
  const timelineReplayProvider = new TimelineReplayProvider(context, timelineReplay);

  // Register webview view providers
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      OnboardingWizardProvider.viewType,
      onboardingWizard
    ),
    vscode.window.registerWebviewViewProvider(
      HealthDashboardProvider.viewType,
      healthDashboard
    ),
    vscode.window.registerWebviewViewProvider(
      ProviderConfigPanel.viewType,
      providerConfig
    ),
    vscode.window.registerWebviewViewProvider(
      ImpactAnalyzerProvider.viewType,
      impactAnalyzerProvider
    ),
    vscode.window.registerWebviewViewProvider(
      UsageDashboardPanel.viewType,
      usageDashboardPanel
    ),
    vscode.window.registerWebviewViewProvider(
      TimelineReplayProvider.viewType,
      timelineReplayProvider
    )
  );

  // Register code action provider
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      { scheme: 'file', language: '*' },
      codeActionProvider
    )
  );

  // Check if first-time setup is needed
  if (await firstTimeSetupDetector.shouldShowWizard(credentialManager)) {
    vscode.commands.executeCommand('allah.showOnboardingWizard');
  }

  const planProvider = new PlanTreeDataProvider();
  const repositoryContext = new RepositoryContextService(context);
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  const localAgentProvider = new LocalAgentWorkbenchProvider(context, client);
  statusBarItem.command = 'allah.focusLocalAgent';
  context.subscriptions.push(
    statusBarItem,
    planProvider,
    vscode.window.registerWebviewViewProvider(LocalAgentWorkbenchProvider.viewType, localAgentProvider),
    vscode.window.registerTreeDataProvider('allah.views.plans', planProvider),
  );
  registerPlanWatchers(context, planProvider);
  registerOfflineWorkbench(context);
  context.subscriptions.push(
    vscode.commands.registerCommand('allah.indexWorkspace', async () => {
      const folders = vscode.workspace.workspaceFolders ?? [];
      if (folders.length === 0) {
        vscode.window.showWarningMessage('Open a workspace folder before indexing it.');
        return;
      }
      const folder = folders.length === 1
        ? folders[0]
        : (await vscode.window.showQuickPick(
          folders.map((candidate) => ({ label: candidate.name, description: candidate.uri.fsPath, folder: candidate })),
          { placeHolder: 'Choose a workspace to index' }
        ))?.folder;
      if (!folder) return;
      const index = await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: 'Indexing workspace context' },
        () => repositoryContext.build(folder)
      );
      vscode.window.showInformationMessage(`Workspace index ready. ${index.files.length} non-sensitive files recorded.`);
    })
  );
  statusBarItem.text = '$(hubot) Workspace Agent';
  statusBarItem.tooltip = 'Local, offline-first coding workflow. Click to focus the agent panel.';
  statusBarItem.show();

  context.subscriptions.push(
    vscode.commands.registerCommand('allah.createPlan', async () => {
      if (!vscode.workspace.isTrusted) {
        vscode.window.showWarningMessage('Workspace Trust is required before creating a plan.');
        return;
      }
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
      if (!vscode.workspace.isTrusted) {
        vscode.window.showWarningMessage('Workspace Trust is required before generating a plan.');
        return;
      }
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
      const status = await client.checkAgentProvider();
      statusBarItem.text = status.ok ? '$(hubot) Agent Ready' : '$(hubot) Agent Setup';
      statusBarItem.tooltip = status.message;
      (status.ok ? vscode.window.showInformationMessage : vscode.window.showWarningMessage)(
        status.message
      );
    }),
    vscode.commands.registerCommand('allah.focusLocalAgent', async () => {
      await vscode.commands.executeCommand('workbench.action.openView', LocalAgentWorkbenchProvider.viewType);
    }),
    vscode.commands.registerCommand('allah.manageWorkspaceMemory', async () => {
      if (!vscode.workspace.isTrusted) {
        vscode.window.showWarningMessage('Workspace Trust is required before managing workspace memory.');
        return;
      }
      const folder = await chooseWorkspaceFolder();
      if (!folder) return;

      const memories = new ContextMemory();
      try {
        memories.restore(context.globalState.get<unknown>(WORKSPACE_MEMORY_KEY, []));
        await context.globalState.update(WORKSPACE_MEMORY_KEY, memories.snapshot());
      } catch (error) {
        vscode.window.showErrorMessage(
          `Could not read workspace memory: ${error instanceof Error ? error.message : String(error)}`
        );
        return;
      }

      const saved = memories.list('workspace', folder.uri.toString());
      const actions = [
        { label: 'Save a workspace note', value: 'save' },
        ...(saved.length > 0
          ? [{ label: 'Clear saved workspace notes', description: `${saved.length} note(s)`, value: 'clear' }]
          : []),
      ];
      const action = await vscode.window.showQuickPick(actions, {
        placeHolder: `Manage notes for ${folder.name}`,
      });
      if (!action) return;

      if (action.value === 'save') {
        const text = await vscode.window.showInputBox({
          title: 'Save Workspace Memory',
          prompt: 'Enter a short note to offer as optional context in future agent sessions.',
          placeHolder: 'A project convention or decision worth remembering',
          validateInput: (value) => !value.trim()
            ? 'Memory text cannot be empty.'
            : value.length > 2_000 ? 'Memory text cannot exceed 2,000 characters.' : undefined,
        });
        if (text === undefined) return;

        const approval = await vscode.window.showWarningMessage(
          'Save this note for the selected workspace?',
          {
            modal: true,
            detail: `Preview: ${redactSensitiveContent(text).slice(0, 200)}\n\nIt stays in this VS Code profile for 30 days. It is sent to a model only when you select Saved workspace memories as session context. Recognized credential-like values are redacted before storage.`,
          },
          'Save note'
        );
        if (approval !== 'Save note') return;

        try {
          memories.remember({
            id: randomUUID(),
            scope: 'workspace',
            workspaceKey: folder.uri.toString(),
            text: redactSensitiveContent(text),
            retentionMs: WORKSPACE_MEMORY_RETENTION_MS,
          });
          await context.globalState.update(WORKSPACE_MEMORY_KEY, memories.snapshot());
          vscode.window.showInformationMessage('Workspace note saved for 30 days.');
        } catch (error) {
          vscode.window.showErrorMessage(
            `Could not save workspace memory: ${error instanceof Error ? error.message : String(error)}`
          );
        }
        return;
      }

      const approval = await vscode.window.showWarningMessage(
        `Clear ${saved.length} saved workspace note${saved.length === 1 ? '' : 's'}?`,
        { modal: true, detail: 'This removes the notes from this VS Code profile.' },
        'Clear notes'
      );
      if (approval !== 'Clear notes') return;

      try {
        memories.clearWorkspace(folder.uri.toString());
        await context.globalState.update(WORKSPACE_MEMORY_KEY, memories.snapshot());
        vscode.window.showInformationMessage('Saved workspace notes cleared.');
      } catch (error) {
        vscode.window.showErrorMessage(
          `Could not clear workspace memory: ${error instanceof Error ? error.message : String(error)}`
        );
      }
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
    vscode.commands.registerCommand('allah.syncPlansToHub', async () => {
      const folder = await chooseWorkspaceFolder();
      if (!folder) return;
      await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: 'Syncing .plans with Arsy Hub...' },
        async () => {
          try {
            const projects = (await client.listProjects()) as Array<{ id: number; name: string; workspace_path?: string }>;
            let match = projects.find((p) => p.workspace_path === folder.uri.fsPath);
            if (!match) {
              match = (await client.createProject({
                name: folder.name,
                workspace_path: folder.uri.fsPath,
                sync_mode: 'bidirectional',
              })) as { id: number; name: string; workspace_path?: string };
            }
            const localPlans = PlanManager.scanWorkspace(folder.uri.fsPath);
            const syncPayload = localPlans.map((p) => ({
              slug: p.folderName,
              title: p.title,
              specStatus: p.status,
              folderHash: p.id,
              tasks: p.tasks.map((t) => ({
                text: t.text,
                state: t.status === 'in-progress' ? 'in_progress' : t.status,
                lineIndex: t.lineIndex,
                sourceLine: t.sourceLine,
                fileHash: t.text,
              })),
            }));
            const res = (await client.syncProjectToHub(match.id, syncPayload)) as {
              outboundPatches?: Array<{ planSlug: string; lineIndex: number; sourceLine: string; newState: string }>;
            };
            if (res?.outboundPatches && res.outboundPatches.length > 0) {
              planProvider.refresh();
            }
            vscode.window.showInformationMessage(`Successfully synced plans with Arsy Hub project "${match.name}".`);
          } catch (err) {
            vscode.window.showErrorMessage(`Sync failed: ${err instanceof Error ? err.message : String(err)}`);
          }
        }
      );
    }),
    vscode.commands.registerCommand('allah.pullPlanFromHub', async () => {
      const folder = await chooseWorkspaceFolder();
      if (!folder) return;
      await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: 'Pulling project tasks from Arsy Hub...' },
        async () => {
          try {
            const projects = (await client.listProjects()) as Array<{ id: number; workspace_path?: string }>;
            const match = projects.find((p) => p.workspace_path === folder.uri.fsPath);
            if (!match) {
              vscode.window.showWarningMessage('No matching Arsy project registered for this workspace.');
              return;
            }
            const exportData = (await client.exportProjectFromHub(match.id)) as { tasks?: unknown[] };
            const count = exportData?.tasks?.length ?? 0;
            vscode.window.showInformationMessage(`Pulled ${count} tasks from Arsy Hub.`);
            planProvider.refresh();
          } catch (err) {
            vscode.window.showErrorMessage(`Pull failed: ${err instanceof Error ? err.message : String(err)}`);
          }
        }
      );
    }),
    vscode.commands.registerCommand('allah.syncPlansToTurso', async () => {
      const folder = await chooseWorkspaceFolder();
      if (!folder) return;
      const tursoUrl = process.env.TURSO_DATABASE_URL || 'libsql://moonwitness-vscode-bjo163.aws-ap-southeast-1.turso.io';
      const tursoToken = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTM4NDU2MTMsImlkIjoiMDFhMWE5ODctOGYwMS03YzI5LTkyMjktNjIzZDc1MmExYzQ4Iiwia2lkIjoib0RNRU1INkFreTVCTFhiUVhDcEYxUlk1c2xSM2FCYjRWcEd6cS1sXzNNVSIsInJpZCI6Ijc4NjMwMGYyLWVmMjYtNDI1OS1iNDIxLTgzMzViZjhiMTFlOCJ9.IORHDVxvCu4ZLlX0kwOFlyB2AMjwI6i-hgF8LweHMJ2fVjBypQ8kU-I8MfY8z-MhhL78biqOAz-A0ym9aLQpDA';
      
      await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: 'Syncing .plans to Turso Cloud DB...' },
        async () => {
          try {
            const turso = new TursoClient({ url: tursoUrl, authToken: tursoToken });
            const projectId = folder.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
            await turso.upsertProject({ id: projectId, name: folder.name, workspace_path: folder.uri.fsPath });
            
            const localPlans = PlanManager.scanWorkspace(folder.uri.fsPath);
            const payload = localPlans.map((p) => ({
              slug: p.folderName,
              title: p.title,
              specStatus: p.status,
              folderHash: p.id,
              tasks: p.tasks.map((t) => ({
                text: t.text,
                state: t.status === 'in-progress' ? 'in_progress' : t.status,
                lineIndex: t.lineIndex,
                sourceLine: t.sourceLine,
                fileHash: t.text,
              })),
            }));
            
            const result = await turso.syncPlans(projectId, payload);
            vscode.window.showInformationMessage(`Turso Cloud Sync: Synced ${localPlans.length} plans (${result.insertedOrUpdated} records) to Turso DB.`);
            planProvider.refresh();
          } catch (err) {
            vscode.window.showErrorMessage(`Turso sync failed: ${err instanceof Error ? err.message : String(err)}`);
          }
        }
      );
    }),
    vscode.commands.registerCommand('allah.openArsyDocs', async () => {
      try {
        const opened = await vscode.env.openExternal(vscode.Uri.parse(client.arsyDocsUrl));
        if (!opened) {
          vscode.window.showErrorMessage(`Could not open Arsy API documentation at ${client.arsyDocsUrl}.`);
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Could not open Arsy API documentation: ${error instanceof Error ? error.message : String(error)}`);
      }
    }),
    // Phase 3 Commands
    vscode.commands.registerCommand('allah.showOnboardingWizard', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.allah-explorer');
    }),
    vscode.commands.registerCommand('allah.showHealthDashboard', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.allah-explorer');
    }),
    vscode.commands.registerCommand('allah.configureProviders', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.allah-explorer');
    }),
    vscode.commands.registerCommand('allah.analyzeImpact', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.allah-explorer');
    }),
    vscode.commands.registerCommand('allah.showUsageDashboard', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.allah-explorer');
    }),
    vscode.commands.registerCommand('allah.showTimelineReplay', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.allah-explorer');
    }),
    vscode.commands.registerCommand('allah.setBudgetLimit', async () => {
      const input = await vscode.window.showInputBox({
        prompt: 'Set the monthly token budget limit in USD.',
        placeHolder: '25',
        validateInput: (value) => {
          const amount = Number(value);
          return Number.isFinite(amount) && amount >= 0 ? undefined : 'Enter a non-negative number.';
        },
      });
      if (input === undefined) return;
      usageDashboard.setBudgetLimit('monthly', {
        period: 'monthly',
        maxTokens: Number.POSITIVE_INFINITY,
        maxCost: Number(input),
        alertThreshold: 75,
      });
      vscode.window.showInformationMessage(`Monthly budget limit set to $${Number(input).toFixed(2)}.`);
    }),
    vscode.commands.registerCommand('allah.exportAuditTrail', async () => {
      const timeline = missionTimeline.getCurrentTimeline() ?? missionTimeline.getAllTimelines().at(-1);
      if (!timeline) {
        vscode.window.showInformationMessage('There is no audit trail to export yet.');
        return;
      }
      const exported = missionTimeline.exportTimelineRedacted(timeline.missionId);
      if (!exported) {
        vscode.window.showErrorMessage('The audit trail could not be exported.');
        return;
      }
      const target = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.file(path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? '', 'allah-audit-trail.json')),
        filters: { JSON: ['json'] },
      });
      if (!target) return;
      await vscode.workspace.fs.writeFile(target, Buffer.from(exported, 'utf8'));
      vscode.window.showInformationMessage(`Audit trail exported to ${target.fsPath}.`);
    }),
    vscode.commands.registerCommand('allah.showMissionTimeline', async () => {
      const entries = missionTimeline
        .getAllTimelines()
        .flatMap((timeline) => timeline.events)
        .sort((left, right) => right.timestamp - left.timestamp)
        .slice(0, 10);
      const message = entries.length === 0
        ? 'No mission events recorded yet.'
        : `Mission Timeline (${entries.length} events):\n${entries
            .map((event) => `[${new Date(event.timestamp).toLocaleTimeString()}] ${event.type}: ${event.title}`)
            .join('\n')}`;
      vscode.window.showInformationMessage(message);
    }),
    vscode.commands.registerCommand('allah.showMissionTemplates', async () => {
      if (!vscode.workspace.isTrusted) {
        vscode.window.showWarningMessage('Workspace Trust is required before browsing workspace-aware templates.');
        return;
      }
      const folder = await chooseWorkspaceFolder();
      if (!folder) return;

      try {
        const index = await vscode.window.withProgress(
          { location: vscode.ProgressLocation.Notification, title: 'Matching mission templates to workspace metadata' },
          () => repositoryContext.build(folder)
        );
        const allTemplates = missionTemplates.getAllTemplates();
        const matchingTemplates = matchMissionTemplates(allTemplates, {
          files: index.files,
          frameworks: index.dna.frameworks,
        });
        const templates = matchingTemplates.length > 0 ? matchingTemplates : allTemplates;
        if (matchingTemplates.length === 0) {
          vscode.window.showInformationMessage('No workspace-specific templates matched. Showing all templates.');
        }

        const category = await vscode.window.showQuickPick(
          [...new Set(templates.map((template) => template.category))].sort(),
          { placeHolder: 'Choose a template category' }
        );
        if (!category) return;

        const selected = await vscode.window.showQuickPick(
          templates
            .filter((template) => template.category === category)
            .map((template) => ({
              label: template.title,
              description: template.description,
              detail: `Mode: ${template.mode}`,
              template,
            })),
          { placeHolder: 'Choose a template for this workspace' }
        );
        if (!selected) return;

        const values: Record<string, string> = {};
        for (const variable of selected.template.variables) {
          const value = variable.type === 'select' && variable.options?.length
            ? await vscode.window.showQuickPick(variable.options, { placeHolder: variable.prompt })
            : await vscode.window.showInputBox({
                prompt: variable.prompt,
                value: variable.default,
                placeHolder: variable.type === 'multiline'
                  ? 'Enter a starting value. You can edit the full prompt afterward.'
                  : variable.required
                    ? 'Required'
                    : 'Optional',
                validateInput: (input) => variable.required && !input.trim()
                  ? 'This value is required.'
                  : undefined,
              });
          if (value === undefined) return;
          values[variable.name] = value.trim() || variable.default || '';
        }

        const prompt = missionTemplates.substituteVariables(selected.template, values);
        const delivered = await localAgentProvider.loadTemplateDraft(selected.template.mode, prompt, folder);
        vscode.window.showInformationMessage(delivered
          ? `Loaded "${selected.template.title}" into Workspace Agent. Review the prompt before starting.`
          : `Queued "${selected.template.title}" for Workspace Agent. It will appear when the view opens.`);
      } catch (error) {
        vscode.window.showErrorMessage(
          `Could not load a mission template: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }),
    vscode.commands.registerCommand('allah.exportMissionTimeline', async () => {
      const timeline = missionTimeline.getCurrentTimeline() ?? missionTimeline.getAllTimelines().at(-1);
      if (!timeline) {
        vscode.window.showInformationMessage('There is no mission timeline to export yet.');
        return;
      }

      const format = await vscode.window.showQuickPick(
        [
          { label: 'JSON', description: 'Machine-readable JSON format' },
          { label: 'CSV', description: 'Spreadsheet-compatible CSV' },
        ],
        { placeHolder: 'Choose export format' }
      );
      if (!format) return;

      try {
        const exported = format.label === 'JSON'
          ? missionTimeline.exportTimeline(timeline.missionId)
          : [
              ['timestamp', 'type', 'title', 'description'],
              ...timeline.events.map((event) => [
                new Date(event.timestamp).toISOString(),
                event.type,
                event.title,
                event.description ?? '',
              ]),
            ]
              .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
              .join('\n');
        if (exported === null) {
          vscode.window.showInformationMessage('The mission timeline is not available to export.');
          return;
        }
        vscode.window.showInformationMessage(`Mission timeline exported (${exported.length} bytes)`);
      } catch (error) {
        vscode.window.showErrorMessage(
          `Export failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }),
    vscode.commands.registerCommand('allah.checkTokenUsage', async () => {
      const stats = tokenCounter.getUsageStats();
      const message = `Token Usage:\nEstimated Cost: $${stats.totalCost.toFixed(4)}\nTotal Tokens: ${stats.totalTokens}\nProviders Used: ${Object.keys(stats.byProvider).join(', ') || 'None'}`;
      vscode.window.showInformationMessage(message);
    }),
    vscode.commands.registerCommand('allah.resetHealthMonitor', async () => {
      healthMonitor.reset();
      vscode.window.showInformationMessage('Health monitor has been reset.');
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

export function deactivate(): void {
  HealthMonitorService.getInstance(ProviderRegistry.getInstance()).stop();
}
