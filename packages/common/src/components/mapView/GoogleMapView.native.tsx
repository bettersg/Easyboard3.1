import { MaterialIcons } from '@expo/vector-icons'
import * as Location from 'expo-location'
import { useEffect, useRef, useState } from 'react'
import { Dimensions, Keyboard, StatusBar, TouchableOpacity } from 'react-native'
import { useSafeArea } from '@repo/common/provider'
import Autocomplete from 'react-native-autocomplete-input'
import MapView, { Marker } from 'react-native-maps'
import { useDebounce } from '../../hooks'
import {
  getGooglePlacePhotoAsync,
  getGooglePlacesLocationAsync,
  getGoogleReverseGeoCodingAsync,
  queryGooglePlacesAsync
} from '../../services/googlePlacesService.native'
import type {
  GoogleMapViewProps,
  LatLong,
  MarkerData
} from '../../types/index.js'
import { Text } from '../Text'
import { View } from '../View'

const GoogleMapView = ({
  onLocationMarkerDrop,
  value,
  initialCenter,
  isTracking = false, 
  isModal = false
}: GoogleMapViewProps) => {
  const { top } = useSafeArea()
  // Map View reference
  const mapViewRef = useRef<MapView>(null)

  // Search location states
  const [search, setSearch] = useState('')
  const [predictions, setPredictions] = useState<any>([])
  const [hidePrediction, setHidePrediction] = useState(true)
  const [showUserLocation, setShowUserLocation] = useState(false)
  const [location, setLocation] = useState<Location.LocationObject | null>(null)

  // Marker States
  const [marker, setMarker] = useState<MarkerData | null>(value)

  const queryLocation = async function () {
    try {
      if (!hidePrediction && search) {
        const predictions = await queryGooglePlacesAsync(search)
        setPredictions(predictions)
      }
    } catch (e) {
      console.error(e)
    }
  }
  useDebounce(queryLocation, 600, [hidePrediction, search])

  const tapPrediction = async function (
    placeId: string | number,
    description: string
  ) {
    try {
      setSearch(description)
      setHidePrediction(true)
      Keyboard.dismiss()
      const result = await getGooglePlacesLocationAsync(placeId)
      if (!result) return

      const { lng, lat } = result.location

      // Get photo if available
      let photoUri: string | undefined
      if (result.photos && result.photos.length > 0) {
        const photoRef = result.photos[0].photo_reference
        const photoUrl = await getGooglePlacePhotoAsync(photoRef)
        photoUri = photoUrl || undefined
      }

      setMarker({
        description,
        latlng: { latitude: lat, longitude: lng },
        photoUri
      })
      mapViewRef.current?.animateToRegion(
        {
          longitude: lng,
          latitude: lat,
          latitudeDelta: 0.007,
          longitudeDelta: 0.007
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

  const goToCurrentLocation = async () => {
    try {
      const { coords } =
        location ||
        (await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation
        }))
      setMarker({
        description: 'Current Location',
        latlng: {
          latitude: coords.latitude,
          longitude: coords.longitude
        }
      })
      mapViewRef.current?.animateToRegion(
        {
          longitude: coords.longitude,
          latitude: coords.latitude,
          latitudeDelta: 0.007,
          longitudeDelta: 0.007
        },
        400
      )
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
        const { status: currentStatus } =
          await Location.getForegroundPermissionsAsync()
        let finalStatus = currentStatus

        // Only request if we don't already have permission
        if (currentStatus !== 'granted') {
          const { status: requestedStatus } =
            await Location.requestForegroundPermissionsAsync()
          finalStatus = requestedStatus
        }

        if (finalStatus !== 'granted') {
          // setErrorMsg("Permission to access location was denied");
          console.error('Permission to access location was denied')
          return
        }

        const currLocation = await Location.getCurrentPositionAsync({})
        setLocation(currLocation)

        // Use value prop if available, otherwise use current location, otherwise use initialCenter
        const coords = value?.latlng || currLocation.coords || initialCenter
        setShowUserLocation(true)
        mapViewRef.current?.animateToRegion(
          {
            longitude: coords.longitude,
            latitude: coords.latitude,
            latitudeDelta: 0.007,
            longitudeDelta: 0.007
          },
          400
        )
        mapViewRef.current?.setCamera({
          center: {
            latitude: coords.latitude,
            longitude: coords.longitude
          },
          zoom: 15
        })
      } catch (e) {
        console.error(e)
      }
    })()
  }, [value, initialCenter])

  // Update marker and map position when value changes in tracking mode
  useEffect(() => {
    if (isTracking && value?.latlng) {
      setMarker(value)
      mapViewRef.current?.animateToRegion(
        {
          longitude: value.latlng.longitude,
          latitude: value.latlng.latitude,
          latitudeDelta: 0.007,
          longitudeDelta: 0.007
        },
        400
      )
    }
  }, [isTracking, value])

  return (
    <View className='flex flex-1 items-center justify-center'>
      <View
        className={`absolute left-0 right-0 z-10 flex flex-1 px-3`}
        style={{ top: isModal ? (StatusBar.currentHeight || 10) * 2 : top }}
      >
        <Autocomplete
          inputContainerStyle={{ borderWidth: 0 }}
          containerStyle={{
            height: 40,
            borderWidth: 1,
            borderColor: '#DCDFE3',
            paddingHorizontal: 12,
            borderRadius: hidePrediction ? 6 : 0,
            borderTopLeftRadius: hidePrediction ? 6 : 6,
            borderTopRightRadius: hidePrediction ? 6 : 6
          }}
          hideResults={hidePrediction}
          placeholder='Search for location'
          data={predictions}
          value={search}
          onChangeText={(searchTerm) => {
            setSearch(searchTerm)
            setHidePrediction(false)
          }}
          returnKeyType='done'
          flatListProps={{
            keyExtractor: (item: any) => item.place_id,
            style: { borderBottomRightRadius: 6, borderBottomLeftRadius: 6 },
            renderItem: ({ item }) => (
              <TouchableOpacity
                onPress={() => tapPrediction(item.place_id, item.description)}
              >
                <View className='border-b-[0.5px] border-gray-300 bg-white p-2'>
                  <Text className='text-lg' numberOfLines={1}>
                    {item.description}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          }}
        />
      </View>
      <MapView
        ref={mapViewRef}
        style={{
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height
        }}
        initialRegion={{
          latitude: initialCenter.latitude,
          longitude: initialCenter.longitude,
          latitudeDelta: 0.3,
          longitudeDelta: 0.3
        }}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        onPress={({ nativeEvent: { coordinate } }) =>
          selectPosition(coordinate)
        }
      >
        {marker != null && (
          <Marker
            title='Selected location'
            description={marker.description}
            coordinate={marker.latlng}
          />
        )}
      </MapView>
      <View className='absolute p-0 bottom-20 left-5'>
        <MaterialIcons.Button
          name='gps-fixed'
          onPress={goToCurrentLocation}
          style={{ padding: 10, marginRight: -10 }}
          backgroundColor={'#222'}
          color={'#fff'}
          size={30}
          borderRadius={500}
        />
      </View>
    </View>
  )
}

export default GoogleMapView
