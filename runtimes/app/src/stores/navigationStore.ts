import { create } from 'zustand'
import type { Route } from '../types/googleRoute'
import type { MarkerData } from './onboardingStore'

interface NavigationState {
  // Destination for navigation
  destination: MarkerData | null
  destinationName: string

  // Available routes from Google Routes API
  availableRoutes: Route[]

  // Selected route for directions
  selectedRoute: Route | null
  selectedRouteIndex: number | null

  // Actions
  setDestination: (destination: MarkerData | null, name: string) => void
  setAvailableRoutes: (routes: Route[]) => void
  selectRoute: (route: Route, index: number) => void
  clearNavigation: () => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  destination: null,
  destinationName: 'Destination',
  availableRoutes: [],
  selectedRoute: null,
  selectedRouteIndex: null,

  setDestination: (destination, name) =>
    set({
      destination,
      destinationName: name,
      // Clear previous routes when destination changes
      availableRoutes: [],
      selectedRoute: null,
      selectedRouteIndex: null
    }),

  setAvailableRoutes: (routes) =>
    set({
      availableRoutes: routes
    }),

  selectRoute: (route, index) =>
    set({
      selectedRoute: route,
      selectedRouteIndex: index
    }),

  clearNavigation: () =>
    set({
      destination: null,
      destinationName: 'Destination',
      availableRoutes: [],
      selectedRoute: null,
      selectedRouteIndex: null
    })
}))
