module.exports = {
  root: true,
  env: { node: true, es2021: true, jest: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    // Use the eslint-specific tsconfig that includes tests/
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // TypeScript
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',

    // Security
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'off', // used intentionally in cli.ts for field expressions

    // Style
    eqeqeq: ['error', 'always'],
    'prefer-const': 'error',
    'no-var': 'error',
  },
  // Relax rules for test files
  overrides: [
    {
      files: ['tests/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-require-imports': 'off',
      },
    },
  ],
};
