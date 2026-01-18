import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'
import baseConfig from './base.js'

/**
 * Next.js configuration following the official standards:
 * https://nextjs.org/docs/app/api-reference/config/eslint#with-typescript
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...baseConfig,
  prettier,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts'])
])

export const nextJsConfig = eslintConfig
export default eslintConfig
