'use client'

import { useRouter } from 'solito/navigation'
import { BackButton, Button, View } from '../../components'
import { useSafeArea } from '../../provider'

interface OnboardingLayoutProps {
  children: React.ReactNode
  currentStep: number
  totalSteps: number
  onNext?: () => void | Promise<void>
  onBack?: () => void
  showBackButton?: boolean
  nextButtonText?: string
}

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  showBackButton,
  nextButtonText
}: OnboardingLayoutProps) {
  const { top, bottom } = useSafeArea()
  const router = useRouter()

  const handleBackPress = () => {
    if (onBack) {
      onBack()
    } else {
      // Default: navigate to previous step
      if (currentStep > 1) {
        router.push(`/onboarding/${currentStep - 1}`)
      }
    }
  }

  const handleNextPress = async () => {
    if (onNext) {
      await onNext()
    } else {
      // Default: navigate to next step
      if (currentStep < totalSteps) {
        router.push(`/onboarding/${currentStep + 1}`)
      }
    }
  }

  const shouldShowBackButton =
    showBackButton !== undefined ? showBackButton : currentStep > 1
  const buttonText = nextButtonText || 'Next' // Default to "Next", only LandingPage should pass "Get started"

  return (
    <View
      className='flex ios:flex-1 android:flex-1 h-dvh bg-[#F4F5F6] justify-between'
      style={{ paddingTop: top }}
    >
      <View
        className='flex-row items-center justify-start px-6 pt-4 gap-4'
        style={{ opacity: shouldShowBackButton ? 1 : 0 }}
      >
        <BackButton
          onPress={handleBackPress}
          textClassName='text-[40px] mb-1'
        />
      </View>
      <View
        className='flex-1'
        onSubmit={(e: Event) => e.preventDefault()}
        // @ts-expect-error - web-specific
        accessibilityRole='form'
      >
        {children}
      </View>
      <View
        className='h-20 w-screen justify-between items-center align-middle flex-row px-6'
        style={{ paddingBottom: bottom * 2 }}
      >
        <Button
          text={buttonText}
          className='w-full'
          onPress={handleNextPress}
        />
      </View>
    </View>
  )
}
