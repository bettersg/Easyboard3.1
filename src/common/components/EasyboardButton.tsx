import { Feather } from '@expo/vector-icons'
import { styled } from 'nativewind'
import { Pressable, Text } from 'react-native'

const StyledPressable = styled(Pressable)

interface Props {
  type?: 'bg-primary' | 'bg-secondary' | 'bg-error' | 'bg-warning' | 'bg-success' | 'bg-white'
  fullWidth?: boolean
  disabled?: boolean
  onPress: () => void
  title: string
  iconAfter?: boolean
  iconName?: 'phone-call' | 'save' | 'map-pin' | 'chevron-right' | 'chevron-left'
  iconSize?: number
  titleSize?: 'text-base' | 'text-xs' | 'text-sm' | 'text-md' | 'text-lg' | 'text-xl'
}
/**
 * This is written as generic as possible, but also as extendible as possible
 * Whenever you come across a new prop or style you want to pass in, feel free to refactor/extend this component
 */
const EasyboardButton = ({
  disabled,
  type,
  fullWidth,
  onPress,
  title,
  titleSize = 'text-base',
  iconName,
  iconSize = 20,
  iconAfter,
}: Props) => {
  return (
    <StyledPressable
      className={[
        'flex h-12 flex-row items-center justify-center rounded-3xl bg-primary px-4 text-xl active:opacity-75',
        type,
        type === 'bg-white' ? 'border-2 border-slate-800' : '',
        fullWidth ? 'w-full' : '',
        disabled ? 'opacity-30' : '',
      ].join(' ')}
      onPress={disabled ? () => {} : onPress}
    >
      <>
        {iconName && !iconAfter && (
          <Feather
            name={iconName}
            size={iconSize}
            color={type === 'bg-white' ? 'black' : 'white'}
          />
        )}
        <Text
          className={`text-center ${
            type === 'bg-white' ? 'text-slate-800' : 'text-white'
          } px-2 font-semibold ${titleSize}`}
        >
          {title}
        </Text>
        {iconName && iconAfter && (
          <Feather
            name={iconName}
            size={iconSize}
            color={type === 'bg-white' ? 'black' : 'white'}
          />
        )}
      </>
    </StyledPressable>
  )
}
export default EasyboardButton
