// Shared types for the UI package

// Re-export onboarding store types
export type { LatLong, MarkerData } from '../stores/onboardingStore'

// Re-export Google Route types
export type {
  GoogleRoute,
  GoogleRouteStepsOverview,
  GoogleRouteStepsOverviewStep,
  Leg,
  Polyline,
  Route,
  Step,
  TransitDetails,
  TransitLine,
  TravelMode,
  Viewport
} from './googleRoute'
// Re-export user types
export type {
  Address,
  CaregiverUser,
  LatLng,
  PWIDUser,
  SavedPlace,
  UserData,
  UserLocation,
  UserStorage,
  UserType
} from './user'

// Map component props
import type { LatLong, MarkerData } from '../stores/onboardingStore'

export interface GoogleMapViewProps {
  onLocationMarkerDrop: (marker: MarkerData) => void
  value: MarkerData | null
  initialCenter: LatLong
  isTracking?: boolean
}
