import React from 'react'
import {
  type ImageSourcePropType,
  Image as RNImage,
  Pressable as RNPressable,
  type PressableProps as RNPressableProps
} from 'react-native'
import { cn } from '../helpers/classnames'
import { Text } from './Text'

const Pressable = RNPressable

const IconImage = RNImage

interface ButtonProps extends RNPressableProps {
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'text'
  disabled?: boolean
  className?: string
  text?: string
  textClassName?: string
  leftIcon?: ImageSourcePropType
  rightIcon?: ImageSourcePropType
  children?: React.ReactNode
}

export const Button = React.forwardRef<
  React.ElementRef<typeof RNPressable>,
  ButtonProps
>(
  (
    {
      text,
      leftIcon,
      rightIcon,
      textClassName,
      className,
      variant = 'primary',
      disabled = false,
      onPress,
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      primary: 'bg-[#174E8C]',
      secondary: 'bg-[#E7EFF9]',
      outline: 'bg-transparent border border-[#C9D4CE]',
      text: 'bg-transparent'
    }

    const textColor =
      variant === 'outline'
        ? 'text-[#414852]'
        : variant === 'secondary'
          ? 'text-[#174E8C]'
          : variant === 'text'
            ? 'text-[#174E8C]'
            : 'text-[#F4F7F4]'

    // If children are provided, use them instead of text
    const hasChildren = children !== undefined && children !== null

    return (
      <Pressable
        className={cn(
          hasChildren ? '' : 'min-h-[48px]',
          'flex-row items-center justify-center rounded-[14px] px-3 gap-2',
          variantStyles[variant],
          disabled ? 'opacity-50' : 'active:opacity-75',
          className
        )}
        ref={ref}
        accessibilityRole='button'
        accessibilityLabel={text}
        accessibilityState={{ disabled }}
        onPress={disabled ? () => {} : onPress}
        disabled={disabled}
        android_ripple={{ color: '#333', radius: 10 }}
        {...props}
      >
        {hasChildren ? (
          children
        ) : (
          <>
            {leftIcon && (
              <IconImage
                source={leftIcon}
                className='h-4 w-4'
                resizeMode='contain'
              />
            )}
            {text && (
              <Text
                className={cn(
                  'font-bold text-base text-center',
                  textColor,
                  textClassName
                )}
              >
                {text}
              </Text>
            )}
            {rightIcon && (
              <IconImage
                source={rightIcon}
                className='h-4 w-4'
                resizeMode='contain'
              />
            )}
          </>
        )}
      </Pressable>
    )
  }
)

Button.displayName = 'Button'
