import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSafeArea } from 'react-native-safe-area-context'
import { useRouter, useSearchParams } from 'solito/navigation'
import { Button, Text, View } from '../../components'
import { DirectionsMapView } from '../../components/mapView/DirectionsMapView'
import { TransitOptionCard } from '../../components/TransitOptionCard'
import { TransitTypePill } from '../../components/TransitTypePill'
import { useNavigation } from '../../contexts/NavigationContext'
import { getStepsOverViewFromGoogleRouteLeg } from '../../services/googleRouteService'
import type { MarkerData } from '../../stores/onboardingStore'
import type { Step } from '../../types/googleRoute'

/**
 * Step card showing navigation instructions for the current step
 */
const StepCard = ({ step, isActive }: { step: Step; isActive?: boolean }) => {
  return (
    <View
      className={`flex-col justify-between rounded-lg bg-white px-4 py-3 shadow-sm border ${isActive ? 'border-blue-500 border-2' : 'border-gray-200'}`}
    >
      <View className='flex-row items-center justify-between mb-2'>
        <TransitTypePill
          travelMode={step.travelMode}
          transitLine={step.transitDetails?.transitLine}
        />
        <View>
          <Text className='text-sm text-gray-600'>
            Duration:{' '}
            <Text className='font-semibold text-gray-800'>
              {step.localizedValues?.staticDuration?.text ??
                step.staticDuration}
            </Text>
          </Text>
        </View>
      </View>
      <View className='mt-1'>
        <Text className='text-base font-semibold text-gray-800 mb-1'>
          Instructions
        </Text>
        <View className='flex-row items-baseline flex-wrap'>
          <Text className='text-sm text-gray-700'>
            {step.navigationInstruction?.instructions ??
              `Continue ${step.travelMode === 'WALK' ? 'walking' : 'on the ride'}`}
          </Text>
          {step.transitDetails?.stopCount && (
            <Text className='text-sm text-gray-500'>
              {` (${step.transitDetails?.stopCount} stops)`}
            </Text>
          )}
        </View>
      </View>
    </View>
  )
}

