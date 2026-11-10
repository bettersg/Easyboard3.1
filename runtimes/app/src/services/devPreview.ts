import { setUserStorage } from './storageService'
import type { UserStorage } from '../types'

export async function seedPreviewUser(role: 'PWID' | 'CAREGIVER' = 'PWID') {
  const now = Date.now()
  const demo = {
    uid: 'dev-preview-pwid',
    name: role === 'CAREGIVER' ? 'Caregiver' : 'Ryan',
    phoneNumber: role === 'CAREGIVER' ? '6522222222' : '6511111111',
    userType: role,
    deviceName: 'iOS Simulator',
    createdAt: now,
    updatedAt: now,
    loggedAt: now,
    caregiverPhone: role === 'PWID' ? '6522222222' : undefined,
    savedPlaces: role === 'PWID' ? [
      {
        locationName: 'Home',
        locationImageKey: '',
        address: {
          description: '23 Serangoon Central, Singapore 556083',
          latlng: { latitude: 1.3508, longitude: 103.8485 }
        }
      },
      {
        locationName: 'Work',
        locationImageKey: '',
        address: {
          description: 'Blue Library, Bishan',
          latlng: { latitude: 1.3521, longitude: 103.8198 }
        }
      }
    ] : undefined
  } as unknown as UserStorage

  await setUserStorage(demo)
}
