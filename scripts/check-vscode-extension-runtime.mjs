import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const extensionRoot = resolve(root, 'packages/vscode-extension');
const manifestPath = resolve(extensionRoot, 'package.json');
const sourceRoot = resolve(extensionRoot, 'src');
const bundlePath = resolve(extensionRoot, 'dist/extension.js');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

function collectTypeScriptFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) return collectTypeScriptFiles(entryPath);
    return entry.isFile() && /\.tsx?$/.test(entry.name) ? [entryPath] : [];
  });
}

const source = collectTypeScriptFiles(sourceRoot)
  .map((filePath) => readFileSync(filePath, 'utf8'))
  .join('\n');

const failures = [];
const registrationPattern = /registerCommand\(['"]([^'"]+)['"]/g;
const registeredCommands = new Set();
for (const match of source.matchAll(registrationPattern)) {
  registeredCommands.add(match[1]);
}

for (const contribution of manifest.contributes?.commands ?? []) {
  if (!registeredCommands.has(contribution.command)) {
    failures.push(`manifest command is not registered in source: ${contribution.command}`);
  }
}

const activationEvents = new Set(manifest.activationEvents ?? []);
const hasStartupActivation = activationEvents.has('onStartupFinished');
for (const contribution of manifest.contributes?.commands ?? []) {
  const commandEvent = `onCommand:${contribution.command}`;
  if (!hasStartupActivation && !activationEvents.has(commandEvent)) {
    failures.push(`command has no startup or explicit activation event: ${contribution.command}`);
  }
}

if (!statSync(bundlePath, { throwIfNoEntry: false })?.isFile()) {
  failures.push(`extension bundle is missing: ${bundlePath}`);
} else {
  const bundle = readFileSync(bundlePath, 'utf8');
  if (/require\(["']@allah\/sdk["']\)/.test(bundle)) {
    failures.push('@allah/sdk must be bundled, not required at runtime');
  }
  if (/require\(["']@moonwitness\/types["']\)/.test(bundle)) {
    failures.push('@moonwitness/types must be bundled, not required at runtime');
  }
}

if (manifest.main !== './dist/extension.js') {
  failures.push(`unexpected extension entrypoint: ${manifest.main}`);
}

if (failures.length > 0) {
  console.error('VS Code extension runtime check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`VS Code extension runtime check passed (${manifest.contributes.commands.length} commands).`);
