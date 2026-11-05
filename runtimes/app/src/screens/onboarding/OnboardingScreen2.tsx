import { useRouter } from 'expo-router'
import { colors, font } from '../../theme/tokens'
import { useEffect, useRef, useState } from 'react'
import { Button, ProgressIndicator, Text, View } from '../../components'
import { useLogin } from '../../hooks'
import { OnboardingLayout } from './OnboardingLayout'

export function OnboardingScreen2() {
  const router = useRouter()
  const { userType, setUserType } = useLogin()
  const [error, setError] = useState('')

  // Use ref to always access latest userType in handler
  const userTypeRef = useRef(userType)

  useEffect(() => {
    userTypeRef.current = userType
  }, [userType])

  const handleNext = () => {
    const currentUserType = userTypeRef.current
    // Validate that userType is selected before proceeding
    if (currentUserType) {
      router.navigate('/onboarding/3')
    } else {
      setError('Choose one to continue.')
    }
  }

  const handleBack = () => {
    router.navigate('/onboarding/1')
  }

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={4}
      onNext={handleNext}
      onBack={handleBack}
    >
      <View className='justify-start items-center px-6 py-4 h-[calc(100svh-80px)] w-screen'>
        <View className='gap-6 w-full'>
          <ProgressIndicator currentStep={2} totalSteps={4} />
          <View className='gap-2'>
            <Text style={{ fontFamily: font.display, fontSize: 30, lineHeight: 34, color: colors.ink }}>
              What are you using EasyBoard for?
            </Text>
          </View>
          <View className='gap-2'>
            <Button
              text='I travel independently'
              variant='secondary'
              className={`bg-white ${userType === 'PWID' ? 'border-2 border-[#3F98F8]' : ''}`}
              textClassName='text-[#3F98F8]'
              onPress={() => {
                setError('')
                setUserType('PWID')
              }}
            />
            <Button
              text='I support a traveller'
              variant='secondary'
              className={`bg-white ${userType === 'CAREGIVER' ? 'border-2 border-[#3F98F8]' : ''}`}
              textClassName='text-[#3F98F8]'
              onPress={() => {
                setError('')
                setUserType('CAREGIVER')
              }}
            />
          </View>
          {error ? (
            <Text accessibilityRole='alert' className='text-sm text-[#F50008]'>
              {error}
            </Text>
          ) : null}
        </View>
      </View>
    </OnboardingLayout>
  )
}
