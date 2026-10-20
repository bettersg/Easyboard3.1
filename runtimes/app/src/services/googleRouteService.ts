import type { LatLong } from '../stores/onboardingStore'
import type {
  GoogleRoute,
  GoogleRouteStepsOverview,
  Leg
} from '../types/googleRoute'

export interface IGoogleRouteService {
  getGoogleRoute(
    originLatLng: LatLong,
    destinationLatLng: LatLong
  ): Promise<GoogleRoute | null>
  getStepsOverViewFromGoogleRouteLeg(leg: Leg): GoogleRouteStepsOverview
  getCurrentPosition(): Promise<LatLong>
}

// Platform-agnostic re-exports
export * from './googleRouteService.native'
