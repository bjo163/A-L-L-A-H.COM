// Maps Tailwind palette utilities onto the token-driven theme utilities from @moonwitness/ui/theme.css.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const srcDir = path.resolve('apps/headquarter/src');
const rules = [
  [/\btext-(?:zinc|slate|neutral|stone|gray)-(?:50|100|200|300)\b/g, 'text-foreground'],
  [/\btext-(?:zinc|slate|neutral|stone|gray)-(?:400|500|600|700)\b/g, 'text-muted-foreground'],
  [/\btext-(?:red|rose)-(?:[3-6]00)\b/g, 'text-destructive'],
  [/\btext-(?:emerald|green|lime)-(?:[3-5]00)\b/g, 'text-success'],
  [/\btext-(?:amber|yellow|orange)-(?:[2-6]00)\b/g, 'text-ring'],
  [/\btext-(?:cyan|sky|blue|teal|indigo)-(?:[2-6]00)\b/g, 'text-accent'],
  [/\bbg-(?:zinc|slate|neutral|stone)-(?:800|900|950)(?:\/\d{1,3})?\b/g, 'bg-card'],
  [/\bbg-(?:red|rose)-(?:[4-6]00)(?:\/\d{1,3})?\b/g, 'bg-destructive'],
  [/\bbg-(?:emerald|green)-(?:[4-6]00)(?:\/\d{1,3})?\b/g, 'bg-success'],
  [/\bbg-(?:amber|yellow)-(?:[4-6]00)(?:\/\d{1,3})?\b/g, 'bg-ring'],
  [/\bbg-(?:cyan|sky|blue)-(?:[4-6]00)(?:\/\d{1,3})?\b/g, 'bg-accent'],
  [/\bborder-(?:zinc|slate|neutral|stone|gray)-(?:[2-8]00)(?:\/\d{1,3})?\b/g, 'border-border'],
  [/\bborder-(?:red|rose)-(?:[3-6]00)(?:\/\d{1,3})?\b/g, 'border-destructive'],
  [/\bborder-(?:cyan|sky|blue|teal)-(?:[3-6]00)(?:\/\d{1,3})?\b/g, 'border-accent'],
  [/\bdivide-(?:zinc|slate|neutral|stone)-(?:[2-8]00)\b/g, 'divide-border'],
  [/\bring-(?:zinc|slate)-(?:[2-8]00)(?:\/\d{1,3})?\b/g, 'ring-ring'],
];

const touched = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (full.endsWith('.tsx')) patch(full);
  }
}

function patch(file) {
  const source = readFileSync(file, 'utf8');
  let updated = source;
  for (const [pattern, replacement] of rules) {
    updated = updated.replace(pattern, replacement);
  }
  if (updated !== source) {
    writeFileSync(file, updated);
    touched.push(path.relative(process.cwd(), file));
  }
}

walk(srcDir);
console.log(touched.join('\n'));
console.log(`${touched.length} file(s) mapped`);
