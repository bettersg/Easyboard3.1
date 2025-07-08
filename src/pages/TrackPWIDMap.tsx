import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../types/RootStackParamList.type'
import Page from '../common/components/Page'
import { MaterialIcons } from '@expo/vector-icons'
import { useEffect, useState, useRef } from 'react'
import { listenToPWIDLocation, Location } from '../services/userService'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
type Props = NativeStackScreenProps<RootStackParamList, 'TrackPWIDMap'>

export default function TrackPWIDMap({ route }: Props) {
  const { pwidPhoneNumber } = route.params
  const [location, setLocation] = useState<Location | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const mapViewRef = useRef<MapView>(null)

  useEffect(() => {
    // Set up real-time location listener
    const unsubscribe = listenToPWIDLocation(pwidPhoneNumber, (newLocation) => {
      setLocation(newLocation)
      const updateTime = new Date(newLocation.updatedAt).toLocaleTimeString()
      setLastUpdated(updateTime)

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
    <Page>
      <View style={styles.container}>
        <MapView
          ref={mapViewRef}
          style={styles.map}
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

        <View style={styles.infoPanel}>
          <View style={styles.titleRow}>
            <Text style={styles.infoTitle}>Tracking {pwidPhoneNumber || 'PWID'}</Text>
            <View style={styles.statusContainer}>
              <MaterialIcons name={statusIcon.name} size={20} color={statusIcon.color} />
              <Text style={[styles.statusText, { color: statusIcon.color }]}>{location ? 'Sharing' : 'Not Sharing'}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Updated:</Text>
            <Text style={styles.infoValue}>{lastUpdated || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, pwidPhoneNumber ? styles.actionButtonEnabled : styles.actionButtonDisabled]}
            onPress={handleCall}
            disabled={!pwidPhoneNumber}
          >
            <MaterialIcons name="call" size={24} color={pwidPhoneNumber ? "#fff" : "#ccc"} />
            <Text style={[styles.actionButtonText, pwidPhoneNumber ? styles.actionButtonTextEnabled : styles.actionButtonTextDisabled]}>Call PWID</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Page>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoPanel: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    width: 120,
  },
  infoValue: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonEnabled: {
    backgroundColor: '#007AFF',
  },
  actionButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  actionButtonText: {
    fontSize: 16,
  },
  actionButtonTextEnabled: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionButtonTextDisabled: {
    color: '#ccc',
    fontWeight: 'bold',
  },
}) 