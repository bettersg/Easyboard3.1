import type { Meta, StoryObj } from '@storybook/react'
import { OTPInput } from './OTPInput'
import { Text } from './Text'
import { View } from './View'

const meta: Meta<typeof OTPInput> = {
  title: 'Components/OTPInput',
  component: OTPInput,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    length: {
      control: { type: 'number', min: 4, max: 8, step: 1 }
    },
    onComplete: {
      action: 'completed'
    }
  }
}

export default meta
type Story = StoryObj<typeof OTPInput>

export const Default: Story = {
  args: {
    length: 6,
    onComplete: (otp: string) => console.log('OTP completed:', otp)
  }
}

export const FourDigits: Story = {
  args: {
    length: 4,
    onComplete: (otp: string) => console.log('OTP completed:', otp)
  }
}

export const EightDigits: Story = {
  args: {
    length: 8,
    onComplete: (otp: string) => console.log('OTP completed:', otp)
  }
}

export const WithInstructions: Story = {
  render: () => (
    <View className='gap-4 p-4 items-center'>
      <Text className='text-lg font-semibold text-[#414852] text-center'>
        Enter Verification Code
      </Text>
      <Text className='text-sm text-[#677281] text-center'>
        Please enter the 6-digit code sent to your phone
      </Text>
      <OTPInput
        length={6}
        onComplete={(otp: string) => {
          console.log('OTP completed:', otp)
          alert(`Verification code: ${otp}`)
        }}
      />
    </View>
  )
}

export const DifferentLengths: Story = {
  render: () => (
    <View className='gap-8 p-4 items-center'>
      <View className='gap-2 items-center'>
        <Text className='text-sm font-semibold text-[#414852]'>4 Digits</Text>
        <OTPInput
          length={4}
          onComplete={(otp) => console.log('4-digit OTP:', otp)}
        />
      </View>
      <View className='gap-2 items-center'>
        <Text className='text-sm font-semibold text-[#414852]'>
          6 Digits (Default)
        </Text>
        <OTPInput
          length={6}
          onComplete={(otp) => console.log('6-digit OTP:', otp)}
        />
      </View>
      <View className='gap-2 items-center'>
        <Text className='text-sm font-semibold text-[#414852]'>8 Digits</Text>
        <OTPInput
          length={8}
          onComplete={(otp) => console.log('8-digit OTP:', otp)}
        />
      </View>
    </View>
  )
}
