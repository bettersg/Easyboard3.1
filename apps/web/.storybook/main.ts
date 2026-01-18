/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path')

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): string {
  return path.dirname(require.resolve(`${value}/package.json`))
}

/** @type{import("@storybook/react-webpack5").StorybookConfig} */
const config = {
  stories: [
    '../../../packages/common/src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-webpack5-compiler-swc',
    {
      name: '@storybook/addon-react-native-web',
      options: {
        babelPresetReactNativeOptions: {
          babelrc: false,
          configFile: false
        },
        modulesToTranspile: [
          'react-native-reanimated',
          'nativewind',
          'react-native-css-interop'
        ],
        babelPresets: ['nativewind/babel'],
        babelPresetReactOptions: { jsxImportSource: 'nativewind' },
        babelPlugins: [
          'react-native-reanimated/plugin',
          [
            '@babel/plugin-transform-react-jsx',
            {
              runtime: 'automatic',
              importSource: 'nativewind'
            }
          ]
        ]
      }
    }
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-webpack5'),
    options: {}
  },
  babel: async (options: any) => {
    return {
      ...options,
      babelrc: false,
      configFile: path.resolve(__dirname, 'babel.config.js')
    }
  },
  // staticDirs: ['../public'],
  webpackFinal: async (config) => {
    // Use tty-browserify polyfill for Node.js tty module
    config.resolve = config.resolve || {}
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      tty: require.resolve('tty-browserify')
    }

    // Transpile TypeScript files from packages/ui BEFORE Storybook's docgen loaders
    // This must run first to convert TS to JS before docgen tries to parse it
    config.module = config.module || {}
    config.module.rules = config.module.rules || []

    // Nuclear Babel isolation:
    // Force all babel-loader rules to ignore root config and use storybook's local config
    const localBabelConfig = path.resolve(__dirname, 'babel.config.js')
    config.module.rules.forEach((rule: any) => {
      if (!rule) return

      const isBabelLoader = (l: any) =>
        l === 'babel-loader' ||
        (typeof l === 'object' && l.loader && l.loader.includes('babel-loader'))

      const patchOptions = (options: any) => {
        return {
          ...options,
          babelrc: false,
          configFile: localBabelConfig
        }
      }

      if (rule.loader && isBabelLoader(rule.loader)) {
        rule.options = patchOptions(rule.options)
      } else if (rule.use) {
        if (Array.isArray(rule.use)) {
          rule.use.forEach((l: any) => {
            if (isBabelLoader(l)) {
              if (typeof l === 'object') {
                l.options = patchOptions(l.options)
              }
            }
          })
        } else if (isBabelLoader(rule.use)) {
          if (typeof rule.use === 'object') {
            rule.use.options = patchOptions(rule.use.options)
          }
        }
      }
    })

    const packagesUiPath = path.resolve(
      __dirname,
      '../../../packages/common/src'
    )

    // Insert this rule at the beginning to ensure it runs before other loaders
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      include: packagesUiPath,
      use: {
        loader: 'babel-loader',
        options: {
          babelrc: false,
          configFile: localBabelConfig,
          presets: [
            '@babel/preset-typescript',
            '@babel/preset-react',
            'nativewind/babel'
          ],
          plugins: [
            [
              '@babel/plugin-transform-react-jsx',
              {
                runtime: 'automatic',
                importSource: 'nativewind'
              }
            ],
            'react-native-reanimated/plugin'
          ]
        }
      }
    })

    config.module.rules.push({
      test: /\.css$/,
      use: [
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [
                require('tailwindcss')({
                  config: path.resolve(__dirname, '../tailwind.config.ts')
                }),
                require('autoprefixer')
              ]
            }
          }
        }
      ],
      include: path.resolve(__dirname, '../../../') // path to project root
    })

    // Exclude .native files from web build
    config.module.rules.push({
      test: /\.native\.(js|jsx|ts|tsx)$/,
      use: 'null-loader'
    })

    config.resolve.alias = config.resolve.alias || {}

    // Clean up conflicting DefinePlugin instances from addon-react-native-web
    // and other plugins that might cause 'Conflicting values for process.env'
    config.plugins = config.plugins.filter((plugin: any) => {
      if (plugin.constructor.name === 'DefinePlugin') {
        const definitions = plugin.definitions || {}
        // If it looks like the problematic reanimated/addon-react-native-web DefinePlugin
        if (
          definitions.process &&
          definitions.process.env &&
          Object.keys(definitions.process).length === 1
        ) {
          return false
        }
      }
      return true
    })

    return config
  }
}
module.exports = config
