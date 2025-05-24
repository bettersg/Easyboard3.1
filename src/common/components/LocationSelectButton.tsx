import { Feather } from '@expo/vector-icons'
import { Pressable, Text, View } from 'react-native'

interface Props {
  additionalClassName?: string
  onPress: () => void
  value?: string
  placeholder?: string
  textClassName?: string
}
/**
 * This is written as generic as possible, but also as extendible as possible
 * Whenever you come across a new prop or style you want to pass in, feel free to refactor/extend this component
 */
const LocationSelectButton = ({
  additionalClassName,
  onPress,
  value,
  placeholder = 'Select Location',
  textClassName
}: Props) => {
  return (
    <Pressable
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          backgroundColor: 'white',
          paddingHorizontal: 16,
          paddingVertical: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
          opacity: pressed ? 0.75 : 1
        }
      ]}
      onPress={onPress}
    >
      <Feather 
        name='map-pin' 
        size={20} 
        color={value ? '#4F46E5' : '#9CA3AF'} 
        style={{ marginRight: 12 }}
      />
      <Text
        numberOfLines={1}
        style={{
          flex: 1,
          fontSize: 16,
          color: value ? '#111827' : '#6B7280',
          fontWeight: value ? '500' : '400'
        }}
      >
        {value ? value : placeholder}
      </Text>
    </Pressable>
  )
}
export default LocationSelectButton
