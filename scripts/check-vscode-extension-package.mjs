import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const extensionRoot = path.join(root, 'packages', 'vscode-extension');
const vsce = path.join(extensionRoot, 'node_modules', '.bin', process.platform === 'win32' ? 'vsce.cmd' : 'vsce');
const output = execFileSync(vsce, ['ls', '--no-dependencies'], {
  cwd: extensionRoot,
  encoding: 'utf8',
  shell: process.platform === 'win32',
});
const files = output.split(/\r?\n/).map((file) => file.trim()).filter(Boolean);
const required = ['package.json', 'README.md', 'dist/extension.js'];
const failures = required.filter((file) => !files.includes(file));

const bundle = await readFile(path.join(extensionRoot, 'dist', 'extension.js'), 'utf8');
if (/require\(["'][^"']*(?:@moonwitness|@allah)\//.test(bundle)
  || /from["'][^"']*(?:@moonwitness|@allah)\//.test(bundle)) {
  failures.push('bundled monorepo runtime import');
}

if (failures.length > 0) {
  console.error('VS Code extension package check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`VS Code extension package check passed: ${files.length} packaged files.`);
}
