import { cssInterop } from 'nativewind'
import React from 'react'
import {
  Pressable as RNPressable,
  type PressableProps as RNPressableProps
} from 'react-native'
import { cn } from '../helpers/classnames'

const Pressable = cssInterop(RNPressable, {
  className: 'style'
})

interface IconButtonProps extends RNPressableProps {
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'text'
  disabled?: boolean
  className?: string
  icon?: React.ReactNode
}

export const IconButton = React.forwardRef<
  React.ElementRef<typeof RNPressable>,
  IconButtonProps
>(
  (
    {
      icon,
      className,
      variant = 'primary',
      disabled = false,
      onPress,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      primary: 'bg-[#3F98F8]',
      secondary: 'bg-[#005BBE]',
      outline: 'bg-transparent border border-[#DCDFE3]',
      text: 'bg-transparent'
    }

    return (
      <Pressable
        className={cn(
          'flex-row items-center justify-center',
          variantStyles[variant],
          disabled ? 'opacity-50' : 'active:opacity-75',
          className
        )}
        ref={ref}
        onPress={disabled ? () => {} : onPress}
        disabled={disabled}
        android_ripple={{ color: '#333', radius: 10 }}
        {...props}
      >
        {icon}
      </Pressable>
    )
  }
)

IconButton.displayName = 'IconButton'
