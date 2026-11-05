'use client'

import { Ionicons } from '@expo/vector-icons'
import { Pressable } from 'react-native'
import { Text } from '../Text'
import { usePreferences } from '../../contexts/PreferencesContext'
import { useReadAloud } from '../../hooks/useReadAloud'
import { colors, radius } from '../../theme/tokens'

export function ReadAloudButton({ text, label = 'Hear this' }: { text: string; label?: string }) {
  const { scale } = usePreferences()
  const { speak, supported } = useReadAloud()

  if (!supported) return null

  return (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel={label}
      accessibilityHint='Reads this step aloud'
      onPress={() => speak(text)}
      style={({ pressed }) => ({
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        minHeight: 44,
        paddingHorizontal: 13,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.lineStrong,
        backgroundColor: pressed ? colors.surfaceMuted : colors.surface
      })}
    >
      <Ionicons name='volume-high-outline' size={scale(18)} color={colors.brand} />
      <Text style={{ fontSize: scale(13), fontWeight: '700', color: colors.brand }}>
        {label}
      </Text>
    </Pressable>
  )
}
