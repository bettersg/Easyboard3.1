'use client'

import { decode } from '@googlemaps/polyline-codec'
import {
  GoogleMap,
  Marker,
  Polyline,
  useJsApiLoader
} from '@react-google-maps/api'
import { useEffect, useMemo, useRef } from 'react'
import type { MarkerData } from '../../stores/onboardingStore'
import type { Route } from '../../types/googleRoute'
import { Text, View } from '../index'

export interface DirectionsMapViewProps {
  googleRoute: Route
  destination: MarkerData
  currentStep: number
  navigationStarted: boolean
}

const apiKey =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  ''

export function DirectionsMapView({
  googleRoute,
  destination,
  currentStep,
  navigationStarted
}: DirectionsMapViewProps) {
  const mapRef = useRef<google.maps.Map | null>(null)

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script-directions',
    googleMapsApiKey: apiKey
  })

  // Decode polyline coordinates
  const polylineCoordinates = useMemo(() => {
    const polyline: google.maps.LatLngLiteral[] = []
    const colors: string[] = []

    googleRoute.legs[0]?.steps.forEach((step) => {
      if (step.polyline?.encodedPolyline) {
        const decoded = decode(step.polyline.encodedPolyline)
        decoded.forEach(([lat, lng]) => {
          polyline.push({ lat, lng })
          colors.push(step.transitDetails?.transitLine?.color || '#4a89f3')
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
        lat: destination.latlng.latitude,
        lng: destination.latlng.longitude,
        zoom: 12
      }
    }
    const { high, low } = viewport
    return {
      lat:
        Math.min(high.latitude, low.latitude) +
        Math.abs((high.latitude - low.latitude) / 4),
      lng: (high.longitude + low.longitude) / 2,
      zoom: 12
    }
  }, [googleRoute.viewport, destination])

  // Update map region based on current step when navigating
  useEffect(() => {
    const step = googleRoute.legs[0]?.steps[currentStep]
    const startLocation = step?.startLocation?.latLng
    const endLocation = step?.endLocation?.latLng

    if (!startLocation || !endLocation || !mapRef.current || !navigationStarted)
      return

    const bounds = new google.maps.LatLngBounds()
    bounds.extend({ lat: startLocation.latitude, lng: startLocation.longitude })
    bounds.extend({ lat: endLocation.latitude, lng: endLocation.longitude })

    mapRef.current.fitBounds(bounds, {
      top: 50,
      bottom: 250,
      left: 50,
      right: 50
    })
  }, [navigationStarted, currentStep, googleRoute.legs])

  // Render start/end markers based on navigation state
  const startEndMarkers = useMemo(() => {
    if (!isLoaded) return null

    if (!navigationStarted) {
      // Show start point marker when not navigating
      const startLocation = googleRoute.legs[0]?.steps[0]?.startLocation?.latLng
      if (startLocation) {
        return (
          <Marker
            position={{
              lat: startLocation.latitude,
              lng: startLocation.longitude
            }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: '#007AFF',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3
            }}
            title='Start'
          />
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
          <Marker
            position={{
              lat: stepStartLocation.latitude,
              lng: stepStartLocation.longitude
            }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: '#007AFF',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3
            }}
            title='Current location'
          />
        )}
        {stepEndLocation &&
          currentStep + 1 < (googleRoute.legs[0]?.steps.length || 0) && (
            <Marker
              position={{
                lat: stepEndLocation.latitude,
                lng: stepEndLocation.longitude
              }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#FF9500',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2
              }}
              title='Next waypoint'
            />
          )}
      </>
    )
  }, [isLoaded, navigationStarted, currentStep, googleRoute.legs])

  const containerStyle = {
    width: '100%',
    height: '100%'
  }

  if (!isLoaded) {
    return (
      <View className='flex-1 items-center justify-center bg-gray-100'>
        <Text className='text-gray-600'>Loading map...</Text>
      </View>
    )
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapRegion}
      zoom={mapRegion.zoom}
      onLoad={(map) => {
        mapRef.current = map
      }}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false
      }}
    >
      {/* Destination marker */}
      <Marker
        position={{
          lat: destination.latlng.latitude,
          lng: destination.latlng.longitude
        }}
        icon={{
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: '#FF3B30',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3
        }}
        title='Destination'
      />

      {/* Start/end markers */}
      {startEndMarkers}

      {/* Route polyline */}
      {polylineCoordinates.polyline.length > 0 && (
        <Polyline
          path={polylineCoordinates.polyline}
          options={{
            strokeColor: '#4a89f3',
            strokeOpacity: 0.9,
            strokeWeight: 5,
            geodesic: true
          }}
        />
      )}
    </GoogleMap>
  )
}

export default DirectionsMapView
