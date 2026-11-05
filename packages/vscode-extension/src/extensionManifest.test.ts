import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { test } from 'node:test';

const extensionRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checker = path.resolve(extensionRoot, '..', '..', 'scripts', 'check-vscode-extension-manifest.mjs');

test('manifest commands and views have runtime registrations', () => {
  const output = execFileSync(process.execPath, [checker], {
    cwd: path.resolve(extensionRoot, '..', '..'),
    encoding: 'utf8',
  });

  if (!output.includes('27 commands and 8 views')) {
    throw new Error(`Unexpected manifest parity result: ${output}`);
  }
});
