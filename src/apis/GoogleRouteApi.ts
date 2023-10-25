import axios from 'axios'
import Constants from 'expo-constants'

import LatLong from '../interfaces/LatLong.interface'
import { GoogleRoute } from '../types/GoogleRoute.type'

const apiKey = Constants?.expoConfig?.extra?.googleMapsAPI
/**
 * Ref: https://developers.google.com/maps/documentation/routes/compute_route_directions
 * @param originLatLng
 * @param destinationLatLng
 * @returns
 */
export const getGoogleRoute = async (originLatLng: LatLong, destinationLatLng: LatLong) => {
  try {
    const params = {
      origin: {
        location: {
          latLng: originLatLng,
        },
      },
      destination: {
        location: {
          latLng: destinationLatLng,
        },
      },
      travelMode: 'TRANSIT',
      computeAlternativeRoutes: true,
      languageCode: 'en-US',
      transitPreferences: {
        allowedTravelModes: ['TRAIN', 'BUS'],
      },
      units: 'METRIC',
    }
    const headers = {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      //   'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.legs.steps.transitDetails,routes.legs.polyline,routes.polyline.encodedPolyline'
      'X-Goog-FieldMask': 'routes',
      //   'X-Goog-FieldMask': 'routes.legs.steps.transitDetails'
    }
    console.log(params)
    const result = await axios.post<GoogleRoute>(
      'https://routes.googleapis.com/directions/v2:computeRoutes',
      params,
      { headers }
    )
    if (result?.data) {
      console.log('data', JSON.stringify(result.data))
      return result.data
    }
  } catch (e) {
    console.error(e)
  }
  return ''
}
