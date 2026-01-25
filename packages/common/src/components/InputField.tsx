import { type TextInputProps } from 'react-native'
import { cn } from '../helpers/classnames'
import { TextInput } from './TextInput'
import { View } from './View'

export interface InputFieldProps extends TextInputProps {
  error?: boolean
  className?: string
}

export const InputField = ({
  error = false,
  className = '',
  editable = true,
  ...props
}: InputFieldProps) => {
  return (
    <View
      className={cn(
        'h-[53px] bg-[#FCFCFD] border border-[#DCDFE3] rounded-md',
        error ? 'border-[#F50008]' : '',
        !editable ? 'bg-[#DCDFE3]' : '',
        className
      )}
    >
      <TextInput
        className={cn(
          'flex-1 px-4 py-3 text-base text-[#414852]',
          !editable ? 'text-[#414852]' : '',
          props.placeholder ? 'text-[#9F9F9F]' : ''
        )}
        placeholderTextColor='#9F9F9F'
        {...props}
      />
    </View>
  )
}
