import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../types/RootStackParamList.type'
import Page from '../common/components/Page'
import { MaterialIcons } from '@expo/vector-icons'

type Props = NativeStackScreenProps<RootStackParamList, 'TrackPWIDMap'>

export default function TrackPWIDMap({ navigation }: Props) {
  return (
    <Page>
      <View style={styles.container}>
        {/* Map View will be added here */}
        <View style={styles.mapPlaceholder}>
          <Text style={styles.placeholderText}>Map View Coming Soon</Text>
        </View>

        {/* Tracking Info Panel */}
        <View style={styles.infoPanel}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoTitle}>Tracking PWID</Text>
            <TouchableOpacity style={styles.refreshButton}>
              <MaterialIcons name="refresh" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>John Doe</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Updated:</Text>
              <Text style={styles.infoValue}>2 minutes ago</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Moving</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="call" size={24} color="#007AFF" />
            <Text style={styles.actionButtonText}>Call PWID</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="notifications" size={24} color="#007AFF" />
            <Text style={styles.actionButtonText}>Send Alert</Text>
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
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  placeholderText: {
    fontSize: 16,
    color: '#666'
  },
  infoPanel: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000'
  },
  refreshButton: {
    padding: 8
  },
  infoContent: {
    gap: 12
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    width: 100
  },
  infoValue: {
    fontSize: 16,
    color: '#000',
    flex: 1
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50'
  },
  statusText: {
    fontSize: 16,
    color: '#4CAF50'
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8
  },
  actionButtonText: {
    fontSize: 16,
    color: '#007AFF'
  }
}) 