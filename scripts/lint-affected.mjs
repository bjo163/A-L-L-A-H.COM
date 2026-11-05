#!/usr/bin/env node
import { ESLint } from 'eslint';
import { getChangedFiles } from './changed-files.mjs';

const files = getChangedFiles()
  .filter((file) => /\.(?:[cm]?[jt]sx?)$/i.test(file))
  .filter((file) => !file.endsWith('.d.ts'))
  .filter((file) => !/(?:^|[/.])[^/\\]+\.(?:test|spec)\.[cm]?[jt]sx?$/i.test(file));
if (files.length === 0) {
  console.log('No changed JavaScript or TypeScript files to lint.');
  process.exit(0);
}

const eslint = new ESLint();
const results = await eslint.lintFiles(files);
const formatter = await eslint.loadFormatter('stylish');
const output = formatter.format(results);
if (output) process.stdout.write(output);
if (results.some(({ errorCount, warningCount }) => errorCount > 0 || warningCount > 0)) process.exit(1);
console.log(`ESLint passed for ${files.length} changed source file(s).`);
