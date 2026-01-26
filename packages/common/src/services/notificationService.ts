export interface NotificationData {
  title: string
  body: string
  data?: Record<string, any>
}

export type NavigationCallback = (screen: string, params?: any) => void

export interface INotificationService {
  initialize(): Promise<string | null>
  checkPermissions(): Promise<boolean>
  requestPermissions(): Promise<boolean>
  sendLocationShareNotification(
    pwidPhoneNumber: string,
    caregiverPhoneNumber: string
  ): Promise<void>
  sendLocationStopNotification(
    pwidPhoneNumber: string,
    caregiverPhoneNumber: string,
    reason?: string
  ): Promise<void>
  sendFCMNotification(
    token: string,
    notification: NotificationData
  ): Promise<void>
  setupNotificationListeners(): (() => void) | undefined
  setNavigationCallback(callback: NavigationCallback): void
}

// Platform-agnostic re-exports
export * from './notificationService.native'
export { default } from './notificationService.native'
