'use client'

import { useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useWindowDimensions, View } from 'react-native'
import { Text } from '../../components'
import {
  ActionButton,
  AppFrame,
  PlaceCard
} from '../../components/ui'
import { usePreferences } from '../../contexts/PreferencesContext'
import { useLocationSharing } from '../../contexts/LocationSharingContext'
import { getUserStorage, type UserStorage } from '../../services/storageService'
import {
  getActiveTrip,
  stageLabel,
  subscribeToTrip,
  type ActiveTrip
} from '../../services/tripStore'
import { getUserData } from '../../services/userService'
import { colors, font, radius, shadow, space } from '../../theme/tokens'
import type { Journey, PWIDUser } from '../../types'

interface CaregiverSummary {
  name?: string
  phone?: string
}

export function PWIDHome() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const { scale, bodyLine } = usePreferences()
  const { isLocationSharing } = useLocationSharing()

  const [userData, setUserData] = useState<UserStorage | null>(null)
  const [caregiver, setCaregiver] = useState<CaregiverSummary>({})
  const [journeys, setJourneys] = useState<Journey[]>([])
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(getActiveTrip)
  const [loading, setLoading] = useState(true)

  const isWide = width >= 980

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await getUserStorage()
        setUserData(stored)
        const storedPwid = stored as unknown as PWIDUser | null

        if (storedPwid?.phoneNumber) {
          const ownData = await getUserData(storedPwid.phoneNumber)
          setJourneys((ownData as PWIDUser | null)?.journeys ?? [])
        }

        if (storedPwid?.caregiverPhone) {
          setCaregiver({ phone: storedPwid.caregiverPhone })
          const caregiverData = await getUserData(storedPwid.caregiverPhone)
          if (caregiverData?.name) {
            setCaregiver({ name: caregiverData.name, phone: storedPwid.caregiverPhone })
          }
        }
      } catch (error) {
        console.error('Error loading home data:', error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  useEffect(() => subscribeToTrip(setActiveTrip), [])

  const savedPlaces = useMemo(() => {
    if (userData?.userType !== 'PWID') return []
    const pwid = userData as unknown as PWIDUser
    const places = (pwid.savedPlaces ?? []).map(place => ({
      ...place,
      icon:
        place.locationName === 'Home'
          ? ('home-outline' as const)
          : place.locationName === 'School'
            ? ('school-outline' as const)
            : ('briefcase-outline' as const)
    }))
    const journeyPlaces = journeys
      .filter(
        journey =>
          !places.some(
            place =>
              place.locationName.trim().toLowerCase() ===
              journey.destinationName.trim().toLowerCase()
          )
      )
      .map(journey => ({
        locationName: journey.destinationName,
        address: undefined,
        icon: 'bus-outline' as const
      }))
    return [...places, ...journeyPlaces]
  }, [journeys, userData])

  const storedPwid = userData as unknown as PWIDUser | null
  const firstName = storedPwid?.name?.trim().split(/\s+/)[0] || ''
  const caregiverName = caregiver.name?.trim() || 'your caregiver'
  const caregiverPhone = caregiver.phone || storedPwid?.caregiverPhone || ''

  const navigateToTrip = useCallback(
    (destinationName: string) => {
      const params = new URLSearchParams({ destinationName, practice: '0' })
      router.navigate(`/trip?${params.toString()}`)
    },
    [router]
  )

  const openHelpCard = useCallback(() => {
    const params = new URLSearchParams({
      destination: activeTrip?.destination || savedPlaces[0]?.locationName || 'Home',
      location: activeTrip
        ? activeTrip.stage === 'waiting'
          ? 'the bus stop'
          : 'the way to your destination'
        : '',
      caregiverName,
      caregiverPhone
    })
    router.navigate(`/help-card?${params.toString()}`)
  }, [activeTrip, caregiverName, caregiverPhone, router, savedPlaces])

  if (loading) {
    return (
      <AppFrame>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 440 }}>
          <Text style={{ color: colors.muted, fontSize: scale(16) }}>Loading EasyBoard…</Text>
        </View>
      </AppFrame>
    )
  }

  const twoColumn = isWide && Boolean(activeTrip)

  return (
    <AppFrame statusLabel={isLocationSharing ? 'Sharing this trip' : 'Sharing off'}>
      <View
        style={{
          flexDirection: twoColumn ? 'row' : 'column',
          gap: space.lg,
          alignItems: 'stretch'
        }}
      >
        <View
          style={{
            flex: twoColumn ? 1.55 : undefined,
            gap: space.lg,
            minWidth: 0,
            width: twoColumn ? undefined : '100%',
            maxWidth: twoColumn ? undefined : 720,
            marginHorizontal: 'auto'
          }}
        >
          <View style={{ gap: 8 }}>
            <Text
              style={{
                fontFamily: font.display,
                fontSize: scale(isWide ? 48 : 36),
                lineHeight: scale(isWide ? 52 : 40),
                fontWeight: '400',
                letterSpacing: -0.6,
                color: colors.ink
              }}
            >
              {firstName ? `Hello, ${firstName}.` : 'Hello.'}
            </Text>
            <Text
              style={{
                maxWidth: 560,
                fontSize: scale(18),
                lineHeight: bodyLine(18),
                color: colors.muted
              }}
            >
              Where do you want to go?
            </Text>
          </View>

          <View style={{ gap: 12 }}>
            {savedPlaces.length > 0 ? (
              <View style={{ gap: 10 }}>
                {savedPlaces.map(place => (
                  <PlaceCard
                    key={`${place.locationName}-${place.address?.description}`}
                    title={place.locationName}
                    address={place.address?.description}
                    icon={place.icon}
                    onPress={() => navigateToTrip(place.locationName)}
                  />
                ))}
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: radius.lg,
                  borderWidth: 1,
                  borderColor: colors.line,
                  padding: 20,
                  gap: 8
                }}
              >
                <Text style={{ fontSize: scale(17), fontWeight: '700', color: colors.ink }}>
                  No places saved yet
                </Text>
                <Text style={{ fontSize: scale(15), lineHeight: bodyLine(15), color: colors.muted }}>
                  Ask your caregiver to add Home, School, or Work.
                </Text>
              </View>
            )}
          </View>

          <ActionButton
            label='I need help'
            icon='help-circle-outline'
            variant={savedPlaces.length > 0 ? 'secondary' : 'primary'}
            onPress={openHelpCard}
            fullWidth
            accessibilityHint='Opens your help card'
          />
        </View>

        {activeTrip ? (
          <View style={{ flex: isWide ? 1 : undefined, gap: 14, minWidth: 0 }}>
            <RailCard>
              <Text style={eyebrowStyle(scale)}>Today</Text>
              <View style={{ gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand }} />
                  <Text style={{ fontSize: scale(13), fontWeight: '700', color: colors.brand }}>
                    {stageLabel(activeTrip.stage)}
                  </Text>
                </View>
                <Text style={{ fontSize: scale(21), fontWeight: '800', lineHeight: scale(26), color: colors.ink }}>
                  {activeTrip.destination}
                </Text>
                <Text style={{ fontSize: scale(14), lineHeight: bodyLine(14), color: colors.muted }}>
                  Updated {new Date(activeTrip.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <ActionButton
                  label='Open trip'
                  icon='arrow-forward'
                  variant='secondary'
                  onPress={() => navigateToTrip(activeTrip.destination)}
                />
              </View>
            </RailCard>
          </View>
        ) : null}
      </View>
    </AppFrame>
  )
}

function RailCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: radius.lg,
        padding: 18,
        gap: 10,
        boxShadow: shadow.card
      }}
    >
      {children}
    </View>
  )
}

const eyebrowStyle = (scale: (n: number) => number) => ({
  fontSize: scale(12),
  fontWeight: '800' as const,
  letterSpacing: 0.7,
  textTransform: 'uppercase' as const,
  color: colors.muted
})
