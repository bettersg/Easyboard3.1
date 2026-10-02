import functions from '@react-native-firebase/functions'
import * as Location from 'expo-location'
import type { LatLong } from '../stores/onboardingStore'
import type {
  GoogleRoute,
  GoogleRouteStepsOverview,
  GoogleRouteStepsOverviewStep,
  Leg
} from '../types/googleRoute'
import type { IGoogleRouteService } from './googleRouteService'

// Use emulator in development
if (__DEV__) {
  functions().useEmulator('localhost', 5001)
}

export const googleRouteService: IGoogleRouteService = {
  getGoogleRoute: async (
    originLatLng: LatLong,
    destinationLatLng: LatLong
  ): Promise<GoogleRoute | null> => {
    try {
      const payload = {
        originLatLng,
        destinationLatLng
      }
      const getGoogleRouteCallable = functions().httpsCallable('getGoogleRoute')
      const response = await getGoogleRouteCallable(payload)
      if (response?.data) {
        return response.data as GoogleRoute
      }
    } catch (e: any) {
      console.error('[googleRouteService.native] Error fetching route:', e)
    }
    return null
  },

  getStepsOverViewFromGoogleRouteLeg: (leg: Leg): GoogleRouteStepsOverview => {
    const totalDuration = leg.localizedValues.duration.text
    const totalDistance = leg.localizedValues.distance.text
    const steps = leg.stepsOverview.multiModalSegments.map((e) => {
      const overview: GoogleRouteStepsOverviewStep = {
        travelMode: e.travelMode,
        instruction: e.navigationInstruction?.instructions
      }
      if (e.travelMode === 'TRANSIT') {
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
  },

  getCurrentPosition: async (): Promise<LatLong> => {
    const { status: currentStatus } =
      await Location.getForegroundPermissionsAsync()
    let finalStatus = currentStatus
    if (currentStatus !== 'granted') {
      const { status: requestedStatus } =
        await Location.requestForegroundPermissionsAsync()
      finalStatus = requestedStatus
    }
    if (finalStatus !== 'granted') {
      throw new Error('Location permission is required to get directions')
    }
    const currentLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    })
    return {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude
    }
  }
} satisfies IGoogleRouteService

// Export individual functions for backward compatibility
export const {
  getGoogleRoute,
  getStepsOverViewFromGoogleRouteLeg,
  getCurrentPosition
} = googleRouteService
