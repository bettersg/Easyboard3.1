// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// Bundle optimization
config.transformer.minifierConfig = {
  keep_fnames: false,
  mangle: {
    keep_fnames: false
  }
}

// Remove unused code
config.transformer.unstable_allowRequireContext = false

// Optimize bundle size
config.resolver.platforms = ['ios', 'android', 'native', 'web']

module.exports = config
