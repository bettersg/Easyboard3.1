'use client'

// Initialize Firebase for web (client-side only)
import { firebase } from '@repo/common/services'
import { useEffect } from 'react'

/**
 * Component to ensure Firebase is initialized on the client side
 * This component does nothing but trigger the Firebase import
 */
export function FirebaseInit() {
  useEffect(() => {
    // Firebase is initialized via the import above
    console.log('Firebase initialization checked', firebase?.name)
  }, [])

  return null
}
