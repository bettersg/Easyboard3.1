// Ref: https://docs.expo.dev/workflow/configuration/#using-typescript-for-configuration-appconfigts-instead-of-appconfigjs
import { ExpoConfig, ConfigContext } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  owner: 'engineeringgood',
  name: 'EasyBoard_RN_Build',
  slug: 'EasyBoard-RN-Build',
  version: '1.0.0',
  extra: {
    settingsStoredKey: 'setting',
    userStorageKey: 'UserStorageData',
    googleMapsAPI: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    cityMapperAPI: '',
    eas: { projectId: 'f9d59e35-0f83-450d-ad37-273dce41a868' }
  },
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  plugins: [
    // Custom Android build filename plugin
    [
      './plugins/androidCustomFilename',
      {
        appName: 'EasyBoard'
      }
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Allow the app to access the gallery.',
        cameraPermission: 'Allow the app to access the camera to take photos.'
      }
    ],
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          buildToolsVersion: '34.0.0',
          extraMavenRepos: [
            '../../node_modules/@notifee/react-native/android/libs'
          ],
          enableShrinkResourcesInReleaseBuilds: false,
          enableProguardInReleaseBuilds: false,
          enablePngCrunchInReleaseBuilds: true,

          networkInspector: true
        },
        ios: {
          deploymentTarget: '15.1',
          useFrameworks: 'static',
          networkInspector: true
        }
      }
    ],
    '@react-native-firebase/app',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Allow Easyboard to use your location.',
        isIosBackgroundLocationEnabled: true,
        isAndroidBackgroundLocationEnabled: true,
        isAndroidForegroundServiceEnabled: true
      }
    ]
  ],
  updates: { fallbackToCacheTimeout: 0 },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'org.engineeringgood.EasyBoard.RN',
    buildNumber: '2.21',
    config: { googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY },
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    newArchEnabled: true,
    googleServicesFile: './GoogleService-Info.plist'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFFFF'
    },
    config: {
      googleMaps: { apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY }
    },
    permissions: [
      'android.permission.RECORD_AUDIO',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_BACKGROUND_LOCATION',
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE'
    ],
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    package: 'org.engineeringgood.EasyBoard.RN',
    newArchEnabled: true,
    googleServicesFile: './google-services.json'
  },
  web: { favicon: './assets/favicon.png' }
})
