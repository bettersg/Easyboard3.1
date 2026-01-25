import { useEffect, useRef, useState } from 'react'
import { Animated as RNAnimated, useWindowDimensions } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Animated, InputField, OTPInput, Text, View } from '../../components'
import { useLogin } from '../../hooks'
import { OnboardingLayout } from '../onboarding/OnboardingLayout'

export function LoginFlow() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const [currentStep, setCurrentStep] = useState<'phone' | 'otp'>('phone')
  const slideAnim = useRef(new RNAnimated.Value(0)).current

  useEffect(() => {
    RNAnimated.timing(slideAnim, {
      toValue: currentStep === 'phone' ? 0 : -width,
      duration: 300,
      useNativeDriver: true
    }).start()
  }, [currentStep, slideAnim, width])

  const {
    phoneNumber,
    setPhoneNumber,
    sendOTP,
    isSendingOTP,
    canSendOTP,
    otpSent,
    displayPhoneNumber,
    verifyOTP,
    isVerifyingOTP,
    reset
  } = useLogin()

  // Use ref to always access latest values
  const loginValuesRef = useRef({
    canSendOTP,
    sendOTP,
    phoneNumber,
    otpSent,
    isSendingOTP
  })

  useEffect(() => {
    loginValuesRef.current = {
      canSendOTP,
      sendOTP,
      phoneNumber,
      otpSent,
      isSendingOTP
    }
  }, [canSendOTP, sendOTP, phoneNumber, otpSent, isSendingOTP])

  // Navigate to OTP screen when OTP is sent
  useEffect(() => {
    if (otpSent && currentStep === 'phone') {
      console.log('[LoginFlow] OTP sent, switching to OTP screen')
      setCurrentStep('otp')
    }
  }, [otpSent, currentStep])

  const verificationCompleteRef = useRef(false)

  const handleNext = async () => {
    if (currentStep === 'phone') {
      const {
        canSendOTP: currentCanSendOTP,
        sendOTP: currentSendOTP,
        otpSent: currentOtpSent,
        isSendingOTP: currentIsSending
      } = loginValuesRef.current

      // If OTP was already sent, switch to OTP screen
      if (currentOtpSent) {
        setCurrentStep('otp')
        return
      }

      // If already sending, do nothing
      if (currentIsSending) {
        return
      }

      // Validate and send OTP
      if (!currentCanSendOTP) {
        console.log('[LoginFlow] Cannot send OTP - validation failed')
        return
      }

      console.log('[LoginFlow] Sending OTP')
      await currentSendOTP()
      // Navigation will happen via otpSent useEffect
    } else {
      // OTP screen - if verification already completed, the navigation
      // should have already happened in handleVerifyOTP
      // Otherwise, do nothing - OTP verification happens via onComplete
    }
  }

  const handleBack = () => {
    if (currentStep === 'otp') {
      reset(true)
      setCurrentStep('phone')
    } else {
      router.push('/')
    }
  }

  const handleVerifyOTP = async (otp: string) => {
    console.log('[LoginFlow] handleVerifyOTP called')
    try {
      await verifyOTP(otp)

      verificationCompleteRef.current = true
      // New user or no existing data - go to onboarding
      console.log(
        '[LoginFlow] No existing data found, navigating to onboarding'
      )
      router.push('/onboarding/1')
    } catch (err) {
      console.error('[LoginFlow] OTP verification failed:', err)
      alert('Invalid OTP')
    }
  }

  return (
    <OnboardingLayout
      currentStep={currentStep === 'phone' ? 1 : 2}
      totalSteps={2}
      onNext={handleNext}
      onBack={handleBack}
      showBackButton={true} // Always show back button in login flow
    >
      <View className='flex-1 overflow-hidden'>
        <Animated.View
          className='flex-row h-full'
          style={{
            width: width * 2,
            transform: [{ translateX: slideAnim }]
          }}
        >
          {/* Phone Number Screen */}
          <View
            className='justify-start items-center px-6 py-4 h-[calc(100svh-80px)]'
            style={{ width }}
          >
            <View
              onSubmit={(e: Event) => e.preventDefault()}
              className='gap-4 w-full'
              // @ts-expect-error - web-specific
              accessibilityRole='form'
            >
              <View className='gap-2'>
                <Text className='text-2xl font-bold text-[#414852]'>
                  What&apos;s your phone number?
                </Text>
                <Text className='text-base text-[#677281]'>
                  An OTP will be sent to this number for verification.
                </Text>
              </View>
              <InputField
                placeholder='+65 | your phone number'
                value={phoneNumber ? `+65 | ${phoneNumber}` : ''}
                onChangeText={(text) =>
                  setPhoneNumber(text.replace('+65 | ', ''))
                }
                keyboardType='phone-pad'
                maxLength={14} // Allow for +65 prefix
                onSubmitEditing={handleNext}
              />
              {isSendingOTP && (
                <Text className='text-base text-[#677281] text-center'>
                  Sending OTP...
                </Text>
              )}
            </View>
          </View>

          {/* OTP Screen */}
          <View
            className='justify-start items-center px-6 py-4 h-[calc(100svh-80px)]'
            style={{ width }}
          >
            <View className='gap-4 w-full'>
              <View className='gap-2'>
                <Text className='text-2xl font-bold text-[#414852]'>
                  Enter your OTP
                </Text>
                <Text className='text-base text-[#677281]'>
                  A 6-digit OTP was sent to {displayPhoneNumber}
                </Text>
              </View>
              <OTPInput
                length={6}
                onComplete={handleVerifyOTP}
                className='justify-center'
              />
              {isVerifyingOTP && (
                <Text className='text-base text-[#677281] text-center'>
                  Verifying OTP...
                </Text>
              )}
            </View>
          </View>
        </Animated.View>
      </View>
    </OnboardingLayout>
  )
}
