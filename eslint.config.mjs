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
    ignores: [
      'node_modules/**',
      'dist/**',
      '**/dist/**',
      '.next/**',
      '**/.next/**',
      'out/**',
      'build/**',
      '**/build/**',
      'next-env.d.ts',
      '**/*.d.ts',
      'pnpm-lock.yaml',
      'scripts/**',
      '**/*.test.*',
      '**/*.spec.*',
    ],
  },
];