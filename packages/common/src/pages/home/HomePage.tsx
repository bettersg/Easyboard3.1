'use client'

import { useEffect, useState } from 'react'
import { Text, View } from '../../components'
import { useAuth } from '../../contexts'
import { getUserStorage } from '../../services/storageService'
import { CaregiverHome } from './CaregiverHome'
import { PWIDHome } from './PWIDHome'

export function HomePage() {
  const { userType } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [userTypeFromStorage, setUserTypeFromStorage] = useState<string | null>(
    null
  )

  useEffect(() => {
    console.log('hererere', userType)
    const loadUserType = async () => {
      try {
        const userStorage = await getUserStorage()
        if (userStorage?.userType) {
          setUserTypeFromStorage(userStorage.userType)
        }
      } catch (error) {
        console.error('Error loading user type:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // If userType is already in context, use it
    if (userType) {
      setUserTypeFromStorage(userType)
      setIsLoading(false)
    } else {
      // Otherwise load from storage
      loadUserType()
    }
  }, [userType])

  if (isLoading) {
    return (
      <View className='flex-1 items-center justify-center'>
        <Text className='text-base text-[#677281]'>Loading...</Text>
      </View>
    )
  }

  // Route to appropriate home based on user type
  if (userTypeFromStorage === 'PWID') {
    return <PWIDHome />
  }

  if (userTypeFromStorage === 'CAREGIVER') {
    return <CaregiverHome />
  }

  // Fallback if user type is unknown
  return (
    <View className='flex-1 items-center justify-center px-6'>
      <View className='gap-4'>
        <Text className='text-xl font-bold text-[#414852] text-center'>
          Unable to determine user type
        </Text>
        <Text className='text-base text-[#677281] text-center'>
          Please try logging out and logging back in.
        </Text>
      </View>
    </View>
  )
}
