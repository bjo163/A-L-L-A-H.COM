import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const extensionRoot = path.join(root, 'packages', 'vscode-extension');
const manifest = JSON.parse(await readFile(path.join(extensionRoot, 'package.json'), 'utf8'));
const sourceRoot = path.join(extensionRoot, 'src');

const sourceFiles = [];
const pending = [sourceRoot];
while (pending.length > 0) {
  const directory = pending.pop();
  for (const entry of await (await import('node:fs/promises')).readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) pending.push(entryPath);
    else if (entry.name.endsWith('.ts')) sourceFiles.push(entryPath);
  }
}

const violations = [];
for (const filePath of sourceFiles) {
  const source = await readFile(filePath, 'utf8');
  const importPattern = /\b(?:from\s*|import\s*\(\s*|import\s*)['"](@(?:allah|moonwitness)\/[^'"]+)['"]/g;
  for (const match of source.matchAll(importPattern)) {
    violations.push(`${path.relative(root, filePath)} imports ${match[1]}`);
  }
}

for (const dependency of Object.keys(manifest.dependencies ?? {})) {
  if (dependency.startsWith('@allah/') || dependency.startsWith('@moonwitness/')) {
    violations.push(`package.json declares monorepo dependency ${dependency}`);
  }
}

if (violations.length > 0) {
  console.error('Standalone extension check failed:');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log('Standalone extension check passed: no required monorepo imports or dependencies.');
}
