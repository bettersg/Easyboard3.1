import type { PWIDUser, UserData, UserLocation, UserType } from '../types'

export interface IUserService {
  createUser(
    phoneNumber: string,
    userType: UserType,
    uid: string,
    initialData?: Partial<UserData>
  ): Promise<UserData>
  updatePWIDLocation(phoneNumber: string, location: UserLocation): Promise<void>
  clearPWIDLocation(phoneNumber: string): Promise<void>
  getUserData(phoneNumber: string): Promise<UserData | null>
  updatePWIDCaregiver(pwidPhone: string, caregiverPhone: string): Promise<void>
  storeFCMToken(phoneNumber: string, fcmToken: string): Promise<void>
  getFCMToken(phoneNumber: string): Promise<string | null>
  listenToPWIDLocation(
    phoneNumber: string,
    callback: (location: UserLocation) => void
  ): () => void
  getPWIDsByCaregiverPhone(caregiverPhone: string): Promise<PWIDUser[]>
  updateUserData(phoneNumber: string, updates: Partial<UserData>): Promise<void>
}

// Platform-agnostic re-exports
export * from './userService.native'
