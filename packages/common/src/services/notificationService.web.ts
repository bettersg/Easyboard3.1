// Web-friendly notification service using Firebase Cloud Messaging for Web
import {
  getMessaging,
  getToken,
  type MessagePayload,
  onMessage
} from 'firebase/messaging'
import fcmService from './fcmService'
import { getUserStorage } from './storageService'
import { getFCMToken, storeFCMToken } from './userService'

export interface NotificationData {
  title: string
  body: string
  data?: Record<string, any>
}

// Navigation callback type - apps should provide their own navigation function
export type NavigationCallback = (...args: any[]) => void

// Store navigation callback - apps should set this during initialization
let navigationCallback: NavigationCallback | null = null

export function setNavigationCallback(callback: NavigationCallback): void {
  navigationCallback = callback
}

function navigate(screen: string, params?: any): void {
  if (navigationCallback) {
    navigationCallback(screen, params)
  } else {
    console.warn(
      'Navigation callback not set. Call setNavigationCallback() during app initialization.'
    )
    // In Next.js, you'd use router.push or similar
    // This is a placeholder - you'll need to implement proper navigation
    if (typeof window !== 'undefined') {
      console.log('Navigate to:', screen, params)
      // TODO: Implement navigation using Next.js router or your navigation solution
    }
  }
}

export class NotificationService {
  private static instance: NotificationService
  private messaging: ReturnType<typeof getMessaging> | null = null

  private constructor() {
    // Initialize messaging only in browser context
    if (typeof window !== 'undefined') {
      try {
        this.messaging = getMessaging()
      } catch (error) {
        console.error('Failed to initialize Firebase Messaging:', error)
      }
    }
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  // Request permissions and get FCM token
  public async initialize(): Promise<string | null> {
    try {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        console.log('Notifications not supported in this browser')
        return null
      }

      if (!this.messaging) {
        console.error('Firebase Messaging not initialized')
        return null
      }

      // Request notification permissions
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        console.log('Notification permission denied')
        return null
      }

      const userData = await getUserStorage()

      // Get FCM token using Firebase Web SDK
      // VAPID key should be set in environment variable
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) {
        console.warn(
          'NEXT_PUBLIC_VAPID_PUBLIC_KEY not set. FCM token generation may fail.'
        )
      }

      const token = await getToken(this.messaging, {
        vapidKey: vapidKey || ''
      })

      if (!token) {
        console.log(
          'No registration token available. Request permission to generate one.'
        )
        return null
      }

      // Store token in database
      if (userData) {
        await storeFCMToken(userData.phoneNumber, token)
      }

