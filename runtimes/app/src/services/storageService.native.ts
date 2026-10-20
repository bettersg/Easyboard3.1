import { getAuth, signOut } from '@react-native-firebase/auth'
import { deleteToken, getMessaging } from '@react-native-firebase/messaging'
import {
  getDownloadURL,
  getStorage,
  putFile,
  ref
} from '@react-native-firebase/storage'
import Constants from 'expo-constants'
import * as SecureStore from 'expo-secure-store'
import type { PWIDUser, UserStorage } from '../types'
import type { IStorageService } from './storageService'

export const storageService: IStorageService = {
  setUserStorage: async (userStorage: UserStorage) => {
    try {
      await SecureStore.setItemAsync(
        Constants?.expoConfig?.extra?.userStorageKey,
        JSON.stringify(userStorage)
      )
    } catch (error) {
      console.error('Error saving user data:', error)
      throw error
    }
  },

  getUserStorage: async () => {
    try {
      const storedData = await SecureStore.getItemAsync(
        Constants?.expoConfig?.extra?.userStorageKey
      )
      if (storedData) {
        return JSON.parse(storedData)
      }
      return null
    } catch (error) {
      console.error('Error getting user data:', error)
      throw error
    }
  },

  clearUserStorage: async () => {
    try {
      const keysToDelete = [
        Constants?.expoConfig?.extra?.userStorageKey,
        Constants?.expoConfig?.extra?.settingsStoredKey,
        'fcmToken',
        'notificationToken',
        'recaptchaToken',
        'authToken',
        'sessionData',
        'userPreferences',
        'cachedLocation',
        'lastKnownLocation'
      ]
      await Promise.all(
        keysToDelete.map((key) =>
          key
            ? SecureStore.deleteItemAsync(key).catch(() => {
                console.log(`Key ${key} not found or already deleted`)
              })
            : Promise.resolve()
        )
      )
      console.log('All user data cleared successfully')
    } catch (error) {
      console.error('Error clearing user data:', error)
      throw error
    }
  },

  clearFirebaseData: async () => {
    try {
      try {
        await deleteToken(getMessaging())
      } catch (error) {
        console.log('FCM token deletion failed (non-fatal):', error)
      }
      try {
        await signOut(getAuth())
      } catch (error) {
        console.log('Firebase Auth sign out failed (non-fatal):', error)
      }
      const firebaseKeys = [
        'firebaseToken',
        'firebaseAuthState',
        'firebaseUserData',
        'firebaseConfig',
        'firebaseInstanceId'
      ]
      await Promise.all(
        firebaseKeys.map((key) =>
          SecureStore.deleteItemAsync(key).catch(() => {
            console.log(`Firebase key ${key} not found or already deleted`)
          })
        )
      )
      console.log('Firebase data cleared successfully')
    } catch (error) {
      console.error('Error clearing Firebase data:', error)
    }
  },

  completeLogout: async () => {
    try {
      await storageService.clearUserStorage()
      await storageService.clearFirebaseData()
      console.log('Complete logout successful - all data cleared')
    } catch (error) {
      console.error('Error during complete logout:', error)
      throw error
    }
  },

  isSessionExpired: async (expiryDays: number = 30) => {
    try {
      const userData = await storageService.getUserStorage()
      if (!userData || !userData.loggedAt) {
        return false
      }
      const expiryTime = userData.loggedAt + expiryDays * 24 * 60 * 60 * 1000
      return Date.now() > expiryTime
    } catch (error) {
      console.error('Error checking session expiry:', error)
      return false
    }
  },

  uploadLocationPhoto: async (imageUri: string, locationType: string) => {
    try {
      const userStorage = await storageService.getUserStorage()
      if (!userStorage?.phoneNumber) {
        throw new Error('No user phone number found')
      }
      const timestamp = Date.now()
      const filename = `${locationType.toLowerCase()}_${timestamp}.jpg`
      const path = `users/${userStorage.uid}/locations/${filename}`
      const reference = ref(getStorage(), path)
      await putFile(reference, imageUri)
      return path
    } catch (error) {
      console.error('Error uploading location photo:', error)
      throw error
    }
  },

  getPhotoDownloadUrl: async (fileKey: string) => {
    try {
      if (fileKey.startsWith('http://') || fileKey.startsWith('https://')) {
        return fileKey
      }
      if (fileKey.startsWith('file://')) {
        return fileKey
      }
      const reference = ref(getStorage(), fileKey)
      return await getDownloadURL(reference)
    } catch (error) {
      console.error('Error getting photo download URL:', error)
      throw error
    }
  }
} satisfies IStorageService

// Export individual functions for backward compatibility
export const setUserStorage = storageService.setUserStorage
export const getUserStorage = storageService.getUserStorage
export const clearUserStorage = storageService.clearUserStorage
export const clearFirebaseData = storageService.clearFirebaseData
export const completeLogout = storageService.completeLogout
export const isSessionExpired = storageService.isSessionExpired
export const uploadLocationPhoto = storageService.uploadLocationPhoto
export const getPhotoDownloadUrl = storageService.getPhotoDownloadUrl

export type { PWIDUser, UserStorage }
