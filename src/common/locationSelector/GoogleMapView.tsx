import * as Location from 'expo-location'
import { useState, useEffect, useRef } from 'react'
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Keyboard } from 'react-native'
import Autocomplete from 'react-native-autocomplete-input'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'

import {
  getGooglePlacesLocationAsync,
  getGoogleReverseGeoCodingAsync,
  queryGooglePlacesAsync,
} from '../../apis/GooglePlacesAPI'
import { useDebounce } from '../../hooks/_debounce'
import LatLong from '../../interfaces/LatLong.interface'

interface Props {
  onLocationMarkerDrop: any
  value: any
}
const GoogleMapView = ({ onLocationMarkerDrop, value }: Props) => {
  // Map View reference
  const mapViewRef = useRef<MapView>(null)

  // Search location states
  const [search, setSearch] = useState('')
  const [predictions, setPredictions] = useState<any>([])
  const [hidePrediction, setHidePrediction] = useState(true)
  const [showUserLocation, setShowUserLocation] = useState(false)

  // Marker States
  const [marker, setMarker] = useState(value)

  const queryLocation = async function () {
    try {
      if (!hidePrediction) {
        const predictions = await queryGooglePlacesAsync(search)
        setPredictions(predictions)
      }
    } catch (e) {
      console.error(e)
    }
  }
  useDebounce(queryLocation, 600, [hidePrediction, search])

  const tapPrediction = async function (placeId: string | number, description: string) {
    try {
      setSearch(description)
      setHidePrediction(true)
      Keyboard.dismiss()
      const { lng, lat } = await getGooglePlacesLocationAsync(placeId)
      setMarker({ description, latlng: { latitude: lat, longitude: lng } })
      mapViewRef.current?.animateToRegion(
        {
          longitude: lng,
          latitude: lat,
          latitudeDelta: 0.09,
          longitudeDelta: 0.09,
        },
        400
      )
    } catch (e) {
      console.error(e)
    }
  }

  const selectPosition = async function (coordinate: LatLong) {
    try {
      const description = await getGoogleReverseGeoCodingAsync(
        coordinate.latitude,
        coordinate.longitude
      )
      setSearch(description)
      setMarker({ description, latlng: coordinate })
    } catch (e) {
      console.error(e)
    }
  }

  // watch marker value change and update the parent component
  useEffect(() => {
    if (marker) onLocationMarkerDrop(marker)
  }, [marker])

  // This will emulate the didMount lifecycle in functional components.
  useEffect(() => {
    ;(async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
          // setErrorMsg("Permission to access location was denied");
          console.error('Permission to access location was denied')
          return
        }
        // if value prop is not null by checking if its truthy
        const coords =
          value == true ? value.latlng : (await Location.getCurrentPositionAsync({})).coords
        setShowUserLocation(true)
        mapViewRef.current?.animateToRegion(
          {
            longitude: coords.longitude,
            latitude: coords.latitude,
            latitudeDelta: 0.09,
            longitudeDelta: 0.09,
          },
          400
        )
      } catch (e) {
        console.error(e)
      }
    })()
  }, [])

  return (
    <View className="flex flex-1 items-center justify-center bg-white">
      <View className="absolute left-0 right-0 top-12 z-10 flex flex-1 px-3">
        <Autocomplete
          inputContainerStyle={{ borderWidth: 0 }}
          className={[
            'h-10 border-[1px] border-textInputBorder px-3 text-[14px]',
            hidePrediction ? 'rounded-md' : 'rounded-t-md',
          ].join(' ')}
          hideResults={hidePrediction}
          placeholder="Search for location"
          data={predictions}
          value={search}
          onChangeText={(searchTerm) => {
            setSearch(searchTerm)
            setHidePrediction(false)
          }}
          returnKeyType="done"
          flatListProps={{
            keyExtractor: (item: any) => item.place_id,
            style: styles.autocompleteList,
            renderItem: ({ item }) => (
              <TouchableOpacity onPress={() => tapPrediction(item.place_id, item.description)}>
                <View className="border-b-[0.5px] border-gray-300 bg-white p-2">
                  <Text className="text-lg" numberOfLines={1}>
                    {item.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ),
          }}
        />
      </View>
      <MapView
        ref={mapViewRef}
        mapPadding={{ top: 30, left: 30, bottom: 30, right: 20 }}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 1.3521,
          longitude: 103.822872,
          latitudeDelta: 0.3,
          longitudeDelta: 0.3,
        }}
        showsUserLocation={showUserLocation}
        showsMyLocationButton
        onPress={({ nativeEvent: { coordinate } }) => selectPosition(coordinate)}
      >
        {marker != null && (
          <Marker
            title="Selected location"
            description={marker.description}
            coordinate={marker.latlng}
          />
        )}
      </MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  autocompleteList: {
    borderBottomRightRadius: 6,
    borderBottomLeftRadius: 6,
  },
  autocompleteItemText: {
    fontSize: 18,
  },
})
export default GoogleMapView
