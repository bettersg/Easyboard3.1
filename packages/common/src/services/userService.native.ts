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

// Re-export types for convenience
export type { UserType, UserLocation, PWIDUser, CaregiverUser, UserData }

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

export async function createUser(
  phoneNumber: string,
  userType: UserType,
  uid: string,
  initialData: Partial<UserData> = {}
): Promise<UserData> {
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
}

export async function updatePWIDLocation(
  phoneNumber: string,
  location: UserLocation
): Promise<void> {
  try {
    await database().ref(`users/${phoneNumber}/location`).set(location)
    await database().ref(`users/${phoneNumber}/updatedAt`).set(Date.now())
  } catch (error) {
    console.error('Error updating PWID location:', error)
    throw error
  }
}

export async function clearPWIDLocation(phoneNumber: string): Promise<void> {
  try {
    await database().ref(`users/${phoneNumber}/location`).remove()
    await database().ref(`users/${phoneNumber}/updatedAt`).set(Date.now())
  } catch (error) {
    console.error('Error clearing PWID location:', error)
    throw error
  }
}

export async function getUserData(
  phoneNumber: string
): Promise<UserData | null> {
  try {
    const snapshot = await database().ref(`users/${phoneNumber}`).once('value')
    return snapshot.val()
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
    await database()
      .ref(`users/${pwidPhone}/caregiverPhone`)
      .set(caregiverPhone)
    await database().ref(`users/${pwidPhone}/updatedAt`).set(Date.now())
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
    await database().ref(`users/${phoneNumber}/fcmToken`).set(fcmToken)
    await database().ref(`users/${phoneNumber}/updatedAt`).set(Date.now())
  } catch (error) {
    console.error('Error storing FCM token:', error)
    throw error
  }
}

// Get FCM token for a user
export async function getFCMToken(phoneNumber: string): Promise<string | null> {
  try {
    const snapshot = await database()
      .ref(`users/${phoneNumber}/fcmToken`)
      .once('value')
    return snapshot.val()
  } catch (error) {
    console.error('Error getting FCM token for user:', error)
    throw error
  }
}

export function listenToPWIDLocation(
  phoneNumber: string,
  callback: (location: UserLocation) => void
): () => void {
  const ref = database().ref(`users/${phoneNumber}/location`)

  const listener = (snapshot: { val: () => UserLocation }) => {
    callback(snapshot.val())
  }

  ref.on('value', listener)
  // Return unsubscribe function
  return () => ref.off('value', listener)
}

export async function getPWIDsByCaregiverPhone(
  caregiverPhone: string
): Promise<PWIDUser[]> {
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
}

/**
 * Update user data in the database with strict typing
 * @param phoneNumber - User identifier
 * @param updates - Partial UserData object
 */
export async function updateUserData(
  phoneNumber: string,
  updates: Partial<UserData>
): Promise<void> {
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
