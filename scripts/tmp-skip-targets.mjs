// Adds the shared skip-link target to every route-level <main> landmark.
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const appsDir = path.resolve('apps');
const changed = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (entry === 'node_modules' || entry === '.next' || entry === 'dist') continue;
    if (statSync(full).isDirectory()) walk(full);
    else if (full.endsWith('.tsx')) patch(full);
  }
}

function patch(file) {
  const source = readFileSync(file, 'utf8');
  if (!source.includes('<main')) return;
  const updated = source.replace(/<main\b([^>]*)>/g, (tag, attrs) => {
    if (/\bid=/.test(attrs)) return tag;
    return `<main id="mw-main" tabIndex={-1}${attrs}>`;
  });
  if (updated !== source) {
    writeFileSync(file, updated);
    changed.push(path.relative(process.cwd(), file));
  }
}

for (const app of readdirSync(appsDir)) {
  const appSrc = path.join(appsDir, app, 'src', 'app');
  if (statSync(appSrc, { throwIfNoEntry: false })?.isDirectory()) walk(appSrc);
}
console.log(changed.join('\n'));
console.log(`${changed.length} file(s) patched`);
