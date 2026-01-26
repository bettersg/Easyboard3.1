import type { UserStorage } from '../types'

export interface IStorageService {
  setUserStorage(userStorage: UserStorage): Promise<void>
  getUserStorage(): Promise<UserStorage | null>
  clearUserStorage(): Promise<void>
  clearFirebaseData(): Promise<void>
  completeLogout(): Promise<void>
  isSessionExpired(expiryDays?: number): Promise<boolean>
  uploadLocationPhoto(imageUri: string, locationType: string): Promise<string>
  getPhotoDownloadUrl(fileKey: string): Promise<string>
}

// Platform-agnostic re-exports
export * from './storageService.native'
