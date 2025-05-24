import { Pressable, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'

interface Props {
  additionalClassName?: string
  onPress: () => void
  value?: string
  placeholder?: string
  textClassName?: string
  disabled?: boolean
}
/**
 * This is written as generic as possible, but also as extendible as possible
 * Whenever you come across a new prop or style you want to pass in, feel free to refactor/extend this component
 */
const ImageUploadButton = ({
  additionalClassName,
  onPress,
  value,
  placeholder = 'Upload Image',
  textClassName,
  disabled = false
}: Props) => {
  return (
    <Pressable
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          backgroundColor: 'white',
          opacity: disabled ? 0.5 : pressed ? 0.75 : 1
        }
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={{ 
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12
      }}>
        <Feather 
          name="image" 
          size={20} 
          color={value ? '#4F46E5' : '#9CA3AF'} 
          style={{ marginRight: 12 }}
        />
        <Text
          numberOfLines={1}
          style={{
            fontSize: 16,
            color: value ? '#111827' : '#6B7280',
            fontWeight: value ? '500' : '400'
          }}
        >
          {value ? value : placeholder}
        </Text>
      </View>
      {/* <View style={{ 
        alignItems: 'center',
        justifyContent: 'center',
        borderLeftWidth: 1,
        borderLeftColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 16,
        paddingVertical: 12
      }}>
        <Feather 
          name="upload" 
          size={18} 
          color={value ? '#4F46E5' : '#9CA3AF'} 
        />
      </View> */}
    </Pressable>
  )
}

export default ImageUploadButton
