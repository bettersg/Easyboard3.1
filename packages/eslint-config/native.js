import { defineConfig, globalIgnores } from 'eslint/config'

import expoConfig from 'eslint-config-expo/flat.js'
import baseConfig from './base.js'

export default defineConfig([
  expoConfig,
  baseConfig,
  globalIgnores([
    'src/**',
    '.expo/**',
    'dist/**',
    'node_modules/**',
    'babel.config.js',
    'metro.config.js',
    'web-build/**',
    'android/**',
    'ios/**'
  ])
])
