import firebaseApp from '@react-native-firebase/app'
import database from '@react-native-firebase/database'
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
    const app = firebaseApp.app()
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
        await database().ref(`users/${phoneNumber}`).set(pwidData)
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
        await database().ref(`users/${phoneNumber}`).set(caregiverData)
        return caregiverData
      }
    } catch (error) {
      console.error('Error creating user in database:', error)
      throw error
    }
  },

  updatePWIDLocation: async (phoneNumber: string, location: UserLocation) => {
    try {
      await database()
        .ref(`users/${phoneNumber}/location`)
        .set({ ...location, isSharing: true })
      await database().ref(`users/${phoneNumber}/updatedAt`).set(Date.now())
    } catch (error) {
      console.error('Error updating PWID location:', error)
      throw error
    }
  },

  stopPWIDLocationSharing: async (phoneNumber: string) => {
    try {
      await database()
        .ref(`users/${phoneNumber}/location`)
        .update({ isSharing: false, updatedAt: Date.now() })
      await database().ref(`users/${phoneNumber}/updatedAt`).set(Date.now())
    } catch (error) {
      console.error('Error stopping PWID location sharing:', error)
      throw error
    }
  },

  getUserData: async (phoneNumber: string) => {
    try {
      const snapshot = await database()
        .ref(`users/${phoneNumber}`)
        .once('value')
      return snapshot.val()
    } catch (error) {
      console.error('Error getting user data:', error)
      throw error
    }
  },

  updatePWIDCaregiver: async (pwidPhone: string, caregiverPhone: string) => {
    try {
      await database()
        .ref(`users/${pwidPhone}/caregiverPhone`)
        .set(caregiverPhone)
      await database().ref(`users/${pwidPhone}/updatedAt`).set(Date.now())
    } catch (error) {
      console.error('Error updating PWID caregiver:', error)
      throw error
    }
  },

  storeFCMToken: async (phoneNumber: string, fcmToken: string) => {
    try {
      await database().ref(`users/${phoneNumber}/fcmToken`).set(fcmToken)
      await database().ref(`users/${phoneNumber}/updatedAt`).set(Date.now())
    } catch (error) {
      console.error('Error storing FCM token:', error)
      throw error
    }
  },

  getFCMToken: async (phoneNumber: string) => {
    try {
      const snapshot = await database()
        .ref(`users/${phoneNumber}/fcmToken`)
        .once('value')
      return snapshot.val()
    } catch (error) {
      console.error('Error getting FCM token for user:', error)
      throw error
    }
  },

  listenToPWIDLocation: (phoneNumber, callback) => {
    const ref = database().ref(`users/${phoneNumber}/location`)
    const listener = (snapshot: any) => callback(snapshot.val())
    ref.on('value', listener)
    return () => ref.off('value', listener)
  },

  getPWIDsByCaregiverPhone: async (caregiverPhone: string) => {
    const snapshot = await database()
      .ref('users')
      .orderByChild('caregiverPhone')
      .equalTo(caregiverPhone)
      .once('value')

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
      const userRef = database().ref(`users/${phoneNumber}`)
      const snapshot = await userRef.once('value')
      const timestamp = Date.now()
      const updatedData = {
        ...(snapshot.exists() ? snapshot.val() : {}),
        ...updates,
        updatedAt: timestamp
      }
      await userRef.set(updatedData)
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
  stopPWIDLocationSharing,
  getUserData,
  updatePWIDCaregiver,
  storeFCMToken,
  getFCMToken,
  listenToPWIDLocation,
  getPWIDsByCaregiverPhone,
  updateUserData
} = userService
