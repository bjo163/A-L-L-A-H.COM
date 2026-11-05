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
        const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
        await document.save();
        await vscode.commands.executeCommand('workbench.action.closeAllEditors');
        await fs.rm(filePath, { force: true });
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
        await vscode.commands.executeCommand('workbench.action.closeAllEditors');
        await fs.rm(filePath, { force: true });
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
        const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
        await document.save();
        await vscode.commands.executeCommand('workbench.action.closeAllEditors');
        await fs.rm(filePath, { force: true });
      }
    });
  }
});
