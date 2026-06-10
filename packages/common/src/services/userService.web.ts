// Web-friendly user service using Firebase Web SDK
import {
  equalTo,
  get,
  off,
  onValue,
  orderByChild,
  query,
  ref,
  set,
  update
} from 'firebase/database'
import type {
  CaregiverUser,
  PWIDUser,
  UserData,
  UserLocation,
  UserType
} from '../types'
import { getDatabaseInstance as getFirebaseDatabase } from './firebase.web'
import type { IUserService } from './userService'

// Get Firebase Database instance
const getDatabaseInstance = () => {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Database can only be used in browser context')
  }
  try {
    return getFirebaseDatabase()
  } catch (error) {
    throw new Error(
      'Firebase Database error: ' +
        (error instanceof Error ? error.message : String(error))
    )
  }
}

// Get device name for web (user agent or browser info)
const getDeviceName = (): string => {
  if (typeof window === 'undefined') return 'Web Browser'
  const userAgent = window.navigator.userAgent
  const platform = window.navigator.platform
  if (userAgent.includes('Chrome')) return 'Chrome Browser'
  if (userAgent.includes('Firefox')) return 'Firefox Browser'
  if (userAgent.includes('Safari')) return 'Safari Browser'
  if (userAgent.includes('Edge')) return 'Edge Browser'
  return `${platform} Browser`
}

export const userService: IUserService = {
  createUser: async (
    phoneNumber: string,
    userType: UserType,
    uid: string,
    initialData: Partial<UserData> = {}
  ): Promise<UserData> => {
    try {
      const deviceName = getDeviceName()
      const timestamp = Date.now()
      const db = getDatabaseInstance()
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
        await set(ref(db, `users/${phoneNumber}`), pwidData)
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
        await set(ref(db, `users/${phoneNumber}`), caregiverData)
        return caregiverData
      }
    } catch (error) {
      console.error('Error creating user in database:', error)
      throw error
    }
  },

  updatePWIDLocation: async (phoneNumber: string, location: UserLocation) => {
    try {
      const db = getDatabaseInstance()
      await set(ref(db, `users/${phoneNumber}/location`), location)
      await set(ref(db, `users/${phoneNumber}/updatedAt`), Date.now())
    } catch (error) {
      console.error('Error updating PWID location:', error)
      throw error
    }
  },

  stopPWIDLocationSharing: async (phoneNumber: string) => {
    try {
      const db = getDatabaseInstance()
      await update(ref(db, `users/${phoneNumber}/location`), {
        isSharing: false
      })
      await set(ref(db, `users/${phoneNumber}/updatedAt`), Date.now())
    } catch (error) {
      console.error('Error stopping PWID location sharing:', error)
      throw error
    }
  },

  getUserData: async (phoneNumber: string) => {
    try {
      const db = getDatabaseInstance()
      const snapshot = await get(ref(db, `users/${phoneNumber}`))
      return snapshot.exists() ? snapshot.val() : null
    } catch (error) {
      console.error('Error getting user data:', error)
      throw error
    }
  },

  updatePWIDCaregiver: async (pwidPhone: string, caregiverPhone: string) => {
    try {
      const db = getDatabaseInstance()
      await set(ref(db, `users/${pwidPhone}/caregiverPhone`), caregiverPhone)
      await set(ref(db, `users/${pwidPhone}/updatedAt`), Date.now())
    } catch (error) {
      console.error('Error updating PWID caregiver:', error)
      throw error
    }
  },

  storeFCMToken: async (phoneNumber: string, fcmToken: string) => {
    try {
      const db = getDatabaseInstance()
      await set(ref(db, `users/${phoneNumber}/fcmToken`), fcmToken)
      await set(ref(db, `users/${phoneNumber}/updatedAt`), Date.now())
    } catch (error) {
      console.error('Error storing FCM token:', error)
      throw error
    }
  },

  getFCMToken: async (phoneNumber: string) => {
    try {
      const db = getDatabaseInstance()
      const snapshot = await get(ref(db, `users/${phoneNumber}/fcmToken`))
      return snapshot.exists() ? snapshot.val() : null
    } catch (error) {
      console.error('Error getting FCM token for user:', error)
      throw error
    }
  },

  listenToPWIDLocation: (phoneNumber, callback) => {
    const db = getDatabaseInstance()
    const locationRef = ref(db, `users/${phoneNumber}/location`)
    const listener = (snapshot: any) => {
      if (snapshot.exists()) {
        callback(snapshot.val())
      }
    }
    onValue(locationRef, listener)
    return () => off(locationRef, 'value', listener)
  },

  getPWIDsByCaregiverPhone: async (caregiverPhone: string) => {
    try {
      const db = getDatabaseInstance()
      const usersRef = ref(db, 'users')
      const q = query(
        usersRef,
        orderByChild('caregiverPhone'),
        equalTo(caregiverPhone)
      )
      const snapshot = await get(q)
      const pwidUsers: PWIDUser[] = []
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const data = child.val()
          if (data && data.userType === 'PWID') {
            pwidUsers.push(data as PWIDUser)
          }
          return false
        })
      }
      return pwidUsers
    } catch (error) {
      console.error('Error getting PWIDs by caregiver phone:', error)
      throw error
    }
  },

  updateUserData: async (phoneNumber: string, updates: Partial<UserData>) => {
    try {
      const db = getDatabaseInstance()
      const userRef = ref(db, `users/${phoneNumber}`)
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
  stopPWIDLocationSharing,
  getUserData,
  updatePWIDCaregiver,
  storeFCMToken,
  getFCMToken,
  listenToPWIDLocation,
  getPWIDsByCaregiverPhone,
  updateUserData
} = userService
