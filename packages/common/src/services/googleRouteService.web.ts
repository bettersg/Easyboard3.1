import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable
} from 'firebase/functions'
import type { LatLong } from '../stores/onboardingStore'
import type {
  GoogleRoute,
  GoogleRouteStepsOverview,
  GoogleRouteStepsOverviewStep,
  Leg
} from '../types/googleRoute'

// Firebase function URL for Google Routes API
const getGoogleRouteApiUrl = (): string => {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_URL || ''
}

/**
 * Fetches Google Routes from current location to destination using Firebase function
 * @param originLatLng Origin coordinates
 * @param destinationLatLng Destination coordinates
 * @returns GoogleRoute object with route options
 */
export async function getGoogleRoute(
  originLatLng: LatLong,
  destinationLatLng: LatLong
): Promise<GoogleRoute | null> {
  const apiUrl = getGoogleRouteApiUrl()

  const functions = getFunctions()

  if (process.env.NODE_ENV === 'development') {
    connectFunctionsEmulator(functions, 'localhost', 5001)
  }

  if (!apiUrl) {
    console.warn(
      '[googleRouteService.web] Google Route API URL not configured. Set NEXT_PUBLIC_FCM_API_URL'
    )
    return null
  }

  try {
    const payload = {
      originLatLng,
      destinationLatLng
    }

    console.log(
      '[googleRouteService.web] Fetching route via Firebase function:',
      payload
    )

    const getGoogleRouteCallable = httpsCallable(functions, 'getGoogleRoute')

    const response = await getGoogleRouteCallable(payload)

    if (response?.data) {
      console.log(
        '[googleRouteService.web] Route data received:',
        JSON.stringify(response.data)
      )
      return response.data as GoogleRoute
    }
  } catch (e: any) {
    console.error(
      '[googleRouteService.web] Error fetching route:',
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
 * Get the user's current location using the browser's Geolocation API
 * @returns Promise with the current position
 */
export async function getCurrentPosition(): Promise<LatLong> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (error) => {
        console.error('[googleRouteService.web] Geolocation error:', error)
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 20000
      }
    )
  })
}
