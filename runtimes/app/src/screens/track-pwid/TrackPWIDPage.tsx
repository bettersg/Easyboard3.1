'use client'

import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Linking,
  Pressable,
  useWindowDimensions,
  View
} from 'react-native'
import { Text } from '../../components'
import { ActionButton, AppFrame } from '../../components/ui'
import GoogleMapView from '../../components/mapView/GoogleMapView'
import { usePreferences } from '../../contexts/PreferencesContext'
import { listenToPWIDLocation } from '../../services/userService'
import type { MarkerData } from '../../stores/onboardingStore'
import { colors, font, radius, shadow, space } from '../../theme/tokens'
import type { UserLocation } from '../../types'

interface TrackPWIDPageProps {
  pwidPhoneNumber: string
  pwidName: string
}

export function TrackPWIDPage({
  pwidPhoneNumber,
  pwidName
}: TrackPWIDPageProps) {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const { scale, bodyLine } = usePreferences()
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = listenToPWIDLocation(pwidPhoneNumber, newLocation => {
      setLocation(newLocation)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [pwidPhoneNumber])

  const handleCall = () => {
    if (!pwidPhoneNumber) return
    Linking.openURL(`tel:${pwidPhoneNumber}`).catch(error =>
      console.error('Failed to open phone dialer:', error)
    )
  }

  const name = pwidName?.trim() || 'Your person'
  const isSharing = Boolean(location?.isSharing)
  const updatedAt = location ? new Date(location.updatedAt) : null
  const validUpdatedAt =
    updatedAt && !Number.isNaN(updatedAt.getTime()) ? updatedAt : null
  const markerData: MarkerData | null = location
    ? {
        latlng: {
          latitude: location.lat,
          longitude: location.lng
        },
        description: `${name}'s location`,
        photoUri: undefined
      }
    : null
  const mapHeight = width < 480 ? 320 : width >= 980 ? 440 : 380

  return (
    <AppFrame statusLabel='Caregiver view' statusAction='none'>
      <View
        style={{
          width: '100%',
          maxWidth: 820,
          marginHorizontal: 'auto',
          gap: space.lg
        }}
      >
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Back to people'
          onPress={() => (router.canGoBack() ? router.back() : router.navigate('/home'))}
          style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8 }}
        >
          <Ionicons name='arrow-back' size={scale(20)} color={colors.brand} />
          <Text style={{ fontSize: scale(14), fontWeight: '700', color: colors.brand }}>
            People
          </Text>
        </Pressable>

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
            Live location
          </Text>
          <Text
            style={{
              fontFamily: font.display,
              fontSize: scale(34),
              lineHeight: scale(38),
              color: colors.ink
            }}
          >
            {name}.
          </Text>
        </View>

        <View
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.line,
            borderRadius: radius.lg,
            padding: 12,
            gap: 12,
            boxShadow: shadow.card
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              paddingHorizontal: 2
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: isSharing ? colors.successSoft : colors.surfaceMuted,
                borderRadius: radius.pill,
                paddingHorizontal: 10,
                paddingVertical: 6
              }}
            >
              <View
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: isSharing ? colors.success : colors.muted
                }}
              />
              <Text style={{ fontSize: scale(12), fontWeight: '800', color: isSharing ? colors.success : colors.muted }}>
                {isSharing ? 'Sharing' : 'Not sharing'}
              </Text>
            </View>
            <Text style={{ fontSize: scale(12), color: colors.muted }}>
              {validUpdatedAt ? `Updated ${validUpdatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'No update yet'}
            </Text>
          </View>

          {loading ? (
            <View style={{ height: mapHeight, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <ActivityIndicator size='large' color={colors.brand} />
              <Text style={{ fontSize: scale(14), color: colors.muted }}>Loading location…</Text>
            </View>
          ) : isSharing && location ? (
            <View
              style={{
                height: mapHeight,
                width: '100%',
                borderRadius: radius.md,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: colors.line
              }}
            >
              <GoogleMapView
                height={mapHeight}
                value={markerData}
                initialCenter={{
                  latitude: location.lat,
                  longitude: location.lng
                }}
                onLocationMarkerDrop={() => {}}
                isTracking={true}
              />
            </View>
          ) : (
            <View
              style={{
                minHeight: 220,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingHorizontal: 20
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: colors.surfaceMuted,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name='location-outline' size={scale(26)} color={colors.muted} />
              </View>
              <Text style={{ fontSize: scale(18), fontWeight: '800', color: colors.ink }}>
                Location is off
              </Text>
              <Text style={{ fontSize: scale(14), lineHeight: bodyLine(14), color: colors.muted, textAlign: 'center' }}>
                Ask {name} to turn on sharing, or call them to check where they are.
              </Text>
            </View>
          )}
        </View>

        <ActionButton
          label='Call'
          icon='call-outline'
          variant='secondary'
          onPress={handleCall}
          disabled={!pwidPhoneNumber}
          accessibilityHint={`Call ${name}`}
          fullWidth
        />

        <Text
          style={{
            fontSize: scale(12),
            lineHeight: bodyLine(12),
            color: colors.muted
          }}
        >
          Shown only while {name} is sharing.
        </Text>
      </View>
    </AppFrame>
  )
}
