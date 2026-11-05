import { execFileSync } from 'node:child_process';

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);
}

export function getChangedFiles({ env = process.env } = {}) {
  if (env.CHANGED_FILES) return [...new Set(env.CHANGED_FILES.split(/\r?\n/).filter(Boolean))];
  if (env.BUILD_AFFECTED_BASE) {
    return git(['diff', '--name-only', `${env.BUILD_AFFECTED_BASE}...${env.CURRENT_SHA || 'HEAD'}`]);
  }
  const files = new Set();
  try {
    const upstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'])[0];
    const mergeBase = git(['merge-base', 'HEAD', upstream])[0];
    for (const file of git(['diff', '--name-only', `${mergeBase}...HEAD`])) files.add(file);
  } catch {
    for (const file of git(['diff', '--name-only', 'HEAD'])) files.add(file);
  }
  for (const file of git(['diff', '--name-only', 'HEAD'])) files.add(file);
  for (const file of git(['ls-files', '--others', '--exclude-standard'])) files.add(file);
  return [...files];
}
