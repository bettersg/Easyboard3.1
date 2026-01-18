'use client'

import { useRouter } from 'solito/navigation'
import { Text, View } from '../../components'
import { OnboardingLayout } from '../onboarding/OnboardingLayout'

export function LandingPage() {
  const router = useRouter()

  const handleNext = () => {
    router.push('/login')
  }

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={1}
      onNext={handleNext}
      showBackButton={false}
      nextButtonText='Get started'
    >
      <View className='justify-center items-center px-6 h-[calc(100svh-80px)] w-screen flex-1'>
        <Text className='text-3xl font-bold text-center mb-4 text-[#005BBE]'>
          Easyboard
        </Text>
        <Text className='text-base font-normal text-center text-[#677281]'>
          Guiding independence, step by step
        </Text>
      </View>
    </OnboardingLayout>
  )
}
