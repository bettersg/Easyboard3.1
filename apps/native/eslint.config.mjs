import baseConfig from '@repo/eslint-config/native'

export default [
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json']
      }
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
  }
]
