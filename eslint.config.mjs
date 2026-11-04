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
    // Later flat-config blocks replace (not merge) the same rule, so this block
    // must also restate the ORM `paths` bans from @moonwitness/lint's base block.
    files: ['apps/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'drizzle-orm', message: 'Drizzle ORM is forbidden. Use native @allah/arsy-orm with PGlite.' },
            { name: '@prisma/client', message: 'Prisma is forbidden. Use native @allah/arsy-orm with PGlite.' },
            { name: 'typeorm', message: 'TypeORM is forbidden. Use native @allah/arsy-orm with PGlite.' },
            { name: 'mongoose', message: 'Mongoose is forbidden. Use native @allah/arsy-orm with PGlite.' },
          ],
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
                '*drizzle*',
              ],
              message: 'Build UI through "@moonwitness/ui"; primitive plumbing belongs to the design system. ORM access goes through @allah/arsy-orm only.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.{mts,cts}'],
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
      '**/*.test.*',
      '**/*.spec.*',
    ],
  },
];