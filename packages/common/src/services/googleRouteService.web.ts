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
import type { IGoogleRouteService } from './googleRouteService'

export const googleRouteService: IGoogleRouteService = {
  getGoogleRoute: async (
    originLatLng: LatLong,
    destinationLatLng: LatLong
  ): Promise<GoogleRoute | null> => {
    const functions = getFunctions()
    if (process.env.NODE_ENV === 'development') {
      connectFunctionsEmulator(functions, 'localhost', 5001)
    }
    try {
      const payload = { originLatLng, destinationLatLng }
      const getGoogleRouteCallable = httpsCallable(functions, 'getGoogleRoute')
      const response = await getGoogleRouteCallable(payload)
      if (response?.data) {
        return response.data as GoogleRoute
      }
    } catch (e: any) {
      console.error('[googleRouteService.web] Error fetching route:', e)
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
} satisfies IGoogleRouteService

// Export individual functions for backward compatibility
export const {
  getGoogleRoute,
  getStepsOverViewFromGoogleRouteLeg,
  getCurrentPosition
} = googleRouteService
