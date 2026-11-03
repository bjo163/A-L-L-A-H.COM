/**
 * @moonwitness/lint
 * Core ESLint flat rules for architectural purity & anti-slop
 */
export default [
  {
    files: ['apps/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'warn',
        {
          paths: [
            {
              name: 'drizzle-orm',
              message: 'Drizzle ORM is forbidden. Use native @allah/arsy-orm with PGlite.'
            }
          ]
        }
      ]
    }
  }
];

