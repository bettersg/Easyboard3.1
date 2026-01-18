// Shared types for the UI package

export type SettingKey =
  | 'name'
  | 'careGiverPhoneNumber'
  | 'houseAddrs'
  | 'housePhotoUri'
  | 'gotoFavAddrs'
  | 'gotoFavAddrsName'
  | 'gotoFavPhotoUri'
  | 'schoolAddrs'
  | 'schoolPhotoUri'

export type SettingValues = {
  [key in SettingKey]: any | any[]
}

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
  CaregiverUser,
  Location,
  PWIDUser,
  UserData,
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
