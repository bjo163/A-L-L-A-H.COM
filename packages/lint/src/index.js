/**
 * @moonwitness/lint
 * Core ESLint flat rules for architectural purity, minimal clean code & anti-slop
 */
export default [
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      'no-duplicate-imports': 'error',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'drizzle-orm',
              message: 'Drizzle ORM is forbidden. Use native @allah/arsy-orm with PGlite.',
            },
            {
              name: '@prisma/client',
              message: 'Prisma is forbidden. Use native @allah/arsy-orm with PGlite.',
            },
            {
              name: 'typeorm',
              message: 'TypeORM is forbidden. Use native @allah/arsy-orm with PGlite.',
            },
            {
              name: 'mongoose',
              message: 'Mongoose is forbidden. Use native @allah/arsy-orm with PGlite.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['*drizzle*'],
              message: 'Drizzle is forbidden in client applications.',
            },
          ],
        },
      ],
    },
  },
];
