// Web-friendly user service using Firebase Web SDK
import {
  equalTo,
  get,
  off,
  onValue,
  orderByChild,
  query,
  ref,
  remove,
  set
} from 'firebase/database'

import type {
  CaregiverUser,
  PWIDUser,
  UserData,
  UserLocation,
  UserType
} from '../types'
import { getDatabaseInstance as getFirebaseDatabase } from './firebase.web'

// Re-export types for convenience
export type { UserType, UserLocation, PWIDUser, CaregiverUser, UserData }

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

  // Try to extract browser name
  if (userAgent.includes('Chrome')) return 'Chrome Browser'
  if (userAgent.includes('Firefox')) return 'Firefox Browser'
  if (userAgent.includes('Safari')) return 'Safari Browser'
  if (userAgent.includes('Edge')) return 'Edge Browser'

  return `${platform} Browser`
}

export async function createUser(
  phoneNumber: string,
  userType: UserType,
  uid: string,
  initialData: Partial<UserData> = {}
): Promise<UserData> {
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
}

export async function updatePWIDLocation(
  phoneNumber: string,
  location: UserLocation
): Promise<void> {
  try {
    const db = getDatabaseInstance()
    await set(ref(db, `users/${phoneNumber}/location`), location)
    await set(ref(db, `users/${phoneNumber}/updatedAt`), Date.now())
  } catch (error) {
    console.error('Error updating PWID location:', error)
    throw error
  }
}

export async function clearPWIDLocation(phoneNumber: string): Promise<void> {
  try {
    const db = getDatabaseInstance()
    await remove(ref(db, `users/${phoneNumber}/location`))
    await set(ref(db, `users/${phoneNumber}/updatedAt`), Date.now())
  } catch (error) {
    console.error('Error clearing PWID location:', error)
    throw error
  }
}

export async function getUserData(
  phoneNumber: string
): Promise<UserData | null> {
  try {
    const db = getDatabaseInstance()
    const snapshot = await get(ref(db, `users/${phoneNumber}`))
    return snapshot.exists() ? snapshot.val() : null
  } catch (error) {
    console.error('Error getting user data:', error)
    throw error
  }
}

export async function updatePWIDCaregiver(
  pwidPhone: string,
  caregiverPhone: string
): Promise<void> {
  try {
    const db = getDatabaseInstance()
    await set(ref(db, `users/${pwidPhone}/caregiverPhone`), caregiverPhone)
    await set(ref(db, `users/${pwidPhone}/updatedAt`), Date.now())
  } catch (error) {
    console.error('Error updating PWID caregiver:', error)
    throw error
  }
}

// Store FCM token for a user
export async function storeFCMToken(
  phoneNumber: string,
  fcmToken: string
): Promise<void> {
  try {
    const db = getDatabaseInstance()
    await set(ref(db, `users/${phoneNumber}/fcmToken`), fcmToken)
    await set(ref(db, `users/${phoneNumber}/updatedAt`), Date.now())
  } catch (error) {
    console.error('Error storing FCM token:', error)
    throw error
  }
}

// Get FCM token for a user
export async function getFCMToken(phoneNumber: string): Promise<string | null> {
  try {
    const db = getDatabaseInstance()
    const snapshot = await get(ref(db, `users/${phoneNumber}/fcmToken`))
    return snapshot.exists() ? snapshot.val() : null
  } catch (error) {
    console.error('Error getting FCM token for user:', error)
    throw error
  }
}

export function listenToPWIDLocation(
  phoneNumber: string,
  callback: (location: UserLocation) => void
): () => void {
  const db = getDatabaseInstance()
  const locationRef = ref(db, `users/${phoneNumber}/location`)

  const listener = (snapshot: {
    exists: () => boolean
    val: () => UserLocation
  }) => {
    if (snapshot.exists()) {
      callback(snapshot.val())
    }
  }

  onValue(locationRef, (snapshot) => listener(snapshot as any))

  // Return unsubscribe function
  return () => off(locationRef, 'value')
}

export async function getPWIDsByCaregiverPhone(
  caregiverPhone: string
): Promise<PWIDUser[]> {
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
        return false // Continue iteration
      })
    }

    return pwidUsers
  } catch (error) {
    console.error('Error getting PWIDs by caregiver phone:', error)
    throw error
  }
}

/**
 * Update user data in the database with strict typing (Web)
 */
export async function updateUserData(
  phoneNumber: string,
  updates: Partial<UserData>
): Promise<void> {
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
