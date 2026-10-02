import { type ElementRef, useRef, useState } from 'react'
import { TextInput, View } from './index'

export interface OTPInputProps {
  length?: number
  onComplete?: (otp: string) => void
  className?: string
}

export const OTPInput = ({
  length = 6,
  onComplete,
  className = ''
}: OTPInputProps) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''))
  const inputRefs = useRef<(ElementRef<typeof TextInput> | null)[]>([])

  const handleChange = (text: string, index: number) => {
    // Only allow single digit
    if (text.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = text
    setOtp(newOtp)

    // Move to next input if digit entered
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Check if OTP is complete
    if (newOtp.every((digit) => digit !== '') && onComplete) {
      onComplete(newOtp.join(''))
    }
  }

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <View className={['flex-row gap-2 items-start', className].join(' ')}>
      {Array.from({ length }).map((_, index) => (
        <View
          key={index}
          className={[
            'h-[97px] w-[50px] bg-[#FCFCFD] border border-[#DCDFE3] rounded-md flex items-center justify-center'
          ].join(' ')}
        >
          <TextInput
            ref={(ref) => {
              inputRefs.current[index] = ref
            }}
            className='text-center text-2xl font-bold text-[#414852] w-full h-full'
            value={otp[index]}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType='number-pad'
            maxLength={1}
            selectTextOnFocus
          />
        </View>
      ))}
    </View>
  )
}
