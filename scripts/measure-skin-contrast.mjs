// Measures the contrast pairs every skin publishes, using the WCAG 2.x formula.
// This is a real gate: any FAIL, any unparseable skin, and a zero-skin parse
// all exit non-zero so `pnpm ui:contrast` can stop a commit or CI job.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const registryPath = path.resolve(scriptDir, '..', 'packages', 'ui', 'src', 'skins', 'registry.ts');
const source = readFileSync(registryPath, 'utf8');

const worldRe = /\n\s*'?[a-z-]+'?: \{\s*\n\s*id: '([a-z-]+)',[\s\S]*?colors: \{([\s\S]*?)\},\s*\n\s*typography/g;
const tokenRe = /(\w+): '([^']+)'/g;

function channel(hex8, index) {
  const value = parseInt(hex8.slice(index, index + 2), 16) / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  if (typeof hex !== 'string' || !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex)) {
    return Number.NaN;
  }
  const expanded = hex.length === 4
    ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    : hex;
  const r = channel(expanded, 1);
  const g = channel(expanded, 3);
  const b = channel(expanded, 5);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(foreground, background) {
  const a = luminance(foreground);
  const b = luminance(background);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

let failures = 0;

function pass(foreground, background, threshold = 4.5) {
  const value = ratio(foreground, background);
  if (!Number.isFinite(value)) {
    failures += 1;
    return 'MISSING FAIL';
  }
  if (value < threshold) failures += 1;
  return `${value.toFixed(2)} ${value >= threshold ? 'PASS' : 'FAIL'}`;
}

const rows = [];
for (const match of source.matchAll(worldRe)) {
  const colors = {};
  for (const pair of match[2].matchAll(tokenRe)) {
    colors[pair[1]] = pair[2];
  }
  rows.push({
    skin: match[1],
    'text/canvas': pass(colors.text, colors.canvas),
    'muted/canvas': pass(colors.mutedText, colors.canvas),
    'muted/surface': pass(colors.mutedText, colors.surface),
    'accent-label/canvas': pass(colors.accentLabel, colors.canvas),
    'accent-label/surface': pass(colors.accentLabel, colors.surface),
    'accent-label/elevated': pass(colors.accentLabel, colors.elevatedSurface),
    'accent-text/accent': pass(colors.accentText, colors.accent),
    'accent/surface': pass(colors.accent, colors.surface, 3),
    'success/canvas': pass(colors.success, colors.canvas),
    'danger/canvas': pass(colors.danger, colors.canvas),
    'focus/canvas': pass(colors.focus, colors.canvas, 3),
  });
}

// A parse that silently degrades (registry shape moved) must fail, not shrug.
const expectedSkins = (source.match(/^\s{2}'[a-z-]+': \{/gm) ?? []).length;
if (rows.length === 0 || rows.length < Math.min(expectedSkins, 6)) {
  console.error(`ui:contrast parsed ${rows.length} skins (registry lists ~${expectedSkins}); the parser no longer matches registry.ts shape.`);
  process.exit(1);
}

const keys = ['skin', 'text/canvas', 'muted/canvas', 'muted/surface', 'accent-label/canvas', 'accent-label/surface', 'accent-label/elevated', 'accent-text/accent', 'accent/surface', 'success/canvas', 'danger/canvas', 'focus/canvas'];
console.log(keys.join('\t'));
for (const row of rows) console.log(keys.map((key) => row[key]).join('\t'));

if (failures > 0) {
  console.error(`\nui:contrast FAILED: ${failures} token pair(s) below WCAG threshold across ${rows.length} skins.`);
  process.exit(1);
}
console.log(`\nui:contrast PASSED: ${rows.length} skins, all token pairs within threshold.`);
