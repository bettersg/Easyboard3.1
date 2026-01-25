import notifee, {
  AndroidImportance,
  AuthorizationStatus
} from '@notifee/react-native'
import messaging, {
  type FirebaseMessagingTypes
} from '@react-native-firebase/messaging'
import { PermissionsAndroid, Platform } from 'react-native'
import fcmService from './fcmService'
import type {
  INotificationService,
  NavigationCallback,
  NotificationData
} from './notificationService'
import { getUserStorage } from './storageService'
import { getFCMToken, storeFCMToken } from './userService'

let navigationCallback: NavigationCallback | null = null

const navigate = (screen: string, params?: any): void => {
  if (navigationCallback) {
    navigationCallback(screen, params)
  } else {
    console.warn('Navigation callback not set in NotificationService')
  }
}

const handleNotification = async (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage
) => {
  const { notification, data } = remoteMessage
  if (notification) {
    await notifee.displayNotification({
      title: notification.title,
      body: notification.body,
      data: data,
      android: {
        channelId: 'default',
        pressAction: {
          id: 'default'
        }
      }
    })
  }
}

export const notificationService: INotificationService = {
  setNavigationCallback: (callback: NavigationCallback): void => {
    navigationCallback = callback
  },

  initialize: async (): Promise<string | null> => {
    try {
      const authStatus = await messaging().requestPermission()
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL

      if (!enabled) {
        console.warn('User declined notification permissions')
        return null
      }

      if (Platform.OS === 'android') {
        await notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
          importance: AndroidImportance.HIGH
        })
      }

      const fcmToken = await messaging().getToken()
      if (fcmToken) {
        const userData = await getUserStorage()
        if (userData?.phoneNumber) {
          await storeFCMToken(userData.phoneNumber, fcmToken)
        }
      }
      return fcmToken
    } catch (error) {
      console.error('Error initializing notification service:', error)
      return null
    }
  },

  checkPermissions: async (): Promise<boolean> => {
    try {
      const settings = await notifee.getNotificationSettings()
      return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED
    } catch (error) {
      console.error('Error checking permissions:', error)
      return false
    }
  },

  requestPermissions: async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS as any
        )
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          return false
        }
      }
      const settings = await notifee.requestPermission()
      return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED
    } catch (error) {
      console.error('Error requesting permissions:', error)
      return false
    }
  },

  sendLocationShareNotification: async (
    pwidPhoneNumber: string,
    caregiverPhoneNumber: string
  ): Promise<void> => {
    try {
      const caregiverToken = await getFCMToken(caregiverPhoneNumber)
      if (!caregiverToken) return

      await notificationService.sendFCMNotification(caregiverToken, {
        title: 'Location Sharing',
        body: `User ${pwidPhoneNumber} has started sharing their location with you.`,
        data: {
          type: 'location_sharing_start',
          pwidPhoneNumber
        }
      })
    } catch (error) {
      console.error('Error sending location share notification:', error)
    }
  },

  sendLocationStopNotification: async (
    pwidPhoneNumber: string,
    caregiverPhoneNumber: string,
    reason?: string
  ): Promise<void> => {
    try {
      const caregiverToken = await getFCMToken(caregiverPhoneNumber)
      if (!caregiverToken) return

      await notificationService.sendFCMNotification(caregiverToken, {
        title: 'Location Stopped',
        body: `User ${pwidPhoneNumber} has stopped sharing their location. ${reason || ''}`,
        data: {
          type: 'location_sharing_stop',
          pwidPhoneNumber
        }
      })
    } catch (error) {
      console.error('Error sending location stop notification:', error)
    }
  },

  sendFCMNotification: async (
    token: string,
    notification: NotificationData
  ): Promise<void> => {
    try {
      await fcmService.sendNotification({
        to: token,
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data,
        priority: 'high'
      })
    } catch (error) {
      console.error('Error sending FCM notification:', error)
    }
  },

  setupNotificationListeners: (): (() => void) | undefined => {
    const unsubscribeOnMessage = messaging().onMessage(
      async (remoteMessage) => {
        handleNotification(remoteMessage)
      }
    )

    const unsubscribeOnNotificationOpenedApp =
      messaging().onNotificationOpenedApp((remoteMessage) => {
        if (remoteMessage.data?.type === 'location_sharing_start') {
          navigate('/home', {
            pwidPhoneNumber: remoteMessage.data.pwidPhoneNumber
          })
        }
      })

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          if (remoteMessage.data?.type === 'location_sharing_start') {
            navigate('/home', {
              pwidPhoneNumber: remoteMessage.data.pwidPhoneNumber
            })
          }
        }
      })

    return () => {
      unsubscribeOnMessage()
      unsubscribeOnNotificationOpenedApp()
    }
  }
} satisfies INotificationService

export default notificationService

// Re-export methods individually for backward compatibility
export const {
  initialize,
  checkPermissions,
  requestPermissions,
  sendLocationShareNotification,
  sendLocationStopNotification,
  sendFCMNotification,
  setupNotificationListeners,
  setNavigationCallback
} = notificationService
