const path = require('node:path');
const fs = require('node:fs/promises');
const os = require('node:os');
const { runTests } = require('@vscode/test-electron');

async function runHost(profileRoot, extraArgs, expectedRootCount) {
  await fs.mkdir(profileRoot, { recursive: true });
  const options = {
    extensionDevelopmentPath: path.resolve(__dirname, '..'),
    extensionTestsPath: path.resolve(__dirname, 'suite', 'index.js'),
    extensionTestsEnv: { ALLAH_EXPECTED_WORKSPACE_ROOTS: String(expectedRootCount) },
    launchArgs: [
      ...extraArgs,
      `--user-data-dir=${path.join(profileRoot, 'user-data')}`,
      `--extensions-dir=${path.join(profileRoot, 'extensions')}`,
      '--disable-extensions',
      '--disable-gpu',
      '--disable-workspace-trust',
    ],
  };
  if (process.env.VSCODE_EXECUTABLE_PATH) {
    options.vscodeExecutablePath = process.env.VSCODE_EXECUTABLE_PATH;
  } else {
    options.version = process.env.VSCODE_VERSION || 'stable';
  }
  await runTests(options);
}

async function removeFixture(fixture) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await fs.rm(fixture, { recursive: true, force: true });
      return;
    } catch (error) {
      if (!['EBUSY', 'EPERM'].includes(error.code) || attempt === 4) throw error;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}

async function main() {
  const fixture = await fs.mkdtemp(path.join(os.tmpdir(), 'allah-extension-host-'));
  try {
    await runHost(path.join(fixture, 'empty'), [], 0);

    const roots = [path.join(fixture, 'first'), path.join(fixture, 'second')];
    await Promise.all(roots.map((root) => fs.mkdir(root, { recursive: true })));
    await fs.mkdir(path.join(roots[0], 'src', 'routes'), { recursive: true });
    await fs.writeFile(path.join(roots[0], 'package.json'), JSON.stringify({ name: 'host-fixture' }));
    await fs.writeFile(path.join(roots[0], 'src', 'routes', 'users.ts'), 'export const users = [];\n');
    const planDirectory = path.join(roots[0], '.plans', 'extension-host-plan');
    await fs.mkdir(planDirectory, { recursive: true });
    await fs.writeFile(path.join(planDirectory, 'spec.md'), '# Extension host plan\n');
    await fs.writeFile(path.join(planDirectory, 'task.md'), '- [ ] Verify host plan actions\n');
    await runHost(path.join(fixture, 'single'), [roots[0]], 1);

    const workspacePath = path.join(fixture, 'multi-root.code-workspace');
    await fs.writeFile(workspacePath, JSON.stringify({
      folders: roots.map((root) => ({ path: root })),
    }));
    await runHost(path.join(fixture, 'multi'), [workspacePath], 2);
  } finally {
    await removeFixture(fixture);
  }
}

main().catch((error) => {
  console.error('VS Code extension-host tests failed:', error);
  process.exitCode = 1;
});
