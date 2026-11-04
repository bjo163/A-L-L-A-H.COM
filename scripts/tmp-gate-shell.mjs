// Swaps the gate's per-page <main class="gate-page"> for the shared RouteShell.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const appDir = path.resolve('apps/gate/src/app');
const OPEN = '<main id="main-content" tabIndex={-1} className="gate-page">';
const IMPORT = 'import { RouteShell } from "@moonwitness/ui";';
const touched = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (full.endsWith('.tsx')) patch(full);
  }
}

function patch(file) {
  let source = readFileSync(file, 'utf8');
  if (!source.includes(OPEN)) return;
  source = source.replace(OPEN, '<RouteShell as="main">').replace('</main>', '</RouteShell>');
  if (!source.includes(IMPORT)) {
    source = source.replace(/^(import [^\n]+\n)/m, `$1${IMPORT}\n`);
  }
  writeFileSync(file, source);
  touched.push(path.relative(process.cwd(), file));
}

walk(appDir);
console.log(touched.join('\n'));
console.log(`${touched.length} file(s) patched`);
