// Web-friendly storage service using localStorage API

import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import type { UserType } from '../types'
import { signOut } from './authService.web'
import { getStorageInstance } from './firebase.web'

export interface UserStorage {
  phoneNumber: string
  userType: UserType | null
  loggedAt: number // Unix timestamp when user last logged in
}

// Match the keys from native app config
const USER_STORAGE_KEY = 'UserStorageData' // From native app.config.ts extra.userStorageKey
const SETTINGS_STORAGE_KEY = 'setting' // From native app.config.ts extra.settingsStoredKey

// Helper to safely access localStorage
const getStorage = (): Storage => {
  if (typeof window === 'undefined') {
    throw new Error('localStorage is not available in server-side context')
  }
  return window.localStorage
}

export const setUserStorage = async (
  userStorage: UserStorage
): Promise<void> => {
  try {
    const storage = getStorage()
    storage.setItem(USER_STORAGE_KEY, JSON.stringify(userStorage))
  } catch (error) {
    console.error('Error saving user data:', error)
    throw error
  }
}

export const getUserStorage = async (): Promise<UserStorage | null> => {
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
}

export const clearUserStorage = async (): Promise<void> => {
  try {
    const storage = getStorage()
    // Clear all stored keys
    const keysToDelete = [
      USER_STORAGE_KEY,
      SETTINGS_STORAGE_KEY,
      // Clear any FCM tokens or other cached data
      'fcmToken',
      'notificationToken',
      'recaptchaToken',
      'authToken',
      'sessionData',
      'userPreferences',
      'cachedLocation',
      'lastKnownLocation'
    ]

    // Delete all keys
    keysToDelete.forEach((key) => {
      try {
        storage.removeItem(key)
      } catch (_) {
        // Ignore errors for keys that don't exist
        console.log(`Key ${key} not found or already deleted`)
      }
    })

    console.log('All user data cleared successfully')
  } catch (error) {
    console.error('Error clearing user data:', error)
    throw error
  }
}

// Clear all Firebase-related data and tokens
export const clearFirebaseData = async (): Promise<void> => {
  try {
    const storage = getStorage()
    // Clear any Firebase-related cached data
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

    // Sign out from Firebase Auth
    await signOut()

    console.log('Firebase data cleared successfully')
  } catch (error) {
    console.error('Error clearing Firebase data:', error)
    // Don't throw error as this is cleanup
  }
}

// Complete logout - clears everything
export const completeLogout = async (): Promise<void> => {
  try {
    // Clear all local storage
    await clearUserStorage()

    // Clear all Firebase data
    await clearFirebaseData()

    console.log('Complete logout successful - all data cleared')
  } catch (error) {
    console.error('Error during complete logout:', error)
    throw error
  }
}

// Helper function to check if session is expired - self-contained
export const isSessionExpired = async (
  expiryDays: number = 30
): Promise<boolean> => {
  try {
    const userData = await getUserStorage()
    if (!userData || !userData.loggedAt) {
      return false
    }
    const expiryTime = userData.loggedAt + expiryDays * 24 * 60 * 60 * 1000 // Convert days to milliseconds
    return Date.now() > expiryTime
  } catch (error) {
    console.error('Error checking session expiry:', error)
    return false // Default to not expired if there's an error
  }
}

// Store appData in localStorage (web-specific)
export const setAppDataStorage = async (appData: any): Promise<void> => {
  try {
    const storage = getStorage()
    storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(appData))
  } catch (error) {
    console.error('Error saving app data:', error)
    throw error
  }
}

// Retrieve appData from localStorage (web-specific)
export const getAppDataStorage = async (): Promise<any | null> => {
  try {
    const storage = getStorage()
    const data = storage.getItem(SETTINGS_STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Error retrieving app data:', error)
    return null
  }
}

/**
 * Converts a blob URL to a File object
 */
async function blobUrlToFile(blobUrl: string): Promise<File> {
  const response = await fetch(blobUrl)
  const blob = await response.blob()

  // Extract filename from blob URL or use default
  const filename = blobUrl.split('/').pop()?.split('?')[0] || 'image.jpg'

  return new File([blob], filename, { type: blob.type || 'image/jpeg' })
}

/**
 * Uploads an image file to Firebase Storage
 * @param file - File object or blob URL string
 * @param path - Storage path (e.g., 'users/{phoneNumber}/locations/{locationId}.jpg')
 * @returns Download URL
 */
export async function uploadImageToStorage(
  file: File | string,
  path: string
): Promise<string> {
  try {
    const storage = getStorageInstance()

    // Convert blob URL to File if needed
    let fileObj: File
    if (typeof file === 'string') {
      if (file.startsWith('blob:')) {
        fileObj = await blobUrlToFile(file)
      } else {
        // If it's already a URL (not a blob), return it
        return file
      }
    } else {
      fileObj = file
    }

    // Create storage reference
    const storageRef = ref(storage, path)

    // Upload file
    await uploadBytes(storageRef, fileObj)

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef)

    return downloadURL
  } catch (error) {
    console.error('Error uploading image to Firebase Storage:', error)
    throw error
  }
}

/**
 * Uploads a location photo to Firebase Storage
 * Automatically generates a path based on user phone number and location type
 */
export async function uploadLocationPhoto(
  imageUri: string,
  locationType: string
): Promise<string> {
  try {
    const userStorage = await getUserStorage()
    if (!userStorage?.phoneNumber) {
      throw new Error('No user phone number found')
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${locationType.toLowerCase()}_${timestamp}.jpg`
    const path = `users/${userStorage.phoneNumber}/locations/${filename}`

    return await uploadImageToStorage(imageUri, path)
  } catch (error) {
    console.error('Error uploading location photo:', error)
    throw error
  }
}
