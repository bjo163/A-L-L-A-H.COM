import { getChangedFiles } from './changed-files.mjs';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const knownComponents = [
  ['arsy', 'apps/arsy/', 'pnpm --filter @allah/arsy build'],
  ['dock', 'apps/dock/', 'pnpm dock:build'],
  ['gate', 'apps/gate/', 'pnpm gate:build'],
  ['headquarter', 'apps/headquarter/', 'pnpm headquarter:build'],
  ['id', 'apps/id/', 'pnpm id:build'],
  ['jizz', 'apps/jizz/', 'pnpm jizz:build'],
  ['harbor', 'apps/harbor/', 'pnpm harbor:build'],
  ['moonsky', 'apps/moonsky/', 'pnpm moonsky:build'],
  ['e-isp', 'apps/e-isp/', 'pnpm esp:build'],
  ['sentinel', 'apps/sentinel/', 'pnpm sentinel:build'],
];

const knownAppPaths = new Set(knownComponents.filter(([, prefix]) => prefix.startsWith('apps/')).map(([, prefix]) => prefix));
const additionalApps = readdirSync('apps', { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== 'server')
  .map((entry) => ({ name: entry.name, directory: join('apps', entry.name) }))
  .filter(({ directory }) => !knownAppPaths.has(`${directory.replaceAll('\\', '/')}/`))
  .flatMap(({ name, directory }) => {
    try {
      const manifest = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'));
      if (!manifest.name || !manifest.scripts?.build) return [];
      return [[name, `${directory.replaceAll('\\', '/')}/`, `pnpm --filter ${manifest.name}... run build`]];
    } catch {
      return [];
    }
  });

export const components = [...knownComponents, ...additionalApps];

const sharedPrefixes = ['addons/', 'scripts/', '.github/', '.husky/'];
const rootFiles = new Set([
  'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'tsconfig.json', 'tsconfig.base.json',
  'eslint.config.mjs', 'eslint.config.js', '.npmrc', '.node-version', '.nvmrc',
]);
const generatedCodeInputs = [
  /(^|\/)__manifest__\.json$/,
  /(^|\/)next\.config\.[^/]+$/,
  /(^|\/)postcss\.config\.[^/]+$/,
  /(^|\/)tailwind\.config\.[^/]+$/,
  /(^|\/)codegen\//,
  /(^|\/)(generate|codegen)[^/]*\.(mjs|cjs|js|ts)$/i,
];
export function selectBuilds(files, targets = components) {
  if (files.length === 0) return { all: true, selected: targets };
  const documentationOnly = (file) => /\.md$/i.test(file) || file.startsWith('.plans/');
  const targetPaths = new Set(targets.map(([, prefix]) => prefix));
  const hasUnknown = files.some((file) => {
    if (documentationOnly(file)) return false;
    if (generatedCodeInputs.some((pattern) => pattern.test(file))) return false;
    if (rootFiles.has(file) || sharedPrefixes.some((prefix) => file.startsWith(prefix))) return false;
    if (file.startsWith('packages/')) return false;
    return ![...targetPaths].some((prefix) => file.startsWith(prefix));
  });
  const all = hasUnknown || files.some((file) =>
    rootFiles.has(file) || sharedPrefixes.some((prefix) => file.startsWith(prefix)) ||
    (file.startsWith('packages/')) ||
    generatedCodeInputs.some((pattern) => pattern.test(file)),
  );
  return {
    all,
    selected: all ? targets : targets.filter(([, prefix]) => files.some((file) => file.startsWith(prefix))),
  };
}

export function selectChangedBuilds(options) {
  return selectBuilds(getChangedFiles(options));
}

export function matrixForBuilds(selected) {
  return selected.map(([component]) => {
    const appDir = component === 'e-isp' ? 'e-isp' : component;
    let usesNext = ['dock', 'gate', 'headquarter', 'id', 'jizz', 'harbor', 'moonsky', 'e-isp'].includes(component);
    if (!usesNext && !['arsy', 'sentinel'].includes(component)) {
      try {
        const manifest = JSON.parse(readFileSync(join('apps', appDir, 'package.json'), 'utf8'));
        usesNext = Boolean(manifest.dependencies?.next || manifest.devDependencies?.next);
      } catch {
        usesNext = false;
      }
    }
    const cachePath = usesNext ? `apps/${appDir}/.next/cache` : '';
    return { component, cachePath };
  });
}

export function matrixForDockerBuilds(selected) {
  return matrixForBuilds(
    selected.filter(([component, prefix]) =>
      prefix.startsWith('apps/') && existsSync(join('apps', component, 'Dockerfile'))
    )
  );
}
