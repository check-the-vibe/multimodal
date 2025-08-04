const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');

const compat = new FlatCompat({ baseDirectory: __dirname });

module.exports = [
  { ignores: ['eslint.config.cjs', 'node_modules/**', 'dist/**', 'build/**', 'coverage/**'] },
  js.configs.recommended,
  ...compat.extends('expo', 'plugin:@typescript-eslint/recommended', 'prettier'),
  {
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    // per-file ignores are handled above
  },
];
