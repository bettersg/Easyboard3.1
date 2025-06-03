import { Text, View } from 'react-native'

interface Props {
  text: string
  required?: boolean
  additionalClassName?: string
}

const FormLabel = ({ text, required, additionalClassName }: Props) => {
  return (
    <View className={['flex flex-row items-center mb-2', additionalClassName].join(' ')}>
      <Text className="text-base font-semibold text-gray-800">
        {text} {required && (
          <Text className="ml-1 text-error font-bold">*</Text>
        )}
      </Text>

    </View>
  )
}

export default FormLabel 