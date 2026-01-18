import { useCallback } from 'react'
import { getUserStorage } from '../services/storageService'
import { getUserAppData } from '../services/userService'

async function callCaregiver(phoneNumber: string) {
  try {
    // On web, create a temporary anchor element to trigger tel: link
    const link = document.createElement('a')
    link.href = `tel:${phoneNumber}`
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error making phone call:', error)
    // Fallback: show phone number to user
    alert(`Please call: ${phoneNumber}`)
  }
}

/**
 * Cross-platform hook to call caregiver (Web implementation)
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

      const appData = await getUserAppData(userStorage.phoneNumber)
      const caregiverPhone = appData?.careGiverPhoneNumber

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