      return token
    } catch (error) {
      console.error('Error initializing notifications:', error)
      return null
    }
  }

  // Check if notification permissions are granted
  public async checkPermissions(): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        return false
      }

      return Notification.permission === 'granted'
    } catch (error) {
      console.error('Error checking notification permissions:', error)
      return false
    }
  }

  // Request notification permissions with user-friendly prompt
  public async requestPermissions(): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        console.log('Notifications not supported')
        return false
      }

      if (Notification.permission === 'granted') {
        // Already granted, initialize
        await this.initialize()
        return true
      }

      if (Notification.permission === 'denied') {
        console.log('Notification permission was previously denied')
        return false
      }

      // Request permission
      const permission = await Notification.requestPermission()
      const granted = permission === 'granted'

      if (granted) {
        await this.initialize()
      }

      return granted
    } catch (error) {
      console.error('Error requesting notification permissions:', error)
      return false
    }
  }

  // Send notification to caregiver when PWID shares location
  public async sendLocationShareNotification(
    pwidPhoneNumber: string,
    caregiverPhoneNumber: string
  ): Promise<void> {
    try {
      // Get caregiver's FCM token
      const caregiverToken = await getFCMToken(caregiverPhoneNumber)
      if (!caregiverToken) {
        console.log('Caregiver FCM token not found')
        return
      }

      const notificationData: NotificationData = {
        title: 'Location Share',
        body: `${pwidPhoneNumber} has shared their location.`,
        data: {
          type: 'location-share',
          pwidPhoneNumber,
          timestamp: Date.now().toString()
        }
      }

      // Send notification via Firebase Cloud Messaging
      await this.sendFCMNotification(caregiverToken, notificationData)

      console.log('Location share notification sent successfully')
    } catch (error) {
      console.error('Error sending location share notification:', error)
    }
  }

  // Send notification to caregiver when PWID stops sharing location
  public async sendLocationStopNotification(
    pwidPhoneNumber: string,
    caregiverPhoneNumber: string,
    reason?: string
  ): Promise<void> {
    try {
      // Get caregiver's FCM token
      const caregiverToken = await getFCMToken(caregiverPhoneNumber)
      if (!caregiverToken) {
        console.log('Caregiver FCM token not found')
        return
      }

      const stopReason = reason || 'Location sharing stopped'
      const notificationData: NotificationData = {
        title: 'Location Share Stopped',
        body: `${pwidPhoneNumber} has stopped sharing their location. ${stopReason}`,
        data: {
          type: 'location-stop',
          pwidPhoneNumber,
          reason: stopReason,
          timestamp: Date.now().toString()
        }
      }

      // Send notification via Firebase Cloud Messaging
      await this.sendFCMNotification(caregiverToken, notificationData)

      console.log('Location stop notification sent successfully')
    } catch (error) {
      console.error('Error sending location stop notification:', error)
    }
  }

  // Send FCM notification
  private async sendFCMNotification(
    token: string,
    notification: NotificationData
  ): Promise<void> {
    try {
      // Use FCM service to send notification through backend
      const success = await fcmService.sendNotification({
        to: token,
        notification: { title: notification.title, body: notification.body },
        data: notification.data,
        priority: 'high'
      })

      if (success) {
        console.log('FCM notification sent successfully through backend')
      } else {
        console.log('Failed to send FCM notification through backend')
      }
    } catch (error) {
      console.error('Error sending FCM notification:', error)
      throw error
    }
  }

  // Set up notification listeners
  public setupNotificationListeners(): (() => void) | undefined {
    if (!this.messaging) {
      return undefined
    }

    // Handle notification when app is in foreground
    const unsubscribeForeground = onMessage(
      this.messaging,
      async (payload: MessagePayload) => {
        const userData = await getUserStorage()
        if (userData?.userType === 'CAREGIVER') {
          // Show browser notification
          if (Notification.permission === 'granted') {
            const notification = new Notification(
              payload.notification?.title || 'New Message',
              {
                body: payload.notification?.body || '',
                icon: '/favicon.png',
                badge: '/favicon.png',
                tag: payload.data?.type || 'default',
                data: payload.data
              }
            )

            notification.onclick = () => {
              window.focus()
              this.handleNotification(payload)
              notification.close()
            }
          }
        }
      }
    )

    // Return cleanup function
    return unsubscribeForeground
  }

  private async handleNotification(payload: MessagePayload) {
    const type = payload.data?.type
    const userData = await getUserStorage()

    if (!type || !userData) return

    switch (type) {
      case 'location-share':
        if (userData.userType === 'CAREGIVER') {
          const pwidPhoneNumber = payload.data?.pwidPhoneNumber?.toString()
          if (pwidPhoneNumber) navigate('TrackPWIDMap', { pwidPhoneNumber })
        }
        break
      case 'location-stop':
        if (userData.userType === 'CAREGIVER') {
          const pwidPhoneNumber = payload.data?.pwidPhoneNumber?.toString()
          if (pwidPhoneNumber) navigate('TrackPWIDMap', { pwidPhoneNumber })
        }
        break
      default:
        console.log('Unhandled notification type:', type)
    }
  }
}

export default NotificationService.getInstance()
