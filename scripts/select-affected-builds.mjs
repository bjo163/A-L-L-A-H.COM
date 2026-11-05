#!/usr/bin/env node
import { components, matrixForBuilds, selectChangedBuilds } from './affected-builds.mjs';

const base = process.env.BUILD_AFFECTED_BASE;
const forceAll = !base || /^0+$/.test(base);
const { all, selected } = forceAll ? { all: true, selected: components } : selectChangedBuilds();
console.log(`matrix=${JSON.stringify(matrixForBuilds(selected))}`);
console.log(`all=${String(all)}`);
if (!process.env.GITHUB_OUTPUT) {
  console.log(`Selected ${selected.length} build targets${all ? ' (shared or unclassified change)' : ''}.`);
}
