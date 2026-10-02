// Ref: https://docs.expo.dev/workflow/configuration/#using-typescript-for-configuration-appconfigts-instead-of-appconfigjs

import * as dotenv from 'dotenv'
import { type ExpoConfig } from 'expo/config'
import * as path from 'path'

// Load environment variables from root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true })

export default (): ExpoConfig => ({
  owner: 'engineeringgood',
  name: 'EasyBoard_RN_Build',
  slug: 'EasyBoard-RN-Build',
  version: '1.0.0',
  extra: {
    settingsStoredKey: 'setting',
    userStorageKey: 'UserStorageData',
    googleMapsAPIIOS: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS,
    googleMapsAPIAndroid: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID,
    cityMapperAPI: '',
    eas: { projectId: 'f9d59e35-0f83-450d-ad37-273dce41a868' }
  },
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  plugins: [
    // Custom Android build filename plugin
    [
      './plugins/androidCustomFilename',
      {
        appName: 'EasyBoard'
      }
    ],
    'expo-router',
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
          enableShrinkResourcesInReleaseBuilds: false,
          enablePngCrunchInReleaseBuilds: true,

          networkInspector: true
        },
        ios: {
          deploymentTarget: '16.4',
          useFrameworks: 'static',
          networkInspector: true
        }
      }
    ],
    '@react-native-firebase/app',
    '@react-native-firebase/auth',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Allow Easyboard to use your location.',
        isIosBackgroundLocationEnabled: true,
        isAndroidBackgroundLocationEnabled: true,
        isAndroidForegroundServiceEnabled: true
      }
    ],
    'expo-font',
    'expo-secure-store',
    'expo-notifications',
    [
      'expo-splash-screen',
      {
        image: './assets/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff'
      }
    ]
  ],
  updates: { fallbackToCacheTimeout: 0 },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'org.engineeringgood.EasyBoard.RN',
    buildNumber: '2.21',
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS
    },
    googleServicesFile: './GoogleService-Info.plist',
    infoPlist: {
      NSAppTransportSecurity: { NSAllowsArbitraryLoads: true } // Enable HTTP requests
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFFFF'
    },
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID
      }
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
    package: 'org.engineeringgood.EasyBoard.RN',
    googleServicesFile: './google-services.json'
  },
  // Expo SDK 58's Rust (oxc) transform worker; files it cannot handle fall
  // back to Babel per file. Expo CLI reads the key, but SDK 58's ExpoConfig
  // type does not declare it yet.
  experiments: {
    noxcturnalTransformWorker: true
  } as ExpoConfig['experiments'],
  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/favicon.png'
  }
})
