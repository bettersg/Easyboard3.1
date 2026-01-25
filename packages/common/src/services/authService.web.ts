import {
  type ConfirmationResult,
  signInWithPhoneNumber as firebaseSignInWithPhoneNumber,
  signOut as firebaseSignOut,
  RecaptchaVerifier
} from '@firebase/auth'
import type { IAuthService } from './authService'
// Import Firebase config to ensure initialization happens
import { auth } from './firebase.web'

// Platform-specific type for web
export type { ConfirmationResult }

/**
 * Ensure Firebase is initialized before using Auth
 */
function ensureFirebaseInitialized(): void {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Auth can only be used in browser context')
  }

  if (!auth) {
    throw new Error(
      'Firebase Auth is not initialized. Make sure Firebase is initialized in your app root (e.g., apps/web/src/config/firebase.ts)'
    )
  }
}

// Store the RecaptchaVerifier instance to reuse it
let recaptchaVerifierInstance: RecaptchaVerifier | null = null

export const authService: IAuthService = {
  signInWithPhoneNumber: async (phoneNumber: string) => {
    ensureFirebaseInitialized()

    try {
      if (!auth) {
        throw new Error('Firebase Auth instance is not available')
      }

      // Clear existing verifier if it exists
      if (recaptchaVerifierInstance) {
        try {
          recaptchaVerifierInstance.clear()
        } catch (clearError) {
          console.log('Clearing existing RecaptchaVerifier:', clearError)
        }
        recaptchaVerifierInstance = null
      }

      // Remove existing container if it exists
      let container = document.getElementById('recaptcha-container')
      if (container) {
        container.innerHTML = ''
        container.remove()
      }

      // Create a fresh container for invisible reCAPTCHA
      container = document.createElement('div')
      container.id = 'recaptcha-container'
      container.style.display = 'none'
      document.body.appendChild(container)

      recaptchaVerifierInstance = new RecaptchaVerifier(
        auth,
        container as HTMLElement,
        {
          size: 'invisible' as const,
          callback: () => {
            console.log('reCAPTCHA verified')
          },
          'error-callback': () => {
            console.error('reCAPTCHA error')
          }
        }
      )

      return await firebaseSignInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifierInstance
      )
    } catch (error) {
      console.error('Firebase Auth signInWithPhoneNumber error:', error)
      if (recaptchaVerifierInstance) {
        try {
          recaptchaVerifierInstance.clear()
        } catch (_) {
          console.log('reCAPTCHA error')
        }
        recaptchaVerifierInstance = null
      }
      throw error
    }
  },

  signOut: async () => {
    try {
      if (auth) {
        await firebaseSignOut(auth)
        console.log('Firebase Auth signed out')
      }
    } catch (error) {
      console.log('Firebase Auth sign out failed (non-fatal):', error)
    }
  },

  getIdToken: async () => {
    try {
      ensureFirebaseInitialized()
      if (!auth) return null
      const currentUser = auth.currentUser
      if (!currentUser) return null
      return await currentUser.getIdToken()
    } catch (error) {
      console.error('Error getting ID token:', error)
      return null
    }
  },

  verifyOtp: async (confirmationResult, otp) => {
    return await confirmationResult.confirm(otp)
  },

  cleanupRecaptcha: () => {
    if (recaptchaVerifierInstance) {
      try {
        recaptchaVerifierInstance.clear()
      } catch (clearError) {
        console.log('Clearing RecaptchaVerifier:', clearError)
      }
      recaptchaVerifierInstance = null
    }

    const container = document.getElementById('recaptcha-container')
    if (container) {
      container.innerHTML = ''
      container.remove()
    }
  }
} satisfies IAuthService

// Export individual functions for backward compatibility
export const {
  signInWithPhoneNumber,
  signOut,
  getIdToken,
  verifyOtp,
  cleanupRecaptcha
} = authService
