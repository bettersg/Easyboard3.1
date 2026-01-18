import { nextJsConfig } from '@repo/eslint-config/next'

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...nextJsConfig,
  {
    ignores: ['.next/**', 'node_modules/**', 'public/**', 'out/**', 'next-env.d.ts']
  }
]

export default config
