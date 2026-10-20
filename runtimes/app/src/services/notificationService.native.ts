import {
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  type RemoteMessage
} from '@react-native-firebase/messaging'
import * as Notifications from 'expo-notifications'
import { PermissionsAndroid, Platform } from 'react-native'
import fcmService from './fcmService'
import type {
  INotificationService,
  NavigationCallback,
  NotificationData
} from './notificationService'
import { getUserStorage } from './storageService'
import { getFCMToken, storeFCMToken } from './userService'

const DEFAULT_CHANNEL_ID = 'default'

// React Native Firebase messaging receives pushes; expo-notifications only
// shows them while the app is in the foreground. Without a handler a
// presented notification is dropped.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
})

let navigationCallback: NavigationCallback | null = null

const navigate = (screen: string, params?: any): void => {
  if (navigationCallback) {
    navigationCallback(screen, params)
  } else {
    console.warn('Navigation callback not set in NotificationService')
  }
}

const handleNotification = async (remoteMessage: RemoteMessage) => {
  const { notification, data } = remoteMessage
  if (notification) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: data
      },
      // A channel trigger presents immediately on that Android channel
      trigger:
        Platform.OS === 'android' ? { channelId: DEFAULT_CHANNEL_ID } : null
    })
  }
}

export const notificationService: INotificationService = {
  setNavigationCallback: (callback: NavigationCallback): void => {
    navigationCallback = callback
  },

  initialize: async (): Promise<string | null> => {
    try {
      const messaging = getMessaging()
      // RN Firebase deprecated its permission API in favour of expo-notifications
      const permission = await Notifications.requestPermissionsAsync()
      const enabled =
        permission.status === 'granted' ||
        permission.ios?.status ===
          Notifications.IosAuthorizationStatus.PROVISIONAL

      if (!enabled) {
        console.warn('User declined notification permissions')
        return null
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
          name: 'Default Channel',
          importance: Notifications.AndroidImportance.HIGH
        })
      }

      const fcmToken = await getToken(messaging)
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
      const { status } = await Notifications.getPermissionsAsync()
      return status === 'granted'
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
      const { status } = await Notifications.requestPermissionsAsync()
      return status === 'granted'
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
    const messaging = getMessaging()
    const unsubscribeOnMessage = onMessage(messaging, async (remoteMessage) => {
      handleNotification(remoteMessage)
    })

    const unsubscribeOnNotificationOpenedApp = onNotificationOpenedApp(
      messaging,
      (remoteMessage) => {
        if (remoteMessage.data?.type === 'location_sharing_start') {
          navigate('/home', {
            pwidPhoneNumber: remoteMessage.data.pwidPhoneNumber
          })
        }
      }
    )

    getInitialNotification(messaging).then((remoteMessage) => {
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
export const initialize = notificationService.initialize
export const checkPermissions = notificationService.checkPermissions
export const requestPermissions = notificationService.requestPermissions
export const sendLocationShareNotification =
  notificationService.sendLocationShareNotification
export const sendLocationStopNotification =
  notificationService.sendLocationStopNotification
export const sendFCMNotification = notificationService.sendFCMNotification
export const setupNotificationListeners =
  notificationService.setupNotificationListeners
export const setNavigationCallback = notificationService.setNavigationCallback
