'use client'

import { Ionicons } from '@expo/vector-icons'
import { Pressable, View } from 'react-native'
import { Text } from '../Text'
import { usePreferences } from '../../contexts/PreferencesContext'
import { colors, radius, shadow } from '../../theme/tokens'

interface PlaceCardProps {
  title: string
  address?: string
  icon: keyof typeof Ionicons.glyphMap
  meta?: string
  onPress: () => void
  badge?: string
}

export function PlaceCard({ title, address, icon, meta, onPress, badge }: PlaceCardProps) {
  const { scale, bodyLine } = usePreferences()

  return (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel={`${title}${address ? `, ${address}` : ''}`}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: radius.lg,
        padding: 16,
        boxShadow: shadow.card,
        opacity: pressed ? 0.8 : 1
      })}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: radius.md,
          backgroundColor: colors.brandSoft,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Ionicons name={icon} size={scale(26)} color={colors.brand} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Text
            style={{
              fontSize: scale(19),
              lineHeight: scale(24),
              fontWeight: '700',
              color: colors.ink
            }}
          >
            {title}
          </Text>
          {badge ? (
            <View
              style={{
                backgroundColor: colors.surfaceMuted,
                borderRadius: radius.pill,
                paddingHorizontal: 8,
                paddingVertical: 2
              }}
            >
              <Text
                style={{
                  fontSize: scale(11),
                  fontWeight: '700',
                  letterSpacing: 0.3,
                  color: colors.muted,
                  textTransform: 'uppercase'
                }}
              >
                {badge}
              </Text>
            </View>
          ) : null}
        </View>
        {address ? (
          <Text
            numberOfLines={2}
            style={{
              marginTop: 3,
              fontSize: scale(14),
              lineHeight: bodyLine(14),
              color: colors.muted
            }}
          >
            {address}
          </Text>
        ) : null}
        {meta ? (
          <Text
            style={{
              marginTop: 5,
              fontSize: scale(13),
              lineHeight: bodyLine(13),
              fontWeight: '600',
              color: colors.brand
            }}
          >
            {meta}
          </Text>
        ) : null}
      </View>
      <Ionicons name='chevron-forward' size={scale(22)} color={colors.faint} />
    </Pressable>
  )
}
