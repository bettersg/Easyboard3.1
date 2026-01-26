import type {
  GooglePlaceDetails,
  GooglePlacePrediction,
  IGooglePlacesService
} from './googlePlacesService'

export const googlePlacesService: IGooglePlacesService = {
  queryGooglePlacesAsync: async (
    _searchTerm: string
  ): Promise<GooglePlacePrediction[]> => {
    return []
  },

  getGooglePlacesLocationAsync: async (
    _placeId: string | number
  ): Promise<GooglePlaceDetails | null> => {
    return null
  },

  getGooglePlacePhotoAsync: async (
    _photoReference: string,
    _maxWidth: number = 400
  ): Promise<string | null> => {
    return null
  },

  getGoogleReverseGeoCodingAsync: async (
    latitude: number,
    longitude: number
  ): Promise<string> => {
    return `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
  }
} satisfies IGooglePlacesService

export const {
  queryGooglePlacesAsync,
  getGooglePlacesLocationAsync,
  getGooglePlacePhotoAsync,
  getGoogleReverseGeoCodingAsync
} = googlePlacesService
