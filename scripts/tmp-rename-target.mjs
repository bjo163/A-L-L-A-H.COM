// Renames the skip-link target id across app routes.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const appsDir = path.resolve('apps');
const touched = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (entry === 'node_modules' || entry === '.next' || entry === 'dist') continue;
    if (statSync(full).isDirectory()) walk(full);
    else if (full.endsWith('.tsx')) {
      const source = readFileSync(full, 'utf8');
      if (!source.includes('id="mw-main"')) continue;
      writeFileSync(full, source.replaceAll('id="mw-main"', 'id="main-content"'));
      touched.push(path.relative(process.cwd(), full));
    }
  }
}

walk(appsDir);
console.log(touched.join('\n'));
console.log(`${touched.length} file(s) renamed`);
