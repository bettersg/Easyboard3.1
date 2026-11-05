'use client'

import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Linking, Pressable, useWindowDimensions, View } from 'react-native'
import { Text } from '../../components'
import { ActionButton, AppFrame, Toast } from '../../components/ui'
import { usePreferences } from '../../contexts/PreferencesContext'
import { useToast } from '../../hooks/useToast'
import { getUserStorage } from '../../services/storageService'
import {
  getActiveTrip,
  stageLabel,
  subscribeToTrip,
  type ActiveTrip
} from '../../services/tripStore'
import {
  getPWIDsByCaregiverPhone,
  subscribeToActiveTrip
} from '../../services/userService'
import { colors, font, radius, shadow, space } from '../../theme/tokens'
import type { PWIDUser } from '../../types'

const BOARDING_WAIT_MS = 45_000

export function CaregiverHome() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const { scale, bodyLine } = usePreferences()
  const { message, showToast } = useToast()

  const [pwids, setPwids] = useState<PWIDUser[]>([])
  const [localTrip, setLocalTrip] = useState<ActiveTrip | null>(getActiveTrip)
  const [remoteTrips, setRemoteTrips] = useState<
    Record<string, ActiveTrip | null>
  >({})
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(() => Date.now())

  const isWide = width >= 980
  const narrow = width < 360

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await getUserStorage()
        if (stored?.phoneNumber) {
          const list = await getPWIDsByCaregiverPhone(stored.phoneNumber)
          const unique = Array.from(
            new Map(list.map(person => [person.phoneNumber, person])).values()
          )
          setPwids(unique)
          const initial: Record<string, ActiveTrip | null> = {}
          unique.forEach(person => {
            if (person.activeTrip) initial[person.phoneNumber] = person.activeTrip
          })
          setRemoteTrips(initial)
        }
      } catch (error) {
        console.error('Error loading caregiver home:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => subscribeToTrip(setLocalTrip), [])

  useEffect(() => {
    if (pwids.length === 0) return
    const unsubscribers = pwids.map(person =>
      subscribeToActiveTrip(person.phoneNumber, trip => {
        setRemoteTrips(current => ({ ...current, [person.phoneNumber]: trip }))
      })
    )
    return () => unsubscribers.forEach(unsubscribe => unsubscribe())
  }, [pwids])

  const remoteActiveTrip =
    Object.values(remoteTrips)
      .filter((trip): trip is ActiveTrip => Boolean(trip))
      .sort((a, b) => b.updatedAt - a.updatedAt)[0] ?? null
  const activeTrip =
    Object.keys(remoteTrips).length > 0 ? remoteActiveTrip : localTrip

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5000)
    return () => clearInterval(timer)
  }, [])

  const activeTripOldEnough = activeTrip && now > 0
    ? now - activeTrip.updatedAt > BOARDING_WAIT_MS
    : false

  const travellerName = activeTrip?.travellerName || pwids[0]?.name || 'Your person'
  const activeTravellerPhone = activeTrip?.travellerPhone || ''
  const destination = activeTrip?.destination || 'Home'
  const stage = activeTrip?.stage || 'story'
  const boardingAlert = activeTrip?.stage === 'waiting' && activeTripOldEnough

  const call = useCallback((phone: string) => {
    if (!phone) {
      showToast('No phone number saved.')
      return
    }
    Linking.openURL(`tel:${phone}`).catch(() => showToast(`Call ${phone}`))
  }, [showToast])

  const showTrip = activeTrip || pwids.length > 0

  return (
    <AppFrame statusLabel='Caregiver view' statusAction='none'>
      <View style={{ gap: space.lg, width: '100%', maxWidth: 820, marginHorizontal: 'auto' }}>
        <View style={{ gap: space.lg, width: '100%', minWidth: 0 }}>
          <View style={{ gap: 8 }}>
            <Text
              style={{
                fontFamily: font.display,
                fontSize: scale(isWide ? 44 : 34),
                lineHeight: scale(isWide ? 48 : 38),
                letterSpacing: -0.5,
                color: colors.ink
              }}
            >
              People you support.
            </Text>

            {pwids.length > 0 ? (
              <Pressable
                accessibilityRole='button'
                accessibilityLabel='Set up a journey'
                onPress={() => router.navigate('/journeys')}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
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
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: colors.brandSoft,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Ionicons name='add-circle-outline' size={scale(23)} color={colors.brand} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontSize: scale(16), fontWeight: '800', color: colors.ink }}>
                    Set up a journey
                  </Text>
                  <Text style={{ fontSize: scale(13), lineHeight: bodyLine(13), color: colors.muted }}>
                    Photos and steps.
                  </Text>
                </View>
                <Ionicons name='chevron-forward' size={scale(20)} color={colors.faint} />
              </Pressable>
            ) : null}
          </View>

          {boardingAlert ? (
            <View
              style={{
                backgroundColor: colors.warningSoft,
                borderWidth: 1,
                borderColor: '#E7CFA6',
                borderRadius: radius.lg,
                padding: 18,
                gap: 10
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name='bus-outline' size={scale(22)} color={colors.warning} />
                <Text style={{ fontSize: scale(13), fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase', color: colors.warning }}>
                  Boarding check
                </Text>
              </View>
              <Text style={{ fontSize: scale(20), fontWeight: '800', color: colors.ink }}>
                No boarding confirmation yet.
              </Text>
              <Text style={{ fontSize: scale(14), lineHeight: bodyLine(14), color: colors.inkSoft }}>
                Call {travellerName} if they need help.
              </Text>
              <ActionButton
                label='Call now'
                icon='call-outline'
                onPress={() => call(pwids[0]?.phoneNumber || '')}
              />
            </View>
          ) : null}

          {loading ? (
            <View style={{ padding: 24 }}>
              <Text style={{ color: colors.muted, fontSize: scale(15) }}>Loading…</Text>
            </View>
          ) : showTrip ? (
            <View style={{ gap: 12 }}>
              {(pwids.length > 0 ? pwids : [{ name: travellerName, phoneNumber: '' } as PWIDUser]).map((pwid, index) => {
                const rawName = pwid.name?.trim() || travellerName
                const name = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : 'Your person'
                const phone = pwid.phoneNumber || ''
                const seenAt = pwid.location ? new Date(pwid.location.updatedAt) : null
                const seenLabel = seenAt && !Number.isNaN(seenAt.getTime())
                  ? `Last seen ${seenAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'No update yet'
                const isThisTrip = Boolean(
                  activeTrip &&
                    (activeTravellerPhone
                      ? activeTravellerPhone === phone
                      : index === 0)
                )
                const isSharing = isThisTrip
                  ? activeTrip?.stage !== 'arrived'
                  : !!pwid.location?.isSharing
                const statusLine = isThisTrip
                  ? `${stageLabel(stage)} · updated ${new Date(activeTrip!.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : pwid.location
                    ? seenLabel
                    : 'No active trip'
                const statusWithSharing = narrow
                  ? `${statusLine} · ${isSharing ? 'Sharing' : 'Not sharing'}`
                  : statusLine

                return (
                  <View
                    key={`${name}-${index}`}
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.line,
                      borderRadius: radius.xl,
                      padding: 20,
                      gap: 14,
                      boxShadow: shadow.card
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 24,
                          backgroundColor: colors.brandSoft,
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Text style={{ fontSize: scale(18), fontWeight: '800', color: colors.brand }}>
                          {name.slice(0, 1).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                          <Text style={{ fontSize: scale(19), fontWeight: '800', color: colors.ink }}>
                            {name}
                          </Text>
                          {phone ? (
                            <Text style={{ fontSize: scale(12), fontWeight: '600', color: colors.faint }}>
                              •••• {phone.slice(-4)}
                            </Text>
                          ) : null}
                        </View>
                        <Text style={{ fontSize: scale(13), lineHeight: bodyLine(13), color: colors.muted }}>
                          {statusWithSharing}
                        </Text>
                      </View>
                      {!narrow ? (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 5,
                            backgroundColor: isSharing ? colors.successSoft : colors.surfaceMuted,
                            borderRadius: radius.pill,
                            paddingHorizontal: 9,
                            paddingVertical: 5
                          }}
                        >
                          <View
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: isSharing ? colors.success : colors.muted
                            }}
                          />
                          <Text style={{ fontSize: scale(11), fontWeight: '800', color: isSharing ? colors.success : colors.muted }}>
                            {isSharing ? 'Sharing' : 'Not sharing'}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {isThisTrip ? (
                      <View style={{ gap: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <Text style={{ fontSize: scale(13), fontWeight: '700', color: colors.muted }}>
                            To {destination}
                          </Text>
                          <Text style={{ fontSize: scale(13), fontWeight: '700', color: colors.brand }}>
                            {stageLabel(stage)}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 4 }}>
                          {['Waiting', 'On the bus', 'Arrived'].map((label, stepIndex) => {
                            const activeIndex = stage === 'waiting' ? 0 : stage === 'arrived' ? 2 : 1
                            const active = stepIndex <= activeIndex
                            return (
                              <View key={label} style={{ flex: 1, gap: 4 }}>
                                <View
                                  style={{
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: active ? colors.brand : colors.surfaceMuted
                                  }}
                                />
                                <Text style={{ fontSize: scale(10), fontWeight: '600', color: active ? colors.inkSoft : colors.faint }}>
                                  {label}
                                </Text>
                              </View>
                            )
                          })}
                        </View>
                      </View>
                    ) : null}

                    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                      <ActionButton
                        label='Call'
                        icon='call-outline'
                        variant='secondary'
                        size='sm'
                        onPress={() => call(phone)}
                        style={{ flex: 1 }}
                      />
                      {isSharing ? (
                        <ActionButton
                          label='Location'
                          icon='locate-outline'
                          variant='secondary'
                          size='sm'
                          accessibilityHint={`See where ${name} is`}
                          onPress={() => router.navigate(`/track-pwid?phone=${encodeURIComponent(phone)}&name=${encodeURIComponent(name)}`)}
                          disabled={!phone}
                          style={{ flex: 1 }}
                        />
                      ) : (
                        <ActionButton
                          label='Journey'
                          icon='add-circle-outline'
                          variant='secondary'
                          size='sm'
                          accessibilityHint={`Set up a journey for ${name}`}
                          onPress={() => router.navigate(`/journeys?phone=${encodeURIComponent(phone)}`)}
                          disabled={!phone}
                          style={{ flex: 1 }}
                        />
                      )}
                    </View>
                  </View>
                )
              })}
            </View>
          ) : (
            <View
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.line,
                borderRadius: radius.lg,
                padding: 24,
                gap: 8
              }}
            >
              <Text style={{ fontSize: scale(18), fontWeight: '800', color: colors.ink }}>
                No one linked yet
              </Text>
              <Text style={{ fontSize: scale(14), lineHeight: bodyLine(14), color: colors.muted }}>
                People who add your phone number as their caregiver will appear here.
              </Text>
            </View>
          )}

        </View>
      </View>
      <Toast message={message} />
    </AppFrame>
  )
}
