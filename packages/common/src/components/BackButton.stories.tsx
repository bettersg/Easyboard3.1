import type { Meta, StoryObj } from '@storybook/react'
import { BackButton } from './BackButton'
import { Text } from './Text'
import { View } from './View'

const meta: Meta<typeof BackButton> = {
  title: 'Components/BackButton',
  component: BackButton,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    onPress: {
      action: 'pressed'
    }
  }
}

export default meta
type Story = StoryObj<typeof BackButton>

export const Default: Story = {
  args: {
    onPress: () => console.log('Back button pressed')
  }
}

export const WithCustomIcon: Story = {
  args: {
    onPress: () => console.log('Back button pressed'),
    icon: (
      <View className='w-6 h-6 items-center justify-center bg-[#3F98F8] rounded-full'>
        <Text className='text-white text-sm font-bold'>×</Text>
      </View>
    )
  }
}

export const InContext: Story = {
  render: () => (
    <View className='gap-4 p-4'>
      <View className='flex-row items-center gap-4'>
        <BackButton onPress={() => console.log('Back pressed')} />
        <Text className='text-lg font-semibold text-[#414852]'>Page Title</Text>
      </View>
      <View className='flex-row items-center gap-4'>
        <BackButton
          onPress={() => console.log('Back pressed')}
          icon={
            <View className='w-6 h-6 items-center justify-center bg-[#3F98F8] rounded-full'>
              <Text className='text-white text-sm font-bold'>×</Text>
            </View>
          }
        />
        <Text className='text-lg font-semibold text-[#414852]'>
          With Custom Icon
        </Text>
      </View>
    </View>
  )
}
