'use client'

import { Pressable, View } from 'react-native'
import { Text } from '../Text'
import { usePreferences } from '../../contexts/PreferencesContext'
import { colors, radius } from '../../theme/tokens'

interface ToggleProps {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  description?: string
  disabled?: boolean
}

export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  const { scale, bodyLine } = usePreferences()

  return (
    <Pressable
      accessibilityRole='switch'
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
        opacity: disabled ? 0.45 : pressed ? 0.75 : 1
      })}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: scale(16),
            lineHeight: bodyLine(16),
            fontWeight: '700',
            color: colors.ink
          }}
        >
          {label}
        </Text>
        {description ? (
          <Text
            style={{
              marginTop: 3,
              fontSize: scale(14),
              lineHeight: bodyLine(14),
              color: colors.muted
            }}
          >
            {description}
          </Text>
        ) : null}
      </View>
      <View
        style={{
          width: 48,
          height: 28,
          borderRadius: radius.pill,
          backgroundColor: checked ? colors.brand : colors.lineStrong,
          padding: 3,
          justifyContent: 'center'
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: colors.surface,
            transform: [{ translateX: checked ? 20 : 0 }]
          }}
        />
      </View>
    </Pressable>
  )
}
