import { useEffect, useState } from 'react'
import { Modal, View, StyleSheet, Dimensions } from 'react-native'

import GoogleMapView from './GoogleMapView'
import Location from '../../interfaces/Location.interface'
import LocationSelectButton from '../components/LocationSelectButton'
import EasyboardButton from '../components/EasyboardButton'

export default function LocationTextInput({
  onLocationSelect,
  value
}: {
  onLocationSelect: any
  value: any
}) {
  const [isModalOpen, setModalOpenState] = useState(false)
  const [location, setSelectedLocation] = useState<Location | null>(null)

  useEffect(() => {
    setSelectedLocation(value)
  }, [value])

  const onLocationMarkerDrop = function (locationMarker: any) {
    setSelectedLocation(locationMarker)
    onLocationSelect(locationMarker) // Propagate back to parent
  }
  return (
    <View>
      <Modal
        presentationStyle='pageSheet'
        statusBarTranslucent
        animationType='slide'
        visible={isModalOpen}
        onRequestClose={() => {
          if (location != null) onLocationSelect(location)
          setModalOpenState(false)
        }}
        onDismiss={() => {
          if (location != null) onLocationSelect(location)
          setModalOpenState(false)
        }}
      >
        <View style={styles.container}>
          <View style={styles.doneBtnContainer}>
            <EasyboardButton
              type='bg-white'
              onPress={() => setModalOpenState(false)}
              title='Done'
            />
          </View>
          <GoogleMapView
            onLocationMarkerDrop={onLocationMarkerDrop}
            value={location}
          />
        </View>
      </Modal>

      <LocationSelectButton
        onPress={() => setModalOpenState(true)}
        value={location?.description}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputBtn: {
    borderColor: '#000',
    borderWidth: 1,
    padding: 10,
    color: '#000'
  },
  doneBtnContainer: {
    zIndex: 2,
    position: 'absolute',
    bottom: 80,
    right: 20
  }
})
