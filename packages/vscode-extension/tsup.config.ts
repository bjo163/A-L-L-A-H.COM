import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/extension.ts'],
  format: ['cjs'],
  external: ['vscode'],
  noExternal: ['@allah/sdk'],
  noShims: true,
  clean: true,
  target: 'es2022',
});
