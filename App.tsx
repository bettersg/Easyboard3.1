import { NavigationContainer } from '@react-navigation/native'
import { useEffect, useState } from 'react'
import LoadingIndicator from './src/common/components/LoadingIndicator'
import Page from './src/common/components/Page'
import { AppProvider, useAuth } from './src/contexts/AppContext'
import { getUserStorage, clearUserStorage, isSessionExpired } from './src/services/storageService'
import AuthStack from './src/navigation/AuthStack'
import PWIDStack from './src/navigation/PWIDStack'
import CaregiverStack from './src/navigation/CaregiverStack'
import notificationService from './src/services/notificationService'

function AppContent() {
  const { hasAuthen, userType, setAuthentication } = useAuth()
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true
    const checkAuthen = async () => {
      try {
        const userStorage = await getUserStorage()
        if (userStorage && isMounted) {
          // Feature to check session expired is worked already but now we do not use, will use later
          // if (await isSessionExpired()) {
          //   await clearUserStorage()
          //   setAuthentication(false, null, true)
          // } else {
          setAuthentication(true, userStorage.userType, false)
          // }
        }
      } catch (error) {
        if (isMounted) setAuthentication(false, null)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    checkAuthen()
    return () => {
      isMounted = false
    }
  }, [setAuthentication])

  // Initialize notification service
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await notificationService.initialize();
        notificationService.setupNotificationListeners();
        console.log('Notification service initialized successfully');
      } catch (error) {
        console.error('Failed to initialize notification service:', error);
      }
    };

    // Only initialize when user is authenticated
    if (hasAuthen) {
      initializeNotifications();
    }
  }, [hasAuthen, userType]); // Re-initialize when user changes

  if (isLoading) {
    return (
      <Page>
        <LoadingIndicator />
      </Page>
    )
  }

  return (
    <NavigationContainer>
      {!hasAuthen ? (
        <AuthStack />
      ) : userType === 'PWID' ? (
        <PWIDStack />
      ) : (
        <CaregiverStack />
      )}
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
