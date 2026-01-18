import functions from '@react-native-firebase/functions'
import * as Location from 'expo-location'
import type { LatLong } from '../stores/onboardingStore'
import type {
  GoogleRoute,
  GoogleRouteStepsOverview,
  GoogleRouteStepsOverviewStep,
  Leg
} from '../types/googleRoute'

// Use emulator in development
if (__DEV__) {
  // If you are running on a physical device, replace localhost with the local ip of your PC
  functions().useEmulator('localhost', 5001)
}

/**
 * Fetches Google Routes from origin to destination using Firebase function
 * @param originLatLng Origin coordinates
 * @param destinationLatLng Destination coordinates
 * @returns GoogleRoute object with route options
 */
export async function getGoogleRoute(
  originLatLng: LatLong,
  destinationLatLng: LatLong
): Promise<GoogleRoute | null> {
  try {
    const payload = {
      originLatLng,
      destinationLatLng
    }

    console.log(
      '[googleRouteService.native] Fetching route via Firebase callable function:',
      payload
    )

    // Call the Firebase callable function
    // The SDK automatically handles authentication tokens
    const getGoogleRouteCallable = functions().httpsCallable('getGoogleRoute')
    const response = await getGoogleRouteCallable(payload)

    if (response?.data) {
      console.log(
        '[googleRouteService.native] Route data received:',
        JSON.stringify(response.data)
      )
      return response.data as GoogleRoute
    }
  } catch (e: any) {
    console.error(
      '[googleRouteService.native] Error fetching route:',
      e?.message || e
    )
  }
  return null
}

/**
 * Get quick overview of what this route consists of
 * Typically used to show overview to select a route
 * @param leg The route leg to extract overview from
 * @returns GoogleRouteStepsOverview with distance, duration, and steps
 */
export function getStepsOverViewFromGoogleRouteLeg(
  leg: Leg
): GoogleRouteStepsOverview {
  const totalDuration = leg.localizedValues.duration.text
  const totalDistance = leg.localizedValues.distance.text
  const steps = leg.stepsOverview.multiModalSegments.map((e) => {
    const overview: GoogleRouteStepsOverviewStep = {
      travelMode: e.travelMode,
      instruction: e.navigationInstruction?.instructions
    }
    if (e.travelMode === 'TRANSIT') {
      // We try to get more information.
      const idx = e.stepStartIndex
      overview.transitLine = leg.steps[idx]?.transitDetails?.transitLine
    }
    return overview
  })
  return {
    totalDistance,
    totalDuration,
    steps
  }
}

/**
 * Get the user's current location using expo-location
 * Requests permissions if needed
 * @returns Promise with the current position
 */
export async function getCurrentPosition(): Promise<LatLong> {
  // Request location permissions
  const { status: currentStatus } =
    await Location.getForegroundPermissionsAsync()
  let finalStatus = currentStatus

  // Only request if we don't already have permission
  if (currentStatus !== 'granted') {
    const { status: requestedStatus } =
      await Location.requestForegroundPermissionsAsync()
    finalStatus = requestedStatus
  }

  if (finalStatus !== 'granted') {
    throw new Error('Location permission is required to get directions')
  }

  // Get current location
  const currentLocation = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High
  })

  return {
    latitude: currentLocation.coords.latitude,
    longitude: currentLocation.coords.longitude
  }
}
