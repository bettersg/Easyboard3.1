import tseslint from 'typescript-eslint'
import js from '@eslint/js'
import reactPlugin from 'eslint-plugin-react'
import hooksPlugin from 'eslint-plugin-react-hooks'
import baseConfig from './base.js'

/**
 * Shared React configuration for internal packages.
 * This includes the standard recommended sets that were removed from base.js
 * to avoid plugin redefinition conflicts.
 */
export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...baseConfig,
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': hooksPlugin
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...hooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
)
