module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', '@typescript-eslint'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // Prevent variable shadowing
    'no-shadow': ['error', { 
      builtinGlobals: true,
      hoist: 'all',
      allow: ['resolve', 'reject', 'done', 'next', 'err', 'error']
    }],
    '@typescript-eslint/no-shadow': ['error', {
      ignoreTypeValueShadow: true
    }],
    'no-redeclare': 'error',
    // Warn about unused variables (helps catch conflicts early)
    '@typescript-eslint/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
  },
};

