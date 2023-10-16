import { styled } from 'nativewind'
import { TextInput, TextInputProps } from 'react-native'

const StyledTextInput = styled(TextInput)

const EasyboardTextInput = (props: TextInputProps) => {
  return (
    <StyledTextInput
      className="text-md rounded-sm border-[0.5px] border-textInputBorder px-2 py-3 text-black"
      {...props}
    />
  )
}
export default EasyboardTextInput
