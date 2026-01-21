import { useEffect, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useRouter } from 'solito/navigation'
import { InputField, ProgressIndicator, Text, View } from '../../components'
import { useOnboardingStore } from '../../stores/onboardingStore'
import { OnboardingLayout } from './OnboardingLayout'

const PHONE_NUMBER_LENGTH = 8

interface FormData {
  careGiverPhoneNumber: string
}

export function OnboardingScreen3() {
  const router = useRouter()
  const { formData, updateFormData } = useOnboardingStore()

  const {
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      careGiverPhoneNumber: formData.careGiverPhoneNumber || ''
    },
    mode: 'onChange'
  })

  const phoneValue = watch('careGiverPhoneNumber')

  // Use refs to always access latest values in handler
  const formValuesRef = useRef({ phoneValue, errors })

  useEffect(() => {
    formValuesRef.current = { phoneValue, errors }
  }, [phoneValue, errors])

  // Initialize form from store on mount
  useEffect(() => {
    if (formData.careGiverPhoneNumber) {
      setValue('careGiverPhoneNumber', formData.careGiverPhoneNumber)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleNext = () => {
    const { phoneValue: currentPhoneValue, errors: currentErrors } =
      formValuesRef.current
    // Validate form before proceeding
    if (
      !currentErrors.careGiverPhoneNumber &&
      currentPhoneValue &&
      currentPhoneValue.length === PHONE_NUMBER_LENGTH
    ) {
      // Save to store before navigating
      updateFormData({ careGiverPhoneNumber: currentPhoneValue })
      router.push('/onboarding/4')
    }
    // If validation fails, errors will be shown by react-hook-form
  }

  const handleBack = () => {
    router.push('/onboarding/2')
  }

  const renderError = (err: any, display: string) => {
    if (err) {
      let errorString = ''
      if (err.type === 'required') {
        errorString = `${display} is required.`
      } else if (err.type === 'minLength') {
        errorString = `${display} has to be at least ${PHONE_NUMBER_LENGTH} digits.`
      }
      return errorString ? (
        <Text className='text-sm text-[#F50008]'>{errorString}</Text>
      ) : null
    }
    return null
  }

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={4}
      onNext={handleNext}
      onBack={handleBack}
    >
      <View className='justify-start items-center px-6 py-4 h-[calc(100svh-80px)] w-screen'>
        <View className='gap-6'>
          <ProgressIndicator currentStep={3} totalSteps={4} />
          <View className='gap-2'>
            <Text className='text-2xl font-bold text-[#414852]'>
              Add an emergency contact
            </Text>
            <Text className='text-base text-[#677281]'>
              They will be able to see your location when you&apos;re
              travelling. You can also call them if you need help from them.
            </Text>
          </View>
          <View className='gap-4'>
            <View
              className='gap-2'
              onSubmit={(e: Event) => e.preventDefault()}
              // @ts-expect-error - web-specific
              accessibilityRole='form'
            >
              <Text className='text-base text-[#414852]'>Phone number</Text>
              <Controller
                control={control}
                rules={{
                  required: true,
                  minLength: PHONE_NUMBER_LENGTH,
                  maxLength: PHONE_NUMBER_LENGTH
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <InputField
                    placeholder='+65 | phone number'
                    value={value ? `+65 | ${value}` : ''}
                    onBlur={onBlur}
                    onChangeText={(text) =>
                      onChange(text.replace('+65 | ', ''))
                    }
                    keyboardType='numeric'
                    maxLength={14} // Allow for +65 prefix
                    error={!!errors.careGiverPhoneNumber}
                    onSubmitEditing={() => {
                      if (
                        !errors.careGiverPhoneNumber &&
                        phoneValue &&
                        phoneValue.length === PHONE_NUMBER_LENGTH
                      ) {
                        handleNext()
                      }
                    }}
                  />
                )}
                name='careGiverPhoneNumber'
              />
              {renderError(errors.careGiverPhoneNumber, 'Phone number')}
            </View>
          </View>
        </View>
      </View>
    </OnboardingLayout>
  )
}
