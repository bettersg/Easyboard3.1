import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'
import { Alert, Platform } from 'react-native'
import { useAuth } from '../contexts'
import { getUserData } from '../services/userService'
import type { UserType } from '../types'

interface LoginContextType {
  // State
  phoneNumber: string
  userType: UserType | undefined
  isRegistration: boolean
  otpSent: boolean
  isSendingOTP: boolean
  isVerifyingOTP: boolean
  error: string | null

  // Actions
  setPhoneNumber: (phone: string) => void
  setUserType: (type: UserType | undefined) => void
  sendOTP: () => Promise<void>
  verifyOTP: (otp: string) => Promise<boolean>
  reset: (soft: boolean) => void

  // Computed values
  formattedPhoneNumber: string
  displayPhoneNumber: string
  isValidPhoneNumber: boolean
  canSendOTP: boolean
  canVerifyOTP: boolean
}

const LoginContext = createContext<LoginContextType | undefined>(undefined)

export function LoginProvider({ children }: { children: React.ReactNode }) {
  const { sendOTP: sendOTPToFirebase, verifyOTP: verifyOTPWithFirebase } =
    useAuth()

  // State
  const [phoneNumber, setPhoneNumberState] = useState<string>('')
  const [userType, setUserTypeState] = useState<UserType>()
  const [isRegistration, setIsRegistration] = useState<boolean>(false)
  const [otpSent, setOtpSent] = useState<boolean>(false)
  const [isSendingOTP, setIsSendingOTP] = useState<boolean>(false)
  const [isVerifyingOTP, setIsVerifyingOTP] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Format phone number helpers
  const cleanPhoneNumber = useCallback((phone: string): string => {
    return phone.replace(/\D/g, '')
  }, [])

  const formatPhoneNumber = useCallback(
    (phone: string): string => {
      const cleaned = cleanPhoneNumber(phone)
      return cleaned.startsWith('65') ? cleaned : `65${cleaned}`
    },
    [cleanPhoneNumber]
  )

  const formatPhoneForDisplay = useCallback(
    (phone: string): string => {
      const cleaned = cleanPhoneNumber(phone)
      return cleaned.startsWith('65') ? `+${cleaned}` : `+65${cleaned}`
    },
    [cleanPhoneNumber]
  )

  // Computed values
  const formattedPhoneNumber = formatPhoneNumber(phoneNumber)
  const displayPhoneNumber = formatPhoneForDisplay(phoneNumber)
  const isValidPhoneNumber = cleanPhoneNumber(phoneNumber).length === 8
  const canSendOTP = isValidPhoneNumber && !isSendingOTP && !otpSent
  const canVerifyOTP = otpSent && !isVerifyingOTP && userType !== undefined

  // Actions
  const setPhoneNumber = useCallback((phone: string) => {
    setPhoneNumberState(phone)
    setError(null)
  }, [])

  const setUserType = useCallback((type: UserType | undefined) => {
    setUserTypeState(type)
    setError(null)
  }, [])

  const sendOTP = useCallback(async () => {
    if (!isValidPhoneNumber) {
      const errorMsg = 'Please enter a valid 8-digit phone number'
      setError(errorMsg)
      Alert.alert('Error', errorMsg)
      return
    }

    setIsSendingOTP(true)
    setError(null)

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber)

      // Check if user exists
      const existingUser = await getUserData(formattedPhone)
      const isReg = !existingUser

      // Send OTP via Firebase
      await sendOTPToFirebase(`+${formattedPhone}`)

      // Update state
      setIsRegistration(isReg)
      setOtpSent(true)

      // If user exists (login flow), set userType from existing user
      if (existingUser) {
        setUserTypeState(existingUser.userType)
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Failed to send OTP. Please try again.'
      setError(errorMsg)
      console.error('Error sending OTP:', err)
      Alert.alert('Error', errorMsg)
    } finally {
      setIsSendingOTP(false)
    }
  }, [phoneNumber, isValidPhoneNumber, formatPhoneNumber, sendOTPToFirebase])

  const verifyOTP = useCallback(
    async (otp: string): Promise<boolean> => {
      if (otp.length !== 6) {
        const errorMsg = 'Please enter a valid 6-digit OTP'
        setError(errorMsg)
        Alert.alert('Error', errorMsg)
        return false
      }

      // For existing users (login), userType should already be set from getUserData
      // For new users (registration), userType will be null - they'll select it in onboarding
      // if (!userType && !isRegistration) {
      //   const errorMsg = 'User type is required. Please try logging in again.'
      //   setError(errorMsg)
      //   Alert.alert('Error', errorMsg)
      //   return false
      // }

      setIsVerifyingOTP(true)
      setError(null)

      try {
        const formattedPhone = formatPhoneNumber(phoneNumber)

        // For registration flow, pass null userType - user will be created later in onboarding
        // For login flow, userType should already be set
        await verifyOTPWithFirebase(
          otp,
          formattedPhone,
          isRegistration,
          userType // Pass as last argument to match new signature
        )
        return true
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : 'Failed to verify OTP. Please try again.'
        setError(errorMsg)
        throw err
      } finally {
        setIsVerifyingOTP(false)
      }
    },
    [
      phoneNumber,
      userType,
      isRegistration,
      formatPhoneNumber,
      verifyOTPWithFirebase
    ]
  )

  const reset = useCallback((soft = false) => {
    setPhoneNumberState('')
    setUserTypeState(undefined)
    setIsRegistration(false)
    setOtpSent(false)
    setIsSendingOTP(false)
    setIsVerifyingOTP(false)
    setError(null)
    // Clean up reCAPTCHA when resetting (e.g., navigating back to login)
    if (Platform.OS === 'web' && typeof window !== 'undefined' && !soft) {
      // Dynamically import and call cleanup only on web
      import('../services/authService.web')
        .then((module) => {
          if (module.cleanupRecaptcha) {
            module.cleanupRecaptcha()
          }
        })
        .catch(() => {
          // Ignore errors if module doesn't exist (e.g., on native)
        })
    }
  }, [])

  // Clean up reCAPTCHA when component unmounts
  useEffect(() => {
    return () => {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        // Dynamically import and call cleanup only on web
        import('../services/authService.web')
          .then((module) => {
            if (module.cleanupRecaptcha) {
              module.cleanupRecaptcha()
            }
          })
          .catch(() => {
            // Ignore errors if module doesn't exist (e.g., on native)
          })
      }
    }
  }, [])

  const value: LoginContextType = {
    // State
    phoneNumber,
    userType,
    isRegistration,
    otpSent,
    isSendingOTP,
    isVerifyingOTP,
    error,

    // Actions
    setPhoneNumber,
    setUserType,
    sendOTP,
    verifyOTP,
    reset,

    // Computed values
    formattedPhoneNumber,
    displayPhoneNumber,
    isValidPhoneNumber,
    canSendOTP,
    canVerifyOTP
  }

  return <LoginContext.Provider value={value}>{children}</LoginContext.Provider>
}

export function useLogin(): LoginContextType {
  const context = useContext(LoginContext)
  if (context === undefined) {
    throw new Error('useLogin must be used within a LoginProvider')
  }
  return context
}
