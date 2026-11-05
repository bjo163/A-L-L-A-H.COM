const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const vscode = require('vscode');

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

    test('discovers Ollama models and does not fall back when Ollama is unavailable', async () => {
      const requests = [];
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
      } finally {
        await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
      }
    });
  }
});
