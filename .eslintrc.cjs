// ESLint for `npm run lint` (eslint 8 + typescript-eslint 6, the versions in
// package.json): JavaScript and TypeScript mistakes, and the React hooks rules.
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  ignorePatterns: ['dist', 'node_modules', 'graphify-out', '.eslintrc.cjs'],
  rules: {
    // `strict` TypeScript is the type check (tsc in `npm run build`). The
    // explicit `any` left are mostly `catch (err: any)`: typing them is a
    // cleanup of its own, not a reason to keep the lint red.
    '@typescript-eslint/no-explicit-any': 'off',
    // French copy puts a non-breaking space before « ? ! : » and inside
    // « guillemets », template strings included: that is typography.
    'no-irregular-whitespace': ['error', { skipStrings: true, skipTemplates: true }],
  },
};