export function DirectionsPage() {
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [navigationStarted, setNavigationStarted] = useState<boolean>(false)

  const { bottom } = useSafeArea()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get state from navigation context
  const {
    destination: contextDestination,
    destinationName: contextDestinationName,
    selectedRoute: contextSelectedRoute,
    availableRoutes,
    clearNavigation,
    setDestination,
    setAvailableRoutes,
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

  // Get route index from query params
  const routeIndexFromParams = useMemo(() => {
    if (!searchParams) return null
    const index = searchParams.get('routeIndex')
    return index ? parseInt(index, 10) : null
  }, [searchParams])

  // Get selected route: from sessionStorage (most reliable), context, or availableRoutes
  // sessionStorage is idiomatic for Next.js App Router and works in production
  const selectedRoute = useMemo(() => {
    // First try sessionStorage (most reliable, persists across navigation)
    if (typeof window !== 'undefined') {
      try {
        const storedRoute = sessionStorage.getItem('navigation_selected_route')
        if (storedRoute) {
          return JSON.parse(storedRoute)
        }
      } catch (e) {
        console.warn(
          '[DirectionsPage] Failed to read route from sessionStorage:',
          e
        )
      }
    }

    // Fallback to context selectedRoute
    if (contextSelectedRoute) {
      return contextSelectedRoute
    }

    // Fallback to availableRoutes using routeIndex
    if (
      routeIndexFromParams !== null &&
      availableRoutes?.length > 0 &&
      availableRoutes[routeIndexFromParams]
    ) {
      return availableRoutes[routeIndexFromParams]
    }

    // Last resort: try to get routes from sessionStorage and use routeIndex
    if (typeof window !== 'undefined' && routeIndexFromParams !== null) {
      try {
        const storedRoutes = sessionStorage.getItem('navigation_routes')
        if (storedRoutes) {
          const routes = JSON.parse(storedRoutes)
          if (routes?.[routeIndexFromParams]) {
            return routes[routeIndexFromParams]
          }
        }
      } catch (e) {
        console.warn(
          '[DirectionsPage] Failed to read routes from sessionStorage:',
          e
        )
      }
    }

    return null
  }, [contextSelectedRoute, availableRoutes, routeIndexFromParams])

  // Load routes from sessionStorage if availableRoutes is empty (restore from storage)
  // This ensures routes are available in context even if they were cleared
  useEffect(() => {
    if (availableRoutes?.length === 0 && typeof window !== 'undefined') {
      try {
        const storedRoutes = sessionStorage.getItem('navigation_routes')
        if (storedRoutes) {
          const routes = JSON.parse(storedRoutes)
          if (routes?.length > 0) {
            // Restore routes to context for consistency
            setAvailableRoutes(routes)
          }
        }
      } catch (e) {
        console.warn(
          '[DirectionsPage] Failed to restore routes from sessionStorage:',
          e
        )
      }
    }
  }, [availableRoutes, setAvailableRoutes])

  // Ensure route is selected in context if we have it from sessionStorage
  useEffect(() => {
    if (
      selectedRoute &&
      !contextSelectedRoute &&
      routeIndexFromParams !== null
    ) {
      // Route was loaded from sessionStorage, update context for consistency
      selectRoute(selectedRoute, routeIndexFromParams)
    }
  }, [selectedRoute, contextSelectedRoute, routeIndexFromParams, selectRoute])

  // Use destination from params if available, otherwise fall back to context
  const destination = destinationFromParams || contextDestination
  const destinationName =
    searchParams?.get('name') || contextDestinationName || 'Destination'

  // Update context when params are available (for consistency)
  // IMPORTANT: Don't call setDestination if we have a routeIndex, as it will clear availableRoutes
  // We only need to read destination from params, not update context (which would clear routes)
  useEffect(() => {
    // Only update destination if:
    // 1. We have destination params
    // 2. We DON'T have a routeIndex (because that means we're navigating with routes)
    // 3. The destination actually changed
    if (
      destinationFromParams &&
      destinationName &&
      routeIndexFromParams === null
    ) {
      const destChanged =
        !contextDestination ||
        contextDestination.latlng?.latitude !==
          destinationFromParams.latlng?.latitude ||
        contextDestination.latlng?.longitude !==
          destinationFromParams.latlng?.longitude

      if (destChanged) {
        setDestination(destinationFromParams, destinationName)
      }
    }
  }, [
    destinationFromParams,
    destinationName,
    routeIndexFromParams,
    contextDestination,
    setDestination
  ])

  // Ensure route is selected in context if we have routeIndex and route is available in context
  // This is a backup in case the route wasn't selected before navigation
  useEffect(() => {
    if (
      routeIndexFromParams !== null &&
      availableRoutes?.length > 0 &&
      availableRoutes[routeIndexFromParams] &&
      !contextSelectedRoute
    ) {
      selectRoute(availableRoutes[routeIndexFromParams], routeIndexFromParams)
    }
  }, [routeIndexFromParams, availableRoutes, contextSelectedRoute, selectRoute])

  const leg = selectedRoute?.legs?.[0]
  const steps = leg?.steps ?? []
  const totalSteps = steps.length

  const routeOverview = useMemo(() => {
    if (!leg) return null
    return getStepsOverViewFromGoogleRouteLeg(leg)
  }, [leg])

  const handleStartTrip = useCallback(() => {
    setNavigationStarted(true)
    setCurrentStep(0)
  }, [])

  const handleNextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep, totalSteps])

  const handlePrevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const handleArrived = useCallback(() => {
    // Clear navigation state and sessionStorage
    clearNavigation()
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('navigation_routes')
        sessionStorage.removeItem('navigation_selected_route')
        sessionStorage.removeItem('navigation_selected_route_index')
      } catch (e) {
        console.warn('[DirectionsPage] Failed to clear sessionStorage:', e)
      }
    }
    router.push('/home')
  }, [clearNavigation, router])

  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  // Show error if no route selected
  if (!selectedRoute || !leg || !destination) {
    return (
      <View className='flex-1 items-center justify-center bg-gray-50'>
        <Text className='text-base text-gray-600'>No route data available</Text>
        <Text className='text-sm text-gray-500 mt-2'>
          {routeIndexFromParams !== null
            ? `Route index: ${routeIndexFromParams}, Available routes: ${availableRoutes?.length || 0}`
            : 'No route index provided'}
        </Text>
        <Button
          text='Go Back'
          onPress={handleBack}
          className='mt-4'
          variant='primary'
        />
      </View>
    )
  }

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === totalSteps - 1

  return (
    <View className='flex-1 bg-gray-50 relative'>
      {/* Full screen map */}
      <View className='absolute inset-0'>
        <DirectionsMapView
          googleRoute={selectedRoute}
          destination={destination}
          currentStep={currentStep}
          navigationStarted={navigationStarted}
        />
      </View>

      {/* Bottom overlay panel */}
      <View
        className='absolute bottom-0 left-0 right-0 z-10 bg-white/95 rounded-t-3xl shadow-lg'
        style={{ paddingBottom: bottom + 8 }}
      >
        {/* Header with destination info */}
        <View className='px-4 pt-4 pb-2'>
          <View className='flex-row items-center justify-between'>
            <View className='flex-1'>
              <Text className='text-lg font-bold text-gray-800'>
                {navigationStarted
                  ? `Step ${currentStep + 1} of ${totalSteps}`
                  : `Directions to ${destinationName}`}
              </Text>
              {!navigationStarted && destination?.description && (
                <Text className='text-sm text-gray-500 mt-1' numberOfLines={1}>
                  {destination.description}
                </Text>
              )}
            </View>
            {/* Back button */}
            <Button
              text='✕'
              onPress={handleBack}
              variant='text'
              className='w-10 h-10 rounded-full bg-gray-100'
            />
          </View>
        </View>

        {/* Route overview (when not navigating) */}
        {!navigationStarted && routeOverview && (
          <View className='px-4 pb-2'>
            <TransitOptionCard googleRouteStepsOverview={routeOverview} />
          </View>
        )}

        {/* Current step card (when navigating) */}
        {navigationStarted && currentStepData && (
          <View className='px-4 pb-2'>
            <StepCard step={currentStepData} isActive={true} />

            {/* Progress indicator */}
            <View className='flex-row justify-center mt-3 gap-1'>
              {steps.map((_step: Step, index: number) => (
                <View
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep
                      ? 'bg-blue-500'
                      : index < currentStep
                        ? 'bg-blue-300'
                        : 'bg-gray-300'
                  }`}
                />
              ))}
            </View>
          </View>
        )}

        {/* Action buttons */}
        <View className='px-4 pt-2'>
          {!navigationStarted ? (
            <Button
              text='START NAVIGATION'
              onPress={handleStartTrip}
              variant='primary'
              className='rounded-full'
            />
          ) : (
            <View className='flex-row gap-3'>
              {currentStep > 0 && (
                <Button
                  text='← Previous'
                  onPress={handlePrevStep}
                  variant='outline'
                  className='flex-1 rounded-full'
                />
              )}
              <Button
                text={isLastStep ? '🎉 ARRIVED' : 'Next Step →'}
                onPress={isLastStep ? handleArrived : handleNextStep}
                variant='primary'
                className='flex-1 rounded-full'
              />
            </View>
          )}
        </View>
      </View>
    </View>
  )
}
