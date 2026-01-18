import {
  type ConfirmationResult,
  signInWithPhoneNumber as firebaseSignInWithPhoneNumber,
  signOut as firebaseSignOut,
  RecaptchaVerifier
} from '@firebase/auth'
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

/**
 * Clean up reCAPTCHA verifier and container
 * Call this when navigating away from login or when component unmounts
 */
export function cleanupRecaptcha(): void {
  if (recaptchaVerifierInstance) {
    try {
      recaptchaVerifierInstance.clear()
    } catch (clearError) {
      // Ignore errors when clearing
      console.log('Clearing RecaptchaVerifier:', clearError)
    }
    recaptchaVerifierInstance = null
  }

  // Remove container if it exists
  const container = document.getElementById('recaptcha-container')
  if (container) {
    container.innerHTML = ''
    container.remove()
  }
}

export async function signInWithPhoneNumber(
  phoneNumber: string
): Promise<ConfirmationResult> {
  ensureFirebaseInitialized()

  try {
    // Use the exported auth instance from Firebase config
    if (!auth) {
      throw new Error('Firebase Auth instance is not available')
    }

    // Clear existing verifier if it exists
    if (recaptchaVerifierInstance) {
      try {
        recaptchaVerifierInstance.clear()
      } catch (clearError) {
        // Ignore errors when clearing (e.g., if already cleared)
        console.log('Clearing existing RecaptchaVerifier:', clearError)
      }
      recaptchaVerifierInstance = null
    }

    // Remove existing container if it exists to ensure clean state
    let container = document.getElementById('recaptcha-container')
    if (container) {
      // Clear any existing content/widgets
      container.innerHTML = ''
      // Remove the container entirely to ensure no reCAPTCHA widgets remain
      container.remove()
    }

    // Create a fresh container for invisible reCAPTCHA
    container = document.createElement('div')
    container.id = 'recaptcha-container'
    container.style.display = 'none'
    document.body.appendChild(container)

    // Use invisible reCAPTCHA - parameters object as third argument
    const recaptchaParams = {
      size: 'invisible' as const,
      callback: () => {
        // reCAPTCHA solved, will proceed automatically
        console.log('reCAPTCHA verified')
      },
      'error-callback': () => {
        // Error occurred during reCAPTCHA verification
        console.error('reCAPTCHA error')
      }
    }

    // Create new RecaptchaVerifier instance
    recaptchaVerifierInstance = new RecaptchaVerifier(
      auth,
      container as HTMLElement,
      recaptchaParams
    )

    return await firebaseSignInWithPhoneNumber(
      auth,
      phoneNumber,
      recaptchaVerifierInstance
    )
  } catch (error) {
    console.error('Firebase Auth signInWithPhoneNumber error:', error)
    // Clear verifier on error to allow retry
    if (recaptchaVerifierInstance) {
      try {
        recaptchaVerifierInstance.clear()
      } catch (_) {
        // Ignore errors when clearing
      }
      recaptchaVerifierInstance = null
    }
    throw error
  }
}

/**
 * Alias for signIn for backward compatibility/consistency
 */
export const signIn = signInWithPhoneNumber

/**
 * Sign out from Firebase Auth
 */
export async function signOut(): Promise<void> {
  try {
    if (auth) {
      await firebaseSignOut(auth)
      console.log('Firebase Auth signed out')
    }
  } catch (error) {
    console.log('Firebase Auth sign out failed (non-fatal):', error)
  }
}

/**
 * Get the current user's ID token
 * @returns ID token string if user is authenticated, null otherwise
 */
export async function getIdToken(): Promise<string | null> {
  try {
    ensureFirebaseInitialized()
    if (!auth) {
      return null
    }
    const currentUser = auth.currentUser
    if (!currentUser) {
      return null
    }
    const token = await currentUser.getIdToken()
    return token
  } catch (error) {
    console.error('Error getting ID token:', error)
    return null
  }
}

// Re-add helper functions that might be needed by some components
export function onAuthStateChanged(
  callback: (user: any | null) => void
): () => void {
  if (!auth) return () => {}
  return auth.onAuthStateChanged(callback)
}

export async function verifyOtp(
  confirmationResult: ConfirmationResult,
  otp: string
): Promise<any> {
  return await confirmationResult.confirm(otp)
}
