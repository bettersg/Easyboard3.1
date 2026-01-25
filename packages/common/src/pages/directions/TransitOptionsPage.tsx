import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator } from 'react-native'
import { useSafeArea } from 'react-native-safe-area-context'
import { useRouter, useSearchParams } from 'solito/navigation'
import { BackButton, Button, ScrollView, Text, View } from '../../components'
import { TransitOptionCard } from '../../components/TransitOptionCard'
import { useNavigation } from '../../contexts/NavigationContext'
import {
  getCurrentPosition,
  getGoogleRoute,
  getStepsOverViewFromGoogleRouteLeg
} from '../../services/googleRouteService'
import type { MarkerData } from '../../stores/onboardingStore'
import type { GoogleRouteStepsOverview, Leg } from '../../types/googleRoute'

export function TransitOptionsPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const hasFetchedRef = useRef(false)

  const { top } = useSafeArea()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get state from navigation context
  const {
    destination: contextDestination,
    destinationName: contextDestinationName,
    availableRoutes,
    setAvailableRoutes,
    setDestination,
    selectRoute
  } = useNavigation()

  // Read destination from URL query params (Next.js idiomatic way)
  // This ensures data is available even in production builds
  const destinationFromParams = useMemo<MarkerData | null>(() => {
    if (!searchParams) return null

    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const name = searchParams.get('name')
    const description = searchParams.get('description')
    const photoUri = searchParams.get('photoUri')

    if (lat && lng) {
      return {
        description: description || name || 'Destination',
        latlng: {
          latitude: parseFloat(lat),
          longitude: parseFloat(lng)
        },
        photoUri: photoUri || undefined
      }
    }
    return null
  }, [searchParams])

  // Use destination from params if available, otherwise fall back to context
  const destination = destinationFromParams || contextDestination
  const destinationName =
    searchParams?.get('name') || contextDestinationName || 'Destination'

  // Update context when params are available (for consistency)
  useEffect(() => {
    if (destinationFromParams && destinationName) {
      setDestination(destinationFromParams, destinationName)
    }
  }, [destinationFromParams, destinationName, setDestination])

  const fetchGoogleRoute = useCallback(async () => {
    if (!destination?.latlng) {
      setErrorMessage('No destination provided')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setErrorMessage('')

      // Get current location
      const currentLocation = await getCurrentPosition()

      // Fetch Google route from current location to destination
      const newGoogleRoute = await getGoogleRoute(
        currentLocation,
        destination.latlng
      )

      if (
        newGoogleRoute &&
        typeof newGoogleRoute === 'object' &&
        newGoogleRoute.routes?.length > 0
      ) {
        setAvailableRoutes(newGoogleRoute.routes)
        // Store routes in sessionStorage for persistence across navigation (Next.js App Router idiomatic)
        // This ensures routes are available even if context is reset
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem(
              'navigation_routes',
              JSON.stringify(newGoogleRoute.routes)
            )
          } catch (e) {
            console.warn(
              '[TransitOptionsPage] Failed to store routes in sessionStorage:',
              e
            )
          }
        }
      } else {
        setErrorMessage('No routes found to your destination')
      }
    } catch (e: any) {
      console.error('[TransitOptionsPage] Error:', e)
      if (e?.message?.includes('permission')) {
        setErrorMessage('Location permission is required to get directions')
      } else {
        setErrorMessage("Error - can't get current location or directions")
      }
    } finally {
      setIsLoading(false)
    }
  }, [destination?.latlng, setAvailableRoutes])

  // Fetch routes when destination is available
  // Context updates are synchronous, so no timing workarounds needed
  useEffect(() => {
    if (!hasFetchedRef.current && destination?.latlng) {
      hasFetchedRef.current = true
      fetchGoogleRoute()
    }
  }, [destination?.latlng, fetchGoogleRoute])

  const handleRetry = useCallback(() => {
    hasFetchedRef.current = false
    fetchGoogleRoute()
  }, [fetchGoogleRoute])

  const onTransitOptionPressed = useCallback(
    (index: number) => {
      if (availableRoutes?.[index] && destination?.latlng) {
        const selectedRoute = availableRoutes[index]

        // Store selected route in context
        selectRoute(selectedRoute, index)

        // Store selected route in sessionStorage for persistence (Next.js App Router idiomatic)
        // This ensures route is available even if context is reset during navigation
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem(
              'navigation_selected_route',
              JSON.stringify(selectedRoute)
            )
            sessionStorage.setItem(
              'navigation_selected_route_index',
              index.toString()
            )
          } catch (e) {
            console.warn(
              '[TransitOptionsPage] Failed to store route in sessionStorage:',
              e
            )
          }
        }

        // Build URL with query params for navigation (Next.js idiomatic way)
        const params = new URLSearchParams({
          lat: destination.latlng.latitude.toString(),
          lng: destination.latlng.longitude.toString(),
          name: destinationName,
          description: destination.description || '',
          routeIndex: index.toString() // Pass route index for fallback
        })

        // Optionally include photoUri if available
        if (destination.photoUri) {
          params.set('photoUri', destination.photoUri)
        }

        // Navigate immediately - sessionStorage ensures route is available
        router.push(`/directions?${params.toString()}`)
      }
    },
    [availableRoutes, destination, destinationName, selectRoute, router]
  )

  const handleBack = () => {
    router.back()
  }

  const transitOptions: GoogleRouteStepsOverview[] = useMemo(
    () =>
      availableRoutes?.map((route) =>
        getStepsOverViewFromGoogleRouteLeg(route.legs[0] as Leg)
      ) ?? [],
    [availableRoutes]
  )

  // Show error if no destination
  if (!destination) {
    return (
      <View
        className='flex-1 items-center justify-center bg-gray-50'
        style={{ paddingTop: top }}
      >
        <Text className='text-base text-gray-600'>No destination selected</Text>
        <Button
          text='Go Back'
          onPress={handleBack}
          className='mt-4'
          variant='primary'
        />
      </View>
    )
  }

  if (isLoading) {
    return (
      <View
        className='flex-1 items-center justify-center bg-gray-50'
        style={{ paddingTop: top }}
      >
        <ActivityIndicator size='large' color='#3F98F8' />
        <Text className='text-base text-gray-600 mt-4'>Loading routes...</Text>
      </View>
    )
  }

  return (
    <View className='flex-1 bg-gray-50' style={{ paddingTop: top }}>
      {/* Header Section */}
      <View className='px-4 pt-4 pb-2 bg-gray-50'>
        <View className='flex-row items-center gap-4 mb-4'>
          <BackButton onPress={handleBack} textClassName='text-[32px]' />
          <Text className='text-xl font-bold text-gray-800 flex-1'>
            Directions to{' '}
            <Text className='text-[#3F98F8] font-bold'>{destinationName}</Text>
          </Text>
        </View>
        <Text className='text-base text-gray-600 leading-5 font-medium pb-2'>
          Choose your preferred route
        </Text>
      </View>

      {/* Routes List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        className='flex-1 px-4'
        contentContainerClassName='pb-8'
      >
        {/* Error Message */}
        {errorMessage && (
          <View className='bg-white rounded-2xl p-4 border border-gray-200 mb-4'>
            <Text className='text-base text-red-500 font-medium'>
              {errorMessage}
            </Text>
            <Button
              text='Retry'
              onPress={handleRetry}
              className='mt-4'
              variant='primary'
            />
          </View>
        )}

        {/* Transit Options */}
        {transitOptions.length > 0 && (
          <View className='gap-3'>
            {transitOptions.map((route, index) => (
              <TransitOptionCard
                key={index}
                index={index}
                googleRouteStepsOverview={route}
                onPress={() => onTransitOptionPressed(index)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
