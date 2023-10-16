// Note: It looks like CityMapper has stopped?
// https://citymapper.com/news/2596/sdks-and-apis-come-to-an-end
import { decode } from '@googlemaps/polyline-codec'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useMemo, useRef } from 'react'
import { SafeAreaView, ScrollView, Text, View } from 'react-native'
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps'

import TransitTypePill from '../common/components/TransitTypePill'
import { Colors } from '../styles/color'
import RootStackParamList from '../types/RootStackParamList.type'

type Props = NativeStackScreenProps<RootStackParamList, 'GoogleMapsDirections'>

export default function GoogleMapsDirections({ navigation, route }: Props) {
  const mapViewRef = useRef<MapView>(null)
  const { googleRoute, destination } = route.params

  const PolylineCoordinates = useMemo(() => {
    if (googleRoute) {
      return decode(googleRoute.polyline.encodedPolyline).map((e) => {
        return { latitude: e[0], longitude: e[1] }
      })
    } else {
      return []
    }
  }, [googleRoute])

  const mapRegion = useMemo(() => {
    const { high, low } = googleRoute.viewport
    const east = Math.max(high.longitude, low.longitude)
    const west = Math.min(high.longitude, low.longitude)
    const north = Math.max(high.latitude, low.latitude)
    const south = Math.min(high.latitude, low.latitude)
    return {
      longitude: Math.abs((east - west) / 2 + west),
      latitude: Math.abs((north - south) / 2 + south),
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    }
  }, [googleRoute.viewport])

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.white,
        justifyContent: 'space-between',
        position: 'relative',
      }}
    >
      <MapView
        initialRegion={mapRegion}
        provider={PROVIDER_GOOGLE}
        ref={mapViewRef}
        className="h-full justify-between px-6 py-4"
        userLocationPriority="high"
        followsUserLocation
      >
        {/* Render End Marker */}
        <Marker coordinate={destination.latlng} />
        <Polyline
          coordinates={PolylineCoordinates}
          strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
          // strokeColors={new Array(PolylineCoordinates.length).fill("#2abfff")}
          strokeWidth={3}
        />
      </MapView>
      <ScrollView horizontal className="absolute bottom-6 z-10 bg-white">
        {googleRoute.legs[0]?.steps.map((step) => (
          <View
            className="mx-1 my-2 flex flex-col justify-between rounded-md bg-slate-200 px-4 py-1"
            key={step.polyline.encodedPolyline}
          >
            <View className="flex flex-row items-center justify-between">
              <TransitTypePill
                travelMode={step.travelMode}
                transitLine={step.transitDetails?.transitLine}
              />
              <View>
                <Text>
                  {'Duration: '}
                  <Text className="font-semibold">{step.staticDuration}</Text>
                </Text>
              </View>
            </View>
            <View className="mb-2">
              <Text className="text-lg font-semibold">Instructions</Text>
              <Text>{step.navigationInstruction?.instructions}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}
