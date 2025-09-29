import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants'
import { UserType } from './userService'
import auth from '@react-native-firebase/auth'
import messaging from '@react-native-firebase/messaging'

interface UserStorage {
  phoneNumber: string
  userType: UserType
  loggedAt: number // Unix timestamp when user last logged in
}

export const setUserStorage = async (
  userStorage: UserStorage
): Promise<void> => {
  try {
    await SecureStore.setItemAsync(
      Constants?.expoConfig?.extra?.userStorageKey,
      JSON.stringify(userStorage)
    )
  } catch (error) {
    console.error('Error saving user data:', error)
    throw error
  }
}

export const getUserStorage = async (): Promise<UserStorage | null> => {
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
}

export const clearUserStorage = async (): Promise<void> => {
  try {
    // Clear all stored keys
    const keysToDelete = [
      Constants?.expoConfig?.extra?.userStorageKey,
      Constants?.expoConfig?.extra?.settingsStoredKey,
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
    await Promise.all(
      keysToDelete.map((key) =>
        key
          ? SecureStore.deleteItemAsync(key).catch(() => {
              // Ignore errors for keys that don't exist
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
}

// Clear all Firebase-related data and tokens
export const clearFirebaseData = async (): Promise<void> => {
  try {
    // Clear FCM token
    try {
      await messaging().deleteToken()
      console.log('FCM token deleted')
    } catch (error) {
      console.log('FCM token deletion failed (non-fatal):', error)
    }

    // Clear any cached Firebase data
    try {
      // Clear Firebase Auth state
      await auth().signOut()
      console.log('Firebase Auth signed out')
    } catch (error) {
      console.log('Firebase Auth sign out failed (non-fatal):', error)
    }

    // Clear any other Firebase-related cached data
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
