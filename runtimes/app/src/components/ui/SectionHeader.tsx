'use client'

import { View } from 'react-native'
import type { ReactNode } from 'react'
import { Text } from '../Text'
import { usePreferences } from '../../contexts/PreferencesContext'
import { colors } from '../../theme/tokens'

interface SectionHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  const { scale, bodyLine } = usePreferences()

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
        marginBottom: 14
      }}
    >
      <View style={{ flex: 1, minWidth: 180 }}>
        <Text
          style={{
            fontSize: scale(24),
            lineHeight: scale(30),
            fontWeight: '700',
            color: colors.ink
          }}
        >
          {title}
        </Text>
        {description ? (
          <Text
            style={{
              marginTop: 4,
              fontSize: scale(15),
              lineHeight: bodyLine(15),
              color: colors.muted
            }}
          >
            {description}
          </Text>
        ) : null}
      </View>
      {action}
    </View>
  )
}
