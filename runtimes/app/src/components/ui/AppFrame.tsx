'use client'

import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '../Text'
import { usePreferences } from '../../contexts/PreferencesContext'
import { colors, radius, shadow, space } from '../../theme/tokens'
import { Toggle } from './Toggle'

interface AppFrameProps {
  children: React.ReactNode
  statusLabel?: string
  statusAction?: 'privacy' | 'none'
}

function statusCopy(mode: 'trip-only' | 'always' | 'paused') {
  if (mode === 'paused') return 'Paused'
  if (mode === 'always') return 'Always'
  return 'Trip only'
}

export function AppFrame({
  children,
  statusLabel,
  statusAction = 'privacy'
}: AppFrameProps) {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const { preferences, updatePreferences, scale, bodyLine } = usePreferences()
  const insets = useSafeAreaInsets()
  const [showDisplay, setShowDisplay] = useState(false)
  const compact = width < 620
  const narrow = width < 360

  const statusMode = preferences.privacyMode
  const offLabel = statusLabel?.toLowerCase().includes('off') || statusLabel?.toLowerCase().includes('paused')
  const statusTone =
    statusAction === 'none'
      ? { bg: colors.brandSoft, ink: colors.brand }
      : offLabel
        ? { bg: colors.warningSoft, ink: colors.warning }
        : statusMode === 'paused'
          ? { bg: colors.warningSoft, ink: colors.warning }
          : statusMode === 'always'
            ? { bg: colors.brandSoft, ink: colors.brand }
            : { bg: colors.successSoft, ink: colors.success }

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: colors.line,
          backgroundColor: colors.surface,
          position: 'relative',
          zIndex: 40,
          paddingTop: insets.top
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 1120,
            marginHorizontal: 'auto',
            paddingHorizontal: compact ? 18 : 28,
            minHeight: 70,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            position: 'relative'
          }}
        >
          <Pressable
            accessibilityRole='link'
            accessibilityLabel='EasyBoard home'
            onPress={() => router.navigate('/home')}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              opacity: pressed ? 0.7 : 1,
              minWidth: 0
            })}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 11,
                backgroundColor: colors.brand,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons name='bus' size={21} color={colors.brandInk} />
            </View>
            {!narrow ? (
              <View style={{ minWidth: 0 }}>
                <Text
                  style={{
                    fontSize: scale(18),
                    lineHeight: scale(22),
                    fontWeight: '800',
                    letterSpacing: -0.2,
                    color: colors.ink
                  }}
                >
                  EasyBoard
                </Text>
                {!compact ? (
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: scale(12),
                      lineHeight: scale(16),
                      color: colors.muted
                    }}
                  >
                    Travel with confidence
                  </Text>
                ) : null}
              </View>
            ) : null}
          </Pressable>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {statusAction === 'none' ? (
              <View
                accessibilityRole='text'
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 7,
                  minHeight: 44,
                  paddingHorizontal: 11,
                  borderRadius: radius.pill,
                  backgroundColor: statusTone.bg
                }}
              >
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 4,
                    backgroundColor: statusTone.ink
                  }}
                />
                <Text
                  style={{
                    fontSize: scale(12),
                    fontWeight: '700',
                    color: statusTone.ink
                  }}
                >
                  {statusLabel || statusCopy(statusMode)}
                </Text>
              </View>
            ) : (
              <Pressable
                accessibilityRole='button'
                accessibilityLabel={`Sharing settings: ${statusLabel || statusCopy(statusMode)}`}
                accessibilityHint='Opens privacy settings'
                onPress={() => router.navigate('/privacy')}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 7,
                  minHeight: 44,
                  paddingHorizontal: 11,
                  borderRadius: radius.pill,
                  backgroundColor: statusTone.bg,
                  opacity: pressed ? 0.75 : 1
                })}
              >
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 4,
                    backgroundColor: statusTone.ink
                  }}
                />
                <Text
                  style={{
                    fontSize: scale(12),
                    fontWeight: '700',
                    color: statusTone.ink
                  }}
                >
                  {statusLabel || statusCopy(statusMode)}
                </Text>
                <Ionicons name='chevron-forward' size={scale(12)} color={statusTone.ink} />
              </Pressable>
            )}

            <Pressable
              accessibilityRole='button'
              accessibilityLabel='Text size and reading settings'
              onPress={() => setShowDisplay(value => !value)}
              style={({ pressed }) => ({
                minWidth: 54,
                minHeight: 44,
                paddingHorizontal: 12,
                borderRadius: radius.pill,
                borderWidth: 1,
                borderColor: colors.lineStrong,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.surface,
                opacity: pressed ? 0.7 : 1
              })}
            >
              <Text style={{ fontSize: scale(14), fontWeight: '800', color: colors.ink }}>
                Text
              </Text>
            </Pressable>
          </View>

          {showDisplay ? (
            <View
              style={{
                position: 'absolute',
                top: 76,
                right: compact ? 18 : 28,
                width: 316,
                maxWidth: compact ? width - 36 : 316,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.line,
                borderRadius: radius.lg,
                padding: 18,
                boxShadow: shadow.raised,
                zIndex: 60,
                gap: 12
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12
                }}
              >
                <Text
                  style={{
                    fontSize: scale(16),
                    fontWeight: '800',
                    color: colors.ink
                  }}
                >
                  Reading settings
                </Text>
                <Pressable
                  accessibilityRole='button'
                  accessibilityLabel='Close reading settings'
                  onPress={() => setShowDisplay(false)}
                  style={{ minHeight: 44, minWidth: 36, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Ionicons name='close' size={scale(20)} color={colors.muted} />
                </Pressable>
              </View>

              <Toggle
                checked={preferences.easyRead}
                onChange={value => updatePreferences({ easyRead: value })}
                label='Easy read'
                description='Larger text and more space.'
              />

              <View style={{ gap: 8 }}>
                <Text
                  style={{
                    fontSize: scale(13),
                    lineHeight: bodyLine(13),
                    fontWeight: '700',
                    color: colors.muted
                  }}
                >
                  Text size
                </Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {[1, 1.15, 1.3].map(value => {
                    const selected = preferences.textScale === value
                    const label = value === 1 ? 'Normal' : value === 1.15 ? 'Large' : 'Larger'
                    return (
                      <Pressable
                        key={value}
                        accessibilityRole='button'
                        accessibilityState={{ selected }}
                        accessibilityLabel={`Text size ${label}`}
                        onPress={() => updatePreferences({ textScale: value })}
                        style={{
                          flex: 1,
                          minHeight: 44,
                          borderRadius: radius.sm,
                          borderWidth: 1,
                          borderColor: selected ? colors.brand : colors.line,
                          backgroundColor: selected ? colors.brand : colors.surface,
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingHorizontal: 4
                        }}
                      >
                        <Text
                          style={{
                            fontSize: scale(12),
                            fontWeight: '700',
                            color: selected ? colors.brandInk : colors.ink
                          }}
                        >
                          {label}
                        </Text>
                      </Pressable>
                    )
                  })}
                </View>
              </View>

              <Text
                style={{
                  fontSize: scale(12),
                  lineHeight: bodyLine(12),
                  color: colors.muted
                }}
              >
                These settings stay on this device.
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          width: '100%',
          maxWidth: 1120,
          marginHorizontal: 'auto',
          paddingHorizontal: compact ? 18 : 28,
          paddingTop: compact ? 24 : 34,
          paddingBottom: Math.max(space.xxl, insets.bottom + 32),
          flexGrow: 1
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
      >
        {children}
      </ScrollView>
    </View>
  )
}
