import { getApp } from '@react-native-firebase/app'
import {
  equalTo,
  get,
  getDatabase,
  onValue,
  orderByChild,
  query,
  ref,
  remove,
  set
} from '@react-native-firebase/database'
import DeviceInfo from 'react-native-device-info'
import type {
  CaregiverUser,
  PWIDUser,
  UserData,
  UserLocation,
  UserType
} from '../types'
import type { IUserService } from './userService'

/**
 * Ensure Firebase is initialized before using Database
 */
function ensureFirebaseInitialized(): void {
  try {
    const app = getApp()
    if (!app) {
      throw new Error('Firebase app is not initialized')
    }
  } catch (error) {
    console.error('Firebase initialization error:', error)
    throw new Error(
      'Firebase is not initialized. Make sure @react-native-firebase/app plugin is configured in app.config.ts and google-services.json is present.'
    )
  }
}

export const userService: IUserService = {
  createUser: async (
    phoneNumber: string,
    userType: UserType,
    uid: string,
    initialData: Partial<UserData> = {}
  ): Promise<UserData> => {
    ensureFirebaseInitialized()
    try {
      const deviceName = await DeviceInfo.getDeviceName()
      const timestamp = Date.now()
      if (userType === 'PWID') {
        const pwidData: PWIDUser = {
          uid,
          name: initialData.name || '',
          phoneNumber,
          userType: 'PWID',
          deviceName,
          createdAt: timestamp,
          updatedAt: timestamp,
          ...(initialData as Partial<PWIDUser>)
        }
        await set(ref(getDatabase(), `users/${phoneNumber}`), pwidData)
        return pwidData
      } else {
        const caregiverData: CaregiverUser = {
          uid,
          name: initialData.name || '',
          phoneNumber,
          userType: 'CAREGIVER',
          deviceName,
          createdAt: timestamp,
          updatedAt: timestamp,
          ...(initialData as Partial<CaregiverUser>)
        }
        await set(ref(getDatabase(), `users/${phoneNumber}`), caregiverData)
        return caregiverData
      }
    } catch (error) {
      console.error('Error creating user in database:', error)
      throw error
    }
  },

  updatePWIDLocation: async (phoneNumber: string, location: UserLocation) => {
    try {
      await set(ref(getDatabase(), `users/${phoneNumber}/location`), location)
      await set(
        ref(getDatabase(), `users/${phoneNumber}/updatedAt`),
        Date.now()
      )
    } catch (error) {
      console.error('Error updating PWID location:', error)
      throw error
    }
  },

  clearPWIDLocation: async (phoneNumber: string) => {
    try {
      await remove(ref(getDatabase(), `users/${phoneNumber}/location`))
      await set(
        ref(getDatabase(), `users/${phoneNumber}/updatedAt`),
        Date.now()
      )
    } catch (error) {
      console.error('Error clearing PWID location:', error)
      throw error
    }
  },

  getUserData: async (phoneNumber: string) => {
    try {
      const snapshot = await get(ref(getDatabase(), `users/${phoneNumber}`))
      return snapshot.val()
    } catch (error) {
      console.error('Error getting user data:', error)
      throw error
    }
  },

  updatePWIDCaregiver: async (pwidPhone: string, caregiverPhone: string) => {
    try {
      await set(
        ref(getDatabase(), `users/${pwidPhone}/caregiverPhone`),
        caregiverPhone
      )
      await set(ref(getDatabase(), `users/${pwidPhone}/updatedAt`), Date.now())
    } catch (error) {
      console.error('Error updating PWID caregiver:', error)
      throw error
    }
  },

  storeFCMToken: async (phoneNumber: string, fcmToken: string) => {
    try {
      await set(ref(getDatabase(), `users/${phoneNumber}/fcmToken`), fcmToken)
      await set(
        ref(getDatabase(), `users/${phoneNumber}/updatedAt`),
        Date.now()
      )
    } catch (error) {
      console.error('Error storing FCM token:', error)
      throw error
    }
  },

  getFCMToken: async (phoneNumber: string) => {
    try {
      const snapshot = await get(
        ref(getDatabase(), `users/${phoneNumber}/fcmToken`)
      )
      return snapshot.val()
    } catch (error) {
      console.error('Error getting FCM token for user:', error)
      throw error
    }
  },

  listenToPWIDLocation: (phoneNumber, callback) => {
    const locationRef = ref(getDatabase(), `users/${phoneNumber}/location`)
    return onValue(locationRef, (snapshot) => callback(snapshot.val()))
  },

  getPWIDsByCaregiverPhone: async (caregiverPhone: string) => {
    const snapshot = await get(
      query(
        ref(getDatabase(), 'users'),
        orderByChild('caregiverPhone'),
        equalTo(caregiverPhone)
      )
    )

    const pwidUsers: PWIDUser[] = []
    snapshot.forEach((child) => {
      const val = child.val()
      if (val && val.userType === 'PWID') {
        pwidUsers.push(val as PWIDUser)
      }
      return undefined
    })
    return pwidUsers
  },

  updateUserData: async (phoneNumber: string, updates: Partial<UserData>) => {
    try {
      const userRef = ref(getDatabase(), `users/${phoneNumber}`)
      const snapshot = await get(userRef)
      const timestamp = Date.now()
      const updatedData = {
        ...(snapshot.exists() ? snapshot.val() : {}),
        ...updates,
        updatedAt: timestamp
      }
      await set(userRef, updatedData)
    } catch (error) {
      console.error('Error updating user data:', error)
      throw error
    }
  }
} satisfies IUserService

// Export individual functions for backward compatibility
export const {
  createUser,
  updatePWIDLocation,
  clearPWIDLocation,
  getUserData,
  updatePWIDCaregiver,
  storeFCMToken,
  getFCMToken,
  listenToPWIDLocation,
  getPWIDsByCaregiverPhone,
  updateUserData
} = userService
