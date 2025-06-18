import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../types/RootStackParamList.type'
import Page from '../common/components/Page'
import { MaterialIcons } from '@expo/vector-icons'

type Props = NativeStackScreenProps<RootStackParamList, 'CaregiverMain'>

export default function CaregiverMain({ navigation }: Props) {
  return (
    <Page>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Caregiver Dashboard</Text>
          <Text style={styles.subtitle}>Welcome to your dashboard</Text>
        </View>

        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.trackButton}
            onPress={() => navigation.navigate('TrackPWIDMap')}
          >
            <MaterialIcons name="location-on" size={24} color="#fff" />
            <Text style={styles.trackButtonText}>Track PWID Location</Text>
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
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600'
  }
}) 