import eslintConfig from './packages/lint/src/index.js';
import tsParser from '@typescript-eslint/parser';

export default [
  ...eslintConfig,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
    },
  },
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    ignores: [
      'node_modules/**',
      'dist/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      '**/*.d.ts',
      'pnpm-lock.yaml',
      'scripts/**',
      '**/*.test.*',
      '**/*.spec.*',
    ],
  },
];
