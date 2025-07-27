import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants'
import { UserType } from './userService'

interface UserStorage {
  phoneNumber: string
  userType: UserType
  loggedAt: number // Unix timestamp when user last logged in
}

export const setUserStorage = async (userStorage: UserStorage): Promise<void> => {
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
    await SecureStore.deleteItemAsync(
      Constants?.expoConfig?.extra?.userStorageKey
    )
  } catch (error) {
    console.error('Error clearing user data:', error)
    throw error
  }
}

// Helper function to check if session is expired - self-contained
export const isSessionExpired = async (expiryDays: number = 30): Promise<boolean> => {
  try {
    const userData = await getUserStorage();
    if (!userData || !userData.loggedAt) {
      return false;
    }
    const expiryTime = userData.loggedAt + (expiryDays * 24 * 60 * 60 * 1000); // Convert days to milliseconds
    return Date.now() > expiryTime;
  } catch (error) {
    console.error('Error checking session expiry:', error);
    return false; // Default to not expired if there's an error
  }
} 