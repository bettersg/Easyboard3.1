// Web-friendly notification service using Firebase Cloud Messaging for Web
import {
  getMessaging,
  getToken,
  type MessagePayload,
  onMessage
} from 'firebase/messaging'
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

const handleNotification = (payload: MessagePayload) => {
  const { notification, data } = payload
  if (
    notification &&
    typeof window !== 'undefined' &&
    'Notification' in window
  ) {
    const { title, body } = notification
    const n = new window.Notification(title || '', {
      body: body || '',
      data: data
    })
    n.onclick = (event) => {
      event.preventDefault()
      if (data?.type === 'location_sharing_start') {
        navigate('/home', { pwidPhoneNumber: data.pwidPhoneNumber })
      }
      n.close()
    }
  }
}

let messagingInstance: ReturnType<typeof getMessaging> | null = null
if (typeof window !== 'undefined') {
  try {
    messagingInstance = getMessaging()
  } catch (_) {
    // Only works in browser
  }
}

export const notificationService: INotificationService = {
  setNavigationCallback: (callback: NavigationCallback): void => {
    navigationCallback = callback
  },

  initialize: async (): Promise<string | null> => {
    if (!messagingInstance) return null
    try {
      const permission = await window.Notification.requestPermission()
      if (permission !== 'granted') return null

      const fcmToken = await getToken(messagingInstance, {
        vapidKey:
          process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ||
          process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY
      })

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
    if (typeof window === 'undefined' || !window.Notification) return false
    return window.Notification.permission === 'granted'
  },

  requestPermissions: async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !window.Notification) return false
    try {
      const permission = await window.Notification.requestPermission()
      return permission === 'granted'
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
      console.error('Error sending stop notification to caregiver:', error)
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
    if (!messagingInstance) return undefined
    return onMessage(messagingInstance, (payload) => {
      handleNotification(payload)
    })
  }
} satisfies INotificationService

export default notificationService
