'use client'

import { View } from 'react-native'
import { Text } from '../Text'
import { usePreferences } from '../../contexts/PreferencesContext'
import { colors, radius } from '../../theme/tokens'

interface ProgressBarProps {
  current: number
  total: number
  label?: string
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const { scale } = usePreferences()
  const percent = Math.min(100, Math.max(0, (current / total) * 100))

  return (
    <View style={{ gap: 8 }}>
      {label ? (
        <Text
          style={{
            fontSize: scale(13),
            fontWeight: '700',
            letterSpacing: 0.4,
            color: colors.muted,
            textTransform: 'uppercase'
          }}
        >
          {label}
        </Text>
      ) : null}
      <View
        accessibilityRole='progressbar'
        accessibilityValue={{ min: 0, max: total, now: current }}
        style={{
          height: 8,
          borderRadius: radius.pill,
          backgroundColor: colors.surfaceMuted,
          overflow: 'hidden'
        }}
      >
        <View
          style={{
            width: `${percent}%`,
            height: '100%',
            borderRadius: radius.pill,
            backgroundColor: colors.brand
          }}
        />
      </View>
    </View>
  )
}
