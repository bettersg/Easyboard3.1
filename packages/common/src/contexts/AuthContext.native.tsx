import { type FirebaseAuthTypes } from '@react-native-firebase/auth'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'
import { signInWithPhoneNumber } from '../services/authService'
import { getUserStorage, setUserStorage } from '../services/storageService'
import { getUserData } from '../services/userService'
import type { UserData, UserType } from '../types'

// Types for different sections of the auth state
type AuthState = {
  confirmation: FirebaseAuthTypes.ConfirmationResult | null
  hasAuthen: boolean
  userType: UserType | undefined
  firstTimeUser: boolean
  isLoading: boolean
}

type AuthActions = {
  setConfirmation: (
    confirmation: FirebaseAuthTypes.ConfirmationResult | null
  ) => void
  setAuthentication: (
    hasAuthen: boolean,
    userType?: UserType,
    firstTimeUser?: boolean
  ) => void
  sendOTP: (
    phoneNumber: string
  ) => Promise<FirebaseAuthTypes.ConfirmationResult>
  verifyOTP: (
    otp: string,
    phoneNumber: string,
    isRegistration: boolean,
    authUserType?: UserType
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
  const [userType, setUserType] = useState<UserType>()
  const [firstTimeUser, setFirstTimeUser] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const setAuthentication = useCallback(
    (
      hasAuthen: boolean,
      authUserType?: UserType,
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
      isRegistration: boolean,
      authUserType?: UserType
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

      // Fetch user data to get all the details (skip for registration as it's not created yet)
      let userData: UserData | null = null
      try {
        if (!isRegistration) {
          userData = await getUserData(phoneNumber)
        }
      } catch (e) {
        console.log('Error fetching user data during login:', e)
      }

      if (userData) {
        // Store only UserStorage fields in local storage
        const {
          deviceName: _deviceName,
          createdAt: _createdAt,
          updatedAt: _updatedAt,
          ...storageData
        } = userData
        await setUserStorage({
          ...storageData,
          loggedAt: Date.now()
        })
      } else {
        await setUserStorage({
          uid: userCredential.user.uid,
          name: '',
          phoneNumber,
          userType: userType,
          loggedAt: Date.now()
        })
      }
    },
    [confirmation, setAuthentication, userType]
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
