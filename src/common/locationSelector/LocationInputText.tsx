import { useEffect, useState } from 'react'
import { Modal, View, StyleSheet, Dimensions } from 'react-native'

import GoogleMapView from './GoogleMapView'
import Location from '../../interfaces/Location.interface'
import LocationSelectButton from '../components/LocationSelectButton'
import EasyboardButton from '../components/EasyboardButton'

interface Props {
  onLocationSelect: (location: Location) => void
  value: Location | null
  additionalClassName?: string
}

export default function LocationTextInput({
  onLocationSelect,
  value,
  additionalClassName
}: Props) {
  const [isModalOpen, setModalOpenState] = useState(false)
  const [location, setSelectedLocation] = useState<Location | null>(null)

  useEffect(() => {
    setSelectedLocation(value)
  }, [value])

  const onLocationMarkerDrop = function (locationMarker: Location) {
    setSelectedLocation(locationMarker)
    onLocationSelect(locationMarker) // Propagate back to parent
  }

  return (
    <View className={additionalClassName}>
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
              iconName="save"
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
        additionalClassName="active:bg-gray-50"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  doneBtnContainer: {
    zIndex: 2,
    position: 'absolute',
    bottom: 80,
    right: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  }
})
