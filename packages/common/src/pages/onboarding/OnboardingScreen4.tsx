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
import { createUser } from '../../services/userService'
import type { MarkerData } from '../../stores/onboardingStore'
import { useOnboardingStore } from '../../stores/onboardingStore'
import type { SavedPlace } from '../../types'
import { OnboardingLayout } from './OnboardingLayout'

const GOOGLE_MAPS_API_BASE_URL = 'https://maps.googleapis.com/maps/api'

const apiKey =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  ''

/**
 * Gets photo URL from photo reference (similar to native implementation)
 */
function getGooglePlacePhotoUrl(
  photoReference: string,
  maxWidth: number = 400
): string | null {
  if (!apiKey || !photoReference) return null
  return `${GOOGLE_MAPS_API_BASE_URL}/place/photo?key=${apiKey}&photo_reference=${photoReference}&maxwidth=${maxWidth}`
}

/**
 * Fetches a photo for a location using Google Maps JavaScript API
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
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode(
      {
        location: {
          lat: location.latlng.latitude,
          lng: location.latlng.longitude
        }
      },
      (results, status) => {
        if (
          status === google.maps.GeocoderStatus.OK &&
          results &&
          results.length > 0 &&
          results[0]?.place_id
        ) {
          const placeId = results[0].place_id
          const div = document.createElement('div')
          document.body.appendChild(div)
          const placesService = new google.maps.places.PlacesService(div)

          placesService.getDetails(
            {
              placeId: placeId,
              fields: ['photos', 'name', 'formatted_address']
            },
            (place, placeStatus) => {
              try {
                if (div.parentNode) {
                  document.body.removeChild(div)
                }
              } catch (_) {
                // Ignore
              }

              if (
                placeStatus === google.maps.places.PlacesServiceStatus.OK &&
                place?.photos &&
                place.photos.length > 0
              ) {
                const firstPhoto = place.photos[0]
                let photoUri: string | null = null

                if (typeof firstPhoto?.getUrl === 'function') {
                  try {
                    photoUri = firstPhoto.getUrl({ maxWidth: 400 })
                  } catch (_) {
                    // Ignore
                  }
                }

                if (!photoUri && (firstPhoto as any)?.photo_reference) {
                  photoUri = getGooglePlacePhotoUrl(
                    (firstPhoto as any).photo_reference,
                    400
                  )
                }

                if (photoUri) {
                  callback({ ...location, photoUri })
                  return
                }
              }
              callback(location)
            }
          )
        } else {
          callback(location)
        }
      }
    )
  } catch (_) {
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

    if (savingCompleteRef.current || currentIsSaving) return

    if (!currentErrors.houseAddrs && currentHouseAddrs) {
      try {
        setIsSaving(true)
        formValuesRef.current.isSaving = true

        updateFormData({
          houseAddrs: currentHouseAddrs || null,
          gotoFavAddrs: currentGotoFavAddrs || null,
          schoolAddrs: currentSchoolAddrs || null
        })

        const userStorage = await getUserStorage()
        if (!userStorage?.phoneNumber) {
          console.error('[OnboardingScreen4] No user phone number found')
          setIsSaving(false)
          formValuesRef.current.isSaving = false
          return
        }

        // Map to SavedPlace structure
        const savedPlaces: SavedPlace[] = []

        const getPhotoKey = (
          marker: MarkerData,
          fallback: string | string[] | null
        ) => {
          return (
            marker.locationImageKey ||
            marker.photoUri ||
            (Array.isArray(fallback) ? fallback[0] : fallback) ||
            ''
          )
        }

        if (currentHouseAddrs) {
          savedPlaces.push({
            locationName: 'Home',
            locationImageKey: getPhotoKey(
              currentHouseAddrs,
              currentFormData.housePhotoUri
            ),
            address: {
              description: currentHouseAddrs.description,
              latlng: currentHouseAddrs.latlng
            }
          })
        }

        if (currentGotoFavAddrs) {
          savedPlaces.push({
            locationName: currentFormData.gotoFavAddrsName || 'Work',
            locationImageKey: getPhotoKey(
              currentGotoFavAddrs,
              currentFormData.gotoFavPhotoUri
            ),
            address: {
              description: currentGotoFavAddrs.description,
              latlng: currentGotoFavAddrs.latlng
            }
          })
        }

        if (currentSchoolAddrs) {
          savedPlaces.push({
            locationName: 'School',
            locationImageKey: getPhotoKey(
              currentSchoolAddrs,
              currentFormData.schoolPhotoUri
            ),
            address: {
              description: currentSchoolAddrs.description,
              latlng: currentSchoolAddrs.latlng
            }
          })
        }

        if (selectedUserType && userStorage.uid) {
          const newUserData = await createUser(
            userStorage.phoneNumber,
            selectedUserType,
            userStorage.uid,
            {
              name: currentFormData.name || '',
              caregiverPhone: `65${currentFormData.careGiverPhoneNumber}`,
              savedPlaces
            }
          )

          await setUserStorage({
            ...newUserData,
            loggedAt: Date.now()
          })

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
                        fetchLocationPhoto(location, (locationWithPhoto) => {
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
                        fetchLocationPhoto(location, (locationWithPhoto) => {
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
                        fetchLocationPhoto(location, (locationWithPhoto) => {
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
