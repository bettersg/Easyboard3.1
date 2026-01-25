import { type ConfirmationResult, type UserCredential } from '@firebase/auth'

export interface IAuthService {
  // TODO: unknown type used due to differences in ConfirmationResult and UserCredential types between react-native and js packages
  signInWithPhoneNumber(phoneNumber: string): Promise<unknown>
  signOut(): Promise<void>
  getIdToken(): Promise<string | null>
  verifyOtp(
    confirmationResult: ConfirmationResult,
    otp: string
  ): Promise<UserCredential>
  cleanupRecaptcha(): void // No-op on native
}

// Platform-agnostic re-exports
export * from './authService.native'
