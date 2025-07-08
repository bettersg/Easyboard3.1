import database from '@react-native-firebase/database';
import DeviceInfo from 'react-native-device-info';

export type UserType = 'PWID' | 'CAREGIVER';

export interface Location {
  lat: number;
  lng: number;
  updatedAt: number;
}

export interface PWIDUser {
  uid: string;  // Firebase Auth UID
  userType: 'PWID';
  deviceName: string;
  caregiverPhone?: string;
  location?: Location;
  fcmToken?: string; // FCM token for push notifications
  createdAt: number;
  updatedAt: number;
}

export interface CaregiverUser {
  uid: string;  // Firebase Auth UID
  userType: 'CAREGIVER';
  deviceName: string;
  uid_pwids: {
    [key: string]: boolean;
  };
  fcmToken?: string; // FCM token for push notifications
  createdAt: number;
  updatedAt: number;
}

export type UserData = PWIDUser | CaregiverUser;

export async function createUser(phoneNumber: string, userType: UserType, uid: string): Promise<UserData> {
  try {
    const deviceName = await DeviceInfo.getDeviceName();
    const timestamp = Date.now();
    if (userType === 'PWID') {
      const pwidData: PWIDUser = {
        uid,
        userType: 'PWID',
        deviceName,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      await database().ref(`users/${phoneNumber}`).set(pwidData);
      return pwidData;
    } else {
      const caregiverData: CaregiverUser = {
        uid,
        userType: 'CAREGIVER',
        deviceName,
        uid_pwids: {},
        createdAt: timestamp,
        updatedAt: timestamp
      };
      await database().ref(`users/${phoneNumber}`).set(caregiverData);
      return caregiverData;
    }
  } catch (error) {
    console.error('Error creating user in database:', error);
    throw error;
  }
}

export async function updatePWIDLocation(phoneNumber: string, location: Location): Promise<void> {
  try {
    await database().ref(`users/${phoneNumber}/location`).set(location);
    await database().ref(`users/${phoneNumber}/updatedAt`).set(Date.now());
  } catch (error) {
    console.error('Error updating PWID location:', error);
    throw error;
  }
}

export async function clearPWIDLocation(phoneNumber: string): Promise<void> {
  try {
    await database().ref(`users/${phoneNumber}/location`).remove();
    await database().ref(`users/${phoneNumber}/updatedAt`).set(Date.now());
  } catch (error) {
    console.error('Error clearing PWID location:', error);
    throw error;
  }
}

export async function addPWIDToCaregiver(caregiverPhone: string, pwidPhone: string): Promise<void> {
  try {
    await database().ref(`users/${caregiverPhone}/uid_pwids/${pwidPhone}`).set(true);
    await database().ref(`users/${caregiverPhone}/updatedAt`).set(Date.now());
  } catch (error) {
    console.error('Error adding PWID to caregiver:', error);
    throw error;
  }
}

export async function getUserData(phoneNumber: string): Promise<UserData | null> {
  try {
    const snapshot = await database().ref(`users/${phoneNumber}`).once('value');
    return snapshot.val();
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
}

export async function updatePWIDCaregiver(pwidPhone: string, caregiverPhone: string): Promise<void> {
  try {
    await database().ref(`users/${pwidPhone}/caregiverPhone`).set(caregiverPhone);
    await database().ref(`users/${pwidPhone}/updatedAt`).set(Date.now());
  } catch (error) {
    console.error('Error updating PWID caregiver:', error);
    throw error;
  }
}

export async function removePWIDFromCaregiver(caregiverPhone: string, pwidPhone: string): Promise<void> {
  try {
    await database().ref(`users/${caregiverPhone}/uid_pwids/${pwidPhone}`).remove();
    await database().ref(`users/${caregiverPhone}/updatedAt`).set(Date.now());
  } catch (error) {
    console.error('Error removing PWID from caregiver:', error);
    throw error;
  }
}

// Store FCM token for a user
export async function storeFCMToken(phoneNumber: string, fcmToken: string): Promise<void> {
  try {
    await database().ref(`users/${phoneNumber}/fcmToken`).set(fcmToken);
    await database().ref(`users/${phoneNumber}/updatedAt`).set(Date.now());
  } catch (error) {
    console.error('Error storing FCM token:', error);
    throw error;
  }
}

// Get FCM token for a user
export async function getFCMToken(phoneNumber: string): Promise<string | null> {
  try {
    const snapshot = await database().ref(`users/${phoneNumber}/fcmToken`).once('value');
    return snapshot.val();
  } catch (error) {
    console.error('Error getting FCM token for user:', error);
    throw error;
  }
}

export function listenToPWIDLocation(
  phoneNumber: string,
  callback: (location: Location) => void
): () => void {
  const ref = database().ref(`users/${phoneNumber}/location`);

  const listener = (snapshot: any) => {
    const val = snapshot.val();
    if (val) callback(val);
  };

  ref.on('value', listener);
  // Return unsubscribe function
  return () => ref.off('value', listener);
}
