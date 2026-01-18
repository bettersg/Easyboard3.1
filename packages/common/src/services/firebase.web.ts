import { type FirebaseApp, getApps, initializeApp } from '@firebase/app'
import { type Auth, getAuth } from '@firebase/auth'
import { type Database, getDatabase } from '@firebase/database'
import { type FirebaseStorage, getStorage } from '@firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Initialize Firebase only if it hasn't been initialized already
let app: FirebaseApp | undefined
let auth: Auth | undefined
let database: Database | undefined
let storage: FirebaseStorage | undefined
let databaseInitialized = false
let storageInitialized = false

// Lazy initialization function for database
function initializeDatabase(): Database {
  if (typeof window === 'undefined') {
    throw new Error(
      'Firebase Database can only be initialized in browser context'
    )
  }

  if (databaseInitialized && database) {
    return database
  }

  // Ensure app is initialized first
  if (!app) {
    const apps = getApps()
    if (apps.length === 0) {
      app = initializeApp(firebaseConfig)
      console.log('Firebase initialized for web')
    } else {
      app = apps[0]
      console.log('Firebase already initialized, using existing app')
    }
  }

  // Validate databaseURL before initializing database service
  if (!firebaseConfig.databaseURL) {
    throw new Error(
      'Firebase Database URL is not configured. Please set NEXT_PUBLIC_FIREBASE_DATABASE_URL environment variable.'
    )
  }

  try {
    database = getDatabase(app)
    databaseInitialized = true
    return database
  } catch (error) {
    console.error('Firebase Database initialization error:', error)
    throw new Error(
      `Failed to initialize Firebase Database: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

// Initialize Firebase App and Auth (but not Database) at module load
if (typeof window !== 'undefined') {
  // Only initialize in browser context (not during SSR)
  try {
    const apps = getApps()
    if (apps.length === 0) {
      app = initializeApp(firebaseConfig)
      console.log('Firebase initialized for web')
    } else {
      app = apps[0]
      console.log('Firebase already initialized, using existing app')
    }

    auth = getAuth(app)
    // Database will be initialized lazily on first access
  } catch (error) {
    console.error('Firebase initialization error:', error)
    throw new Error(
      'Failed to initialize Firebase. Please check your Firebase configuration and ensure you have a Web app registered in Firebase Console.'
    )
  }
}

// Lazy initialization function for storage
function initializeStorage(): FirebaseStorage {
  if (typeof window === 'undefined') {
    throw new Error(
      'Firebase Storage can only be initialized in browser context'
    )
  }

  if (storageInitialized && storage) {
    return storage
  }

  // Ensure app is initialized first
  if (!app) {
    const apps = getApps()
    if (apps.length === 0) {
      app = initializeApp(firebaseConfig)
      console.log('Firebase initialized for web')
    } else {
      app = apps[0]
      console.log('Firebase already initialized, using existing app')
    }
  }

  try {
    storage = getStorage(app)
    storageInitialized = true
    return storage
  } catch (error) {
    console.error('Firebase Storage initialization error:', error)
    throw new Error(
      `Failed to initialize Firebase Storage: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

// Export getter function for database that uses lazy initialization
function getDatabaseInstance(): Database {
  return initializeDatabase()
}

// Export getter function for storage that uses lazy initialization
function getStorageInstance(): FirebaseStorage {
  return initializeStorage()
}

export { app, auth, getDatabaseInstance, getStorageInstance }
export { type Database, type FirebaseStorage as Storage }
export default app
