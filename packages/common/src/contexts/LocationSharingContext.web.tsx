'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'
import notificationService from '../services/notificationService'
import { getUserStorage } from '../services/storageService'
import {
  clearPWIDLocation,
  getUserData,
  updatePWIDLocation
} from '../services/userService'
import type { PWIDUser } from '../types'

type LocationSharingContextType = {
  isLocationSharing: boolean
  setIsLocationSharing: (share: boolean) => void
  setDestination: (dest: { lat: number; lng: number } | null) => void
  destination: { lat: number; lng: number } | null
}

const LocationSharingContext = createContext<
  LocationSharingContextType | undefined
>(undefined)

export const LocationSharingProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [isLocationSharing, setIsLocationSharingState] = useState(false)
  const [pwidPhoneNumber, setPwidPhoneNumber] = useState<string | null>(null)
  const [destination, setDestinationState] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const watchIdRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    const getPhoneNumber = async () => {
      const userData = await getUserStorage()
      if (userData) {
        setPwidPhoneNumber(userData.phoneNumber)
      }
    }
    getPhoneNumber()
  }, [])

  const sendShareNotificationToCaregiver = useCallback(async () => {
    try {
      if (!pwidPhoneNumber) return
      const pwidUser = await getUserData(pwidPhoneNumber)
      if (pwidUser && pwidUser.userType === 'PWID') {
        const pwid = pwidUser as PWIDUser
        if (pwid.caregiverPhone) {
          await notificationService.sendLocationShareNotification(
            pwidPhoneNumber,
            pwid.caregiverPhone
          )
        }
      }
    } catch (error) {
      console.error('Error sending notification to caregiver:', error)
    }
  }, [pwidPhoneNumber])

  const sendStopNotificationToCaregiver = useCallback(
    async (reason?: string) => {
      try {
        if (!pwidPhoneNumber) return
        const pwidUser = await getUserData(pwidPhoneNumber)
        if (pwidUser && pwidUser.userType === 'PWID') {
          const pwid = pwidUser as PWIDUser
          if (pwid.caregiverPhone) {
            await notificationService.sendLocationStopNotification(
              pwidPhoneNumber,
              pwid.caregiverPhone,
              reason || 'Location sharing stopped manually'
            )
          }
        }
      } catch (error) {
        console.error('Error sending stop notification to caregiver:', error)
      }
    },
    [pwidPhoneNumber]
  )

  React.useEffect(() => {
    if (!isLocationSharing || !pwidPhoneNumber) {
      // Stop sharing
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      if (pwidPhoneNumber) {
        clearPWIDLocation(pwidPhoneNumber).catch(() => {})
      }
      return
    }

    // Start sharing
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported')
      setIsLocationSharingState(false)
      return
    }

    // Send notification when sharing starts
    sendShareNotificationToCaregiver()

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        try {
          await updatePWIDLocation(pwidPhoneNumber!, {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            updatedAt: Date.now()
          })

          // Check if arrived at destination
          if (destination) {
            const distance = getDistanceFromLatLonInMeters(
              position.coords.latitude,
              position.coords.longitude,
              destination.lat,
              destination.lng
            )
            if (distance < 20) {
              // 20 meters threshold
              setIsLocationSharingState(false)
              await sendStopNotificationToCaregiver('Arrived at destination')
              setDestinationState(null)
            }
          }
        } catch (error) {
          console.error('Error updating location:', error)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        setIsLocationSharingState(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000
      }
    )

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      if (pwidPhoneNumber) {
        clearPWIDLocation(pwidPhoneNumber).catch(() => {})
        sendStopNotificationToCaregiver().catch(() => {})
      }
    }
  }, [
    isLocationSharing,
    pwidPhoneNumber,
    destination,
    sendShareNotificationToCaregiver,
    sendStopNotificationToCaregiver
  ])

  const setIsLocationSharing = useCallback((share: boolean) => {
    setIsLocationSharingState(share)
  }, [])

  const setDestination = useCallback(
    (dest: { lat: number; lng: number } | null) => {
      setDestinationState(dest)
    },
    []
  )

  function getDistanceFromLatLonInMeters(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371e3 // meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lng2 - lng1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  return (
    <LocationSharingContext.Provider
      value={{
        isLocationSharing,
        setIsLocationSharing,
        destination,
        setDestination
      }}
    >
      {children}
    </LocationSharingContext.Provider>
  )
}

export const useLocationSharing = () => {
  const context = useContext(LocationSharingContext)
  if (!context) {
    throw new Error(
      'useLocationSharing must be used within a LocationSharingProvider'
    )
  }
  return context
}
