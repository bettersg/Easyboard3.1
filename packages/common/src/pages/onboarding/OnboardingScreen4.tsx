import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useRouter } from 'solito/navigation'
import { ProgressIndicator, ScrollView, Text, View } from '../../components'
import {
  LocationInput,
  type LocationInputRef
} from '../../components/LocationInput'
import { SavedPlaceCard } from '../../components/SavedPlaceCard'
import { useAuth } from '../../contexts'
import { useLogin } from '../../hooks'
import { getUserStorage, setUserStorage } from '../../services/storageService'
import { createUser, setUserAppData } from '../../services/userService'
import type { MarkerData } from '../../stores/onboardingStore'
import { useOnboardingStore } from '../../stores/onboardingStore'
import { OnboardingLayout } from './OnboardingLayout'

const GOOGLE_MAPS_API_BASE_URL = 'https://maps.googleapis.com/maps/api'

const apiKey =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  ''

/**
 * Gets photo URL from photo reference (similar to native implementation)
 * Note: Photo URLs don't have CORS restrictions, so this endpoint works fine
 */
function getGooglePlacePhotoUrl(
  photoReference: string,
  maxWidth: number = 400
): string | null {
  if (!apiKey || !photoReference) return null
  return `${GOOGLE_MAPS_API_BASE_URL}/place/photo?key=${apiKey}&photo_reference=${photoReference}&maxwidth=${maxWidth}`
}

/**
 * Fetches a photo for a location using Google Maps JavaScript API (avoids CORS issues)
 * Uses JavaScript API to get place details, then constructs photo URL like native
 * @param location - The location marker data with latlng coordinates
 * @param callback - Callback function to be called with the location (with photoUri if available)
 */
function fetchLocationPhoto(
  location: MarkerData,
  callback: (location: MarkerData) => void
): void {
  if (
    !location.latlng ||
    typeof window === 'undefined' ||
    !window.google?.maps ||
    !window.google.maps.places
  ) {
    callback(location)
    return
  }

  try {
    console.log('Starting photo fetch for location:', location)
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode(
      {
        location: {
          lat: location.latlng.latitude,
          lng: location.latlng.longitude
        }
      },
      (results, status) => {
        if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
          console.warn('Google Geocoder API rate limit exceeded')
          callback(location)
          return
        }

        if (
          status === google.maps.GeocoderStatus.OK &&
          results &&
          results.length > 0 &&
          results[0]?.place_id
        ) {
          const placeId = results[0].place_id

          // Create a div element and attach it to the document body for PlacesService
          const div = document.createElement('div')
          document.body.appendChild(div)
          const placesService = new google.maps.places.PlacesService(div)

          placesService.getDetails(
            {
              placeId: placeId,
              fields: ['photos', 'name', 'formatted_address']
            },
            (place, placeStatus) => {
              // Clean up the div element
              try {
                if (div.parentNode) {
                  document.body.removeChild(div)
                }
              } catch (_) {
                // Ignore cleanup errors
              }

              if (
                placeStatus ===
                google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT
              ) {
                console.warn('Google Places API rate limit exceeded')
                callback(location)
                return
              }

              if (
                placeStatus ===
                google.maps.places.PlacesServiceStatus.REQUEST_DENIED
              ) {
                console.error(
                  'Google Places API request denied - check API key permissions'
                )
                callback(location)
                return
              }

              console.log('PlacesService.getDetails response:', {
                placeStatus,
                hasPlace: !!place,
                photosCount: place?.photos?.length,
                placeKeys: place ? Object.keys(place) : [],
                firstPhoto: place?.photos?.[0]
              })

              if (
                placeStatus === google.maps.places.PlacesServiceStatus.OK &&
                place?.photos &&
                place.photos.length > 0
              ) {
                const firstPhoto = place.photos[0]
                console.log('First photo object details:', {
                  photo: firstPhoto,
                  photoType: typeof firstPhoto,
                  photoKeys: firstPhoto ? Object.keys(firstPhoto) : [],
                  hasGetUrl: typeof firstPhoto?.getUrl === 'function',
                  photoReference: (firstPhoto as any)?.photo_reference
                })

                let photoUri: string | null = null

                // Try getUrl() first (JavaScript API method)
                if (typeof firstPhoto?.getUrl === 'function') {
                  try {
                    photoUri = firstPhoto.getUrl({ maxWidth: 400 })
                    console.log('Got photo URI from getUrl():', photoUri)
                  } catch (e) {
                    console.error('Error calling getUrl():', e)
                  }
                }

                // Try photo_reference if getUrl() didn't work
                if (!photoUri && (firstPhoto as any)?.photo_reference) {
                  const photoRef = (firstPhoto as any).photo_reference
                  photoUri = getGooglePlacePhotoUrl(photoRef, 400)
                  console.log('Got photo URI from photo_reference:', photoUri)
                }

                if (photoUri) {
                  console.log('Photo URI fetched successfully:', photoUri)
                  callback({ ...location, photoUri })
                  return
                } else {
                  console.log('Failed to get photo URI from both methods')
                }
              }

              console.log('No photos found:', {
                placeStatus,
                hasPhotos: !!place?.photos,
                photosLength: place?.photos?.length,
                placeStatusString: placeStatus
              })
              callback(location)
            }
          )
        } else {
          console.log('Geocoder failed or no place_id:', { status })
          callback(location)
        }
      }
    )
  } catch (e) {
    console.error('Error fetching photo:', e)
    callback(location)
  }
}

