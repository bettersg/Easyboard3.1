import firebaseApp from '@react-native-firebase/app'
import auth, { type FirebaseAuthTypes } from '@react-native-firebase/auth'

// Platform-specific type for native
export type ConfirmationResult = FirebaseAuthTypes.ConfirmationResult

/**
 * Ensure Firebase is initialized before using Auth
 * @react-native-firebase/app auto-initializes, but we check to be safe
 */
function ensureFirebaseInitialized(): void {
  try {
    // Check if Firebase app is initialized
    const app = firebaseApp.app()
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

export async function signInWithPhoneNumber(
  phoneNumber: string
): Promise<ConfirmationResult> {
  // Ensure Firebase is initialized before using Auth
  ensureFirebaseInitialized()

  try {
    if (process.env.NODE_ENV === 'development') {
      const settings = auth().settings
      settings.appVerificationDisabledForTesting = true
      auth().settings = settings
      return await auth().signInWithPhoneNumber(phoneNumber)
    }
    return await auth().signInWithPhoneNumber(phoneNumber)
  } catch (error) {
    console.error('Firebase Auth signInWithPhoneNumber error:', error)
    throw error
  }
}

// Alias for consistency with web API
export const signIn = signInWithPhoneNumber

/**
 * Sign out from Firebase Auth
 */
export async function signOut(): Promise<void> {
  try {
    await auth().signOut()
    console.log('Firebase Auth signed out')
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
    const currentUser = auth().currentUser
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

// Re-add helper functions for consistency
export function onAuthStateChanged(
  callback: (user: FirebaseAuthTypes.User | null) => void
): () => void {
  return auth().onAuthStateChanged(callback)
}

export async function verifyOtp(
  confirmationResult: FirebaseAuthTypes.ConfirmationResult,
  otp: string
): Promise<FirebaseAuthTypes.UserCredential | null> {
  return await confirmationResult.confirm(otp)
}
