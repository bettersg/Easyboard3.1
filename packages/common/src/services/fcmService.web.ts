// FCM Service - Web-friendly version (already mostly compatible)
import axios from 'axios'

export interface FCMNotificationPayload {
  to: string
  notification: {
    title: string
    body: string
  }
  data?: Record<string, any>
  priority: 'high' | 'normal'
}

export class FCMService {
  private static instance: FCMService
  private apiUrl: string

  private constructor() {
    // Use NEXT_PUBLIC_ prefix for Next.js environment variables
    this.apiUrl =
      process.env.NEXT_PUBLIC_FCM_API_URL ||
      process.env.EXPO_PUBLIC_FCM_API_URL ||
      ''

    if (!this.apiUrl) {
      console.warn(
        'FCM API URL not configured. Set NEXT_PUBLIC_FCM_API_URL or EXPO_PUBLIC_FCM_API_URL'
      )
    }
  }

  public static getInstance(): FCMService {
    if (!FCMService.instance) {
      FCMService.instance = new FCMService()
    }
    return FCMService.instance
  }

  // Send notification through backend API
  public async sendNotification(
    payload: FCMNotificationPayload
  ): Promise<boolean> {
    try {
      if (!this.apiUrl) {
        console.error('FCM API URL not configured')
        return false
      }

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      })

      if (response.status === 200) {
        console.log('FCM notification sent successfully')
        return true
      } else {
        console.error('Failed to send FCM notification:', response.status)
        return false
      }
    } catch (error) {
      console.error('Error sending FCM notification:', error)
      return false
    }
  }
}

export default FCMService.getInstance()
