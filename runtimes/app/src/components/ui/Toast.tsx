'use client'

import { Ionicons } from '@expo/vector-icons'
import { Platform, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '../Text'
import { usePreferences } from '../../contexts/PreferencesContext'
import { colors, radius, shadow } from '../../theme/tokens'

export function Toast({ message }: { message: string | null }) {
  const { scale } = usePreferences()
  const insets = useSafeAreaInsets()
  if (!message) return null

  return (
    <View
      accessibilityRole='alert'
      accessibilityLiveRegion='polite'
      style={{
        position: Platform.OS === 'web' ? ('fixed' as never) : 'absolute',
        left: 24,
        right: 24,
        bottom: Math.max(24, insets.bottom + 16),
        alignItems: 'center',
        zIndex: 100
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: colors.dark,
          borderRadius: radius.md,
          paddingHorizontal: 16,
          paddingVertical: 12,
          boxShadow: shadow.raised,
          maxWidth: 560
        }}
      >
        <Ionicons name='checkmark-circle' size={scale(20)} color={colors.successSoft} />
        <Text
          style={{
            color: colors.darkInk,
            fontSize: scale(15),
            lineHeight: scale(21),
            fontWeight: '600'
          }}
        >
          {message}
        </Text>
      </View>
    </View>
  )
}
