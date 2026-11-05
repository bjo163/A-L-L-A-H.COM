const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const vscode = require('vscode');

function createLocalAgentProvider(client) {
  const values = new Map();
  const state = {
    get(key, defaultValue) {
      return values.has(key) ? values.get(key) : defaultValue;
    },
    async update(key, value) {
      values.set(key, value);
    },
  };
  const Provider = require('../../dist/extension.js').LocalAgentWorkbenchProvider;
  assert.equal(typeof Provider, 'function');
  return new Provider({ globalState: state, workspaceState: state }, client);
}

function createAiTaskPlan() {
  return JSON.stringify({
    tasks: [
      {
        id: 'task-1',
        title: 'Update the implementation',
        acceptanceCriteria: ['The requested behavior is present.'],
        dependsOn: [],
      },
      {
        id: 'task-2',
        title: 'Verify the change',
        acceptanceCriteria: ['Focused tests pass.'],
        dependsOn: ['task-1'],
      },
    ],
    verification: ['Run the focused test suite.'],
  });
}

suite('A-L-L-A-H.COM extension host', () => {
  test('starts with the expected workspace state', () => {
    const expectedRootCount = Number(process.env.ALLAH_EXPECTED_WORKSPACE_ROOTS);
    const folders = vscode.workspace.workspaceFolders || [];
    assert.equal(folders.length, expectedRootCount);
    if (expectedRootCount > 0) {
      assert.equal(path.basename(folders[0].uri.fsPath), 'first');
    }
    if (expectedRootCount === 2) {
      assert.equal(path.basename(folders[1].uri.fsPath), 'second');
    }
  });

  test('activates and registers primary workspace commands', async () => {
    const extension = vscode.extensions.getExtension('a-l-l-a-h.allah-vscode-extension');
    assert.ok(extension, 'extension must be discoverable by its published identifier');
    await extension.activate();
    assert.equal(extension.isActive, true);
    const views = extension.packageJSON.contributes.views['allah-explorer'];
    assert.equal(views.filter((view) => view.id === 'allah.localAgentWorkbench').length, 1);

    const commands = await vscode.commands.getCommands(true);
    for (const command of [
      'allah.focusLocalAgent',
      'allah.createPlan',
      'allah.refreshPlans',
      'allah.loadPlanTask',
      'allah.searchWorkspace',
      'allah.runApprovedTask',
      'allah.manageWorkspaceMemory',
    ]) {
      assert.ok(commands.includes(command), `expected registered command ${command}`);
    }
  });

  test('dashboard commands open their existing health, impact, usage, and audit views', async () => {
    const extension = vscode.extensions.getExtension('a-l-l-a-h.allah-vscode-extension');
    await extension.activate();
    const executeCommand = vscode.commands.executeCommand.bind(vscode.commands);
    const openedViews = [];

    try {
      vscode.commands.executeCommand = async (command, ...args) => {
        if (command === 'workbench.action.openView') {
          openedViews.push(args[0]);
          return undefined;
        }
        return executeCommand(command, ...args);
      };
      await executeCommand('allah.showHealthDashboard');
      await executeCommand('allah.analyzeImpact');
      await executeCommand('allah.showUsageDashboard');
      await executeCommand('allah.showTimelineReplay');
    } finally {
      vscode.commands.executeCommand = executeCommand;
    }

    assert.deepEqual(openedViews, [
      'allah.views.health',
      'allah.views.impactAnalyzer',
      'allah.views.usageDashboard',
      'allah.views.timelineReplay',
    ]);
    assert.equal(new Set(openedViews).size, openedViews.length);
  });

  if (Number(process.env.ALLAH_EXPECTED_WORKSPACE_ROOTS) === 1) {
    test('workspace memory is opt-in and saved notes are scoped to one workspace', async () => {
      const provider = createLocalAgentProvider({});
      const memoryKey = 'allah.workspaceMemory.entries';
      const root = vscode.workspace.workspaceFolders[0];
      await provider.context.globalState.update(memoryKey, [{
        id: 'memory-for-this-workspace',
        scope: 'workspace',
        workspaceKey: root.uri.toString(),
        text: 'Use pnpm for package scripts.',
        createdAt: Date.now(),
        expiresAt: Date.now() + 60_000,
      }, {
        id: 'memory-for-another-workspace',
        scope: 'workspace',
        workspaceKey: 'file:///unrelated-workspace',
        text: 'Do not include this note.',
        createdAt: Date.now(),
        expiresAt: Date.now() + 60_000,
      }]);

      const originalQuickPick = vscode.window.showQuickPick;
      try {
        vscode.window.showQuickPick = async (items) => items.find((item) => item.value === 'memory');
        const context = await provider.getWorkspaceContext(root);
        assert.ok(context.includes('Use pnpm for package scripts.'));
        assert.equal(context.includes('Do not include this note.'), false);

        vscode.window.showQuickPick = async (items) => items.find((item) => item.value === 'none');
        assert.equal(await provider.getWorkspaceContext(root), '');
      } finally {
        vscode.window.showQuickPick = originalQuickPick;
      }
    });

    test('workspace memory command requires consent to save and clear notes', async () => {
      const originalQuickPick = vscode.window.showQuickPick;
      const originalInputBox = vscode.window.showInputBox;
      const originalWarning = vscode.window.showWarningMessage;
      const originalInformation = vscode.window.showInformationMessage;
      const warningDetails = [];
      const quickPickCalls = [];
      const information = [];
      try {
        vscode.window.showQuickPick = async (items) => {
          quickPickCalls.push(items.map((item) => item.value));
          const target = quickPickCalls.length === 1 ? 'save' : 'clear';
          return items.find((item) => item.value === target);
        };
        vscode.window.showInputBox = async () => 'Use pnpm. api_key=host-memory-secret';
        vscode.window.showWarningMessage = async (message, options) => {
          warningDetails.push({ message, detail: options?.detail });
          return message.startsWith('Save this note') ? 'Save note' : 'Clear notes';
        };
        vscode.window.showInformationMessage = async (message) => {
          information.push(message);
        };

        await vscode.commands.executeCommand('allah.manageWorkspaceMemory');
        await vscode.commands.executeCommand('allah.manageWorkspaceMemory');

        assert.ok(warningDetails[0].detail.includes('30 days'));
        assert.ok(warningDetails[0].detail.includes('select Saved workspace memories'));
        assert.ok(quickPickCalls[1].includes('clear'));
        assert.ok(warningDetails[1].message.includes('1 saved workspace note'));
        assert.deepEqual(information, [
          'Workspace note saved for 30 days.',
          'Saved workspace notes cleared.',
        ]);
      } finally {
        vscode.window.showQuickPick = originalQuickPick;
        vscode.window.showInputBox = originalInputBox;
        vscode.window.showWarningMessage = originalWarning;
        vscode.window.showInformationMessage = originalInformation;
      }
    });

    test('configures the agent provider from the same surface that reports readiness', async () => {
      const originalExecuteCommand = vscode.commands.executeCommand.bind(vscode.commands);
      const commands = [];
      const provider = createLocalAgentProvider({
        async checkAgentProvider() {
          return {
            ok: true,
            provider: 'ollama',
            model: 'host-local-model',
            models: ['host-local-model'],
            message: 'Ollama is ready with model "host-local-model".',
          };
        },
      });
      let receiveMessage;
      const webview = {
        cspSource: 'vscode-webview:',
        options: {},
        html: '',
        onDidReceiveMessage(handler) {
          receiveMessage = handler;
          return { dispose() {} };
        },
        async postMessage(message) {
          commands.push(message);
          return true;
        },
      };
      const originalExecute = vscode.commands.executeCommand;

      try {
        vscode.commands.executeCommand = async (command, ...args) => {
          commands.push([command, ...args]);
          if (command === 'workbench.action.openSettings') return true;
          return originalExecuteCommand(command, ...args);
        };
        provider.resolveWebviewView({
          webview,
          onDidDispose() {
            return { dispose() {} };
          },
        });
        await receiveMessage({ command: 'ready' });
        const status = commands.find((message) => message.type === 'provider-status');
        assert.equal(status.ok, true);
        assert.deepEqual(status.models, ['host-local-model']);

        await receiveMessage({ command: 'configureProvider' });
        assert.ok(commands.some((entry) => Array.isArray(entry) && entry[0] === 'allah.configureProviders'));
        assert.ok(commands.some((entry) => Array.isArray(entry)
          && entry[0] === 'workbench.action.openSettings'
          && entry[1] === '@ext:a-l-l-a-h.allah-vscode-extension agentProvider'));
        await originalExecuteCommand('allah.configureProviders');
        assert.equal(
          commands.filter((entry) => Array.isArray(entry) && entry[0] === 'workbench.action.openSettings').length,
          2
        );
      } finally {
        vscode.commands.executeCommand = originalExecute;
      }
    });

    test('loads selected plan tasks as drafts and focuses the local mission timeline', async () => {
      const originalExecuteCommand = vscode.commands.executeCommand;
      const commandCalls = [];
      const messages = [];
      const provider = createLocalAgentProvider({});
      const workspace = vscode.workspace.workspaceFolders[0];
      const webview = {
        cspSource: 'vscode-webview:',
        options: {},
        html: '',
        onDidReceiveMessage() {
          return { dispose() {} };
        },
        async postMessage(message) {
          messages.push(message);
          return true;
        },
      };

      try {
        vscode.commands.executeCommand = async (command, ...args) => {
          commandCalls.push([command, ...args]);
          return undefined;
        };
        provider.resolveWebviewView({
          webview,
          show() {},
          onDidDispose() {
            return { dispose() {} };
          },
        });
        const delivered = await provider.loadPlanTaskDraft({
          text: 'Verify the focused host test.',
          filePath: path.join(workspace.uri.fsPath, '.plans', 'extension-host-plan', 'task.md'),
        }, workspace);
        assert.equal(delivered, true);
        const draft = messages.find((message) => message.type === 'plan-task-draft');
        assert.equal(draft.mode, 'code');
        assert.ok(draft.prompt.includes('Verify the focused host test.'));
        assert.ok(draft.prompt.includes('.plans\\extension-host-plan\\task.md'));
        assert.ok(draft.prompt.includes('Do not change its checklist status.'));

        await provider.focusMissionTimeline();
        assert.ok(messages.some((message) => message.type === 'focus-timeline'));
        assert.ok(commandCalls.some(([command]) => command === 'allah.focusLocalAgent'));
        assert.ok(commandCalls.some(([command]) => command === 'workbench.action.openView'));
      } finally {
        vscode.commands.executeCommand = originalExecuteCommand;
      }
    });

    test('repository index prefers the workspace root package manifest', async () => {
      const provider = createLocalAgentProvider({});
      const index = await provider.repositoryContext.build(vscode.workspace.workspaceFolders[0]);
      assert.ok(index.dna.frameworks.includes('Next.js'));
      assert.equal(index.dna.frameworks.includes('Vue'), false);
    });

    test('restores interrupted sessions as blocked without restarting provider work', async () => {
      const timestamp = new Date().toISOString();
      const session = {
        id: 'interrupted-host-session',
        mode: 'code',
        state: 'running',
        startedAt: timestamp,
        updatedAt: timestamp,
        timeline: [],
      };
      let providerCalls = 0;
      const client = {
        async checkAgentProvider() {
          return { ok: true, provider: 'gateway', model: 'test-model', models: [], message: 'ready' };
        },
        async completeAgent() {
          providerCalls += 1;
          return 'must not resume automatically';
        },
      };
      const provider = createLocalAgentProvider(client);
      const stateKey = 'allah.localAgent.sessions';
      await provider.context.globalState.update(stateKey, [session]);
      const messages = [];
      let receiveMessage;
      const webview = {
        cspSource: 'vscode-webview:',
        options: {},
        html: '',
        onDidReceiveMessage(handler) {
          receiveMessage = handler;
          return { dispose() {} };
        },
        async postMessage(message) {
          messages.push(message);
          return true;
        },
      };

      provider.resolveWebviewView({
        webview,
        onDidDispose() {
          return { dispose() {} };
        },
      });
      await receiveMessage({ command: 'ready' });

      const history = messages.find((message) => message.type === 'history');
      assert.equal(history.sessions[0].state, 'blocked');
      assert.ok(history.sessions[0].timeline.some((event) => event.type === 'mission.interrupted'));
      assert.ok(messages.some((message) =>
        message.type === 'mission-restored' && message.state === 'blocked'
      ));
      assert.equal(providerCalls, 0);
    });

    test('resumes an opted-in interrupted task only after the user starts its reviewed draft', async () => {
      const timestamp = new Date().toISOString();
      const sourceSession = {
        id: 'saved-interrupted-session',
        mode: 'ask',
        state: 'running',
        startedAt: timestamp,
        updatedAt: timestamp,
        timeline: [],
        resumePrompt: 'Explain api_key=secret-value',
        resumeExpiresAt: new Date(Date.now() + 60_000).toISOString(),
      };
      const expiredSession = {
        id: 'expired-saved-session',
        mode: 'ask',
        state: 'blocked',
        startedAt: timestamp,
        updatedAt: timestamp,
        timeline: [],
        resumePrompt: 'This task has expired.',
        resumeExpiresAt: new Date(Date.now() - 1_000).toISOString(),
      };
      const stateKey = 'allah.localAgent.sessions';
      const providerCalls = [];
      const provider = createLocalAgentProvider({
        async checkAgentProvider() {
          return { ok: true, provider: 'gateway', model: 'test-model', models: [], message: 'ready' };
        },
        async completeAgent(system, prompt) {
          providerCalls.push(prompt);
          return 'Task completed.';
        },
      });
      await provider.context.globalState.update(stateKey, [sourceSession, expiredSession]);
      const messages = [];
      let receiveMessage;
      const webview = {
        cspSource: 'vscode-webview:',
        options: {},
        html: '',
        onDidReceiveMessage(handler) {
          receiveMessage = handler;
          return { dispose() {} };
        },
        async postMessage(message) {
          messages.push(message);
          return true;
        },
      };
      const originalQuickPick = vscode.window.showQuickPick;

      try {
        vscode.window.showQuickPick = async (items) => items.find((item) => item.value === 'none');
        provider.resolveWebviewView({
          webview,
          onDidDispose() {
            return { dispose() {} };
          },
        });
        await receiveMessage({ command: 'ready' });
        assert.equal(providerCalls.length, 0);
        const history = messages.find((message) => message.type === 'history');
        assert.equal(history.sessions[0].canResume, true);
        assert.equal(history.sessions[0].resumePrompt, undefined);
        assert.equal(history.sessions.find((session) => session.id === expiredSession.id).hasSavedTask, false);
        assert.equal(
          provider.context.globalState.get(stateKey, []).find((session) => session.id === expiredSession.id).resumePrompt,
          undefined
        );
        await receiveMessage({ command: 'resumeSession', sessionId: expiredSession.id });
        assert.equal(providerCalls.length, 0);

        await receiveMessage({ command: 'resumeSession', sessionId: sourceSession.id });
        const draft = messages.find((message) => message.type === 'resume-draft');
        assert.equal(draft.prompt, 'Explain api_key=[REDACTED]');
        assert.equal(providerCalls.length, 0);

        await receiveMessage({
          command: 'run',
          mode: draft.mode,
          prompt: draft.prompt,
          persistForResume: true,
          resumeSessionId: sourceSession.id,
        });
        assert.equal(providerCalls.length, 1);
        assert.ok(providerCalls[0].includes('Explain api_key=[REDACTED]'));
        const newSessionId = messages.find((message) => message.type === 'started').sessionId;
        const savedSessions = provider.context.globalState.get(stateKey, []);
        const savedSource = savedSessions.find((session) => session.id === sourceSession.id);
        const resumedSession = savedSessions.find((session) => session.id === newSessionId);
        assert.equal(savedSource.resumedBySessionId, newSessionId);
        assert.equal(savedSource.state, 'blocked');
        assert.equal(resumedSession.state, 'completed');
        assert.equal(resumedSession.resumePrompt, 'Explain api_key=[REDACTED]');
        assert.ok(Date.parse(resumedSession.resumeExpiresAt) > Date.now());
        const latestHistory = messages.filter((message) => message.type === 'history').at(-1);
        assert.equal(latestHistory.sessions.find((session) => session.id === newSessionId).hasSavedTask, true);
        assert.equal(
          provider.getSessionHistory().find((session) => session.id === newSessionId).resumePrompt,
          'Explain api_key=[REDACTED]'
        );

        await receiveMessage({ command: 'resumeSession', sessionId: sourceSession.id });
        assert.equal(providerCalls.length, 1);
        assert.ok(messages.some((message) => message.type === 'blocked'));
        await receiveMessage({ command: 'forgetSavedTask', sessionId: newSessionId });
        assert.ok(
          messages.some((message) => message.type === 'saved-task-forgotten'),
          messages.map((message) => `${message.type}: ${message.message || ''}`).join('\n')
        );
        const forgottenSession = provider.context.globalState.get(stateKey, [])
          .find((session) => session.id === newSessionId);
        assert.equal(forgottenSession.resumePrompt, undefined);
      } finally {
        vscode.window.showQuickPick = originalQuickPick;
      }
    });

    test('does not re-execute completed or interrupted remote missions', async () => {
      const timestamp = new Date().toISOString();
      let providerCalls = 0;
      const provider = createLocalAgentProvider({
        async checkAgentProvider() {
          return { ok: true, provider: 'gateway', model: 'test-model', models: [], message: 'ready' };
        },
        async completeAgent() {
          providerCalls += 1;
          return 'must not replay';
        },
      });
      await provider.context.globalState.update('allah.localAgent.sessions', [
        {
          id: 'remote-completed-session',
          mode: 'code',
          state: 'completed',
          startedAt: timestamp,
          updatedAt: timestamp,
          remoteMissionId: 'remote-completed',
          timeline: [],
        },
        {
          id: 'remote-interrupted-session',
          mode: 'code',
          state: 'running',
          startedAt: timestamp,
          updatedAt: timestamp,
          remoteMissionId: 'remote-interrupted',
          timeline: [],
        },
      ]);

      assert.equal(
        await provider.executeRemoteMission(
          { id: 'remote-completed', mode: 'code', goal: 'repeat completed work' },
          new AbortController().signal
        ),
        'completed'
      );
      assert.equal(
        await provider.executeRemoteMission(
          { id: 'remote-interrupted', mode: 'code', goal: 'resume interrupted work' },
          new AbortController().signal
        ),
        'blocked'
      );
      assert.equal(providerCalls, 0);
    });

    test('refreshes plans, opens artifacts, and updates task status', async () => {
      await vscode.commands.executeCommand('allah.refreshPlans');
      const root = vscode.workspace.workspaceFolders[0].uri.fsPath;
      const planDirectory = path.join(root, '.plans', 'extension-host-plan');
      const specPath = path.join(planDirectory, 'spec.md');
      const taskPath = path.join(planDirectory, 'task.md');

      await vscode.commands.executeCommand('allah.openPlanSpec', {
        id: 'extension-host-plan',
        dirPath: planDirectory,
        folderName: 'extension-host-plan',
        title: 'Extension host plan',
        tasks: [],
        specPath,
      });
      assert.equal(path.basename(vscode.window.activeTextEditor.document.uri.fsPath), 'spec.md');

      const task = {
        id: 1,
        filePath: taskPath,
        lineIndex: 0,
        sourceLine: '- [ ] Verify host plan actions',
        text: 'Verify host plan actions',
        status: 'pending',
      };
      await vscode.commands.executeCommand('allah.openPlanTask', task);
      assert.equal(vscode.window.activeTextEditor.selection.active.line, 0);
      await vscode.commands.executeCommand('allah.markTaskCompleted', task);
      assert.match(await fs.readFile(taskPath, 'utf8'), /- \[x\] Verify host plan actions/);
    });

    test('loads a workspace-matched template into the agent draft for review', async () => {
      const originalQuickPick = vscode.window.showQuickPick;
      const originalInputBox = vscode.window.showInputBox;
      const originalInformationMessage = vscode.window.showInformationMessage;
      const originalErrorMessage = vscode.window.showErrorMessage;
      const originalWithProgress = vscode.window.withProgress;
      const quickPickCalls = [];
      const inputValues = [];
      const informationMessages = [];
      const errorMessages = [];
      vscode.window.showQuickPick = async (items) => {
        quickPickCalls.push(items);
        if (quickPickCalls.length === 1) return 'api';
        if (quickPickCalls.length === 2) return items.find((item) => item.label === 'Add REST Endpoint');
        return 'GET';
      };
      vscode.window.showInputBox = async (options) => {
        inputValues.push(options.prompt);
        return options.prompt.startsWith('Endpoint path') ? '/host-test' : 'Host acceptance test';
      };
      vscode.window.showInformationMessage = async (message) => {
        informationMessages.push(message);
      };
      vscode.window.showErrorMessage = async (message) => {
        errorMessages.push(message);
      };
      vscode.window.withProgress = async (_options, task) => task();

      try {
        await vscode.commands.executeCommand('allah.showMissionTemplates');
        assert.ok(quickPickCalls[0].includes('api'));
        assert.equal(inputValues.length, 2);
        assert.deepEqual(errorMessages, []);
        assert.ok(informationMessages.some((message) =>
          message.includes('Loaded "Add REST Endpoint"')
          || message.includes('Queued "Add REST Endpoint" for Workspace Agent')
        ));
      } finally {
        vscode.window.showQuickPick = originalQuickPick;
        vscode.window.showInputBox = originalInputBox;
        vscode.window.showInformationMessage = originalInformationMessage;
        vscode.window.showErrorMessage = originalErrorMessage;
        vscode.window.withProgress = originalWithProgress;
      }
    });

    test('stores gateway credentials in SecretStorage and sends them to the configured endpoint', async () => {
      const extension = vscode.extensions.getExtension('a-l-l-a-h.allah-vscode-extension');
      const properties = extension.packageJSON.contributes.configuration.properties;
      assert.equal(properties['allah.apiKey'], undefined);

      const originalInputBox = vscode.window.showInputBox;
      const originalInformationMessage = vscode.window.showInformationMessage;
      const configuration = vscode.workspace.getConfiguration('allah');
      const originalGatewayUrl = configuration.inspect('gatewayUrl')?.globalValue;
      const originalProvider = configuration.inspect('agentProvider')?.globalValue;
      const requests = [];
      const server = http.createServer((request, response) => {
        requests.push({ path: request.url, key: request.headers['x-virtual-key'] });
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(request.url === '/health'
          ? { status: 'ok' }
          : { data: [{ id: 'dx-reasoning' }] }));
      });
      await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
      });

      try {
        const address = server.address();
        await configuration.update('agentProvider', 'gateway', vscode.ConfigurationTarget.Global);
        await configuration.update(
          'gatewayUrl',
          `http://127.0.0.1:${address.port}`,
          vscode.ConfigurationTarget.Global
        );
        vscode.window.showInputBox = async () => 'host-test-secret';
        vscode.window.showInformationMessage = async () => undefined;
        await vscode.commands.executeCommand('allah.setApiKey');
        assert.equal(configuration.get('apiKey'), undefined);

        await vscode.commands.executeCommand('allah.testConnection');
        assert.ok(requests.some((request) => request.path === '/health' && request.key === 'host-test-secret'));
        assert.ok(requests.some((request) => request.path === '/v1/models' && request.key === 'host-test-secret'));
      } finally {
        vscode.window.showInputBox = async () => '';
        vscode.window.showInformationMessage = async () => undefined;
        await vscode.commands.executeCommand('allah.setApiKey');
        vscode.window.showInputBox = originalInputBox;
        vscode.window.showInformationMessage = originalInformationMessage;
        await configuration.update('gatewayUrl', originalGatewayUrl, vscode.ConfigurationTarget.Global);
        await configuration.update('agentProvider', originalProvider, vscode.ConfigurationTarget.Global);
        await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
      }
    });

    test('discovers Ollama models and does not fall back when Ollama is unavailable', async () => {
      const requests = [];
      const warnings = [];
      const originalWarningMessage = vscode.window.showWarningMessage;
      const server = http.createServer((request, response) => {
        requests.push(request.url);
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ models: [{ name: 'host-test-model' }] }));
      });
      await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
      });

      const address = server.address();
      const configuration = vscode.workspace.getConfiguration('allah');
      try {
        vscode.window.showWarningMessage = async (message) => {
          warnings.push(message);
        };
        await configuration.update('agentProvider', 'ollama', vscode.ConfigurationTarget.Global);
        await configuration.update('agentModel', undefined, vscode.ConfigurationTarget.Global);
        await configuration.update('ollamaUrl', `http://127.0.0.1:${address.port}`, vscode.ConfigurationTarget.Global);
        await configuration.update('gatewayUrl', `http://127.0.0.1:${address.port}`, vscode.ConfigurationTarget.Global);

        await vscode.commands.executeCommand('allah.testConnection');
        assert.deepEqual(requests, ['/api/tags']);
        assert.equal(vscode.workspace.getConfiguration('allah').get('agentModel'), 'host-test-model');

        await vscode.workspace.getConfiguration('allah').update(
          'ollamaUrl',
          'http://127.0.0.1:1',
          vscode.ConfigurationTarget.Global
        );
        await vscode.commands.executeCommand('allah.testConnection');
        assert.deepEqual(requests, ['/api/tags']);
        assert.ok(warnings.some((message) => message.includes('Ollama is unavailable')));
      } finally {
        vscode.window.showWarningMessage = originalWarningMessage;
        await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
      }
    });

    test('completes a local Ollama edit without contacting the Gateway', async () => {
      const root = vscode.workspace.workspaceFolders[0].uri.fsPath;
      const filePath = path.join(root, 'src', 'offline-ollama-flow.ts');
      const original = 'const provider = "before";\n';
      await fs.writeFile(filePath, original);
      const configuration = vscode.workspace.getConfiguration('allah');
      const previous = {
        agentProvider: configuration.inspect('agentProvider')?.globalValue,
        agentModel: configuration.inspect('agentModel')?.globalValue,
        ollamaUrl: configuration.inspect('ollamaUrl')?.globalValue,
        gatewayUrl: configuration.inspect('gatewayUrl')?.globalValue,
      };
      const originalQuickPick = vscode.window.showQuickPick;
      const originalWarning = vscode.window.showWarningMessage;
      const requests = [];
      const proposal = JSON.stringify({
        response: 'Updated the provider.',
        edits: [{
          path: 'src/offline-ollama-flow.ts',
          oldText: original,
          newText: 'const provider = "ollama";\n',
        }],
      });
      const server = http.createServer((request, response) => {
        requests.push(request.url);
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(request.url === '/api/tags'
          ? { models: [{ name: 'host-local-model' }] }
          : { message: { content: proposal } }));
      });
      await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
      });

      try {
        const address = server.address();
        await configuration.update('agentProvider', 'ollama', vscode.ConfigurationTarget.Global);
        await configuration.update('agentModel', 'host-local-model', vscode.ConfigurationTarget.Global);
        await configuration.update('ollamaUrl', `http://127.0.0.1:${address.port}`, vscode.ConfigurationTarget.Global);
        await configuration.update('gatewayUrl', 'http://127.0.0.1:1', vscode.ConfigurationTarget.Global);
        vscode.window.showQuickPick = async (items) => items.find((item) => item.value === 'none');
        vscode.window.showWarningMessage = async (message) =>
          message.startsWith('Apply ') ? 'Apply changes' : undefined;

        const ExtensionClient = require('../../dist/extension.js').MoonWitnessClient;
        const client = new ExtensionClient({ secrets: { get: async () => undefined } });
        const provider = createLocalAgentProvider(client);
        assert.equal(await provider.run('code', 'Change the provider constant.'), 'completed');
        const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
        assert.equal(document.getText(), 'const provider = "ollama";\n');
        assert.deepEqual(requests, ['/api/tags', '/api/chat']);
      } finally {
        vscode.window.showQuickPick = originalQuickPick;
        vscode.window.showWarningMessage = originalWarning;
        await configuration.update('agentProvider', previous.agentProvider, vscode.ConfigurationTarget.Global);
        await configuration.update('agentModel', previous.agentModel, vscode.ConfigurationTarget.Global);
        await configuration.update('ollamaUrl', previous.ollamaUrl, vscode.ConfigurationTarget.Global);
        await configuration.update('gatewayUrl', previous.gatewayUrl, vscode.ConfigurationTarget.Global);
        await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
      }
    });

    test('requires plan approval before a multi-step edit proposal', async () => {
      const originalQuickPick = vscode.window.showQuickPick;
      const originalWarning = vscode.window.showWarningMessage;
      const warningCalls = [];
      const modelCalls = [];
      const client = {
        async checkAgentProvider() {
          return { ok: true, provider: 'gateway', model: 'test-model', models: [], message: 'ready' };
        },
        async completeAgent(system, prompt) {
          modelCalls.push({ system, prompt });
          return createAiTaskPlan();
        },
      };

      try {
        vscode.window.showQuickPick = async (items) => items.find((item) => item.value === 'none');
        vscode.window.showWarningMessage = async (message) => {
          warningCalls.push(message);
          return undefined;
        };
        const provider = createLocalAgentProvider(client);
        assert.equal(await provider.run('code', 'Update the implementation and add a focused test.'), 'blocked');
        assert.equal(modelCalls.length, 1);
        assert.ok(modelCalls[0].system.includes('Do not propose file edits.'));
        assert.ok(warningCalls.some((message) => message.includes('implementation plan')));
      } finally {
        vscode.window.showQuickPick = originalQuickPick;
        vscode.window.showWarningMessage = originalWarning;
      }
    });

    test('passes only an approved multi-step plan to the edit proposal request', async () => {
      const root = vscode.workspace.workspaceFolders[0].uri.fsPath;
      const filePath = path.join(root, 'src', 'approved-plan-flow.ts');
      const original = 'const plan = "pending";\n';
      await fs.writeFile(filePath, original);
      const originalQuickPick = vscode.window.showQuickPick;
      const originalWarning = vscode.window.showWarningMessage;
      const modelCalls = [];
      const plan = [
        'Implementation plan',
        '1. Update the implementation',
        '   Acceptance: The requested behavior is present.',
        '2. Verify the change',
        '   Acceptance: Focused tests pass.',
        '   Depends on: task-1',
        'Verification',
        '- Run the focused test suite.',
      ].join('\n');
      const client = {
        async checkAgentProvider() {
          return { ok: true, provider: 'gateway', model: 'test-model', models: [], message: 'ready' };
        },
        async completeAgent(system, prompt) {
          modelCalls.push({ system, prompt });
          if (system.includes('Do not propose file edits.')) return createAiTaskPlan();
          return JSON.stringify({
            response: 'Updated the status.',
            edits: [{
              path: 'src/approved-plan-flow.ts',
              oldText: original,
              newText: 'const plan = "approved";\n',
            }],
          });
        },
      };

      try {
        vscode.window.showQuickPick = async (items) => items.find((item) => item.value === 'none');
        vscode.window.showWarningMessage = async (message) =>
          message.includes('implementation plan')
            ? 'Continue with this plan'
            : message.startsWith('Apply ') ? 'Apply changes' : undefined;
        const provider = createLocalAgentProvider(client);
        assert.equal(
          await provider.run('code', 'Change the status value and verify the resulting code.'),
          'completed'
        );
        assert.equal(modelCalls.length, 2);
        assert.ok(modelCalls[1].prompt.includes(`user-approved implementation plan:\n${plan}`));
        const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
        assert.equal(document.getText(), 'const plan = "approved";\n');
      } finally {
        vscode.window.showQuickPick = originalQuickPick;
        vscode.window.showWarningMessage = originalWarning;
      }
    });

    test('cancels a plan review without requesting edits', async () => {
      const originalQuickPick = vscode.window.showQuickPick;
      const originalWarning = vscode.window.showWarningMessage;
      const modelCalls = [];
      let releaseReview;
      let notifyReview;
      const reviewRequested = new Promise((resolve) => {
        notifyReview = resolve;
      });
      const review = new Promise((resolve) => {
        releaseReview = resolve;
      });
      const client = {
        async checkAgentProvider() {
          return { ok: true, provider: 'gateway', model: 'test-model', models: [], message: 'ready' };
        },
        async completeAgent(system, prompt) {
          modelCalls.push({ system, prompt });
          return createAiTaskPlan();
        },
      };

      try {
        vscode.window.showQuickPick = async (items) => items.find((item) => item.value === 'none');
        vscode.window.showWarningMessage = () => {
          notifyReview();
          return review;
        };
        const provider = createLocalAgentProvider(client);
        const events = [];
        provider.post = (message) => events.push(message);
        const run = provider.run('code', 'Update the implementation and verify the change.');
        await reviewRequested;
        provider.activeRun.abort();
        releaseReview('Continue with this plan');
        assert.equal(await run, 'cancelled');
        assert.equal(modelCalls.length, 1);
        assert.ok(events.some((event) => event.type === 'cancelled'));
      } finally {
        vscode.window.showQuickPick = originalQuickPick;
        vscode.window.showWarningMessage = originalWarning;
      }
    });

    test('applies proposed edits only after approval', async () => {
      const root = vscode.workspace.workspaceFolders[0].uri.fsPath;
      const filePath = path.join(root, 'src', 'agent-approval-accepted.ts');
      const original = 'const version = "before";\n';
      await fs.writeFile(filePath, original);
      const originalQuickPick = vscode.window.showQuickPick;
      const originalWarning = vscode.window.showWarningMessage;
      const client = {
        async checkAgentProvider() {
          return { ok: true, provider: 'gateway', model: 'test-model', models: [], message: 'ready' };
        },
        async completeAgent() {
          return JSON.stringify({
            response: 'Update the version.',
            edits: [{ path: 'src/agent-approval-accepted.ts', oldText: original, newText: 'const version = "proposed";\n' }],
          });
        },
      };

      try {
        vscode.window.showQuickPick = async (items) => items.find((item) => item.value === 'none');
        vscode.window.showWarningMessage = async (message) =>
          message.startsWith('Apply ') ? 'Apply changes' : undefined;
        const provider = createLocalAgentProvider(client);
        assert.equal(await provider.run('code', 'Update the version.'), 'completed');
        const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
        assert.equal(document.getText(), 'const version = "proposed";\n');
      } finally {
        vscode.window.showQuickPick = originalQuickPick;
        vscode.window.showWarningMessage = originalWarning;
      }
    });

    test('rejected edit approval leaves the workspace document unchanged', async () => {
      const root = vscode.workspace.workspaceFolders[0].uri.fsPath;
      const filePath = path.join(root, 'src', 'agent-approval-rejected.ts');
      const original = 'const version = "before";\n';
      await fs.writeFile(filePath, original);
      const originalQuickPick = vscode.window.showQuickPick;
      const originalWarning = vscode.window.showWarningMessage;
      const client = {
        async checkAgentProvider() {
          return { ok: true, provider: 'gateway', model: 'test-model', models: [], message: 'ready' };
        },
        async completeAgent() {
          return JSON.stringify({
            response: 'Update the version.',
            edits: [{ path: 'src/agent-approval-rejected.ts', oldText: original, newText: 'const version = "proposed";\n' }],
          });
        },
      };

      try {
        vscode.window.showQuickPick = async (items) => items.find((item) => item.value === 'none');
        vscode.window.showWarningMessage = async () => undefined;
        const provider = createLocalAgentProvider(client);
        assert.equal(await provider.run('code', 'Update the version.'), 'blocked');
        const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
        assert.equal(document.getText(), original);
      } finally {
        vscode.window.showQuickPick = originalQuickPick;
        vscode.window.showWarningMessage = originalWarning;
      }
    });

    test('preserves external changes made while an approved diff is open', async () => {
      const root = vscode.workspace.workspaceFolders[0].uri.fsPath;
      const filePath = path.join(root, 'src', 'agent-approval-conflict.ts');
      const original = 'const version = "before";\n';
      const external = 'const version = "external";\n';
      await fs.writeFile(filePath, original);
      const originalQuickPick = vscode.window.showQuickPick;
      const originalWarning = vscode.window.showWarningMessage;
      const client = {
        async checkAgentProvider() {
          return { ok: true, provider: 'gateway', model: 'test-model', models: [], message: 'ready' };
        },
        async completeAgent() {
          return JSON.stringify({
            response: 'Update the version.',
            edits: [{ path: 'src/agent-approval-conflict.ts', oldText: original, newText: 'const version = "proposed";\n' }],
          });
        },
      };

      try {
        vscode.window.showQuickPick = async (items) => items.find((item) => item.value === 'none');
        vscode.window.showWarningMessage = async (message) => {
          if (!message.startsWith('Apply ')) return undefined;
          const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
          const edit = new vscode.WorkspaceEdit();
          edit.replace(
            document.uri,
            new vscode.Range(new vscode.Position(0, 0), document.positionAt(document.getText().length)),
            external
          );
          await vscode.workspace.applyEdit(edit);
          return 'Apply changes';
        };
        const provider = createLocalAgentProvider(client);
        assert.equal(await provider.run('code', 'Update the version.'), 'failed');
        const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
        assert.equal(document.getText(), external);
      } finally {
        vscode.window.showQuickPick = originalQuickPick;
        vscode.window.showWarningMessage = originalWarning;
      }
    });

    test('rejects validation commands that are not approved', async () => {
      const originalWarning = vscode.window.showWarningMessage;
      const events = [];
      const provider = createLocalAgentProvider({});
      provider.post = (message) => events.push(message);

      try {
        vscode.window.showWarningMessage = async () => undefined;
        await provider.runValidation('code', 'git-status');
        assert.ok(events.some((event) => event.type === 'validation-blocked'));
        assert.equal(events.some((event) => event.type === 'validation-started'), false);
      } finally {
        vscode.window.showWarningMessage = originalWarning;
      }
    });

    test('does not start validation when approval is cancelled', async () => {
      const originalWarning = vscode.window.showWarningMessage;
      const events = [];
      let releaseApproval;
      let notifyApprovalRequested;
      const approvalRequested = new Promise((resolve) => {
        notifyApprovalRequested = resolve;
      });
      const approval = new Promise((resolve) => {
        releaseApproval = resolve;
      });
      const provider = createLocalAgentProvider({});
      provider.post = (message) => events.push(message);

      try {
        vscode.window.showWarningMessage = () => {
          notifyApprovalRequested();
          return approval;
        };
        const validation = provider.runValidation('code', 'git-status');
        await approvalRequested;
        provider.activeRun.abort();
        releaseApproval('Run command');
        await validation;
        assert.ok(events.some((event) => event.type === 'validation-blocked'));
        assert.equal(events.some((event) => event.type === 'validation-started'), false);
      } finally {
        vscode.window.showWarningMessage = originalWarning;
      }
    });

    test('cancels an approved validation process without reporting success', async () => {
      const originalWarning = vscode.window.showWarningMessage;
      const events = [];
      const provider = createLocalAgentProvider({});
      provider.post = (message) => {
        events.push(message);
        if (message.type === 'validation-started') {
          setTimeout(() => provider.activeRun?.abort(), 80);
        }
      };

      try {
        vscode.window.showWarningMessage = async () => 'Run command';
        await provider.runValidation('code', 'extension-tests');
        assert.ok(events.some((event) => event.type === 'validation-started'));
        assert.ok(events.some((event) => event.type === 'cancelled'));
        assert.equal(events.some((event) => event.type === 'validation-result'), false);
      } finally {
        vscode.window.showWarningMessage = originalWarning;
      }
    });

    test('limits each repeated validation failure to one repair proposal', async () => {
      const originalQuickPick = vscode.window.showQuickPick;
      const events = [];
      let completionCount = 0;
      const client = {
        async checkAgentProvider() {
          return { ok: true, provider: 'gateway', model: 'test-model', models: [], message: 'ready' };
        },
        async completeAgent() {
          completionCount += 1;
          return JSON.stringify({ response: 'No repair needed.', edits: [] });
        },
      };
      const provider = createLocalAgentProvider(client);
      provider.post = (message) => events.push(message);
      const root = vscode.workspace.workspaceFolders[0].uri.fsPath;
      const failureOutput = 'TypeError: fixture failure at line 12\n';
      const createSession = (id) => ({
        id,
        mode: 'code',
        state: 'failed',
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeline: [],
      });

      try {
        vscode.window.showQuickPick = async (items) => items.find((item) => item.value === 'none');
        const firstSession = createSession('repair-first');
        await provider.offerRepair(firstSession, 'pnpm typecheck', failureOutput, root);
        await provider.requestRepairProposal(firstSession.id);
        assert.equal(completionCount, 1);

        const repeatedSession = createSession('repair-repeat');
        await provider.offerRepair(repeatedSession, 'pnpm typecheck', failureOutput, root);
        await provider.requestRepairProposal(repeatedSession.id);
        assert.equal(completionCount, 1);
        assert.ok(events.some((event) => event.type === 'repair-blocked'));
      } finally {
        vscode.window.showQuickPick = originalQuickPick;
      }
    });
  }
});
