import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../types/RootStackParamList.type'
import { MaterialIcons } from '@expo/vector-icons'
import { useEffect, useState, useRef } from 'react'
import { listenToPWIDLocation, Location } from '../services/userService'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
type Props = NativeStackScreenProps<RootStackParamList, 'TrackPWIDMap'>

export default function TrackPWIDMap({ route }: Props) {
  const { pwidPhoneNumber } = route.params
  const [location, setLocation] = useState<Location | null>(null)
  const [locationUpdated, setLocationUpdated] = useState<string>('')
  const mapViewRef = useRef<MapView>(null)

  useEffect(() => {
    // Set up real-time location listener
    const unsubscribe = listenToPWIDLocation(pwidPhoneNumber, (newLocation) => {
      setLocation(newLocation)
      const updateTime = new Date(newLocation.updatedAt).toLocaleTimeString()
      setLocationUpdated(updateTime)

      // Animate map to the new location
      mapViewRef.current?.animateToRegion(
        {
          latitude: newLocation.lat,
          longitude: newLocation.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      )
    })

    // Clean up listener on unmount
    return () => unsubscribe()
  }, [pwidPhoneNumber])

  const handleCall = () => {
    if (pwidPhoneNumber) {
      Linking.openURL(`tel:${pwidPhoneNumber}`).catch(err => console.error('Failed to open URL: ', err))
    }
  }

  const statusIcon = (() => {
    if (location) {
      return { name: 'location-on' as const, color: '#4CAF50' } // Green for sharing
    } else {
      return { name: 'location-off' as const, color: '#F44336' } // Red for not sharing
    }
  })()

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapViewRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 1.3521, // Default to Singapore
          longitude: 103.8198,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        }}
      >
        {location && (
          <Marker coordinate={{ latitude: location.lat, longitude: location.lng }} title={pwidPhoneNumber || 'PWID Location'}>
            <View style={styles.markerContainer}>
              <MaterialIcons name="person-pin-circle" size={40} color="#007AFF" />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Overlay: Info Panel at Bottom */}
      <View style={styles.overlayInfoPanel}>
        <View style={styles.statusRow}>
          <Text style={styles.infoTitle}>Tracking {pwidPhoneNumber || 'PWID'}</Text>
          <View style={styles.statusContainer}>
            <MaterialIcons name={statusIcon.name} size={20} color={statusIcon.color} />
            <Text style={[styles.statusText, { color: statusIcon.color }]}>{location ? 'Sharing' : 'Not Sharing'}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Updated:</Text>
          <Text style={styles.infoValue}>{locationUpdated || 'N/A'}</Text>
          <TouchableOpacity
            style={styles.inlineCallButton}
            onPress={handleCall}
            disabled={!pwidPhoneNumber}
          >
            <MaterialIcons name="call" size={20} color={pwidPhoneNumber ? "#007AFF" : "#ccc"} />
            <Text style={[styles.inlineCallText, { color: pwidPhoneNumber ? "#007AFF" : "#ccc" }]}>Call</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayInfoPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0, // closer to bottom now that call button is inline
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 12,
    paddingBottom: 30,
    elevation: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    width: 85,
  },
  infoValue: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  inlineCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center'
  },
  inlineCallText: {
    marginLeft: 4,
    fontWeight: 'bold',
    fontSize: 15,
    opacity: 1,
  },
}) 