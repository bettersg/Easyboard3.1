// github.com/nandorojo/solito/blob/master/example-monorepos/blank/apps/next/next.config.js
// React Native Reanimated Next.js example:
// https://github.com/software-mansion/react-native-reanimated/blob/main/apps/next-example/next.config.js
import webpack from 'webpack'

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * @type {import('next').NextConfig}
 */
const withWebpack = {
  webpack(config) {
    if (!config.resolve) {
      config.resolve = {}
    }

    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native': 'react-native-web',
      'react-native$': 'react-native-web',
      'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter$':
        'react-native-web/dist/vendor/react-native/NativeEventEmitter/RCTDeviceEventEmitter',
      'react-native/Libraries/vendor/emitter/EventEmitter$':
        'react-native-web/dist/vendor/react-native/emitter/EventEmitter',
      'react-native/Libraries/EventEmitter/NativeEventEmitter$':
        'react-native-web/dist/vendor/react-native/NativeEventEmitter'
    }

    config.resolve.extensions = [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      ...(config.resolve?.extensions ?? [])
    ]

    // Define global as globalThis for browser environment
    config.plugins = config.plugins || []
    config.plugins.push(
      new webpack.DefinePlugin({
        global: 'globalThis'
      })
    )

    return config
  }
}

/**
 * @type {import('next').NextConfig}
 */
const withTurbopack = {
  turbopack: {
    resolveAlias: {
      'react-native$': 'react-native-web',
      'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter$':
        'react-native-web/dist/vendor/react-native/NativeEventEmitter/RCTDeviceEventEmitter',
      'react-native/Libraries/vendor/emitter/EventEmitter$':
        'react-native-web/dist/vendor/react-native/emitter/EventEmitter',
      'react-native/Libraries/EventEmitter/NativeEventEmitter$':
        'react-native-web/dist/vendor/react-native/NativeEventEmitter'
    },
    resolveExtensions: [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      '.js',
      '.mjs',
      '.tsx',
      '.ts',
      '.jsx',
      '.json',
      '.wasm'
    ],
    root: path.resolve(__dirname, '../..')
  }
}

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  transpilePackages: [
    'react-native',
    'react-native-web',
    'app',
    'nativewind',
    'react-native-gesture-handler',
    'react-native-reanimated',
    'react-native-css-interop',
    '@react-navigation',
    '@expo/vector-icons',
    'react-native-worklets',
    'react-native-actions-sheet',
    'react-native-safe-area-context',
    'react-native-svg',
    'solito',
    'moti',
    '@repo/common',
    'expo-image-picker',
    'expo-image-loader',
    'expo-modules-core'
  ],

  compiler: {
    define: {
      __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production')
    }
  },
  experimental: {
    forceSwcTransforms: true
  },
  typescript: {
    ignoreBuildErrors: true // do not do this in prod
  },
  images: { unoptimized: true },
  reactStrictMode: false, // reanimated doesn't support this on web

  ...withWebpack,
  ...withTurbopack
}

export default nextConfig
