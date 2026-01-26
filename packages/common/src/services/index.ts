// Platform-agnostic service exports
// These will automatically resolve to .native.ts or .web.ts based on the platform

export * from './authService'
export * from './fcmService'
export { default as fcmService } from './fcmService'
export { default as firebase } from './firebase'
export * from './googlePlacesService'
export * from './googleRouteService'
export * from './notificationService'
export { default as notificationService, default } from './notificationService'
export * from './storageService'
export * from './userService'
