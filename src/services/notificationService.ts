import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';
import { getUserStorage } from './storageService';
import fcmService from './fcmService';
import { getUserData, storeFCMToken, getFCMToken } from './userService';

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export class NotificationService {
  private static instance: NotificationService;

  private constructor() { }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Request permissions and get FCM token
  public async initialize(): Promise<string | null> {
    try {
      // Request permissions for Firebase Messaging
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('Failed to get permissions for push notifications!');
        return null;
      }

      const userData = await getUserStorage();
      // Get FCM token
      const token = await messaging().getToken();
      // Store token in database
      if (userData) {
        await storeFCMToken(userData.phoneNumber, token);
      }

      // Listen for token refresh
      messaging().onTokenRefresh(async (new_token) => {
        if (userData) {
          await storeFCMToken(userData.phoneNumber, new_token);
        }
      });

      return token;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return null;
    }
  }

  // Send notification to caregiver when PWID shares location
  public async sendLocationShareNotification(pwidPhoneNumber: string, caregiverPhoneNumber: string): Promise<void> {
    try {
      // Get caregiver's FCM token
      const caregiverToken = await getFCMToken(caregiverPhoneNumber);
      if (!caregiverToken) {
        console.log('Caregiver FCM token not found');
        return;
      }

      const notificationData: NotificationData = {
        title: 'Location Share',
        body: `${pwidPhoneNumber} has shared their location.`,
        data: {
          type: 'location-share',
          pwidPhoneNumber,
          timestamp: Date.now().toString()
        }
      };

      // Send notification via Firebase Cloud Messaging
      await this.sendFCMNotification(caregiverToken, notificationData);

      console.log('Location share notification sent successfully');
    } catch (error) {
      console.error('Error sending location share notification:', error);
    }
  }

  // Send FCM notification
  private async sendFCMNotification(token: string, notification: NotificationData): Promise<void> {
    try {
      // Use FCM service to send notification through backend
      const success = await fcmService.sendNotification({
        to: token,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data,
        priority: 'high',
      });

      if (success) {
        console.log('FCM notification sent successfully through backend');
      } else {
        console.log('Failed to send FCM notification through backend');
      }

    } catch (error) {
      console.error('Error sending FCM notification:', error);
    }
  }

  // Set up notification listeners
  public setupNotificationListeners(): (() => void) | undefined {
    // Handle notification when app is in foreground
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('Received foreground message:', remoteMessage);

      // Show alert for foreground messages
      Alert.alert(
        remoteMessage.notification?.title || 'New Message',
        remoteMessage.notification?.body || '',
        [
          {
            text: 'OK',
            onPress: () => {
              // Handle notification tap
              this.handleNotificationNavigation(remoteMessage.data);
            },
          },
        ]
      );
    });

    // Handle notification when app is opened from background
    messaging().onNotificationOpenedApp(remoteMessage => {
      // Handle navigation based on notification data
      this.handleNotificationNavigation(remoteMessage.data);
    });

    // Handle notification when app is opened from quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          this.handleNotificationNavigation(remoteMessage.data);
        }
      });

    return unsubscribeForeground;
  }

  // Handle navigation based on notification data
  private handleNotificationNavigation(data: any): void {
    if (data?.type === 'location-share') {
      // Navigate to tracking screen or show location on map
      console.log('Navigate to location tracking for PWID:', data.pwidPhoneNumber);
      // You'll need to implement navigation logic here
    }
  }
}

export default NotificationService.getInstance(); 