// Platform-agnostic re-exports
// TypeScript will use this file, but the bundler will resolve to .native.ts or .web.ts at runtime
// We export from .native as the default for TypeScript type checking
export * from './notificationService.native'
export { default } from './notificationService.native'
