import { useCallback, useEffect, useMemo, useState } from 'react'
import { Modal, RefreshControl } from 'react-native'
import { useSafeArea } from 'react-native-safe-area-context'
import { useRouter } from 'solito/navigation'
import { BackButton, Button, ScrollView, Text, View } from '../../components'
import GoogleMapView from '../../components/mapView/GoogleMapView'
import { SavedPlaceCard } from '../../components/SavedPlaceCard'
import { useAuth } from '../../contexts'
import { useLocationSharing } from '../../contexts/LocationSharingContext'
import { useCallCaregiver } from '../../hooks/useCallCaregiver'
import {
  completeLogout,
  getPhotoDownloadUrl,
  getUserStorage,
  setUserStorage,
  type UserStorage
} from '../../services/storageService'
import { getUserData } from '../../services/userService'
import type { MarkerData } from '../../stores/onboardingStore'
import type { PWIDUser, SavedPlace } from '../../types'

export function PWIDHome() {
  const [userData, setUserData] = useState<UserStorage | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [searchLocation, setSearchLocation] = useState<MarkerData | null>(null)
  const [resolvedPhotoUrls, setResolvedPhotoUrls] = useState<{
    house?: string
    work?: string
    school?: string
  }>({})

  const { top, bottom } = useSafeArea()
  const router = useRouter()
  const { setAuthentication } = useAuth()
  const { isLocationSharing, setIsLocationSharing } = useLocationSharing()
  const callCaregiver = useCallCaregiver()

  // Helper to resolve photo keys to URLs
  const resolvePhoto = useCallback(
    async (photoKeyOrArray: string | string[] | null | undefined) => {
      if (!photoKeyOrArray) return undefined
      const photoKey = Array.isArray(photoKeyOrArray)
        ? photoKeyOrArray[0]
        : photoKeyOrArray
      if (!photoKey) return undefined
      try {
        return await getPhotoDownloadUrl(photoKey)
      } catch (e) {
        console.error('Error resolving photo URL:', e)
        return undefined
      }
    },
    []
  )

  const loadPhotos = useCallback(
    async (pwid: Partial<PWIDUser>) => {
      if (!pwid.savedPlaces) return

      const housePlace = pwid.savedPlaces.find((p) => p.locationName === 'Home')
      const schoolPlace = pwid.savedPlaces.find(
        (p) => p.locationName === 'School'
      )
      const workPlace = pwid.savedPlaces.find(
        (p) => p.locationName !== 'Home' && p.locationName !== 'School'
      )

      const [houseUrl, workUrl, schoolUrl] = await Promise.all([
        resolvePhoto(housePlace?.locationImageKey),
        resolvePhoto(workPlace?.locationImageKey),
        resolvePhoto(schoolPlace?.locationImageKey)
      ])

      setResolvedPhotoUrls({
        house: houseUrl,
        work: workUrl,
        school: schoolUrl
      })
    },
    [resolvePhoto]
  )

  // Extract loadSavedLocations as a separate function for reuse
  const loadSavedLocations = useCallback(
    async (forceRefresh = false) => {
      try {
        const cachedUser = await getUserStorage()

        // First, load from storage for instant display
        if (cachedUser) {
          setUserData(cachedUser)
          if (cachedUser.userType === 'PWID') {
            loadPhotos(cachedUser as unknown as PWIDUser)
          }
        }

        if (!cachedUser?.phoneNumber) {
          console.error('No user phone number found')
          return
        }

        // Then, fetch latest data from Firebase if needed or forced
        if (forceRefresh || !cachedUser) {
          console.log(
            'Fetching latest data from Firebase',
            cachedUser.phoneNumber
          )
          const freshData = await getUserData(cachedUser.phoneNumber)

          if (freshData) {
            const updatedStorage: UserStorage = {
              ...freshData,
              loggedAt: cachedUser?.loggedAt || Date.now()
            }
            setUserData(updatedStorage)
            await setUserStorage(updatedStorage)

            if (freshData.userType === 'PWID') {
              loadPhotos(freshData as PWIDUser)
            }
          }
        }
      } catch (error) {
        console.error('Error loading saved locations:', error)
      }
    },
    [loadPhotos]
  )

  // Initial load
  useEffect(() => {
    const initialLoad = async () => {
      await loadSavedLocations(false)
      setLoading(false)
    }
    initialLoad()
  }, [loadSavedLocations])

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadSavedLocations(true)
    setRefreshing(false)
  }, [loadSavedLocations])

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await completeLogout()
      setAuthentication(false, undefined)
      router.push('/')
    } catch (error) {
      console.error('Error during logout:', error)
      setLoggingOut(false)
    }
  }

  // Extract saved places using useMemo
  const savedPlaces = useMemo(() => {
    if (userData?.userType !== 'PWID') return {}

    const pwid = userData as unknown as PWIDUser
    if (!pwid.savedPlaces) return {}

    const findPlace = (name: string) =>
      pwid.savedPlaces?.find((p) => p.locationName === name)
    const findWorkPlace = () =>
      pwid.savedPlaces?.find(
        (p) => p.locationName !== 'Home' && p.locationName !== 'School'
      )

    const mapToMarker = (place?: SavedPlace): MarkerData | null => {
      if (!place) return null
      return {
        description: place.address.description,
        latlng: {
          latitude: place.address.latlng.latitude,
          longitude: place.address.latlng.longitude
        }
      }
    }

    const home = findPlace('Home')
    const school = findPlace('School')
    const work = findWorkPlace()

    return {
      home: mapToMarker(home),
      school: mapToMarker(school),
      work: mapToMarker(work),
      workName: work?.locationName || 'Work'
    }
  }, [userData])

  // Navigate to transit options
  const navigateToTransitOptions = useCallback(
    (destination: MarkerData, destinationName: string) => {
      if (!destination?.latlng) return

      const params = new URLSearchParams({
        lat: destination.latlng.latitude.toString(),
        lng: destination.latlng.longitude.toString(),
        name: destinationName,
        description: destination.description || ''
      })

      if (destination.photoUri) {
        params.set('photoUri', destination.photoUri)
      }

      router.push(`/transit-options?${params.toString()}`)
    },
    [router]
  )

  if (loading) {
    return (
      <View className='flex-1 items-center justify-center'>
        <Text className='text-base text-[#677281]'>Loading...</Text>
      </View>
    )
  }

  return (
    <>
      <View
        className='justify-start items-center px-6 w-screen flex-1'
        style={{ paddingTop: top + 16 }}
      >
        <View className='gap-6 w-full'>
          <View className='flex-row items-center justify-between'>
            <Text className='text-2xl font-bold text-[#414852]'>
              Where do you want to go?
            </Text>
          </View>

          <View className='gap-2'>
            <Text className='text-lg font-semibold text-[#414852]'>
              Saved Places
            </Text>
            <Text className='text-base text-[#677281]'>
              Tap a location to get directions
            </Text>
          </View>

          <ScrollView
            contentContainerClassName='gap-4 pb-12 web:pb-36 pt-4'
            className='h-[500px]'
            alwaysBounceVertical={true}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {savedPlaces.home && (
              <View className='gap-2'>
                <SavedPlaceCard
                  title='Home'
                  required={true}
                  onPress={() =>
                    navigateToTransitOptions(savedPlaces.home!, 'Home')
                  }
                  location={savedPlaces.home}
                  imageUri={resolvedPhotoUrls.house}
                />
              </View>
            )}

            {savedPlaces.work && (
              <View className='gap-2'>
                <SavedPlaceCard
                  title={savedPlaces.workName}
                  onPress={() =>
                    navigateToTransitOptions(
                      savedPlaces.work!,
                      savedPlaces.workName
                    )
                  }
                  location={savedPlaces.work}
                  imageUri={resolvedPhotoUrls.work}
                />
              </View>
            )}

            {savedPlaces.school && (
              <View className='gap-2'>
                <SavedPlaceCard
                  title='School'
                  onPress={() =>
                    navigateToTransitOptions(savedPlaces.school!, 'School')
                  }
                  location={savedPlaces.school}
                  imageUri={resolvedPhotoUrls.school}
                />
              </View>
            )}

            <Button
              onPress={() => setIsSearchModalOpen(true)}
              variant='outline'
              className='px-3 py-2 h-auto w-full bg-[#FCFCFD]'
              text='Other location'
            />

            {!savedPlaces.home && !savedPlaces.work && !savedPlaces.school && (
              <View className='flex-1 items-center justify-center py-12'>
                <Text className='text-base text-[#677281]'>
                  No saved locations yet.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        <View
          className='absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4'
          style={{ paddingBottom: bottom + 16 }}
        >
          <View className='gap-3'>
            <Button
              text='CALL CAREGIVER'
              onPress={callCaregiver}
              variant='primary'
              className='rounded-full'
            />
            <Button
              text={isLocationSharing ? 'STOP SHARING' : 'SHARE LOCATION'}
              onPress={() => setIsLocationSharing(!isLocationSharing)}
              variant={isLocationSharing ? 'secondary' : 'outline'}
              className='rounded-full'
            />
            <Button
              text={loggingOut ? 'Logging out...' : 'Logout'}
              onPress={handleLogout}
              disabled={loggingOut}
              variant='text'
              textClassName='text-red-500'
            />
          </View>
        </View>
      </View>

      <Modal
        presentationStyle='pageSheet'
        statusBarTranslucent
        animationType='slide'
        visible={isSearchModalOpen}
        onRequestClose={() => setIsSearchModalOpen(false)}
        onDismiss={() => setIsSearchModalOpen(false)}
      >
        <View className='flex-1 bg-white'>
          <View className='flex-row items-center justify-start px-6 py-4 gap-4'>
            <BackButton
              onPress={() => setIsSearchModalOpen(false)}
              textClassName='text-[40px] mb-1'
            />
            <Text className='text-2xl font-bold text-[#414852]'>
              Search destination
            </Text>
          </View>

          <View className='flex-1'>
            <GoogleMapView
              isModal
              onLocationMarkerDrop={(location) => setSearchLocation(location)}
              value={searchLocation}
              initialCenter={{
                latitude: 1.3521,
                longitude: 103.8198
              }}
            />
          </View>

          <View
            className='px-6 py-4 bg-white border-t border-gray-200'
            style={{ paddingBottom: bottom + 12 }}
          >
            {searchLocation && (
              <View className='mb-3'>
                <Text className='text-sm text-gray-600' numberOfLines={2}>
                  {searchLocation.description}
                </Text>
              </View>
            )}
            <Button
              text='Get Directions'
              onPress={() => {
                setIsSearchModalOpen(false)
                if (searchLocation) {
                  const shortName =
                    searchLocation.description.split(',')[0] || 'Destination'
                  navigateToTransitOptions(searchLocation, shortName)
                  setSearchLocation(null)
                }
              }}
              disabled={!searchLocation}
              variant='primary'
            />
          </View>
        </View>
      </Modal>
    </>
  )
}
