import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts'],
    ignores: ['dist/**', 'node_modules/**'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
];
