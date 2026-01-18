import type { Meta, StoryObj } from '@storybook/react'
import {
  type LocationCardProps as _LocationCardProps,
  LocationCard
} from './LocationCard'
import { Text } from './Text'
import { View } from './View'

const meta: Meta<typeof LocationCard> = {
  title: 'Components/LocationCard',
  component: LocationCard,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    isHome: {
      control: 'boolean'
    },
    onPress: {
      action: 'pressed'
    }
  }
}

export default meta
type Story = StoryObj<typeof LocationCard>

export const Default: Story = {
  args: {
    title: '123 Main Street',
    subtitle: 'New York, NY 10001',
    onPress: () => console.log('Location card pressed')
  }
}

export const WithoutSubtitle: Story = {
  args: {
    title: '123 Main Street',
    onPress: () => console.log('Location card pressed')
  }
}

export const HomeLocation: Story = {
  args: {
    title: 'Home',
    subtitle: '123 Main Street, New York, NY 10001',
    isHome: true,
    onPress: () => console.log('Home location pressed')
  }
}

export const NonClickable: Story = {
  args: {
    title: '123 Main Street',
    subtitle: 'New York, NY 10001'
  }
}

export const AllVariants: Story = {
  render: () => (
    <View className='gap-4 p-4 w-[350px]'>
      <View className='gap-2'>
        <Text className='text-sm font-semibold text-[#414852]'>
          Default Card
        </Text>
        <LocationCard
          title='123 Main Street'
          subtitle='New York, NY 10001'
          onPress={() => console.log('Card pressed')}
        />
      </View>
      <View className='gap-2'>
        <Text className='text-sm font-semibold text-[#414852]'>
          Home Location
        </Text>
        <LocationCard
          title='Home'
          subtitle='123 Main Street, New York, NY 10001'
          isHome
          onPress={() => console.log('Home pressed')}
        />
      </View>
      <View className='gap-2'>
        <Text className='text-sm font-semibold text-[#414852]'>
          Without Subtitle
        </Text>
        <LocationCard
          title='Work'
          onPress={() => console.log('Work pressed')}
        />
      </View>
      <View className='gap-2'>
        <Text className='text-sm font-semibold text-[#414852]'>
          Non-Clickable
        </Text>
        <LocationCard
          title='Current Location'
          subtitle='123 Main Street, New York, NY 10001'
        />
      </View>
    </View>
  )
}
