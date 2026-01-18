import type { Meta, StoryObj } from '@storybook/react'
import { InputField } from './InputField'
import { Text } from './Text'
import { View } from './View'

const meta: Meta<typeof InputField> = {
  title: 'Components/InputField',
  component: InputField,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    error: {
      control: 'boolean'
    },
    placeholder: {
      control: 'text'
    },
    value: {
      control: 'text'
    }
  }
}

export default meta
type Story = StoryObj<typeof InputField>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
    value: ''
  }
}

export const WithValue: Story = {
  args: {
    placeholder: 'Enter text...',
    value: 'Sample text'
  }
}

export const WithError: Story = {
  args: {
    placeholder: 'Enter text...',
    value: '',
    error: true
  }
}

export const EmailInput: Story = {
  args: {
    placeholder: 'Enter your email',
    value: '',
    keyboardType: 'email-address',
    autoCapitalize: 'none'
  }
}

export const PasswordInput: Story = {
  args: {
    placeholder: 'Enter your password',
    value: '',
    secureTextEntry: true
  }
}

export const PhoneInput: Story = {
  args: {
    placeholder: 'Enter phone number',
    value: '',
    keyboardType: 'phone-pad'
  }
}

export const AllStates: Story = {
  render: () => (
    <View className='gap-4 p-4 w-[300px]'>
      <View className='gap-2'>
        <Text className='text-sm font-semibold text-[#414852]'>Default</Text>
        <InputField placeholder='Enter text...' />
      </View>
      <View className='gap-2'>
        <Text className='text-sm font-semibold text-[#414852]'>With Value</Text>
        <InputField placeholder='Enter text...' value='Sample text' />
      </View>
      <View className='gap-2'>
        <Text className='text-sm font-semibold text-[#414852]'>
          Error State
        </Text>
        <InputField placeholder='Enter text...' error />
      </View>
      <View className='gap-2'>
        <Text className='text-sm font-semibold text-[#414852]'>
          Email Input
        </Text>
        <InputField
          placeholder='Enter your email'
          keyboardType='email-address'
        />
      </View>
      <View className='gap-2'>
        <Text className='text-sm font-semibold text-[#414852]'>
          Password Input
        </Text>
        <InputField placeholder='Enter password' secureTextEntry />
      </View>
    </View>
  )
}
