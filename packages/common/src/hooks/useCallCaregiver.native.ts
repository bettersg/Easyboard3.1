import { useCallback } from 'react'
import call from 'react-native-phone-call'
import { getUserStorage } from '../services/storageService'
import { getUserData } from '../services/userService'
import type { PWIDUser } from '../types'

async function callCaregiver(phoneNumber: string) {
  try {
    await call({
      number: phoneNumber,
      prompt: true,
      skipCanOpen: true
    })
  } catch (error) {
    console.error('Error making phone call:', error)
  }
}

/**
 * Cross-platform hook to call caregiver (Native implementation)
 * Returns a function that opens the phone dialer with caregiver's phone number
 */
export function useCallCaregiver() {
  return useCallback(async () => {
    try {
      const userStorage = await getUserStorage()
      if (!userStorage?.phoneNumber) {
        console.error('No user phone number found')
        return
      }

      const userData = await getUserData(userStorage.phoneNumber)
      const caregiverPhone =
        userData?.userType === 'PWID'
          ? (userData as PWIDUser).caregiverPhone
          : undefined

      if (!caregiverPhone) {
        console.error('Caregiver phone number not found')
        return
      }

      return callCaregiver(caregiverPhone)
    } catch (error) {
      console.error('Error calling caregiver:', error)
    }
  }, [])
}
