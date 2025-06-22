import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { updatePWIDLocation } from '../services/userService';
import { getUserStorage } from '../services/storageService';

type LocationSharingContextType = {
  isLocationSharing: boolean;
  setIsLocationSharing: (share: boolean) => void;
};

const LocationSharingContext = createContext<LocationSharingContextType | undefined>(undefined);

export const LocationSharingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLocationSharing, setIsLocationSharingState] = useState(false);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const [pwidPhoneNumber, setPwidPhoneNumber] = useState<string | null>(null);

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
    const stopSharing = () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
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

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 1,
        },
        async (loc) => {
          try {
            await updatePWIDLocation(pwidPhoneNumber, {
              lat: loc.coords.latitude,
              lng: loc.coords.longitude,
              updatedAt: Date.now(),
            });
          } catch (e) {
            console.error('Failed to share location', e);
          }
        }
      );
    };

    if (isLocationSharing) {
      startSharing();
    } else {
      stopSharing();
    }

    return () => {
      stopSharing();// Cleanup on unmount
    };
  }, [isLocationSharing, pwidPhoneNumber]);

  const setIsLocationSharing = (share: boolean) => {
    setIsLocationSharingState(share);
  };

  return (
    <LocationSharingContext.Provider value={{ isLocationSharing, setIsLocationSharing }}>
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