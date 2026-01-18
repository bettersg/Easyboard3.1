import type { Meta, StoryObj } from '@storybook/react'
import {
  type OnboardingScreenProps as _OnboardingScreenProps,
  OnboardingScreen
} from './OnboardingScreen'
import { Text } from './Text'
import { View } from './View'

const meta: Meta<typeof OnboardingScreen> = {
  title: 'Components/OnboardingScreen',
  component: OnboardingScreen,
  argTypes: {}
}

export default meta
type Story = StoryObj<typeof OnboardingScreen>

export const Step1: Story = {
  args: {
    title: 'Welcome to Easyboard',
    description: 'Guiding independence, step by step.'
  },
  render: (args) => (
    <OnboardingScreen {...args}>
      <View className='flex-1 bg-[#EBF4FF] rounded-xl justify-center items-center'>
        <Text className='text-[#005BBE] font-bold'>
          Onboarding Content Placeholder
        </Text>
      </View>
    </OnboardingScreen>
  )
}

export const Step2: Story = {
  args: {
    title: 'Add your home address',
    description: 'We will use this to help you get home.'
  },
  render: (args) => (
    <OnboardingScreen {...args}>
      <View className='flex-1 bg-[#F4F5F6] rounded-xl justify-center items-center border-2 border-dashed border-[#DCDFE3]'>
        <Text className='text-[#677281]'>Address Input Placeholder</Text>
      </View>
    </OnboardingScreen>
  )
}
