import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, Linking } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../types/RootStackParamList.type'
import { MaterialIcons } from '@expo/vector-icons'
import { useEffect, useState } from 'react'
import { getPWIDsByCaregiverPhone } from '../services/userService'
import { getUserStorage } from '../services/storageService'
import LoadingIndicator from '../common/components/LoadingIndicator'

type Props = NativeStackScreenProps<RootStackParamList, 'CaregiverMain'>


export default function CaregiverMain({ navigation }: Props) {
  const [pwids, setPwids] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadPWIDs = async () => {
    try {
      const userStorage = await getUserStorage()
      if (userStorage) {
        const pwidList = await getPWIDsByCaregiverPhone(userStorage.phoneNumber)
        setPwids(pwidList)
      }
    } catch (error) {
      console.error('Error loading PWIDs:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadPWIDs()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    loadPWIDs()
  }
  const handleCall = (pwidPhone: string) => {
    if (pwidPhone) Linking.openURL(`tel:${pwidPhone}`).catch(err => console.error('Failed to open URL: ', err))
  }
  const renderPWIDItem = ({ item }: { item: any }) => {
    const isSharing = !!item.location
    const statusColor = isSharing ? '#4CAF50' : '#F44336'
    const statusText = isSharing ? 'Sharing' : 'Not Sharing'
    const statusIcon = isSharing ? 'location-on' : 'location-off'

    return (
      <TouchableOpacity
        style={styles.pwidCard}
        onPress={() => navigation.navigate('TrackPWIDMap', { pwidPhoneNumber: item.pwidPhone })}
      >
        <View style={styles.pwidCardHeader}>
          <View style={styles.pwidInfo}>
            <Text style={styles.pwidPhone}>{item.pwidPhone}</Text>
            {/* <Text style={styles.deviceName}>{item.deviceName}</Text> */}
          </View>
          <View style={styles.statusContainer}>
            <MaterialIcons name={statusIcon} size={20} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Updated:</Text>
          <Text style={styles.infoValue}>
            {item.location ? new Date(item.location.updatedAt).toLocaleTimeString() : 'N/A'}
          </Text>
          <TouchableOpacity
            style={styles.inlineCallButton}
            onPress={() => handleCall(item.pwidPhone)}
            disabled={!item.pwidPhone}
          >
            <MaterialIcons name="call" size={20} color={item.pwidPhone ? "#007AFF" : "#ccc"} />
            <Text style={[styles.inlineCallText, { color: item.pwidPhone ? "#007AFF" : "#ccc" }]}>Call</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="people-outline" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No PWIDs Found</Text>
      <Text style={styles.emptyStateSubtitle}>
        PWIDs you're assigned to will appear here once they register and link to your phone number.
      </Text>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingIndicator />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Manage your assigned PWIDs</Text>
      </View>

      <FlatList
        data={pwids}
        renderItem={renderPWIDItem}
        keyExtractor={(item) => item.pwidPhone}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#666'
  },
  listContainer: {
    padding: 20,
    paddingTop: 0
  },
  pwidCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84
  },
  pwidCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  pwidInfo: {
    flex: 1
  },
  pwidPhone: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4
  },
  deviceName: {
    fontSize: 14,
    color: '#666'
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
    width: 75,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20
  },
}) 