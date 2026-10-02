import { getApp } from '@react-native-firebase/app'
import {
  type FirebaseAuthTypes,
  getIdToken as firebaseGetIdToken,
  signInWithPhoneNumber as firebaseSignInWithPhoneNumber,
  signOut as firebaseSignOut,
  getAuth
} from '@react-native-firebase/auth'
import type { IAuthService } from './authService'

// Platform-specific type for native
export type ConfirmationResult = FirebaseAuthTypes.ConfirmationResult

/**
 * Ensure Firebase is initialized before using Auth
 * @react-native-firebase/app auto-initializes, but we check to be safe
 */
function ensureFirebaseInitialized(): void {
  try {
    // Check if Firebase app is initialized
    const app = getApp()
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

export const authService: IAuthService = {
  signInWithPhoneNumber: async (phoneNumber: string) => {
    ensureFirebaseInitialized()
    try {
      if (process.env.NODE_ENV === 'development') {
        getAuth().settings.appVerificationDisabledForTesting = true
      }
      return await firebaseSignInWithPhoneNumber(getAuth(), phoneNumber)
    } catch (error) {
      console.error('Firebase Auth signInWithPhoneNumber error:', error)
      throw error
    }
  },

  signOut: async () => {
    try {
      await firebaseSignOut(getAuth())
      console.log('Firebase Auth signed out')
    } catch (error) {
      console.log('Firebase Auth sign out failed (non-fatal):', error)
    }
  },

  getIdToken: async () => {
    try {
      ensureFirebaseInitialized()
      const currentUser = getAuth().currentUser
      if (!currentUser) {
        return null
      }
      return await firebaseGetIdToken(currentUser)
    } catch (error) {
      console.error('Error getting ID token:', error)
      return null
    }
  },

  verifyOtp: async (confirmationResult, otp) => {
    return await confirmationResult.confirm(otp)
  },

  cleanupRecaptcha: () => {
    // No-op on native
  }
} satisfies IAuthService

// Export individual functions for backward compatibility if needed,
// but encourage use of authService object
export const signInWithPhoneNumber = authService.signInWithPhoneNumber
export const signOut = authService.signOut
export const getIdToken = authService.getIdToken
export const verifyOtp = authService.verifyOtp
export const cleanupRecaptcha = authService.cleanupRecaptcha
