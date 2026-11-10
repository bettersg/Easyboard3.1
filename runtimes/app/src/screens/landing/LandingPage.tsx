'use client'

import { useRouter } from 'expo-router'
import { colors, font } from '../../theme/tokens'
import { Pressable } from 'react-native'
import { Text, View } from '../../components'
import { seedPreviewUser } from '../../services/devPreview'
import { OnboardingLayout } from '../onboarding/OnboardingLayout'

export function LandingPage() {
  const router = useRouter()

  const handleNext = () => {
    router.navigate('/login')
  }

  const handlePreview = async () => {
    await seedPreviewUser()
    router.navigate('/home')
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
        <Text style={{ fontFamily: font.display, fontSize: 46, lineHeight: 50, color: colors.brand, textAlign: 'center', marginBottom: 12 }}>
          EasyBoard
        </Text>
        <Text style={{ fontSize: 17, lineHeight: 24, color: colors.muted, textAlign: 'center' }}>
          Take the bus, one step at a time.
        </Text>
        {__DEV__ ? (
          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Preview traveller experience'
            onPress={handlePreview}
            style={{ minHeight: 44, justifyContent: 'center', marginTop: 18 }}
          >
            <Text className='text-sm font-semibold text-center text-[#174E8C]'>
              Preview traveller (dev build)
            </Text>
          </Pressable>
        ) : null}
      </View>
    </OnboardingLayout>
  )
}
