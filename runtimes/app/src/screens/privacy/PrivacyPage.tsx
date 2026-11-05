'use client'

import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import { Text } from '../../components'
import { ActionButton, AppFrame, Toast } from '../../components/ui'
import { useAuth } from '../../contexts'
import { usePreferences, type PrivacyMode } from '../../contexts/PreferencesContext'
import { useLocationSharing } from '../../contexts/LocationSharingContext'
import { useToast } from '../../hooks/useToast'
import { getActiveTrip, stageLabel, subscribeToTrip } from '../../services/tripStore'
import { completeLogout } from '../../services/storageService'
import { colors, font, radius, shadow, space } from '../../theme/tokens'

const MODES: { id: PrivacyMode; title: string; description: string }[] = [
  {
    id: 'trip-only',
    title: 'This trip only',
    description: 'While a trip is active.'
  },
  {
    id: 'always',
    title: 'Always',
    description: 'Until you turn it off.'
  },
  {
    id: 'paused',
    title: 'Paused',
    description: 'Nothing is shared.'
  }
]

export function PrivacyPage() {
  const router = useRouter()
  const { setAuthentication } = useAuth()
  const { preferences, updatePreferences, scale, bodyLine } = usePreferences()
  const { setIsLocationSharing } = useLocationSharing()
  const { message, showToast } = useToast()
  const [signOutOpen, setSignOutOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [trip, setTrip] = useState(getActiveTrip)

  useEffect(() => subscribeToTrip(setTrip), [])

  const hasActiveTrip = Boolean(
    trip && trip.stage !== 'arrived' && preferences.privacyMode !== 'paused'
  )
  const previewTone = hasActiveTrip ? colors.success : colors.muted
  const previewTitle =
    preferences.privacyMode === 'paused'
      ? 'Nothing shared'
      : hasActiveTrip
        ? preferences.privacyMode === 'always'
          ? 'Location on'
          : 'Sharing this trip'
        : preferences.privacyMode === 'always'
          ? 'Location on'
          : 'Nothing shared now'
  const previewBody =
    hasActiveTrip && trip
      ? `${trip.destination} · ${stageLabel(trip.stage)}`
      : preferences.privacyMode === 'always'
        ? 'Sharing is on.'
        : preferences.privacyMode === 'paused'
          ? 'Sharing is paused.'
          : 'No active trip.'

  const setMode = (mode: PrivacyMode) => {
    updatePreferences({ privacyMode: mode })
    if (mode === 'paused') {
      setIsLocationSharing(false)
    } else if (mode === 'always') {
      setIsLocationSharing(true)
    } else if (trip && trip.stage !== 'arrived') {
      setIsLocationSharing(true)
    } else {
      setIsLocationSharing(false)
    }
  }

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await completeLogout()
      setAuthentication(false, undefined)
      router.navigate('/')
    } catch (error) {
      console.error('Error during logout:', error)
      setLoggingOut(false)
      showToast('Could not sign out. Try again.')
    }
  }

  return (
    <AppFrame statusAction='none'>
      <View style={{ maxWidth: 820, marginHorizontal: 'auto', width: '100%', gap: space.lg }}>
        <View style={{ gap: 8 }}>
          <Text
            style={{
              fontSize: scale(13),
              fontWeight: '800',
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: colors.brand
            }}
          >
            Privacy
          </Text>
          <Text
            style={{
              fontFamily: font.display,
              fontSize: scale(42),
              lineHeight: scale(46),
              fontWeight: '400',
              letterSpacing: -0.5,
              color: colors.ink
            }}
          >
            What you share
          </Text>
          <Text style={{ fontSize: scale(16), lineHeight: bodyLine(16), color: colors.muted }}>
            Only you can change it.
          </Text>
        </View>

        <View style={{ gap: 10 }}>
          {MODES.map(mode => {
            const selected = preferences.privacyMode === mode.id
            return (
              <Pressable
                key={mode.id}
                accessibilityRole='radio'
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`${mode.title}. ${mode.description}`}
                onPress={() => setMode(mode.id)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 14,
                  padding: 18,
                  borderRadius: radius.lg,
                  borderWidth: selected ? 2 : 1,
                  borderColor: selected ? colors.brand : colors.line,
                  backgroundColor: selected ? colors.brandSoft : colors.surface,
                  boxShadow: selected ? shadow.card : undefined,
                  opacity: pressed ? 0.8 : 1
                })}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    borderWidth: 2,
                    borderColor: selected ? colors.brand : colors.lineStrong,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 2
                  }}
                >
                  {selected ? (
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand }} />
                  ) : null}
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ fontSize: scale(17), fontWeight: '800', color: colors.ink }}>
                    {mode.title}
                  </Text>
                  <Text style={{ fontSize: scale(14), lineHeight: bodyLine(14), color: colors.muted }}>
                    {mode.description}
                  </Text>
                </View>
              </Pressable>
            )
          })}
        </View>

        <View
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.line,
            borderRadius: radius.lg,
            padding: 18,
            gap: 10
          }}
        >
          <Text style={{ fontSize: scale(12), fontWeight: '800', letterSpacing: 0.7, textTransform: 'uppercase', color: colors.muted }}>
            Preview
          </Text>
          <View
            style={{
              backgroundColor: colors.surfaceMuted,
              borderRadius: radius.md,
              padding: 14,
              gap: 4
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: previewTone }} />
              <Text style={{ fontSize: scale(13), fontWeight: '800', color: previewTone }}>
                {previewTitle}
              </Text>
            </View>
            <Text style={{ fontSize: scale(16), lineHeight: bodyLine(16), color: colors.ink }}>
              {previewBody}
            </Text>
          </View>
        </View>

        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.line,
            paddingTop: 18,
            gap: 10
          }}
        >
          <Text style={{ fontSize: scale(12), fontWeight: '800', letterSpacing: 0.7, textTransform: 'uppercase', color: colors.muted }}>
            This phone
          </Text>
          {signOutOpen ? (
            <>
              <Text style={{ fontSize: scale(15), lineHeight: bodyLine(15), color: colors.inkSoft }}>
                Sign out of EasyBoard on this phone?
              </Text>
              <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                <ActionButton
                  label='Sign out'
                  variant='danger'
                  onPress={handleLogout}
                  disabled={loggingOut}
                />
                <ActionButton
                  label='Stay signed in'
                  variant='ghost'
                  onPress={() => setSignOutOpen(false)}
                />
              </View>
            </>
          ) : (
            <>
              <Text style={{ fontSize: scale(14), lineHeight: bodyLine(14), color: colors.muted }}>
                Only if you are leaving this phone.
              </Text>
              <ActionButton
                label='Sign out of this phone'
                variant='ghost'
                onPress={() => setSignOutOpen(true)}
              />
            </>
          )}
        </View>
      </View>
      <Toast message={message} />
    </AppFrame>
  )
}
