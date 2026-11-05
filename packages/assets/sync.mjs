#!/usr/bin/env node
// Copies the canonical subset for each app from packages/assets into its public
// directory. Idempotent: safe to run on every predev/prebuild. Resolves paths
// from this file's own location so it works the same locally and inside a
// Docker builder, where only the current app directory exists.

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(pkgDir, '..', '..');
const manifest = JSON.parse(readFileSync(join(pkgDir, 'manifest.json'), 'utf8'));

const requested = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
for (const app of requested) {
  if (!manifest.apps[app]) {
    console.error(`assets:sync — unknown app "${app}". Known: ${Object.keys(manifest.apps).join(', ')}`);
    process.exit(1);
  }
}

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

function copy(src, dest, counter) {
  if (!existsSync(src)) {
    throw new Error(`assets:sync — canonical file missing: ${src}`);
  }
  ensureDir(dirname(dest));
  copyFileSync(src, dest);
  counter.files += 1;
}

const counter = { files: 0 };
const synced = [];

for (const app of requested.length ? requested : Object.keys(manifest.apps)) {
  const entry = manifest.apps[app];
  const appRoot = join(repoRoot, 'apps', app);

  // Defaulting to all apps must tolerate missing siblings (partial checkouts);
  // an explicitly requested app must exist.
  if (!existsSync(appRoot)) {
    if (requested.length) {
      console.error(`assets:sync — app directory not found: apps/${app}`);
      process.exit(1);
    }
    continue;
  }

  const publicDir = join(appRoot, 'public');

  for (const skin of entry.artwork ?? []) {
    copy(join(pkgDir, 'artwork', `${skin}.png`), join(publicDir, 'artwork', `${skin}.png`), counter);
    copy(join(pkgDir, 'artwork', `${skin}.svg`), join(publicDir, 'artwork', `${skin}.svg`), counter);
  }

  if (entry.emblem) {
    copy(join(pkgDir, 'brand', entry.emblem), join(publicDir, 'brand', 'emblem.svg'), counter);
  }

  for (const font of manifest.fonts ?? []) {
    copy(join(pkgDir, 'fonts', font), join(publicDir, 'fonts', font), counter);
  }

  if (entry.favicon) {
    copy(join(pkgDir, 'favicon', entry.favicon), join(appRoot, 'src', 'app', 'favicon.ico'), counter);
  }

  synced.push(app);
}

console.log(`assets:sync — ${synced.length} app(s), ${counter.files} file(s) [${synced.join(', ')}]`);
