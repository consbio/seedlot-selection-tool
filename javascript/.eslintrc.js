module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    es6: true,
  },
  settings: {
    'react': {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts'],
      },
    },
  },
  extends: ['airbnb', 'airbnb/hooks', 'prettier/@typescript-eslint', 'plugin:prettier/recommended'],
  rules: {
    'prettier/prettier': 'warn',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { vars: 'all', args: 'after-used' }],
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'error',
    'react/state-in-constructor': 'off',
    'react/destructuring-assignment': ['error', 'always', { ignoreClassFields: true }],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'error',
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': 'error',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'no-underscore-dangle': 'off',
    'react/jsx-filename-extension': [2, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
    'react/static-property-placement': 'off',
    'react/jsx-one-expression-per-line': 'off',
    'func-names': 'off',
    'no-alert': 'off',
    'import/no-extraneous-dependencies': 'off',
    'consistent-return': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'jsx-a11y/anchor-has-content': 'off',
    'react/no-find-dom-node': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
  },
  plugins: ['react', '@typescript-eslint'],
}
