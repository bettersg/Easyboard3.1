// Platform-agnostic re-exports
// TypeScript will use this file, but the bundler will resolve to .native.ts or .web.ts at runtime
// We export from .native as the default for TypeScript type checking
export * from './storageService.native'

// Export upload and download functions (platform-specific implementations)
export {
  getPhotoDownloadUrl,
  type PWIDUser,
  type UserStorage,
  uploadLocationPhoto
} from './storageService.native'
