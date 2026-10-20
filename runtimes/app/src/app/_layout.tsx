import '../../global.css'

import { Stack, useRouter } from 'expo-router'
import React, { useEffect, useRef } from 'react'
import { Platform } from 'react-native'
import { AuthRouteGuard } from '@/components'
import {
  AuthProvider,
  LocationSharingProvider,
  NavigationProvider,
  useAuth
} from '@/contexts'
import { Provider } from '@/provider'
import notificationService, { setNavigationCallback } from '@/services'

function RootLayoutNav() {
  const { hasAuthen, userType } = useAuth()

  const router = useRouter()
  // Keep the latest router without re-running notification setup on every
  // render (re-running would add duplicate listeners)
  const routerRef = useRef(router)
  useEffect(() => {
    routerRef.current = router
  }, [router])

  // Initialize notification service
  useEffect(() => {
    // Set navigation callback for notification service
    setNavigationCallback((screen, params) =>
      routerRef.current.navigate({ pathname: screen, params })
    )

    const initializeNotifications = async () => {
      try {
        await notificationService.initialize()
        notificationService.setupNotificationListeners()
        console.log('Notification service initialized successfully')
      } catch (error) {
        console.error('Failed to initialize notification service:', error)
      }
    }

    // Only initialize when user is authenticated
    if (hasAuthen) {
      initializeNotifications()
    }
  }, [hasAuthen, userType]) // Re-initialize when user changes

  // Use Stack to enable animations between top-level routes
  const stack = (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'card', // Card presentation with default slide animation
        gestureEnabled: true, // Enable swipe back gesture on native
        gestureDirection: 'horizontal'
      }}
    />
  )

  // Web needs the route guard (deep links and reloads land on any URL);
  // native navigation is driven by the screens themselves.
  if (Platform.OS === 'web') {
    return <AuthRouteGuard>{stack}</AuthRouteGuard>
  }

  return stack
}

export default function RootLayout() {
  return (
    <Provider>
      <AuthProvider>
        <NavigationProvider>
          <LocationSharingProvider>
            <RootLayoutNav />
          </LocationSharingProvider>
        </NavigationProvider>
      </AuthProvider>
    </Provider>
  )
}
