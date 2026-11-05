'use client'

import { Ionicons } from '@expo/vector-icons'
import { Pressable, type StyleProp, type ViewStyle } from 'react-native'
import { Text } from '../Text'
import { usePreferences } from '../../contexts/PreferencesContext'
import { colors, radius, space } from '../../theme/tokens'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ActionButtonProps {
  label: string
  onPress: () => void
  variant?: Variant
  icon?: keyof typeof Ionicons.glyphMap
  disabled?: boolean
  fullWidth?: boolean
  style?: StyleProp<ViewStyle>
  accessibilityHint?: string
  size?: 'md' | 'sm'
}

export function ActionButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  fullWidth = false,
  style,
  accessibilityHint,
  size = 'md'
}: ActionButtonProps) {
  const { scale } = usePreferences()
  const compact = size === 'sm'

  const palette = {
    primary: { background: colors.brand, border: colors.brand, text: colors.brandInk },
    secondary: {
      background: colors.brandSoft,
      border: colors.brandSoft,
      text: colors.brand
    },
    ghost: { background: 'transparent', border: colors.lineStrong, text: colors.ink },
    danger: { background: colors.danger, border: colors.danger, text: '#FFFFFF' }
  }[variant]

  return (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: compact ? 48 : 52,
          paddingHorizontal: compact ? 12 : space.lg,
          paddingVertical: compact ? 10 : 13,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: palette.border,
          backgroundColor: palette.background,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: compact ? 8 : 10,
          width: fullWidth ? '100%' : undefined,
          opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
          transform: pressed ? [{ scale: 0.992 }] : undefined
        },
        style
      ]}
    >
      {icon ? (
        <Ionicons name={icon} size={scale(compact ? 18 : 20)} color={palette.text} />
      ) : null}
      <Text
        style={{
          color: palette.text,
          fontSize: scale(compact ? 15 : 17),
          lineHeight: scale(compact ? 20 : 22),
          fontWeight: '700',
          textAlign: 'center'
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}
