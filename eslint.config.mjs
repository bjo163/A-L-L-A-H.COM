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
    // The shared design system is the only path to UI primitives in an application.
    files: ['apps/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@base-ui/react',
                '@base-ui/react/*',
                'class-variance-authority',
                'clsx',
                'tailwind-merge',
                'cn',
                'shadcn',
              ],
              message: 'Build UI through "@moonwitness/ui"; primitive plumbing belongs to the design system.',
            },
          ],
        },
      ],
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