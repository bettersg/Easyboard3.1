import { FontAwesome, MaterialIcons } from '@expo/vector-icons'
import { decode } from '@googlemaps/polyline-codec'
import { useEffect, useMemo, useRef } from 'react'
import { Dimensions } from 'react-native'
import MapView, { Marker, Polyline } from 'react-native-maps'
import type { LatLong, MarkerData } from '../../stores/onboardingStore'
import type { Route } from '../../types/googleRoute'
import { View } from '../View'

export interface DirectionsMapViewProps {
  googleRoute: Route
  destination: MarkerData
  currentStep: number
  navigationStarted: boolean
}

export function DirectionsMapView({
  googleRoute,
  destination,
  currentStep,
  navigationStarted
}: DirectionsMapViewProps) {
  const mapViewRef = useRef<MapView>(null)

  // Decode polyline coordinates
  const polylineCoordinates = useMemo(() => {
    const polyline: LatLong[] = []
    const colors: string[] = []

    googleRoute.legs[0]?.steps.forEach((step) => {
      if (step.polyline?.encodedPolyline) {
        decode(step.polyline.encodedPolyline).forEach((e) => {
          polyline.push({ latitude: e[0], longitude: e[1] })
          colors.push(step.transitDetails?.transitLine?.color ?? '#4a89f3')
        })
      }
    })

    return { polyline, colors }
  }, [googleRoute])

  // Initial map region from viewport
  const mapRegion = useMemo(() => {
    const viewport = googleRoute.viewport
    if (!viewport) {
      return {
        latitude: destination.latlng.latitude,
        longitude: destination.latlng.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1
      }
    }
    const { high, low } = viewport
    return {
      latitude:
        Math.min(high.latitude, low.latitude) +
        Math.abs((high.latitude - low.latitude) / 4),
      longitude: (high.longitude + low.longitude) / 2,
      latitudeDelta: Math.abs(high.latitude - low.latitude) + 0.1,
      longitudeDelta: Math.abs(high.longitude - low.longitude) + 0.1
    }
  }, [googleRoute.viewport, destination])

  // Update map region based on current step when navigating
  useEffect(() => {
    const step = googleRoute.legs[0]?.steps[currentStep]
    const startLocation = step?.startLocation?.latLng
    const endLocation = step?.endLocation?.latLng

    if (
      !startLocation ||
      !endLocation ||
      !mapViewRef.current ||
      !navigationStarted
    )
      return

    const oLat = Math.abs(startLocation.latitude)
    const oLng = Math.abs(startLocation.longitude)
    const dLat = Math.abs(endLocation.latitude)
    const dLng = Math.abs(endLocation.longitude)

    const zoom = step?.travelMode === 'WALK' ? 0.002 : 0.075
    mapViewRef.current?.animateToRegion(
      {
        latitude:
          Math.min(startLocation.latitude, endLocation.latitude) +
          Math.abs((startLocation.latitude - endLocation.latitude) / 4),
        longitude: (startLocation.longitude + endLocation.longitude) / 2,
        latitudeDelta: Math.abs(oLat - dLat) + zoom,
        longitudeDelta: Math.abs(oLng - dLng) + zoom
      },
      500
    )
  }, [navigationStarted, currentStep, googleRoute.legs])

  // Render start/end markers based on navigation state
  const startEndMarkers = useMemo(() => {
    if (!navigationStarted) {
      // Show start point marker when not navigating
      const startLocation = googleRoute.legs[0]?.steps[0]?.startLocation?.latLng
      if (startLocation) {
        return (
          <Marker coordinate={startLocation} pinColor='blue'>
            <View className='rounded-full bg-white'>
              <MaterialIcons name='person-pin' size={40} color='black' />
            </View>
          </Marker>
        )
      }
      return null
    }

    // Show current step start/end markers when navigating
    const stepStartLocation =
      googleRoute.legs[0]?.steps[currentStep]?.startLocation?.latLng
    const stepEndLocation =
      googleRoute.legs[0]?.steps[currentStep]?.endLocation?.latLng

    return (
      <>
        {stepStartLocation && (
          <Marker coordinate={stepStartLocation} pinColor='blue'>
            <View className='rounded-full bg-white'>
              <MaterialIcons name='person-pin' size={40} color='black' />
            </View>
          </Marker>
        )}
        {stepEndLocation &&
          currentStep + 1 < (googleRoute.legs[0]?.steps.length || 0) && (
            <Marker coordinate={stepEndLocation} pinColor='orange'>
              <View className='rounded-full bg-white'>
                <FontAwesome name='circle-o' size={24} color='black' />
              </View>
            </Marker>
          )}
      </>
    )
  }, [navigationStarted, currentStep, googleRoute.legs])

  return (
    <MapView
      initialRegion={mapRegion}
      ref={mapViewRef}
      style={{
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height
      }}
      userLocationPriority='high'
      followsUserLocation
    >
      {/* Destination marker */}
      <Marker coordinate={destination.latlng} />

      {/* Start/end markers */}
      {startEndMarkers}

      {/* Route polyline */}
      <Polyline
        lineJoin='round'
        coordinates={polylineCoordinates.polyline}
        strokeColor='#4a89f3'
        strokeColors={polylineCoordinates.colors}
        strokeWidth={5}
      />
    </MapView>
  )
}

export default DirectionsMapView
