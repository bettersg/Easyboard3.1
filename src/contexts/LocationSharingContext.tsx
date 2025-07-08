import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { updatePWIDLocation, getUserData, clearPWIDLocation } from '../services/userService';
import { getUserStorage } from '../services/storageService';
import notificationService from '../services/notificationService';

type LocationSharingContextType = {
  isLocationSharing: boolean;
  setIsLocationSharing: (share: boolean) => void;
  setDestination: (dest: { lat: number, lng: number } | null) => void;
  destination: { lat: number, lng: number } | null;
};

const LocationSharingContext = createContext<LocationSharingContextType | undefined>(undefined);

export const LocationSharingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLocationSharing, setIsLocationSharingState] = useState(false);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const [pwidPhoneNumber, setPwidPhoneNumber] = useState<string | null>(null);
  const [destination, setDestinationState] = useState<{ lat: number, lng: number } | null>(null);
  const destinationRef = useRef<{ lat: number, lng: number } | null>(null);
  const arrivalDetectedRef = useRef<boolean>(false);

  // Keep destinationRef in sync with destination
  useEffect(() => {
    destinationRef.current = destination;
  }, [destination]);

  useEffect(() => {
    const getPhoneNumber = async () => {
      const userData = await getUserStorage();
      if (userData) {
        setPwidPhoneNumber(userData.phoneNumber);
      }
    };
    getPhoneNumber();
  }, []);

  useEffect(() => {
    const cleanup = () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
      setDestinationState(null);
      // Clear PWID location from database
      if (pwidPhoneNumber) clearPWIDLocation(pwidPhoneNumber).catch(err => { });
    };

    const stopSharing = async () => {
      cleanup();
      await sendStopNotificationToCaregiver();
    };

    const startSharing = async () => {
      if (!pwidPhoneNumber) {
        Alert.alert('Error', 'Your phone number is not available to start sharing location.');
        setIsLocationSharingState(false);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to share your location.');
        setIsLocationSharingState(false);
        return;
      }

      // Send notification when sharing starts (runs once per effect execution)
      await sendShareNotificationToCaregiver();

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 10,
        },
        async (loc) => {
          try {
            await updatePWIDLocation(pwidPhoneNumber, {
              lat: loc.coords.latitude,
              lng: loc.coords.longitude,
              updatedAt: Date.now(),
            });

            // Use the ref for the latest destination
            if (destinationRef.current) {
              const distance = getDistanceFromLatLonInMeters(
                loc.coords.latitude,
                loc.coords.longitude,
                destinationRef.current.lat,
                destinationRef.current.lng
              );
              if (distance < 20) { //meters threshold
                // Mark that we've detected arrival
                arrivalDetectedRef.current = true;
                setIsLocationSharingState(false);
                Alert.alert('Arrived', 'You have reached your destination. Location sharing stopped.');
                // Note: stopSharing() will be called automatically by useEffect, which clears destination
              }
            }
          } catch (e) {
            console.error('Failed to share location', e);
          }
        }
      );
    };

    const sendShareNotificationToCaregiver = async () => {
      try {
        if (!pwidPhoneNumber) return;
        // Get PWID user data to find caregiver
        const pwidUser = await getUserData(pwidPhoneNumber);
        if (pwidUser && pwidUser.userType === 'PWID' && pwidUser.caregiverPhone) {
          // Send notification to caregiver when location sharing starts
          await notificationService.sendLocationShareNotification(pwidPhoneNumber, pwidUser.caregiverPhone);
        }
      } catch (error) {
        console.error('Error sending notification to caregiver:', error);
      }
    };

    const sendStopNotificationToCaregiver = async () => {
      try {
        if (!pwidPhoneNumber) return;
        // Get PWID user data to find caregiver
        const pwidUser = await getUserData(pwidPhoneNumber);
        if (pwidUser && pwidUser.userType === 'PWID' && pwidUser.caregiverPhone) {
          const reason = arrivalDetectedRef.current ? 'Arrived at destination' : 'Location sharing stopped manually';
          arrivalDetectedRef.current = false;
          // Send notification to caregiver when location sharing stops
          await notificationService.sendLocationStopNotification(pwidPhoneNumber, pwidUser.caregiverPhone, reason);
        }
      } catch (error) {
        console.error('Error sending stop notification to caregiver:', error);
      }
    };

    if (isLocationSharing) {
      startSharing();
    } else {
      stopSharing();
    }
    return () => cleanup();// Cleanup on unmount - don't send notification for cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocationSharing, pwidPhoneNumber]);

  const setIsLocationSharing = (share: boolean) => {
    setIsLocationSharingState(share);
  };

  const setDestination = (dest: { lat: number, lng: number } | null) => {
    setDestinationState(dest);
  };

  function getDistanceFromLatLonInMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  return (
    <LocationSharingContext.Provider value={{
      isLocationSharing,
      setIsLocationSharing,
      destination,
      setDestination
    }}>
      {children}
    </LocationSharingContext.Provider>
  );
};

export const useLocationSharing = () => {
  const context = useContext(LocationSharingContext);
  if (!context) {
    throw new Error('useLocationSharing must be used within a LocationSharingProvider');
  }
  return context;
}; 