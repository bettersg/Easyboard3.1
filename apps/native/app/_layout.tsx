import {
  AuthProvider,
  LocationSharingProvider,
  NavigationProvider,
  useAuth
} from '@repo/common/contexts'
import { Provider } from '@repo/common/provider'
import notificationService, {
  setNavigationCallback
} from '@repo/common/services'
import { router, Stack, useNavigation } from 'expo-router'
import React, { useEffect } from 'react'

function RootLayoutNav() {
  const { hasAuthen, userType } = useAuth()

  const navigation = useNavigation()

  useEffect(() => {
    // This listener fires whenever the navigation state changes
    const unsubscribe = navigation.addListener('state', () => {
      const state = navigation.getState()
      console.log(
        'Current navigation history:',
        state?.routes.map((route) => route.name)
      )
    })

    return unsubscribe
  }, [navigation])

  // Initialize notification service
  useEffect(() => {
    // Set navigation callback for notification service
    setNavigationCallback(router.navigate)

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
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'card', // Card presentation with default slide animation
        gestureEnabled: true, // Enable swipe back gesture on native
        gestureDirection: 'horizontal'
      }}
    />
  )
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
