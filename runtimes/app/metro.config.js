// Learn more https://docs.expo.io/guides/customizing-metro
// Expo configures monorepo watch folders and node_modules lookup itself
// (SDK 52+): https://docs.expo.dev/guides/monorepos
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const fs = require('fs')
const path = require('path')

const projectRoot = __dirname

const config = getDefaultConfig(projectRoot)

// Exclude native build output from being watched/bundled; it changes during
// builds and holds no source code
const blockListPatterns = [
  path.resolve(projectRoot, 'ios'),
  path.resolve(projectRoot, 'android')
].map(
  (folder) => new RegExp(`${folder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/.*`)
)

config.resolver.blockList = [
  ...[].concat(config.resolver.blockList ?? []),
  ...blockListPatterns
]

// Configure resolver to handle packages with missing react-native field
config.resolver.resolverMainFields = ['react-native', 'browser', 'main']
config.resolver.platforms.push('native')

const originalResolveRequest = config.resolver.resolveRequest
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle @nandorojo/iconic - use main field instead of react-native field
  if (moduleName === '@nandorojo/iconic') {
    const packageJsonPath = require.resolve('@nandorojo/iconic/package.json', {
      paths: [projectRoot]
    })
    const packageJson = require(packageJsonPath)
    if (packageJson.main) {
      const mainPath = path.resolve(
        path.dirname(packageJsonPath),
        packageJson.main
      )
      if (fs.existsSync(mainPath)) {
        return {
          type: 'sourceFile',
          filePath: mainPath
        }
      }
    }
  }

  // Fall back to default resolver
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform)
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = withNativeWind(config, {
  input: './global.css',
  inlineRem: 16
})
