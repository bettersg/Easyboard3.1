import type { ActiveTrip } from '../services/tripStore'

// Shared user types

export type UserType = 'PWID' | 'CAREGIVER'

export interface LatLng {
  latitude: number
  longitude: number
}

export interface Address {
  description: string
  latlng: LatLng
}

export interface SavedPlace {
  locationName: string
  locationImageKey: string
  address: Address
}

export interface UserLocation {
  lat: number
  lng: number
  updatedAt: number
  isSharing: boolean
}

interface BaseUser {
  uid: string // Firebase Auth UID
  name: string
  phoneNumber: string
  userType: UserType
  deviceName: string
  fcmToken?: string // FCM token for push notifications
  createdAt: number
  updatedAt: number
}

export interface JourneyStep {
  id: string
  title: string
  detail: string
  photoUrl?: string
}

export interface Journey {
  id: string
  destinationName: string
  originName: string
  busNumber: string
  steps: JourneyStep[]
  updatedAt: number
}

export type PWIDUser = BaseUser & {
  caregiverPhone?: string
  savedPlaces?: SavedPlace[]
  journeys?: Journey[]
  activeTrip?: ActiveTrip | null
  location?: UserLocation // Real-time location
}

export type CaregiverUser = BaseUser

export type UserData = PWIDUser | CaregiverUser

export type UserStorage = Omit<
  UserData,
  'userType' | 'deviceName' | 'createdAt' | 'updatedAt'
> & {
  userType: UserType | undefined
  loggedAt: number // Unix timestamp when user last logged in
}
