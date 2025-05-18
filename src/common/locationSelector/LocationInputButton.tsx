import { useState } from 'react'
import { Pressable, Modal, Text, View, StyleSheet } from 'react-native'

import GoogleMapView from './GoogleMapView'
import styles from '../../styles/style'
import EasyboardButton from '../components/EasyboardButton'

export default function LocationInputButton({
  onLocationSelect
}: {
  onLocationSelect: any
}) {
  const [isModalOpen, setModalOpenState] = useState(false)
  const [location, setSelectedLocation] = useState(null)

  const onLocationMarkerDrop = function (locationMarker: any) {
    setSelectedLocation(locationMarker)
  }

  const cardShadowStyle = function (
    { pressed }: { pressed: boolean },
    backgroundColor = '#fff'
  ) {
    return [
      styles.pressableCard,
      {
        shadowColor: pressed ? '#fff' : '#171717',
        backgroundColor,
        borderWidth: pressed ? 0.8 : 1
      }
    ]
  }

  return (
    <View className='py-2'>
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
        <View style={localStyles.container}>
          {/* TODO: improve UX around closing the map screen */}
          {/* <View style={localStyles.doneBtnContainer}>
            <Pressable>
              <Text
                style={localStyles.doneBtn}
                onPress={() => setModalOpenState(false)}
              >
                Done
              </Text>
            </Pressable>
          </View> */}
          <GoogleMapView
            onLocationMarkerDrop={onLocationMarkerDrop}
            value={null}
          />
        </View>
      </Modal>
      <EasyboardButton
        type='bg-white'
        onPress={() => setModalOpenState(true)}
        title='Other Location'
        iconName='chevron-right'
      />
    </View>
  )
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  doneBtnContainer: {
    zIndex: 2,
    position: 'absolute',
    top: 50,
    right: 10
  },
  doneBtn: {
    color: '#fff',
    fontSize: 16,
    padding: 10,
    backgroundColor: '#2ecc71',
    borderRadius: 15,
    textAlign: 'center',
    lineHeight: 25
  }
})
