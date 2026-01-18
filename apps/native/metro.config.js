// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const exclusionList = require('metro-config/src/defaults/exclusionList')
const path = require('path')

// Find the workspace root, this can be replaced with `find-yarn-workspace-root`
const workspaceRoot = path.resolve(__dirname, '../..')
const projectRoot = __dirname

const config = getDefaultConfig(projectRoot)

// Exclude build artifact folders from being watched/bundled
// These folders change frequently during builds but don't contain source code
const blockListPatterns = [
  // Native build artifacts
  path.resolve(workspaceRoot, 'apps/native/ios'),
  path.resolve(workspaceRoot, 'apps/native/android'),
  // Web build artifacts
  path.resolve(workspaceRoot, 'apps/web/.next'),
  // Any .next folders
  path.resolve(workspaceRoot, '.next')
].map(
  (folder) => new RegExp(`${folder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/.*`)
)

// Configure blockList to exclude build artifacts
config.resolver.blockList = exclusionList(blockListPatterns)

// Configure resolver to handle packages with missing react-native field
config.resolver.resolverMainFields = ['react-native', 'browser', 'main']
config.resolver.platforms.push('native')

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot, path.resolve(workspaceRoot, 'packages')]
// 2. Let Metro know where to resolve packages, and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules')
]
// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true
// 4. Explicitly map workspace packages for Metro resolution
config.resolver.extraNodeModules = {
  '@repo/common': path.resolve(workspaceRoot, 'packages/common')
}
// 5. Custom resolver to handle package.json exports field
const fs = require('fs')
const originalResolveRequest = config.resolver.resolveRequest
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle @repo/common subpath exports (e.g., @repo/common/components, @repo/common/pages)
  if (moduleName.startsWith('@repo/common/')) {
    const subpath = moduleName.replace('@repo/common/', '')
    const commonPackagePath = path.resolve(workspaceRoot, 'packages/common')

    // Map exports subpaths to actual file paths based on package.json exports
    const exportsMap = {
      components: path.resolve(commonPackagePath, 'src/components/index.ts'),
      pages: path.resolve(commonPackagePath, 'src/pages/index.ts'),
      provider: path.resolve(commonPackagePath, 'src/provider/index.tsx'),
      contexts: path.resolve(commonPackagePath, 'src/contexts/index.ts'),
      services: path.resolve(commonPackagePath, 'src/services/index.ts'),
      types: path.resolve(commonPackagePath, 'src/types/index.ts'),
      hooks: path.resolve(commonPackagePath, 'src/hooks/index.ts')
    }

    if (exportsMap[subpath]) {
      const filePath = exportsMap[subpath]
      // Verify file exists before resolving
      if (fs.existsSync(filePath)) {
        return {
          type: 'sourceFile',
          filePath: filePath
        }
      }
    }
  }

  // Handle @nandorojo/iconic - use main field instead of react-native field
  if (moduleName === '@nandorojo/iconic') {
    const packagePath = path.resolve(
      workspaceRoot,
      'node_modules/@nandorojo/iconic'
    )
    const packageJsonPath = path.join(packagePath, 'package.json')
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = require(packageJsonPath)
      // Use main field (lib/commonjs/index.js) instead of react-native field
      if (packageJson.main) {
        const mainPath = path.resolve(packagePath, packageJson.main)
        if (fs.existsSync(mainPath)) {
          return {
            type: 'sourceFile',
            filePath: mainPath
          }
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

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true
  }
})

module.exports = withNativeWind(config, {
  input: './global.css',
  inlineRem: 16
})
