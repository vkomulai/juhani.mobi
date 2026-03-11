import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import globals from 'globals'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { react: reactPlugin },
    languageOptions: {
      globals: { ...globals.browser }
    },
    settings: { react: { version: 'detect' } },
    rules: {
      semi: [2, 'never'],
      quotes: ['error', 'single'],
      'comma-dangle': ['error', 'never'],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true }]
    }
  },
  {
    files: ['src/**/*.test.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    }
  },
  {
    files: ['src/custom-sw.js'],
    languageOptions: {
      globals: { ...globals.serviceworker }
    }
  },
  {
    ignores: ['build/', 'e2e/', 'api/', 'node_modules/']
  }
)