interface FormData {
  houseAddrs: MarkerData | null
  gotoFavAddrs: MarkerData | null
  schoolAddrs: MarkerData | null
}

export function OnboardingScreen4() {
  const { formData, updateFormData } = useOnboardingStore()
  const { setAuthentication } = useAuth()
  const { userType: selectedUserType } = useLogin()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const homeLocationInputRef = useRef<LocationInputRef>(null)
  const workLocationInputRef = useRef<LocationInputRef>(null)
  const schoolLocationInputRef = useRef<LocationInputRef>(null)
  const savingCompleteRef = useRef(false)

  const {
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      houseAddrs: formData.houseAddrs,
      gotoFavAddrs: formData.gotoFavAddrs,
      schoolAddrs: formData.schoolAddrs
    },
    mode: 'onChange'
  })

  const houseAddrs = watch('houseAddrs')
  const gotoFavAddrs = watch('gotoFavAddrs')
  const schoolAddrs = watch('schoolAddrs')

  // Use refs to always access latest values in handler
  const formValuesRef = useRef({
    houseAddrs,
    gotoFavAddrs,
    schoolAddrs,
    errors,
    formData,
    isSaving
  })

  useEffect(() => {
    formValuesRef.current = {
      houseAddrs,
      gotoFavAddrs,
      schoolAddrs,
      errors,
      formData,
      isSaving
    }
  }, [houseAddrs, gotoFavAddrs, schoolAddrs, errors, formData, isSaving])

  const handleNext = async () => {
    const {
      houseAddrs: currentHouseAddrs,
      gotoFavAddrs: currentGotoFavAddrs,
      schoolAddrs: currentSchoolAddrs,
      errors: currentErrors,
      formData: currentFormData,
      isSaving: currentIsSaving
    } = formValuesRef.current

    // If saving already completed, skip
    if (savingCompleteRef.current) {
      return
    }

    // If already saving, skip
    if (currentIsSaving) {
      return
    }

    // Validate that required fields are filled before proceeding
    // Home address is required
    if (!currentErrors.houseAddrs && currentHouseAddrs) {
      try {
        setIsSaving(true)
        formValuesRef.current.isSaving = true

        // Save form data to store before saving to Firebase
        updateFormData({
          houseAddrs: currentHouseAddrs || null,
          gotoFavAddrs: currentGotoFavAddrs || null,
          schoolAddrs: currentSchoolAddrs || null
        })

        console.log('[OnboardingScreen4] Saving onboarding data...')

        // Get user phone number from storage
        const userStorage = await getUserStorage()
        if (!userStorage?.phoneNumber) {
          console.error('[OnboardingScreen4] No user phone number found')
          setIsSaving(false)
          formValuesRef.current.isSaving = false
          return
        }

        // Prepare appData to save (matching SettingValues structure)
        const appData = {
          name: currentFormData.name,
          careGiverPhoneNumber: currentFormData.careGiverPhoneNumber,
          houseAddrs: currentHouseAddrs,
          housePhotoUri:
            currentHouseAddrs?.photoUri || currentFormData.housePhotoUri,
          gotoFavAddrs: currentGotoFavAddrs,
          gotoFavAddrsName: currentFormData.gotoFavAddrsName,
          gotoFavPhotoUri:
            currentGotoFavAddrs?.photoUri || currentFormData.gotoFavPhotoUri,
          schoolAddrs: currentSchoolAddrs,
          schoolPhotoUri:
            currentSchoolAddrs?.photoUri || currentFormData.schoolPhotoUri
        }

        // Save to Firebase
        await setUserAppData(userStorage.phoneNumber, appData)

        // Ensure user record is created in Firebase with correct userType
        // And update local storage and global auth state
        if (selectedUserType && userStorage.uid) {
          await createUser(
            userStorage.phoneNumber,
            selectedUserType,
            userStorage.uid
          )

          await setUserStorage({
            ...userStorage,
            userType: selectedUserType,
            loggedAt: Date.now()
          })

          // Update global authentication state to allow access to /home
          setAuthentication(true, selectedUserType, false)
        }

        console.log('[OnboardingScreen4] Onboarding data saved successfully')
        savingCompleteRef.current = true

        // Navigate to home page
        router.push('/home')
      } catch (error) {
        console.error(
          '[OnboardingScreen4] Error saving onboarding data:',
          error
        )
        setIsSaving(false)
        formValuesRef.current.isSaving = false
        // TODO: Show error message to user
      }
    }
    // If validation fails, errors will be shown by react-hook-form
  }

  const handleBack = () => {
    router.push('/onboarding/3')
  }

  const renderError = (err: any, display: string) => {
    if (err) {
      return (
        <Text className='text-sm text-[#F50008]'>{display} is required.</Text>
      )
    }
    return null
  }

  const handleHomePress = () => {
    homeLocationInputRef.current?.open()
  }

  const handleWorkPress = () => {
    workLocationInputRef.current?.open()
  }

  const handleSchoolPress = () => {
    schoolLocationInputRef.current?.open()
  }

  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={4}
      onNext={handleNext}
      onBack={handleBack}
    >
      <View className='flex-1 w-full'>
        <View className='gap-6 w-full flex-1 px-6 py-4'>
          <ProgressIndicator currentStep={4} totalSteps={4} />
          <View className='gap-2'>
            <Text className='text-2xl font-bold text-[#414852]'>
              Add saved places
            </Text>
            <Text className='text-base text-[#677281]'>
              Bookmark places you frequently travel to for easy access.
            </Text>
          </View>

          <ScrollView
            contentContainerClassName='gap-4 pb-8'
            className='flex-1'
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
          >
            {/* Home Card */}
            <View className='gap-2'>
              <SavedPlaceCard
                title='Home'
                required={true}
                onPress={handleHomePress}
                location={houseAddrs}
                imageUri={
                  // Use photoUri from location if available, otherwise use manually uploaded photo
                  houseAddrs?.photoUri ||
                  (Array.isArray(formData.housePhotoUri)
                    ? formData.housePhotoUri[0]
                    : formData.housePhotoUri || undefined)
                }
              />
              <View
                style={{
                  position: 'absolute',
                  opacity: 0,
                  pointerEvents: 'none'
                }}
              >
                <Controller
                  control={control}
                  rules={{ required: true }}
                  render={() => (
                    <LocationInput
                      ref={homeLocationInputRef}
                      value={houseAddrs}
                      locationType='Home'
                      onLocationSelect={(location: MarkerData) => {
                        console.log('Home location selected:', location)
                        fetchLocationPhoto(location, (locationWithPhoto) => {
                          console.log(
                            'Home location with photo:',
                            locationWithPhoto
                          )
                          setValue('houseAddrs', locationWithPhoto, {
                            shouldValidate: true
                          })
                        })
                      }}
                    />
                  )}
                  name='houseAddrs'
                />
              </View>
              {renderError(errors.houseAddrs, 'Home Address')}
            </View>

            {/* Work Card */}
            <View className='gap-2'>
              <SavedPlaceCard
                title='Work'
                onPress={handleWorkPress}
                location={gotoFavAddrs}
                imageUri={
                  // Use photoUri from location if available, otherwise use manually uploaded photo
                  gotoFavAddrs?.photoUri ||
                  (Array.isArray(formData.gotoFavPhotoUri)
                    ? formData.gotoFavPhotoUri[0]
                    : formData.gotoFavPhotoUri || undefined)
                }
              />
              <View
                style={{
                  position: 'absolute',
                  opacity: 0,
                  pointerEvents: 'none'
                }}
              >
                <Controller
                  control={control}
                  render={() => (
                    <LocationInput
                      ref={workLocationInputRef}
                      value={gotoFavAddrs}
                      locationType='Work'
                      onLocationSelect={(location: MarkerData) => {
                        console.log('Work location selected:', location)
                        fetchLocationPhoto(location, (locationWithPhoto) => {
                          console.log(
                            'Work location with photo:',
                            locationWithPhoto
                          )
                          setValue('gotoFavAddrs', locationWithPhoto, {
                            shouldValidate: true
                          })
                        })
                      }}
                    />
                  )}
                  name='gotoFavAddrs'
                />
              </View>
            </View>

            {/* School Card */}
            <View className='gap-2'>
              <SavedPlaceCard
                title='School'
                onPress={handleSchoolPress}
                location={schoolAddrs}
                imageUri={
                  // Use photoUri from location if available, otherwise use manually uploaded photo
                  schoolAddrs?.photoUri ||
                  (Array.isArray(formData.schoolPhotoUri)
                    ? formData.schoolPhotoUri[0]
                    : formData.schoolPhotoUri || undefined)
                }
              />
              <View
                style={{
                  position: 'absolute',
                  opacity: 0,
                  pointerEvents: 'none'
                }}
              >
                <Controller
                  control={control}
                  render={() => (
                    <LocationInput
                      ref={schoolLocationInputRef}
                      value={schoolAddrs}
                      locationType='School'
                      onLocationSelect={(location: MarkerData) => {
                        console.log('School location selected:', location)
                        fetchLocationPhoto(location, (locationWithPhoto) => {
                          console.log(
                            'School location with photo:',
                            locationWithPhoto
                          )
                          setValue('schoolAddrs', locationWithPhoto, {
                            shouldValidate: true
                          })
                        })
                      }}
                    />
                  )}
                  name='schoolAddrs'
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </OnboardingLayout>
  )
}
