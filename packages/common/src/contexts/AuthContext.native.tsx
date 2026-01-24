import { type FirebaseAuthTypes } from '@react-native-firebase/auth'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'
import { signInWithPhoneNumber } from '../services/authService'
import {
  getUserStorage,
  setAppDataStorage,
  setUserStorage
} from '../services/storageService'
import { createUser, getUserAppData } from '../services/userService'
import type { UserType } from '../types'

// Types for different sections of the auth state
type AuthState = {
  confirmation: FirebaseAuthTypes.ConfirmationResult | null
  hasAuthen: boolean
  userType: UserType | null
  firstTimeUser: boolean
  isLoading: boolean
}

type AuthActions = {
  setConfirmation: (
    confirmation: FirebaseAuthTypes.ConfirmationResult | null
  ) => void
  setAuthentication: (
    hasAuthen: boolean,
    userType: UserType | null,
    firstTimeUser?: boolean
  ) => void
  sendOTP: (
    phoneNumber: string
  ) => Promise<FirebaseAuthTypes.ConfirmationResult>
  verifyOTP: (
    otp: string,
    phoneNumber: string,
    userType: UserType | null,
    isRegistration: boolean
  ) => Promise<void>
}

// Main context type definition (matching web as much as possible)
export type AuthContextType = {
  auth: AuthState & AuthActions
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Auth related states
  const [confirmation, setConfirmation] =
    useState<FirebaseAuthTypes.ConfirmationResult | null>(null)
  const [hasAuthen, setHasAuthen] = useState<boolean>(false)
  const [userType, setUserType] = useState<UserType | null>(null)
  const [firstTimeUser, setFirstTimeUser] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const setAuthentication = useCallback(
    (
      hasAuthen: boolean,
      authUserType: UserType | null,
      firstTimeUser: boolean = false
    ) => {
      setHasAuthen(hasAuthen)
      setUserType(authUserType)
      setFirstTimeUser(firstTimeUser)
    },
    []
  )

  // Initialize auth state from storage
  useEffect(() => {
    let isMounted = true

    const loadUserFromStorage = async () => {
      try {
        const storedUser = await getUserStorage()

        if (!isMounted) return

        if (storedUser && storedUser.phoneNumber) {
          // We found a user in storage, set them as authenticated
          // Note: We might want to verify the token validity here if available
          setHasAuthen(true)
          setUserType(storedUser.userType)
        }
      } catch (error) {
        console.error('Failed to load user from storage:', error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadUserFromStorage()

    return () => {
      isMounted = false
    }
  }, [])

  // Send OTP to phone number
  const sendOTP = useCallback(
    async (
      phoneNumber: string
    ): Promise<FirebaseAuthTypes.ConfirmationResult> => {
      // Format phone number to E.164 format if needed
      const formattedPhone = phoneNumber.startsWith('+')
        ? phoneNumber
        : `+${phoneNumber}`
      const confirmationResult = await signInWithPhoneNumber(formattedPhone)
      setConfirmation(
        confirmationResult as FirebaseAuthTypes.ConfirmationResult
      )
      return confirmationResult as FirebaseAuthTypes.ConfirmationResult
    },
    []
  )

  // Verify OTP and complete authentication
  const verifyOTP = useCallback(
    async (
      otp: string,
      phoneNumber: string,
      authUserType: UserType | null,
      isRegistration: boolean
    ): Promise<void> => {
      if (!confirmation) {
        throw new Error('No confirmation found. Please try again.')
      }

      if (otp.length !== 6) {
        throw new Error('Please enter a valid 6-digit OTP')
      }

      // For login (existing users), userType must be set
      if (!isRegistration && !authUserType) {
        throw new Error('User type is required for login')
      }

      // Confirm the OTP
      const userCredential = await confirmation.confirm(otp)

      if (!userCredential || !userCredential.user) {
        throw new Error('Failed to verify OTP')
      }

      // Update authentication state IMMEDIATELY after confirmation
      setAuthentication(true, authUserType, isRegistration)

      // If this is a registration flow, create new user (userType should be provided)
      if (isRegistration && authUserType) {
        await createUser(phoneNumber, authUserType, userCredential.user.uid)
      }

      // Store user data in local storage
      await setUserStorage({
        phoneNumber,
        uid: userCredential.user.uid,
        userType: authUserType || null,
        loggedAt: Date.now()
      })

      // After successful login/registration, fetch appData and cache locally
      try {
        const appData = await getUserAppData(phoneNumber)
        if (appData) {
          await setAppDataStorage(appData)
        }
      } catch (e) {
        console.log('App data not found or error fetching:', e)
      }
    },
    [confirmation, setAuthentication]
  )

  // Combine all context values
  const contextValue: AuthContextType = {
    auth: {
      // States
      confirmation,
      hasAuthen,
      userType,
      firstTimeUser,
      isLoading,
      // Actions
      setConfirmation,
      setAuthentication,
      sendOTP,
      verifyOTP
    }
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context.auth
}
