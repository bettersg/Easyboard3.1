// Ref: https://docs.expo.dev/workflow/configuration/#using-typescript-for-configuration-appconfigts-instead-of-appconfigjs
import { ExpoConfig, ConfigContext } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  owner: 'engineeringgood',
  name: 'EasyBoard_RN_Build',
  slug: 'EasyBoard-RN-Build',
  privacy: 'unlisted',
  version: '1.0.0',
  extra: {
    settingsStoredKey: 'setting',
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
          buildToolsVersion: '34.0.0'
        },
        ios: { deploymentTarget: '15.1' }
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
    newArchEnabled: true
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFFFF'
    },
    config: {
      googleMaps: { apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY }
    },
    permissions: ['android.permission.RECORD_AUDIO'],
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    package: 'org.engineeringgood.EasyBoard.RN',
    newArchEnabled: true
  },
  web: { favicon: './assets/favicon.png' }
})
