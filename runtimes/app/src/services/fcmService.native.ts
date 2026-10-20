import type { FCMNotificationPayload, IFCMService } from './fcmService'

const apiUrl = process.env.EXPO_PUBLIC_FCM_API_URL || ''

export const fcmService: IFCMService = {
  sendNotification: async (
    payload: FCMNotificationPayload
  ): Promise<boolean> => {
    try {
      if (!apiUrl) {
        console.error('FCM API URL not configured')
        return false
      }
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      }).finally(() => clearTimeout(timeout))

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
  },

  getInstance: () => fcmService
} satisfies IFCMService

export default fcmService
