'use client'

import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { Linking, Pressable, useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScrollView, Text } from '../../components'
import { ActionButton, Toast } from '../../components/ui'
import { usePreferences } from '../../contexts/PreferencesContext'
import { useToast } from '../../hooks/useToast'
import { getUserStorage } from '../../services/storageService'
import { colors, font, radius, shadow } from '../../theme/tokens'
import type { PWIDUser } from '../../types'

export function HelpCardPage() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const { scale, bodyLine } = usePreferences()
  const insets = useSafeAreaInsets()
  const { message, showToast } = useToast()

  const params = useLocalSearchParams<{
    destination?: string
    location?: string
    caregiverName?: string
    caregiverPhone?: string
  }>()

  const [profile, setProfile] = useState<{ name: string; caregiverName: string; caregiverPhone: string }>({
    name: '',
    caregiverName: params.caregiverName || 'your caregiver',
    caregiverPhone: params.caregiverPhone || ''
  })
  const [showMode, setShowMode] = useState(false)

  useEffect(() => {
    const load = async () => {
      const stored = await getUserStorage()
      if (!stored) return
      const pwid = stored as unknown as PWIDUser
      setProfile(current => ({
        name: pwid.name?.trim() || current.name,
        caregiverName:
          current.caregiverName && current.caregiverName !== 'your caregiver'
            ? current.caregiverName
            : 'your caregiver',
        caregiverPhone: current.caregiverPhone || pwid.caregiverPhone || ''
      }))
    }
    load().catch(error => console.error('Error loading help card:', error))
  }, [])

  const destination = params.destination || 'my destination'
  const location = params.location?.trim() || ''
  const locationSentence = location
    ? location.startsWith('the way')
      ? `I am on the way to ${destination}.`
      : `I am at ${location}.`
    : ''
  const caregiverName = profile.caregiverName
  const caregiverPhone = profile.caregiverPhone
  const compact = width < 620

  const callCaregiver = useMemo(
    () => async () => {
      if (!caregiverPhone) {
        showToast('No caregiver number saved.')
        return
      }
      try {
        await Linking.openURL(`tel:${caregiverPhone}`)
      } catch {
        showToast(`Call ${caregiverName}: ${caregiverPhone}`)
      }
    },
    [caregiverName, caregiverPhone, showToast]
  )

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: showMode ? colors.surface : colors.canvas }}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          width: '100%',
          maxWidth: 820,
          marginHorizontal: 'auto',
          paddingHorizontal: compact ? 18 : 28,
          paddingTop: (compact ? 18 : 26) + insets.top,
          paddingBottom: Math.max(48, insets.bottom + 32),
          flex: 1
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 18
          }}
        >
          {showMode ? (
            <View />
          ) : (
            <Pressable
              accessibilityRole='button'
              accessibilityLabel='Back'
              onPress={() => (router.canGoBack() ? router.back() : router.navigate('/home'))}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 }}
            >
              <Ionicons name='arrow-back' size={scale(20)} color={colors.brand} />
              <Text style={{ fontSize: scale(14), fontWeight: '700', color: colors.brand }}>
                Back
              </Text>
            </Pressable>
          )}
          {showMode ? (
            <Pressable
              accessibilityRole='button'
              accessibilityLabel='Close full screen help card'
              onPress={() => setShowMode(false)}
              style={{
                minHeight: 44,
                paddingHorizontal: 12,
                borderRadius: radius.pill,
                borderWidth: 1,
                borderColor: colors.lineStrong,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Text style={{ fontSize: scale(13), fontWeight: '700', color: colors.ink }}>
                Close
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View
          style={{
            backgroundColor: colors.surface,
            borderWidth: showMode ? 0 : 1,
            borderColor: colors.line,
            borderRadius: showMode ? 0 : radius.xl,
            padding: showMode ? 8 : compact ? 22 : 32,
            gap: showMode ? 18 : 20,
            boxShadow: showMode ? undefined : shadow.card,
            flex: showMode ? 1 : undefined,
            justifyContent: showMode ? 'center' : 'flex-start'
          }}
        >
          <View style={{ gap: 6 }}>
            <Text
              style={{
                fontSize: scale(showMode ? 14 : 12),
                fontWeight: '900',
                letterSpacing: 1.4,
                color: colors.danger,
                textTransform: 'uppercase'
              }}
            >
              Help card
            </Text>
            <Text
              style={{
                fontFamily: font.display,
                fontSize: scale(showMode ? (compact ? 44 : 56) : compact ? 34 : 44),
                lineHeight: scale(showMode ? (compact ? 48 : 60) : compact ? 38 : 48),
                color: colors.ink,
                letterSpacing: -0.5
              }}
            >
              {profile.name ? `My name is ${profile.name}.` : 'I need help.'}
            </Text>
            <Text
              style={{
                fontFamily: font.display,
                fontSize: scale(showMode ? (compact ? 34 : 44) : compact ? 28 : 34),
                lineHeight: scale(showMode ? (compact ? 39 : 50) : compact ? 33 : 39),
                color: colors.ink,
                letterSpacing: -0.3
              }}
            >
              I am going to {destination}.
            </Text>
          </View>

          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: colors.line,
              paddingTop: showMode ? 18 : 16,
              gap: 10
            }}
          >
            {locationSentence ? (
              <Text style={{ fontSize: scale(showMode ? 20 : 17), lineHeight: bodyLine(showMode ? 20 : 17), color: colors.inkSoft }}>
                {locationSentence}
              </Text>
            ) : null}
            <Text style={{ fontSize: scale(showMode ? 20 : 17), lineHeight: bodyLine(showMode ? 20 : 17), color: colors.inkSoft }}>
              Please call my caregiver.
            </Text>
            <Text
              style={{
                fontSize: scale(showMode ? 34 : 28),
                lineHeight: scale(showMode ? 40 : 34),
                fontWeight: '900',
                color: colors.danger,
                fontVariant: ['tabular-nums']
              }}
            >
              {caregiverPhone || 'No number saved'}
            </Text>
          </View>

          {!showMode ? (
            <View style={{ gap: 10 }}>
              <ActionButton
                label={caregiverPhone ? 'Call caregiver' : 'No caregiver number'}
                icon='call-outline'
                onPress={callCaregiver}
                disabled={!caregiverPhone}
                fullWidth
              />
              <ActionButton
                label='Show this to someone'
                icon='people-outline'
                variant='secondary'
                onPress={() => setShowMode(true)}
                fullWidth
              />

            </View>
          ) : (
            <ActionButton
              label={caregiverPhone ? 'Call caregiver' : 'No caregiver number'}
              icon='call-outline'
              onPress={callCaregiver}
              disabled={!caregiverPhone}
              fullWidth
            />
          )}

          <View
            style={{
              backgroundColor: colors.surfaceMuted,
              borderRadius: radius.md,
              padding: 14,
              gap: 4
            }}
          >
            <Text style={{ fontSize: scale(12), fontWeight: '800', letterSpacing: 0.7, textTransform: 'uppercase', color: colors.muted }}>
              For the driver
            </Text>
            <Text style={{ fontSize: scale(16), lineHeight: bodyLine(16), color: colors.ink }}>
              “I am going to {destination}. Please tell me when to get off.”
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Text style={{ fontSize: scale(12), lineHeight: bodyLine(12), color: colors.faint }}>
              Works while this app is open.
            </Text>
            <Pressable
              accessibilityRole='link'
              accessibilityLabel='Call emergency services on 999'
              onPress={() => Linking.openURL('tel:999')}
              style={{ minHeight: 44, justifyContent: 'center' }}
            >
              <Text style={{ fontSize: scale(13), fontWeight: '800', color: colors.danger }}>
                Emergency: 999
              </Text>
            </Pressable>
          </View>
        </View>
        <Text style={{ marginTop: 14, fontSize: scale(12), color: colors.faint, textAlign: 'center' }}>
          Only share this card with someone who is helping you.
        </Text>
      </View>
      <Toast message={message} />
    </ScrollView>
  )
}
