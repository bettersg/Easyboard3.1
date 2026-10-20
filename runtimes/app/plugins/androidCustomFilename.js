const { withAppBuildGradle } = require('@expo/config-plugins')

/**
 * Simple plugin to customize Android build filenames
 */
const withAndroidBuildFilename = (config, options = {}) => {
  const {
    appName = 'EasyBoard'
  } = options

  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const filenameConfig = `
// Custom APK filename
android.applicationVariants.all { variant ->
    variant.outputs.all { output ->
        def timestamp = new Date().format('yyyyMMddHHmm')
        def buildType = variant.buildType.name
        def versionName = variant.versionName

        def filename = "${appName}_\${buildType}_\${versionName}_\${timestamp}.apk"
        outputFileName = filename
    }
}
`

      // Add the configuration to the android block
      const androidBlockEnd = config.modResults.contents.lastIndexOf('}')
      if (androidBlockEnd !== -1) {
        config.modResults.contents =
          config.modResults.contents.slice(0, androidBlockEnd) +
          filenameConfig +
          '\n' +
          config.modResults.contents.slice(androidBlockEnd)
      }
    }
    return config
  })
}

module.exports = withAndroidBuildFilename
