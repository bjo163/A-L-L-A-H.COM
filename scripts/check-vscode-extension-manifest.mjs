import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const extensionRoot = path.join(root, 'packages', 'vscode-extension');
const manifest = JSON.parse(await readFile(path.join(extensionRoot, 'package.json'), 'utf8'));
const sourceFiles = [];
const pending = [path.join(extensionRoot, 'src')];

while (pending.length > 0) {
  const directory = pending.pop();
  for (const entry of await (await import('node:fs/promises')).readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) pending.push(entryPath);
    else if (entry.name.endsWith('.ts')) sourceFiles.push(entryPath);
  }
}

const sources = await Promise.all(sourceFiles.map((file) => readFile(file, 'utf8')));
const source = sources.join('\n');
const commands = manifest.contributes?.commands ?? [];
const views = Object.values(manifest.contributes?.views ?? {}).flat();
const failures = [];

for (const command of commands) {
  if (!new RegExp(`registerCommand\\(['"]${command.command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`).test(source)) {
    failures.push(`Manifest command is not registered: ${command.command}`);
  }
}

for (const view of views) {
  if (view.id === 'allah.views.plans') continue;
  if (!source.includes(`viewType = '${view.id}'`) && !source.includes(`viewType = "${view.id}"`)) {
    failures.push(`Manifest view has no provider type: ${view.id}`);
  }
}

const activationEvents = manifest.activationEvents ?? [];
for (const view of views) {
  if (view.id !== 'allah.views.plans' && !activationEvents.includes(`onView:${view.id}`)) {
    failures.push(`View is missing activation event: ${view.id}`);
  }
}

if (failures.length > 0) {
  console.error('VS Code extension manifest check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`VS Code extension manifest check passed: ${commands.length} commands and ${views.length} views.`);
}
