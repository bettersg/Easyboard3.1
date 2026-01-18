import { Phone, Pin } from '@nandorojo/iconic'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Linking } from 'react-native'
import ActionSheet, { type ActionSheetRef } from 'react-native-actions-sheet'
import { useSafeArea } from 'react-native-safe-area-context'
import { useRouter } from 'solito/navigation'
import { BackButton, Button, Text, View } from '../../components'
import GoogleMapView from '../../components/mapView/GoogleMapView'
import { listenToPWIDLocation } from '../../services/userService'
import type { MarkerData } from '../../stores/onboardingStore'

interface Location {
  lat: number
  lng: number
  updatedAt: number
}

interface TrackPWIDPageProps {
  pwidPhoneNumber: string
  pwidName: string
}

export function TrackPWIDPage({
  pwidPhoneNumber,
  pwidName
}: TrackPWIDPageProps) {
  const { top } = useSafeArea()
  const router = useRouter()
  const [location, setLocation] = useState<Location | null>(null)
  const [_, setLocationUpdated] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const actionSheetRef = useRef<ActionSheetRef>(null)

  useEffect(() => {
    // Set up real-time location listener
    const unsubscribe = listenToPWIDLocation(pwidPhoneNumber, (newLocation) => {
      if (newLocation) {
        setLocation(newLocation)
        const updateTime = new Date(newLocation.updatedAt).toLocaleTimeString()
        setLocationUpdated(updateTime)
      } else {
        setLocation(null)
        setLocationUpdated('')
      }
      setLoading(false)
    })

    // Clean up listener on unmount
    return () => unsubscribe()
  }, [pwidPhoneNumber])

  useEffect(() => {
    if (location && !loading) {
      actionSheetRef.current?.show()
    } else {
      actionSheetRef.current?.hide()
    }
  }, [location, loading])

  const handleCall = () => {
    if (pwidPhoneNumber) {
      Linking.openURL(`tel:${pwidPhoneNumber}`).catch((err) =>
        console.error('Failed to open URL:', err)
      )
    }
  }

  const isSharing = !!location
  const statusColor = isSharing ? '#CBF4DF' : '#F7CBC8'
  const statusTextColor = isSharing ? '#209D5E' : '#E13F33'
  const statusText = isSharing ? 'Online' : 'Offline'

  // Convert location to MarkerData format for GoogleMapView
  const markerData: MarkerData | null = location
    ? {
        latlng: {
          latitude: location.lat,
          longitude: location.lng
        },
        description: `${pwidPhoneNumber}'s Location`,
        photoUri: undefined
      }
    : null

  return (
    <View className='flex-1 bg-gray-100'>
      {/* Header */}
      <View
        className='bg-white px-6 py-4 border-b border-gray-200'
        style={{ paddingTop: top + 16 }}
      >
        <View className='flex-row items-center gap-4'>
          <BackButton
            onPress={() => router.back()}
            textClassName='text-[40px] mb-1'
          />
          <Text className='text-2xl font-bold text-[#414852]'>
            View location
          </Text>
        </View>
      </View>

      {/* Map View */}
      <View className='flex-1'>
        {loading ? (
          <View className='flex-1 items-center justify-center bg-gray-200'>
            <View className='items-center gap-2'>
              <ActivityIndicator size='large' color='#3F98F8' />
              <Text className='text-base text-[#677281]'>
                Loading location...
              </Text>
            </View>
          </View>
        ) : location ? (
          <GoogleMapView
            value={markerData}
            initialCenter={{
              latitude: location.lat,
              longitude: location.lng
            }}
            onLocationMarkerDrop={() => {}}
            isTracking={true}
          />
        ) : (
          <View className='flex-1 items-center justify-center bg-gray-200'>
            <View className='items-center gap-2'>
              <Pin width={64} height={64} color='#DC2626' />
              <Text className='text-lg font-semibold text-[#677281]'>
                Location Not Available
              </Text>
              <Text className='text-sm text-[#677281] text-center px-6'>
                PWID is not currently sharing their location
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* ActionSheet for location info */}
      <ActionSheet ref={actionSheetRef} backgroundInteractionEnabled={true}>
        <View className='bg-white rounded-xl p-4 mb-4 w-full flex-1'>
          <View className='flex-row justify-between items-start mb-3'>
            <View className='flex-1 flex flex-col'>
              <Text className='text-xl font-semibold text-[#414852] mb-1'>
                {pwidName}
              </Text>
              <Text className='text-sm text-[#677281] mb-1'>
                Updated{' '}
                {location
                  ? new Date(location.updatedAt).toLocaleTimeString()
                  : 'unknown'}
              </Text>
            </View>
            <View
              className='flex-row items-center px-2 py-2 rounded-[100px]'
              style={{ backgroundColor: statusColor }}
            >
              <Pin width={20} height={20} color={statusTextColor} />
              <Text
                className='text-sm font-bold'
                style={{ color: statusTextColor }}
              >
                {statusText}
              </Text>
            </View>
          </View>

          <View className='flex-row items-center mt-0.5 w-full gap-2'>
            <Button
              className='flex-row items-center flex-1 p-1.5 h-[3rem] justify-center gap-1'
              onPress={handleCall}
            >
              <Phone width={30} height={30} color='#F4F5F6' />
              <Text className='font-bold text-base text-[#F4F5F6]'>Call</Text>
            </Button>
          </View>
        </View>
      </ActionSheet>
    </View>
  )
}
