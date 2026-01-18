import { useEffect, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useRouter } from 'solito/navigation'
import { InputField, ProgressIndicator, Text, View } from '../../components'
import { useOnboardingStore } from '../../stores/onboardingStore'
import { OnboardingLayout } from './OnboardingLayout'

interface FormData {
  name: string
}

export function OnboardingScreen1() {
  const router = useRouter()
  const { formData, updateFormData } = useOnboardingStore()

  const {
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      name: formData.name || ''
    },
    mode: 'onChange'
  })

  const nameValue = watch('name')

  // Use refs to always access latest values in handler
  const formValuesRef = useRef({ nameValue, errors })

  useEffect(() => {
    formValuesRef.current = { nameValue, errors }
  }, [nameValue, errors])

  // Initialize form from store on mount
  useEffect(() => {
    if (formData.name) {
      setValue('name', formData.name)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleNext = () => {
    const { nameValue: currentNameValue, errors: currentErrors } =
      formValuesRef.current
    // Validate form before proceeding
    if (!currentErrors.name && currentNameValue && currentNameValue.trim()) {
      // Save to store before navigating
      updateFormData({ name: currentNameValue || null })
      router.push('/onboarding/2')
    }
    // If validation fails, errors will be shown by react-hook-form
  }

  const handleBack = () => {
    router.push('/login')
  }

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={4}
      onNext={handleNext}
      onBack={handleBack}
      showBackButton={true} // Show back button to go back to login
    >
      <View className='justify-start items-center px-6 py-4 h-[calc(100svh-80px)] w-screen'>
        <View className='gap-6 w-full'>
          <ProgressIndicator currentStep={1} totalSteps={4} />
          <View className='gap-2'>
            <Text className='text-2xl font-bold text-[#414852]'>
              What&apos;s your name?
            </Text>
          </View>
          <View className='gap-2'>
            <Controller
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  placeholder='Your name here'
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.name}
                  onSubmitEditing={() => {
                    if (!errors.name && nameValue && nameValue.trim()) {
                      handleNext()
                    }
                  }}
                />
              )}
              name='name'
            />
            {errors.name && (
              <Text className='text-sm text-[#F50008]'>Name is required.</Text>
            )}
          </View>
        </View>
      </View>
    </OnboardingLayout>
  )
}
