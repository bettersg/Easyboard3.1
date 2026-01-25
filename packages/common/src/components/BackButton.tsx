import { cssInterop } from 'nativewind'
import { Pressable as RNPressable } from 'react-native'
import { Text } from './Text'

const Pressable = cssInterop(RNPressable, {
  className: 'style'
})

export interface BackButtonProps {
  onPress: () => void
  icon?: React.ReactNode
  className?: string
  textClassName?: string
}

export const BackButton = ({
  onPress,
  icon,
  className = '',
  textClassName = ''
}: BackButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={[
        'items-center justify-center active:opacity-75',
        className
      ].join(' ')}
    >
      {icon || (
        <Text className={['text-[#414852]', textClassName].join(' ')}>‹</Text>
      )}
    </Pressable>
  )
}
