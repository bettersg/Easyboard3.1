export interface FCMNotificationPayload {
  to: string
  notification: {
    title: string
    body: string
  }
  data?: Record<string, any>
  priority: 'high' | 'normal'
}

export interface IFCMService {
  sendNotification(payload: FCMNotificationPayload): Promise<boolean>
  getInstance(): IFCMService
}

// Platform-agnostic re-exports
export * from './fcmService.native'
export { default } from './fcmService.native'
