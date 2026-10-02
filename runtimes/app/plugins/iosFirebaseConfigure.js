const { withAppDelegate } = require('@expo/config-plugins')

/**
 * Calls FirebaseApp.configure() in the iOS AppDelegate.
 *
 * @react-native-firebase/app's plugin inserts it before
 * `factory.startReactNative(`, but Expo SDK 58's scene-based AppDelegate
 * starts React Native from SceneDelegate instead, so that plugin skips the
 * call ("Unable to determine correct Firebase insertion point"). Remove this
 * plugin once RN Firebase handles the SDK 58 template.
 */
const withIosFirebaseConfigure = (config) =>
  withAppDelegate(config, (config) => {
    if (config.modResults.language !== 'swift') {
      return config
    }

    let contents = config.modResults.contents
    if (contents.includes('FirebaseApp.configure()')) {
      return config
    }

    if (!contents.includes('import FirebaseCore')) {
      contents = `import FirebaseCore\n${contents}`
    }

    const launchMatcher =
      /didFinishLaunchingWithOptions launchOptions: \[UIApplication\.LaunchOptionsKey: Any\]\? = nil\s*\) -> Bool \{\n/
    if (!launchMatcher.test(contents)) {
      throw new Error(
        '[iosFirebaseConfigure] Could not find didFinishLaunchingWithOptions in AppDelegate.swift'
      )
    }
    contents = contents.replace(
      launchMatcher,
      (match) => `${match}    FirebaseApp.configure()\n`
    )

    config.modResults.contents = contents
    return config
  })

module.exports = withIosFirebaseConfigure
