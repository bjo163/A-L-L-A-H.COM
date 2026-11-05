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
      'allah.searchWorkspace',
      'allah.runApprovedTask',
    ]) {
      assert.ok(commands.includes(command), `expected registered command ${command}`);
    }
  });

  if (Number(process.env.ALLAH_EXPECTED_WORKSPACE_ROOTS) === 1) {
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
