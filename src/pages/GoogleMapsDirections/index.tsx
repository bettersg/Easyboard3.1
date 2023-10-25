import { MaterialIcons, FontAwesome } from '@expo/vector-icons'
import { decode } from '@googlemaps/polyline-codec'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { SafeAreaView, View, Dimensions, Text } from 'react-native'
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import Carousel from 'react-native-reanimated-carousel'
import type { ICarouselInstance } from 'react-native-reanimated-carousel'

import CarouselStep from './CarouselStep'
import EasyboardButton from '../../common/components/EasyboardButton'
import TransitOptionCard from '../../common/components/TransitOptionCard'
import { getStepsOverViewFromGoogleRouteLeg } from '../../common/utils/GoogleRouteUtils'
import LatLong from '../../interfaces/LatLong.interface'
import RootStackParamList from '../../types/RootStackParamList.type'

type Props = NativeStackScreenProps<RootStackParamList, 'GoogleMapsDirections'>

export default function GoogleMapsDirections({ navigation, route }: Props) {
  const mapViewRef = useRef<MapView>(null)
  const carouselRef = useRef<ICarouselInstance>(null)
  const { googleRoute, destination } = route.params

  const [currentStep, setCurrentStep] = useState<number>(0)
  const [navigationStarted, setNavigationStarted] = useState<boolean>(false)

  const PolylineCoordinates = useMemo(() => {
    const polyline: LatLong[] = []
    const colors: string[] = []
    googleRoute.legs[0]?.steps.forEach((step) => {
      decode(step.polyline.encodedPolyline).forEach((e) => {
        polyline.push({ latitude: e[0], longitude: e[1] })
        colors.push(step.transitDetails?.transitLine.color ?? '#4a89f3')
      })
    })
    return { polyline, colors }
  }, [googleRoute])

  /**
   * Initial Map Region
   */
  const mapRegion = useMemo(() => {
    const { high, low } = googleRoute.viewport
    return {
      latitude:
        Math.min(high.latitude, low.latitude) + Math.abs((high.latitude - low.latitude) / 4),
      longitude: (high.longitude + low.longitude) / 2, // Simple logic -> middle
      latitudeDelta: Math.abs(high.latitude - low.latitude) + 0.1,
      longitudeDelta: Math.abs(high.longitude - low.longitude) + 0.1,
    }
  }, [googleRoute.viewport])

  /**
   * This useEffect is to update map visible region based on current step
   */
  useEffect(() => {
    const step = googleRoute.legs[0]?.steps[currentStep]
    const startLocation = step?.startLocation.latLng
    const endLocation = step?.endLocation.latLng
    if (!startLocation || !endLocation) return
    // Ref: https://stackoverflow.com/a/66031097
    const oLat = Math.abs(startLocation.latitude)
    const oLng = Math.abs(startLocation.longitude)
    const dLat = Math.abs(endLocation.latitude)
    const dLng = Math.abs(endLocation.longitude)
    if (navigationStarted && mapViewRef && mapViewRef.current) {
      // We want both origin & destination lat/longs to be barely within frame.

      const zoom = step?.travelMode === 'WALK' ? 0.002 : 0.075
      mapViewRef.current?.animateToRegion(
        {
          // Divide by 3 -> The center point will be on the top 1/3 of the screen
          latitude:
            Math.min(startLocation.latitude, endLocation.latitude) +
            Math.abs((startLocation.latitude - endLocation.latitude) / 4),
          longitude: (startLocation.longitude + endLocation.longitude) / 2, // Simple logic -> middle
          latitudeDelta: Math.abs(oLat - dLat) + zoom,
          longitudeDelta: Math.abs(oLng - dLng) + zoom,
        },
        500
      )
    }
  }, [navigationStarted, mapViewRef, currentStep, googleRoute.legs[0]])

  // We render additional start/end markers when navigation is active
  const startEndMarkers = useMemo(() => {
    if (!navigationStarted) {
      // Return START POINT
      const startLocation = googleRoute.legs[0]?.steps[0]?.startLocation.latLng
      if (startLocation)
        return (
          <Marker coordinate={startLocation} pinColor="blue">
            <View className="rounded-full bg-white">
              <MaterialIcons name="person-pin" size={40} color="black" />
            </View>
          </Marker>
        )
    }

    const startLocation = googleRoute.legs[0]?.steps[currentStep]?.startLocation.latLng
    const endLocation = googleRoute.legs[0]?.steps[currentStep]?.endLocation.latLng

    return (
      <>
        {startLocation && (
          <Marker coordinate={startLocation} pinColor="blue">
            <View className="rounded-full bg-white">
              <MaterialIcons name="person-pin" size={40} color="black" />
            </View>
          </Marker>
        )}
        {endLocation && currentStep + 1 < googleRoute.legs[0]?.steps.length && (
          <Marker coordinate={endLocation} pinColor="orange">
            <View className="rounded-full bg-white">
              <FontAwesome name="circle-o" size={24} color="black" />
            </View>
          </Marker>
        )}
      </>
    )
  }, [navigationStarted, currentStep, googleRoute.legs[0]])

  const onNextStepPressed = useCallback(() => {
    carouselRef.current?.next()
  }, [carouselRef])
  const onPrevStepPressed = useCallback(() => {
    carouselRef.current?.prev()
  }, [carouselRef])
  /**
   * When trip starts, we
   * 1) Scroll current navigation step to the start
   * 2) Set navigation started as true, so we know to update our map view
   * 3) update 'currentStep' that is used to render pins, routes, etc
   */
  const onStartTripPressed = useCallback(() => {
    carouselRef.current?.scrollTo({ index: 0, animated: true })
    setNavigationStarted(true)
    setCurrentStep(0)
  }, [currentStep])

  return (
    <View className="relative flex flex-1 justify-between bg-white">
      <MapView
        initialRegion={mapRegion}
        provider={PROVIDER_GOOGLE}
        ref={mapViewRef}
        className="h-full justify-between px-6 py-4"
        userLocationPriority="high"
        followsUserLocation
      >
        {/* Render Final Destination Marker */}
        <Marker coordinate={destination.latlng} />
        {/* Render additional markers */}
        {startEndMarkers}
        <Polyline
          lineJoin="round"
          coordinates={PolylineCoordinates.polyline}
          strokeColor="#4a89f3" // fallback for when `strokeColors` is not supported by the map-provider
          strokeColors={PolylineCoordinates.colors}
          strokeWidth={5}
        />
      </MapView>
      <View className="absolute bottom-0 left-0 right-0 z-10 flex-col justify-end bg-white/40 pt-2">
        {!navigationStarted && googleRoute.legs[0] && (
          <View className="px-3 pt-1">
            <TransitOptionCard
              googleRouteStepsOverview={getStepsOverViewFromGoogleRouteLeg(googleRoute.legs[0])}
            />
          </View>
        )}
        {googleRoute.legs[0] && navigationStarted && (
          <Carousel
            enabled={navigationStarted}
            mode="parallax"
            modeConfig={{
              parallaxScrollingScale: 0.9,
              parallaxScrollingOffset: 50,
            }}
            loop={false}
            ref={carouselRef}
            width={Dimensions.get('window').width}
            height={Dimensions.get('window').width * 0.4}
            data={googleRoute.legs[0].steps}
            scrollAnimationDuration={500}
            onSnapToItem={(index) => setCurrentStep(index)}
            renderItem={({ index }) => {
              const step = googleRoute.legs[0]?.steps[index]
              return step ? <CarouselStep step={step} /> : <View />
            }}
          />
        )}
        <SafeAreaView className="flex flex-row">
          {!navigationStarted ? (
            <View className="mx-2 flex flex-1 px-1">
              <EasyboardButton
                fullWidth
                title="START"
                iconAfter
                iconName="chevron-right"
                onPress={onStartTripPressed}
              />
            </View>
          ) : (
            <>
              <View className="ml-2 flex flex-1 px-1">
                {currentStep === 0 ? (
                  <View />
                ) : (
                  <EasyboardButton
                    type="bg-secondary"
                    onPress={onPrevStepPressed}
                    title="Previous Step"
                    iconName="chevron-left"
                  />
                )}
              </View>
              <View className="mr-2 flex flex-1 px-1">
                <EasyboardButton
                  onPress={onNextStepPressed}
                  title={
                    currentStep + 1 < googleRoute.legs[0]?.steps.length ? 'Next Step' : 'Arrived'
                  }
                  iconName={
                    currentStep + 1 < googleRoute.legs[0]?.steps.length
                      ? 'chevron-right'
                      : undefined
                  }
                  iconAfter
                  disabled={currentStep + 1 === googleRoute.legs[0]?.steps.length}
                />
              </View>
            </>
          )}
        </SafeAreaView>
      </View>
    </View>
  )
}
