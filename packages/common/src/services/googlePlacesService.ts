export interface GooglePlacePrediction {
  description: string
  place_id: string
  // Add other fields as needed based on the API response
}

export interface GooglePlaceDetails {
  location: {
    lat: number
    lng: number
  }
  photos?: any[]
}

export interface IGooglePlacesService {
  queryGooglePlacesAsync(searchTerm: string): Promise<GooglePlacePrediction[]>
  getGooglePlacesLocationAsync(
    placeId: string | number
  ): Promise<GooglePlaceDetails | null>
  getGooglePlacePhotoAsync(
    photoReference: string,
    maxWidth?: number
  ): Promise<string | null>
  getGoogleReverseGeoCodingAsync(
    latitude: number,
    longitude: number
  ): Promise<string>
}

// Platform-agnostic re-exports
export * from './googlePlacesService.native'
