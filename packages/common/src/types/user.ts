// Shared user types

export type UserType = 'PWID' | 'CAREGIVER'

export interface Location {
  lat: number
  lng: number
  updatedAt: number
}

export interface PWIDUser {
  uid: string // Firebase Auth UID
  userType: 'PWID'
  deviceName: string
  caregiverPhone?: string
  location?: Location
  fcmToken?: string // FCM token for push notifications
  createdAt: number
  updatedAt: number
}

export interface CaregiverUser {
  uid: string // Firebase Auth UID
  userType: 'CAREGIVER'
  deviceName: string
  fcmToken?: string // FCM token for push notifications
  createdAt: number
  updatedAt: number
}

export type UserData = PWIDUser | CaregiverUser
