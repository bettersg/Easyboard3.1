'use client'

import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MdGpsFixed } from 'react-icons/md'
import { Pressable } from 'react-native'
import { useDebounce } from '../../hooks'
import type {
  GoogleMapViewProps,
  LatLong,
  MarkerData
} from '../../types/index.js'
import { IconButton, InputField, Text, View } from '..'

// Google Places API functions
const GOOGLE_MAPS_API_BASE_URL = 'https://maps.googleapis.com/maps/api'
const apiKey =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  ''

async function getGoogleReverseGeoCodingAsync(
  latitude: number,
  longitude: number
): Promise<string> {
  if (!apiKey) return ''

  try {
    const response = await fetch(
      `${GOOGLE_MAPS_API_BASE_URL}/geocode/json?key=${apiKey}&latlng=${latitude},${longitude}`
    )
    const data = await response.json()
    return data.results?.[0]?.formatted_address || ''
  } catch (e) {
    console.error(e)
    return ''
  }
}

const GoogleMapView = ({
  onLocationMarkerDrop,
  value,
  initialCenter,
  isTracking = false
}: GoogleMapViewProps) => {
  const mapRef = useRef<google.maps.Map | null>(null)
  const autocompleteServiceRef =
    useRef<google.maps.places.AutocompleteService | null>(null)
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null)

  // Search location states
  const [search, setSearch] = useState('')
  const [predictions, setPredictions] = useState<any[]>([])
  const [hidePrediction, setHidePrediction] = useState(true)
  const [marker, setMarker] = useState<MarkerData | null>(value)
  const [userLocation, setUserLocation] = useState<LatLong | null>(null)
  const isGettingLocationRef = useRef(false)
  const hasInitializedRef = useRef(false)

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['places']
  })

  // Initialize services when map is loaded
  useEffect(() => {
    if (isLoaded) {
      // AutocompleteService doesn't need a map instance
      autocompleteServiceRef.current =
        new google.maps.places.AutocompleteService()
    }
  }, [isLoaded])

  // Query location predictions
  const queryLocation = useCallback(async () => {
    if (
      hidePrediction ||
      !search ||
      !search.trim() ||
      !autocompleteServiceRef.current ||
      !isLoaded
    ) {
      setPredictions([])
      return
    }

    try {
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: search.trim(),
          componentRestrictions: { country: 'sg' }
        },
        (predictions, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            setPredictions(predictions)
          } else {
            setPredictions([])
            if (
              status !== google.maps.places.PlacesServiceStatus.ZERO_RESULTS
            ) {
              console.warn('Places API error:', status)
            }
          }
        }
      )
    } catch (e) {
      console.error('Error querying places:', e)
      setPredictions([])
    }
  }, [hidePrediction, search, isLoaded])

  useDebounce(queryLocation, 600, [queryLocation])

  const tapPrediction = async function (placeId: string, description: string) {
    try {
      setSearch(description)
      setHidePrediction(true)

      if (!placesServiceRef.current) return

      placesServiceRef.current.getDetails(
        {
          placeId: placeId,
          fields: ['geometry', 'formatted_address']
        },
        (place, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            place?.geometry?.location
          ) {
            const lat = place.geometry.location.lat()
            const lng = place.geometry.location.lng()
            const newMarker: MarkerData = {
              description: place?.formatted_address || description,
              latlng: { latitude: lat, longitude: lng }
            }
            setMarker(newMarker)

            if (mapRef.current) {
              mapRef.current.panTo({ lat, lng })
              mapRef.current.setZoom(15)
            }
          } else {
            console.warn('Places API error or missing data:', {
              status,
              hasPlace: !!place,
              hasGeometry: !!place?.geometry,
              hasLocation: !!place?.geometry?.location
            })
          }
        }
      )
    } catch (e) {
      console.error(e)
    }
  }

  const selectPosition = async function (lat: number, lng: number) {
    try {
      const description = await getGoogleReverseGeoCodingAsync(lat, lng)
      setSearch(description)
      setMarker({ description, latlng: { latitude: lat, longitude: lng } })
    } catch (e) {
      console.error(e)
    }
  }

  const goToCurrentLocation = useCallback(async () => {
    if (isGettingLocationRef.current) return

    try {
      if (!navigator.geolocation) {
        console.error('Geolocation is not supported by this browser')
        return
      }

      isGettingLocationRef.current = true

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const newMarker: MarkerData = {
            description: 'Current Location',
            latlng: { latitude, longitude }
          }
          setMarker(newMarker)
          setUserLocation({ latitude, longitude })

          if (mapRef.current) {
            mapRef.current.panTo({ lat: latitude, lng: longitude })
            mapRef.current.setZoom(15)
          }
          isGettingLocationRef.current = false
        },
        (error) => {
          console.error('Error getting location:', error)
          isGettingLocationRef.current = false
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000
        }
      )
    } catch (e) {
      console.error(e)
      isGettingLocationRef.current = false
    }
  }, [])

  // Watch marker value change and update the parent component
  useEffect(() => {
    if (marker) {
      onLocationMarkerDrop(marker)
    }
  }, [marker, onLocationMarkerDrop])

  // Initialize map position when value changes (only on initial load)
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !value?.latlng) {
      if (
        isLoaded &&
        mapRef.current &&
        !value?.latlng &&
        !hasInitializedRef.current
      ) {
        // If no value prop, mark as initialized after map loads
        hasInitializedRef.current = true
      }
      return
    }

    // In tracking mode, always update the map position
    if (isTracking) {
      setMarker(value)
      mapRef.current.panTo({
        lat: value.latlng.latitude,
        lng: value.latlng.longitude
      })
      // Only set zoom on first update
      if (!hasInitializedRef.current) {
        mapRef.current.setZoom(15)
        hasInitializedRef.current = true
      }
    } else {
      // In normal mode, only pan to value on initial load
      // This prevents resetting when user interacts with the map
      if (!hasInitializedRef.current) {
        setMarker(value)
        mapRef.current.panTo({
          lat: value.latlng.latitude,
          lng: value.latlng.longitude
        })
        mapRef.current.setZoom(15)
        hasInitializedRef.current = true
      }
    }
  }, [isLoaded, value, isTracking])

  const containerStyle = {
    width: '100%',
    height: '100%'
  }

  // Memoize center to prevent unnecessary re-renders that cause map resets
  const mapCenter = useMemo(
    () => ({ lat: initialCenter.latitude, lng: initialCenter.longitude }),
    [initialCenter.latitude, initialCenter.longitude]
  )

  if (!isLoaded) {
    return (
      <View className='flex flex-1 items-center justify-center'>
        <Text>Loading map...</Text>
      </View>
    )
  }

  return (
    <View className='flex flex-1 items-center justify-center relative h-screen w-screen'>
      {/* Search Bar */}
      <View
        className='absolute left-0 right-0 z-10 flex flex-1 px-3'
        style={{ top: 20 }}
      >
        <View className='relative'>
          {!isTracking && (
            <InputField
              className={`${hidePrediction ? 'rounded-md' : 'rounded-t-md'}`}
              placeholder='Search for location'
              value={search}
              onChangeText={(searchTerm: string) => {
                setSearch(searchTerm)
                setHidePrediction(false)
              }}
              onFocus={() => setHidePrediction(false)}
            />
          )}
          {!hidePrediction && predictions.length > 0 && (
            <View className='absolute top-[53px] left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-md shadow-lg z-20'>
              {predictions.map((item) => (
                <Pressable
                  key={item.place_id}
                  onPress={() => {
                    console.log(
                      'Prediction item clicked:',
                      item.place_id,
                      item.description
                    )
                    tapPrediction(item.place_id, item.description)
                  }}
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: '#e5e7eb',
                    backgroundColor: '#ffffff',
                    padding: 8
                  }}
                >
                  <Text className='text-base' numberOfLines={1}>
                    {item.description}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={12}
        onLoad={(map) => {
          mapRef.current = map
          // Initialize PlacesService when map is loaded
          if (isLoaded && !placesServiceRef.current) {
            placesServiceRef.current = new google.maps.places.PlacesService(map)
          }
        }}
        onClick={(e) => {
          if (e.latLng) {
            selectPosition(e.latLng.lat(), e.latLng.lng())
          }
        }}
        options={{
          disableDefaultUI: true,
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          keyboardShortcuts: false
        }}
      >
        {marker && (
          <Marker
            position={{
              lat: marker.latlng.latitude,
              lng: marker.latlng.longitude
            }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2
            }}
          />
        )}
        {userLocation && (
          <Marker
            position={{
              lat: userLocation.latitude,
              lng: userLocation.longitude
            }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2
            }}
          />
        )}
      </GoogleMap>

      {/* GPS Button */}
      <View className='absolute p-0 bottom-8 right-8'>
        <IconButton
          onPress={goToCurrentLocation}
          icon={<MdGpsFixed size={30} color='#3F98F8' />}
          variant='text'
          className='p-[10px] -mr-[10px] bg-white rounded-full items-center justify-center w-12 h-12'
        />
      </View>
    </View>
  )
}

export default GoogleMapView
