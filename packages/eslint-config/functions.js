import tseslint from 'typescript-eslint'
import js from '@eslint/js'
import baseConfig from './base.js'
import globals from 'globals'

/**
 * Firebase Functions configuration for ESLint v9.
 * This includes the standard recommended sets that were removed from base.js
 * to avoid plugin redefinition conflicts.
 */
export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {
      'no-console': 'off'
    }
  }
)
