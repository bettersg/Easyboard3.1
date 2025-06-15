import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants'
import { UserType } from './userService'

interface UserStoredData {
  phoneNumber: string
  userType: UserType
}


export const setUserData = async (userStoredData: UserStoredData): Promise<void> => {
  try {
    await SecureStore.setItemAsync(
      Constants?.expoConfig?.extra?.userStoredKey,
      JSON.stringify(userStoredData)
    )
  } catch (error) {
    console.error('Error saving user data:', error)
    throw error
  }
}

export const getUserData = async (): Promise<UserStoredData | null> => {
  try {
    const storedData = await SecureStore.getItemAsync(
      Constants?.expoConfig?.extra?.userStoredKey
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

export const clearUserData = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(
      Constants?.expoConfig?.extra?.userStoredKey
    )
  } catch (error) {
    console.error('Error clearing user data:', error)
    throw error
  }
} 