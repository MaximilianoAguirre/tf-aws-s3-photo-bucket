module.exports = {
    root: true,
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true
        },
        requireConfigFile: false,
    },
    settings: {
        react: {
            version: 'detect'
        }
    },
    env: {
        jest: true,
        browser: true,
        amd: true,
        node: true,
        es6: true
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:prettier/recommended' // Make this the last element so prettier config overrides other formatting rules
    ],
    rules: {
        'no-unused-vars': ['warn', { vars: 'all', args: 'after-used', ignoreRestSiblings: false }],
        'prettier/prettier': ['warn', {}, { usePrettierrc: true }],
        'react/prop-types': 0
    },
    parser: "@babel/eslint-parser"
}