import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'
import { View } from './View'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline']
    },
    disabled: {
      control: 'boolean'
    },
    text: {
      control: 'text'
    }
  }
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    text: 'Primary Button',
    onPress: () => console.log('Primary button pressed'),
    variant: 'primary'
  }
}

export const Secondary: Story = {
  args: {
    text: 'Secondary Button',
    onPress: () => console.log('Secondary button pressed'),
    variant: 'secondary'
  }
}

export const Outline: Story = {
  args: {
    text: 'Outline Button',
    onPress: () => console.log('Outline button pressed'),
    variant: 'outline'
  }
}

export const Disabled: Story = {
  args: {
    text: 'Disabled Button',
    onPress: () => console.log('This should not fire'),
    variant: 'primary',
    disabled: true
  }
}

// export const WithLeftIcon: Story = {
//   args: {
//     text: 'Button with Icon',
//     onPress: () => console.log('Button with icon pressed'),
//     variant: 'primary',
//     leftIcon: <Text className='text-white text-lg'>←</Text>
//   }
// }

// export const WithRightIcon: Story = {
//   args: {
//     text: 'Button with Icon',
//     onPress: () => console.log('Button with icon pressed'),
//     variant: 'primary',
//     rightIcon: <Text className='text-white text-lg'>→</Text>
//   }
// }

export const AllVariants: Story = {
  render: () => (
    <View className='gap-4 p-4'>
      <Button
        text='Primary Button'
        onPress={() => console.log('Primary pressed')}
        variant='primary'
      />
      <Button
        text='Secondary Button'
        onPress={() => console.log('Secondary pressed')}
        variant='secondary'
      />
      <Button
        text='Outline Button'
        onPress={() => console.log('Outline pressed')}
        variant='outline'
      />
      <Button
        text='Disabled Button'
        onPress={() => console.log('Should not fire')}
        variant='primary'
        disabled
      />
    </View>
  )
}
