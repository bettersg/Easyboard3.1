// Web-friendly storage service using localStorage API
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import type { UserStorage } from '../types'
import { signOut } from './authService.web'
import { getStorageInstance } from './firebase.web'
import type { IStorageService } from './storageService'

// Match the keys from native app config
const USER_STORAGE_KEY = 'UserStorageData'
const SETTINGS_STORAGE_KEY = 'setting'

// Helper to safely access localStorage
const getStorage = (): Storage => {
  if (typeof window === 'undefined') {
    throw new Error('localStorage is not available in server-side context')
  }
  return window.localStorage
}

/**
 * Converts a blob URL to a File object
 */
async function blobUrlToFile(blobUrl: string): Promise<File> {
  const response = await fetch(blobUrl)
  const blob = await response.blob()
  const filename = blobUrl.split('/').pop()?.split('?')[0] || 'image.jpg'
  return new File([blob], filename, { type: blob.type || 'image/jpeg' })
}

/**
 * Uploads an image file to Firebase Storage
 */
async function uploadImageToStorage(
  file: File | string,
  path: string
): Promise<string> {
  try {
    const storage = getStorageInstance()
    let fileObj: File
    if (typeof file === 'string') {
      if (file.startsWith('blob:')) {
        fileObj = await blobUrlToFile(file)
      } else {
        return file
      }
    } else {
      fileObj = file
    }
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, fileObj)
    return path
  } catch (error) {
    console.error('Error uploading image to Firebase Storage:', error)
    throw error
  }
}

export const storageService: IStorageService = {
  setUserStorage: async (userStorage: UserStorage) => {
    try {
      const storage = getStorage()
      storage.setItem(USER_STORAGE_KEY, JSON.stringify(userStorage))
    } catch (error) {
      console.error('Error saving user data:', error)
      throw error
    }
  },

  getUserStorage: async () => {
    try {
      const storage = getStorage()
      const storedData = storage.getItem(USER_STORAGE_KEY)
      if (storedData) {
        return JSON.parse(storedData)
      }
      return null
    } catch (error) {
      console.error('Error getting user data:', error)
      return null
    }
  },

  clearUserStorage: async () => {
    try {
      const storage = getStorage()
      const keysToDelete = [
        USER_STORAGE_KEY,
        SETTINGS_STORAGE_KEY,
        'fcmToken',
        'notificationToken',
        'recaptchaToken',
        'authToken',
        'sessionData',
        'userPreferences',
        'cachedLocation',
        'lastKnownLocation'
      ]
      keysToDelete.forEach((key) => {
        try {
          storage.removeItem(key)
        } catch (_) {
          console.log(`Key ${key} not found or already deleted`)
        }
      })
      console.log('All user data cleared successfully')
    } catch (error) {
      console.error('Error clearing user data:', error)
      throw error
    }
  },

  clearFirebaseData: async () => {
    try {
      const storage = getStorage()
      const firebaseKeys = [
        'firebaseToken',
        'firebaseAuthState',
        'firebaseUserData',
        'firebaseConfig',
        'firebaseInstanceId'
      ]
      firebaseKeys.forEach((key) => {
        try {
          storage.removeItem(key)
        } catch (_) {
          console.log(`Firebase key ${key} not found or already deleted`)
        }
      })
      await signOut()
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
      return await uploadImageToStorage(imageUri, path)
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
      const storage = getStorageInstance()
      const storageRef = ref(storage, fileKey)
      return await getDownloadURL(storageRef)
    } catch (error) {
      console.error('Error getting photo download URL:', error)
      throw error
    }
  }
} satisfies IStorageService

// Export individual functions for backward compatibility
export const {
  setUserStorage,
  getUserStorage,
  clearUserStorage,
  clearFirebaseData,
  completeLogout,
  isSessionExpired,
  uploadLocationPhoto,
  getPhotoDownloadUrl
} = storageService

export type { UserStorage }
