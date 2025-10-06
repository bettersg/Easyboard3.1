import messaging, {
  FirebaseMessagingTypes
} from '@react-native-firebase/messaging'
import { Alert, Platform, PermissionsAndroid, Permission } from 'react-native'
import { getUserStorage } from './storageService'
import fcmService from './fcmService'
import { storeFCMToken, getFCMToken } from './userService'
import { navigate } from '../navigation/RootNavigation'
import notifee, {
  AndroidImportance,
  AuthorizationStatus
} from '@notifee/react-native'

export interface NotificationData {
  title: string
  body: string
  data?: Record<string, any>
}

export class NotificationService {
  private static instance: NotificationService

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  // Request permissions and get FCM token
  public async initialize(): Promise<string | null> {
    try {
      let enabled = true

      // Request permissions for Firebase Messaging (iOS only)
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission()
        enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL
      }

      if (!enabled) {
        console.log('Failed to get permissions for push notifications!')
        return null
      }

      // Create channel for Android (if needed)
      if (Platform.OS === 'android') {
        await notifee.createChannel({
          id: 'location-share-cn',
          name: 'Location Sharing',
          description: 'Notifications for when location is shared.',
          importance: AndroidImportance.HIGH,
          vibration: true,
          sound: 'default'
        })
      }

      const userData = await getUserStorage()

      // Register device for remote messages (required before getToken)
      await messaging().registerDeviceForRemoteMessages()

      // Get FCM token
      const token = await messaging().getToken()
      // Store token in database
      if (userData) {
        await storeFCMToken(userData.phoneNumber, token)
      }

      // Listen for token refresh
      messaging().onTokenRefresh(async (new_token) => {
        if (userData) {
          await storeFCMToken(userData.phoneNumber, new_token)
        }
      })

      return token
    } catch (error) {
      console.error('Error initializing notifications:', error)
      return null
    }
  }

  // Check if notification permissions are granted
  public async checkPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().hasPermission()
        return (
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL
        )
      } else {
        // For Android 13+ (API 33+), check POST_NOTIFICATIONS permission
        if (
          Platform.OS === 'android' &&
          parseInt(Platform.Version.toString()) >= 33
        ) {
          const granted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS as Permission
          )
          return granted
        } else {
          // For older Android versions, use Notifee to check notification settings
          const settings = await notifee.getNotificationSettings()
          return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED
        }
      }
    } catch (error) {
      console.error('Error checking notification permissions:', error)
      return false
    }
  }

  // Request notification permissions with user-friendly prompt
  public async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission({
          alert: true,
          badge: true,
          sound: true,
          announcement: false,
          carPlay: false,
          criticalAlert: false,
          provisional: false
        })

        const granted =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL

        if (granted) {
          // Initialize notifications if permission granted
          await this.initialize()
        }

        return granted
      } else {
        // For Android 13+ (API 33+), request POST_NOTIFICATIONS permission
        console.log(
          'Request permissions - Android version check:',
          Platform.Version,
          'Parsed:',
          parseInt(Platform.Version.toString())
        )
        if (
          Platform.OS === 'android' &&
          parseInt(Platform.Version.toString()) >= 33
        ) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS as Permission,
            {
              title: 'Notification Permission',
              message:
                'EasyBoard needs notification permissions to alert your caregiver when you share your location.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK'
            }
          )

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            await this.initialize()
            return true
          } else {
            return false
          }
        } else {
          // For older Android versions, check current permissions and open settings if needed
          console.log('Using Notifee for older Android version')
          const settings = await notifee.getNotificationSettings()
          if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
            // Open notification settings for user to enable
            await notifee.openNotificationSettings()
            return false
          } else {
            // Initialize notifications if already authorized
            await this.initialize()
            return true
          }
        }
      }
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
        Alert.alert(
          'Information',
          'Caregiver is not available for notifications'
        )
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
        Alert.alert(
          'Information',
          'Caregiver is not available for notifications'
        )
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
    // Handle notification when app is in foreground
    const unsubscribeForeground = messaging().onMessage(
      async (remoteMessage) => {
        const userData = await getUserStorage()
        if (userData?.userType === 'CAREGIVER') {
          Alert.alert(
            remoteMessage.notification?.title || 'New Message',
            remoteMessage.notification?.body || '',
            [
              {
                text: 'OK',
                onPress: async () =>
                  await this.handleNotification(remoteMessage)
              }
            ]
          )
        }
      }
    )

    // Handle notification when app is opened from background
    messaging().onNotificationOpenedApp((remoteMessage) => {
      if (remoteMessage) this.handleNotification(remoteMessage)
    })

    // Handle notification when app is opened from quit state (cold start)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) this.handleNotification(remoteMessage)
      })

    return unsubscribeForeground
  }

  private async handleNotification(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ) {
    const type = remoteMessage.data?.type
    const userData = await getUserStorage()

    if (!type || !userData) return

    switch (type) {
      case 'location-share':
        if (userData.userType === 'CAREGIVER') {
          const pwidPhoneNumber =
            remoteMessage.data?.pwidPhoneNumber?.toString()
          if (pwidPhoneNumber) navigate('TrackPWIDMap', { pwidPhoneNumber })
        }
        break
      case 'location-stop':
        if (userData.userType === 'CAREGIVER') {
          const pwidPhoneNumber =
            remoteMessage.data?.pwidPhoneNumber?.toString()
          if (pwidPhoneNumber) navigate('TrackPWIDMap', { pwidPhoneNumber })
        }
        break
      // 👉 Add more notification types below if needed
      default:
        console.log('Unhandled notification type:', type)
    }
  }
}

export default NotificationService.getInstance()
