import { styled } from 'nativewind'
import { TextInput, TextInputProps, View } from 'react-native'
import { Feather } from '@expo/vector-icons'

const StyledTextInput = styled(TextInput)

interface Props extends TextInputProps {
  iconName?: keyof typeof Feather.glyphMap
  additionalClassName?: string
}

const EasyboardTextInput = ({ iconName, additionalClassName, ...props }: Props) => {
  return (
    <View className={[
      'flex flex-row rounded-lg border-[1px] border-gray-300 bg-white shadow-sm',
      additionalClassName
    ].join(' ')}>
      {iconName && (
        <View className='flex items-center justify-center rounded-l-lg border-r-[1px] border-gray-300 bg-gray-50 px-4'>
          <Feather name={iconName} size={18} color='#6B7280' />
        </View>
      )}
      <StyledTextInput
        className='flex-1 px-4 py-3 text-md text-black'
        placeholderTextColor="#6B7280"
        {...props}
      />
    </View>
  )
}

export default EasyboardTextInput
