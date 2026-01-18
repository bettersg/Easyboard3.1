import axios from 'axios'
import Constants from 'expo-constants'
import { Platform } from 'react-native'

const GOOGLE_MAPS_API_BASE_URL = 'https://maps.googleapis.com/maps/api'

const apiKey =
  Platform.OS === 'ios'
    ? Constants?.expoConfig?.extra?.googleMapsAPIIOS
    : Constants?.expoConfig?.extra?.googleMapsAPIAndroid

// Common headers for Google Maps API requests
const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  // Add Android-specific headers
  if (Platform.OS === 'android') {
    const androidPackage = Constants?.expoConfig?.android?.package
    if (androidPackage) {
      headers['X-Android-Package'] = androidPackage
    }

    // SHA-1 certificate fingerprint - should be set via environment variable
    // For development, you can get it with: cd android && ./gradlew signingReport
    const androidCert =
      process.env.EXPO_PUBLIC_ANDROID_SHA1_CERT ||
      Constants?.expoConfig?.extra?.androidSha1Cert
    if (androidCert) {
      headers['X-Android-Cert'] = androidCert
    }
  }

  // Add iOS-specific headers
  if (Platform.OS === 'ios') {
    const iosBundleId = Constants?.expoConfig?.ios?.bundleIdentifier
    if (iosBundleId) {
      headers['X-Ios-Bundle-Identifier'] = iosBundleId
    }
  }

  return headers
}

// Helper to check API response for errors
const checkApiError = (data: any): string | null => {
  if (data?.status === 'REQUEST_DENIED') {
    return data.error_message || 'API key not authorized'
  }
  if (data?.status === 'OVER_QUERY_LIMIT') {
    return 'API quota exceeded'
  }
  if (data?.status === 'INVALID_REQUEST') {
    return data.error_message || 'Invalid request'
  }
  return null
}

export async function queryGooglePlacesAsync(searchTerm: string) {
  if (!apiKey) {
    console.warn('Google Maps API key not configured')
    return []
  }

  if (!searchTerm || !searchTerm.trim()) {
    return []
  }

  try {
    const result = await axios.request({
      method: 'post',
      url: `${GOOGLE_MAPS_API_BASE_URL}/place/autocomplete/json?key=${apiKey}&input=${searchTerm}&components=country:sg`,
      headers: getHeaders()
    })

    if (result?.data) {
      const error = checkApiError(result.data)
      if (error) {
        console.error('Google Places Autocomplete API error:', error)
        return []
      }

      if (result.data.status === 'OK' && result.data.predictions) {
        return result.data.predictions
      }

      if (result.data.status === 'ZERO_RESULTS') {
        return []
      }

      console.warn('Unexpected API status:', result.data.status)
      return []
    }
  } catch (e: any) {
    console.error(
      'Error calling Google Places Autocomplete API:',
      e?.response?.data || e?.message || e
    )
  }
  return []
}

export async function getGooglePlacesLocationAsync(placeId: string | number) {
  if (!apiKey) {
    console.warn('Google Maps API key not configured')
    return null
  }

  try {
    const result = await axios.request({
      method: 'post',
      url: `${GOOGLE_MAPS_API_BASE_URL}/place/details/json?key=${apiKey}&place_id=${placeId}&fields=geometry,photos`,
      headers: getHeaders()
    })

    if (result?.data) {
      const error = checkApiError(result.data)
      if (error) {
        console.error('Google Places Details API error:', error)
        return null
      }

      if (result.data.status === 'OK' && result.data.result) {
        const {
          result: {
            geometry: { location },
            photos
          }
        } = result.data
        return { location, photos }
      }

      console.warn('Unexpected API status:', result.data.status)
      return null
    }
  } catch (e: any) {
    console.error(
      'Error calling Google Places Details API:',
      e?.response?.data || e?.message || e
    )
  }
  return null
}

export async function getGooglePlacePhotoAsync(
  photoReference: string,
  maxWidth: number = 400
): Promise<string | null> {
  if (!apiKey || !photoReference) return null

  try {
    return `${GOOGLE_MAPS_API_BASE_URL}/place/photo?key=${apiKey}&photo_reference=${photoReference}&maxwidth=${maxWidth}`
  } catch (e) {
    console.error(e)
    return null
  }
}

export async function getGoogleReverseGeoCodingAsync(
  latitude: number,
  longitude: number
) {
  if (!apiKey) {
    console.warn('Google Maps API key not configured')
    return `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
  }

  try {
    const result = await axios.request({
      method: 'get',
      url: `${GOOGLE_MAPS_API_BASE_URL}/geocode/json?key=${apiKey}&latlng=${latitude},${longitude}`,
      headers: getHeaders()
    })

    if (result?.data) {
      const error = checkApiError(result.data)
      if (error) {
        console.error('Google Geocoding API error:', error)
        // Return fallback description
        return `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
      }

      if (
        result.data.status === 'OK' &&
        result.data.results?.[0]?.formatted_address
      ) {
        return result.data.results[0].formatted_address
      }

      if (result.data.status === 'ZERO_RESULTS') {
        console.warn('No results found for coordinates')
        return `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
      }

      console.warn(
        'Geocoding API returned unexpected status:',
        result.data.status
      )
      return `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
    }
  } catch (e: any) {
    console.error(
      'Error calling Google Geocoding API:',
      e?.response?.data || e?.message || e
    )
    // Return fallback description
    return `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
  }
  return ''
}
