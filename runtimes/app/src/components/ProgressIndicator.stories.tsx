import type { Meta, StoryObj } from '@storybook/react'
import {
  type ProgressIndicatorProps as _ProgressIndicatorProps,
  ProgressIndicator
} from './ProgressIndicator'
import { Text } from './Text'
import { View } from './View'

const meta: Meta<typeof ProgressIndicator> = {
  title: 'Components/ProgressIndicator',
  component: ProgressIndicator,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    currentStep: {
      control: { type: 'number', min: 1, max: 5, step: 1 }
    },
    totalSteps: {
      control: { type: 'number', min: 2, max: 5, step: 1 }
    }
  }
}

export default meta
type Story = StoryObj<typeof ProgressIndicator>

export const Step1Of3: Story = {
  args: {
    currentStep: 1,
    totalSteps: 3
  }
}

export const Step2Of3: Story = {
  args: {
    currentStep: 2,
    totalSteps: 3
  }
}

export const Step3Of3: Story = {
  args: {
    currentStep: 3,
    totalSteps: 3
  }
}

export const Step2Of5: Story = {
  args: {
    currentStep: 2,
    totalSteps: 5
  }
}

export const AllSteps: Story = {
  render: () => (
    <View className='gap-6 p-4 w-[300px]'>
      <View className='gap-2'>
        <Text className='text-sm font-semibold text-[#414852]'>
          Step 1 of 3
        </Text>
        <ProgressIndicator currentStep={1} totalSteps={3} />
      </View>
      <View className='gap-2'>
        <Text className='text-sm font-semibold text-[#414852]'>
          Step 2 of 3
        </Text>
        <ProgressIndicator currentStep={2} totalSteps={3} />
      </View>
      <View className='gap-2'>
        <Text className='text-sm font-semibold text-[#414852]'>
          Step 3 of 3 (Complete)
        </Text>
        <ProgressIndicator currentStep={3} totalSteps={3} />
      </View>
      <View className='gap-2'>
        <Text className='text-sm font-semibold text-[#414852]'>
          Step 2 of 5
        </Text>
        <ProgressIndicator currentStep={2} totalSteps={5} />
      </View>
      <View className='gap-2'>
        <Text className='text-sm font-semibold text-[#414852]'>
          Step 4 of 5
        </Text>
        <ProgressIndicator currentStep={4} totalSteps={5} />
      </View>
    </View>
  )
}
