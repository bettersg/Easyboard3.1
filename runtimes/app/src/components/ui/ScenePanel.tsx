'use client'

import { Ionicons } from '@expo/vector-icons'
import { View } from 'react-native'
import { Text } from '../Text'
import { usePreferences } from '../../contexts/PreferencesContext'
import { colors, radius } from '../../theme/tokens'

export type SceneKind = 'stop' | 'door' | 'card' | 'seat' | 'destination' | 'home'

const sceneMap: Record<
  SceneKind,
  { icon: keyof typeof Ionicons.glyphMap; label: string; background: string; ink: string }
> = {
  home: {
    icon: 'home-outline',
    label: 'Your place',
    background: colors.brandSoft,
    ink: colors.brand
  },
  stop: {
    icon: 'bus-outline',
    label: 'Your bus stop',
    background: '#E7EEF8',
    ink: colors.brand
  },
  door: {
    icon: 'log-in-outline',
    label: 'The open door',
    background: colors.successSoft,
    ink: colors.success
  },
  card: {
    icon: 'card-outline',
    label: 'The card reader',
    background: colors.warningSoft,
    ink: colors.warning
  },
  seat: {
    icon: 'person-outline',
    label: 'A seat near the driver',
    background: colors.surfaceMuted,
    ink: colors.inkSoft
  },
  destination: {
    icon: 'flag-outline',
    label: 'Your destination',
    background: colors.brandSoft,
    ink: colors.brand
  }
}

export function ScenePanel({ kind, caption }: { kind: SceneKind; caption?: string }) {
  const { scale } = usePreferences()
  const scene = sceneMap[kind]

  return (
    <View
      style={{
        minHeight: 188,
        borderRadius: radius.lg,
        backgroundColor: scene.background,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 24,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <View
        style={{
          position: 'absolute',
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: 'rgba(255,255,255,0.35)',
          top: -80,
          right: -50
        }}
      />
      <Ionicons name={scene.icon} size={scale(58)} color={scene.ink} />
      <Text
        style={{
          fontSize: scale(14),
          lineHeight: scale(20),
          fontWeight: '700',
          color: scene.ink,
          textAlign: 'center'
        }}
      >
        {caption || scene.label}
      </Text>
    </View>
  )
}
