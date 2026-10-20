'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'
import type { MarkerData } from '../stores/onboardingStore'
import type { Route } from '../types/googleRoute'

interface NavigationState {
  // Destination for navigation
  destination: MarkerData | null
  destinationName: string

  // Available routes from Google Routes API
  availableRoutes: Route[]

  // Selected route for directions
  selectedRoute: Route | null
  selectedRouteIndex: number | null
}

interface NavigationActions {
  setDestination: (destination: MarkerData | null, name: string) => void
  setAvailableRoutes: (routes: Route[]) => void
  selectRoute: (route: Route, index: number) => void
  clearNavigation: () => void
}

export type NavigationContextType = {
  navigation: NavigationState & NavigationActions
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
)

export function NavigationProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [destination, setDestinationState] = useState<MarkerData | null>(null)
  const [destinationName, setDestinationName] = useState<string>('Destination')
  const [availableRoutes, setAvailableRoutesState] = useState<Route[]>([])
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(
    null
  )

  const setDestination = useCallback(
    (dest: MarkerData | null, name: string) => {
      setDestinationState(dest)
      setDestinationName(name)
      // Clear previous routes when destination changes
      setAvailableRoutesState([])
      setSelectedRoute(null)
      setSelectedRouteIndex(null)
    },
    []
  )

  const setAvailableRoutes = useCallback((routes: Route[]) => {
    setAvailableRoutesState(routes)
  }, [])

  const selectRoute = useCallback((route: Route, index: number) => {
    setSelectedRoute(route)
    setSelectedRouteIndex(index)
  }, [])

  const clearNavigation = useCallback(() => {
    setDestinationState(null)
    setDestinationName('Destination')
    setAvailableRoutesState([])
    setSelectedRoute(null)
    setSelectedRouteIndex(null)
  }, [])

  const contextValue: NavigationContextType = {
    navigation: {
      // State
      destination,
      destinationName,
      availableRoutes,
      selectedRoute,
      selectedRouteIndex,
      // Actions
      setDestination,
      setAvailableRoutes,
      selectRoute,
      clearNavigation
    }
  }

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context.navigation
}
