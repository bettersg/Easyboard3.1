import { useEffect, useRef } from 'react'
import { useRouter } from 'solito/navigation'
import { Button, ProgressIndicator, Text, View } from '../../components'
import { useLogin } from '../../hooks'
import { OnboardingLayout } from './OnboardingLayout'

export function OnboardingScreen2() {
  const router = useRouter()
  const { userType, setUserType } = useLogin()

  // Use ref to always access latest userType in handler
  const userTypeRef = useRef(userType)

  useEffect(() => {
    userTypeRef.current = userType
  }, [userType])

  const handleNext = () => {
    const currentUserType = userTypeRef.current
    // Validate that userType is selected before proceeding
    if (currentUserType) {
      router.push('/onboarding/3')
    }
    // If no userType selected, don't navigate (user needs to select first)
  }

  const handleBack = () => {
    router.push('/onboarding/1')
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
            <Text className='text-2xl font-bold text-[#414852]'>
              What are you using Easyboard for?
            </Text>
          </View>
          <View className='gap-2'>
            <Button
              text="I'm travelling independently"
              variant='secondary'
              className={`bg-white ${userType === 'PWID' ? 'border-2 border-[#3F98F8]' : ''}`}
              textClassName='text-[#3F98F8]'
              onPress={() => setUserType('PWID')}
            />
            <Button
              text="I'm checking on my loved one's travel"
              variant='secondary'
              className={`bg-white ${userType === 'CAREGIVER' ? 'border-2 border-[#3F98F8]' : ''}`}
              textClassName='text-[#3F98F8]'
              onPress={() => setUserType('CAREGIVER')}
            />
          </View>
        </View>
      </View>
    </OnboardingLayout>
  )
}
