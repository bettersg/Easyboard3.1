import { defineConfig, globalIgnores } from 'eslint/config'
import expoConfig from 'eslint-config-expo/flat.js'
import globals from 'globals'

export default defineConfig([
  expoConfig,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.json']
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' }
      ],
      // React Compiler rules that eslint-config-expo 56 turned on as errors.
      // Existing code trips 17 of them; warnings until they are fixed.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/use-memo': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/refs': 'warn',
      // TypeScript already checks namespace members; this rule cannot follow
      // expo-notifications 58's build output and reports false errors
      'import/namespace': 'off'
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.json']
        },
        node: {
          project: ['./tsconfig.json']
        }
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx']
      }
    }
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  globalIgnores([
    '.expo/**',
    'dist/**',
    'dist-*/**',
    'node_modules/**',
    'babel.config.js',
    'metro.config.js',
    'web-build/**',
    'android/**',
    'ios/**'
  ])
])
