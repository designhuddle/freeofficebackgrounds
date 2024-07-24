module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  env: {
    es6: true,
    browser: true,
    amd: true,
    node: true
  },
  globals: { 
    '$': 'writable' 
  },
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    'no-console': 2,
    'no-unused-vars': ['error', {
      'ignoreRestSiblings': true
    }],
  },
};
