import { useCallback, useEffect, useState } from 'react'
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
import { getUserAppData } from '../../services/userService'
import type { MarkerData } from '../../stores/onboardingStore'
import type { SettingValues } from '../../types'

export function PWIDHome() {
  const [appData, setAppData] = useState<SettingValues | null>(null)
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

  // Extract loadSavedLocations as a separate function for reuse
  const loadSavedLocations = useCallback(async (forceRefresh = false) => {
    try {
      const userStorage = await getUserStorage()
      if (!userStorage?.phoneNumber) {
        console.error('No user phone number found')
        return
      }

      // First, load cached data for instant display (skip if force refresh)
      if (!forceRefresh) {
        const cachedData = (await getUserStorage()) as SettingValues | null
        if (cachedData) {
          console.log('Loading cached data')
          setAppData(cachedData)
        }
      }

      // Then, fetch latest data from Firebase
      console.log('Fetching latest data from Firebase', userStorage.phoneNumber)
      const savedData = await getUserAppData(userStorage.phoneNumber)

      console.log('latest', savedData)

      if (savedData) {
        // Update state with fresh data
        setAppData(savedData)

        // Cache the fresh data for next time
        await setUserStorage(savedData as unknown as UserStorage)

        // Resolve file keys to download URLs in parallel
        const resolvePhoto = async (
          photoKeyOrArray: string | string[] | null | undefined
        ) => {
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
        }

        const [houseUrl, workUrl, schoolUrl] = await Promise.all([
          resolvePhoto(
            savedData.houseAddrs?.photoUri || savedData.housePhotoUri
          ),
          resolvePhoto(
            savedData.gotoFavAddrs?.photoUri || savedData.gotoFavPhotoUri
          ),
          resolvePhoto(
            savedData.schoolAddrs?.photoUri || savedData.schoolPhotoUri
          )
        ])

        setResolvedPhotoUrls({
          house: houseUrl,
          work: workUrl,
          school: schoolUrl
        })
      }
    } catch (error) {
      console.error('Error loading saved locations:', error)
    }
  }, [])

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
    await loadSavedLocations(true) // Force refresh - skip cache
    setRefreshing(false)
  }, [loadSavedLocations])

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      // Complete logout - clears all data including Firebase tokens
      await completeLogout()
      // Update authentication state
      setAuthentication(false, null)
      // Navigate to landing page
      router.push('/')
    } catch (error) {
      console.error('Error during logout:', error)
      setLoggingOut(false)
    }
  }

  // Navigate to transit options with query params (Next.js idiomatic way)
  const navigateToTransitOptions = useCallback(
    (destination: MarkerData, destinationName: string) => {
      if (!destination?.latlng) return

      // Encode destination data as query params
      const params = new URLSearchParams({
        lat: destination.latlng.latitude.toString(),
        lng: destination.latlng.longitude.toString(),
        name: destinationName,
        description: destination.description || ''
      })

      // Optionally include photoUri if available
      if (destination.photoUri) {
        params.set('photoUri', destination.photoUri)
      }

      router.push(`/transit-options?${params.toString()}`)
    },
    [router]
  )

  // Create navigation handlers for each saved place
  const handleHomePress = useCallback(() => {
    const houseAddrs = (appData?.houseAddrs as MarkerData) || null
    if (houseAddrs) {
      navigateToTransitOptions(houseAddrs, 'Home')
    }
  }, [appData?.houseAddrs, navigateToTransitOptions])

  const handleWorkPress = useCallback(() => {
    const gotoFavAddrs = (appData?.gotoFavAddrs as MarkerData) || null
    if (gotoFavAddrs) {
      navigateToTransitOptions(
        gotoFavAddrs,
        (appData?.gotoFavAddrsName as string) || 'Work'
      )
    }
  }, [
    appData?.gotoFavAddrs,
    appData?.gotoFavAddrsName,
    navigateToTransitOptions
  ])

  const handleSchoolPress = useCallback(() => {
    const schoolAddrs = (appData?.schoolAddrs as MarkerData) || null
    if (schoolAddrs) {
      navigateToTransitOptions(schoolAddrs, 'School')
    }
  }, [appData?.schoolAddrs, navigateToTransitOptions])

  const handleSearchLocationSelect = useCallback((location: MarkerData) => {
    setSearchLocation(location)
  }, [])

  const handleSearchDone = useCallback(() => {
    setIsSearchModalOpen(false)
    if (searchLocation) {
      // Get a short name from the description (first part before comma)
      const shortName =
        searchLocation.description.split(',')[0] || 'Destination'
      navigateToTransitOptions(searchLocation, shortName)
      setSearchLocation(null)
    }
  }, [searchLocation, navigateToTransitOptions])

  if (loading) {
    return (
      <View className='flex-1 items-center justify-center'>
        <Text className='text-base text-[#677281]'>Loading...</Text>
      </View>
    )
  }

  const houseAddrs = (appData?.houseAddrs as MarkerData) || null
  const gotoFavAddrs = (appData?.gotoFavAddrs as MarkerData) || null
  const schoolAddrs = (appData?.schoolAddrs as MarkerData) || null

  const housePhotoUri = resolvedPhotoUrls.house
  const workPhotoUri = resolvedPhotoUrls.work
  const schoolPhotoUri = resolvedPhotoUrls.school

  return (
    <>
      <View
        className='justify-start items-center px-6 w-screen flex-1'
        style={{ paddingTop: top + 16 }}
      >
        <View className='gap-6 w-full'>
          {/* Header with Search */}
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
            {/* Home Card */}
            {houseAddrs && (
              <View className='gap-2'>
                <SavedPlaceCard
                  title='Home'
                  required={true}
                  onPress={handleHomePress}
                  location={houseAddrs}
                  imageUri={housePhotoUri}
                />
              </View>
            )}

            {/* Work Card */}
            {gotoFavAddrs && (
              <View className='gap-2'>
                <SavedPlaceCard
                  title='Work'
                  onPress={handleWorkPress}
                  location={gotoFavAddrs}
                  imageUri={workPhotoUri}
                />
              </View>
            )}

            {/* School Card */}
            {schoolAddrs && (
              <View className='gap-2'>
                <SavedPlaceCard
                  title='School'
                  onPress={handleSchoolPress}
                  location={schoolAddrs}
                  imageUri={schoolPhotoUri}
                />
              </View>
            )}

            <Button
              onPress={() => setIsSearchModalOpen(true)}
              variant='outline'
              className='px-3 py-2 h-auto w-full bg-[#FCFCFD]'
              text='Other location'
            />

            {!houseAddrs && !gotoFavAddrs && !schoolAddrs && (
              <View className='flex-1 items-center justify-center py-12'>
                <Text className='text-base text-[#677281]'>
                  No saved locations yet.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Fixed Bottom Buttons */}
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

      {/* Search Location Modal */}
      <Modal
        presentationStyle='pageSheet'
        statusBarTranslucent
        animationType='slide'
        visible={isSearchModalOpen}
        onRequestClose={() => setIsSearchModalOpen(false)}
        onDismiss={() => setIsSearchModalOpen(false)}
      >
        <View className='flex-1 bg-white'>
          {/* Header */}
          <View className='flex-row items-center justify-start px-6 py-4 gap-4'>
            <BackButton
              onPress={() => setIsSearchModalOpen(false)}
              textClassName='text-[40px] mb-1'
            />
            <Text className='text-2xl font-bold text-[#414852]'>
              Search destination
            </Text>
          </View>

          {/* Map */}
          <View className='flex-1'>
            <GoogleMapView
              onLocationMarkerDrop={handleSearchLocationSelect}
              value={searchLocation}
              initialCenter={{
                latitude: 1.3521,
                longitude: 103.8198
              }}
            />
          </View>

          {/* Bottom Action */}
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
              onPress={handleSearchDone}
              disabled={!searchLocation}
              variant='primary'
            />
          </View>
        </View>
      </Modal>
    </>
  )
}
