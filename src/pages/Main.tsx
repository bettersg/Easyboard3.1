import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import Constants from 'expo-constants'
import * as SecureStore from 'expo-secure-store'
import { useEffect, useState } from 'react'
import { Text, View, TouchableOpacity, Modal } from 'react-native'
import { MaterialCommunityIcons  } from '@expo/vector-icons'

import EasyboardButton from '../common/components/EasyboardButton'
import Page from '../common/components/Page'
import SavedLocationCard from '../common/components/SavedLocationCard'
import GoogleMapView from '../common/locationSelector/GoogleMapView'
import useCallCaregiver from '../hooks/useCallCaregiver'
import { RootStackParamList } from '../types/RootStackParamList.type'
import { useLocationSharing } from '../contexts/LocationSharingContext'

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>

export default function Main({ navigation }: Props) {
  const callCareGiver = useCallCaregiver()
  const [userSetting, setUserSetting] = useState<any>(null)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [searchLocation, setSearchLocation] = useState<any>(null)
  const { isLocationSharing, setIsLocationSharing } = useLocationSharing();

  useEffect(() => {
    ; (async () => {
      try {
        const storedData = await SecureStore.getItemAsync(
          Constants?.expoConfig?.extra?.settingsStoredKey
        )
        if (storedData) setUserSetting(JSON.parse(storedData))
      } catch (e) {
        console.error(e)
      }
    })()
  }, [])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        const storedData = await SecureStore.getItemAsync(
          Constants?.expoConfig?.extra?.settingsStoredKey
        )
        if (storedData) setUserSetting(JSON.parse(storedData))
      } catch (e) {
        console.error(e)
      }
    })

    return unsubscribe
  }, [navigation])

  const onShareLocation = () => {
    setIsLocationSharing(!isLocationSharing);
  }

  return (
    <Page disableScroll>
      {userSetting && (
        <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
          <View style={{
              padding: 16,
              paddingTop: 24,
              paddingBottom: 120
            }}>
            {/* Header Section */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 20
            }}>
              <Text style={{
                fontSize: 23,
                fontWeight: '700',
                color: '#1F2937',
                flex: 1
              }}>
                Where do you want to go?
              </Text>
              <TouchableOpacity
                onPress={() => setIsSearchModalOpen(true)}
                style={{
                  padding: 8,
                  paddingTop:10
                }}
              >
                <MaterialCommunityIcons 
                  name="map-search-outline" 
                  size={30} 
                  color="#1F2937" 
                />
              </TouchableOpacity>
            </View>

            {/* Saved Locations Section */}
              <SavedLocationCard
                borderColor='border-cyan-800'
                onPress={() => {
                  navigation.navigate('TransitOptions', {
                    destinationName: 'Home',
                    destination: userSetting.houseAddrs
                  })
                }}
                title='Home'
                subtitle={userSetting.houseAddrs.description}
                imageUri={userSetting.housePhotoUri}
                iconName='home'
              />

              <View style={{ height: 16 }} />

              <SavedLocationCard
                borderColor='border-secondary'
                onPress={() => {
                  navigation.navigate('TransitOptions', {
                    destination: userSetting.gotoFavAddrs,
                    destinationName: userSetting.gotoFavAddrsName
                  })
                }}
                title={userSetting.gotoFavAddrsName}
                subtitle={userSetting.gotoFavAddrs.description}
                imageUri={userSetting.gotoFavPhotoUri}
                iconName='map'
              />
              <View style={{ height: 16 }} />
          </View>

          {/* Fixed Call Caregiver Button */}
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'white',
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
            zIndex: 1
          }}>
            <EasyboardButton
              type='bg-primary'
              onPress={callCareGiver}
              title='CALL CAREGIVER'
              iconName='phone-call'
              titleSize="text-lg"
            />
            <View style={{ height: 16 }} />
            <EasyboardButton
              type="bg-secondary"
              onPress={onShareLocation}
              title={isLocationSharing ? "STOP SHARING" : "SHARE LOCATION"}
              iconName="map-pin"
              titleSize="text-lg"
            />
          </View>
        </View>
      )}

      {/* Search Modal */}
      <Modal
        presentationStyle='pageSheet'
        statusBarTranslucent
        animationType='slide'
        visible={isSearchModalOpen}
        onRequestClose={() => {
          setIsSearchModalOpen(false)
        }}
        onDismiss={() => {
          setIsSearchModalOpen(false)
        }}
      >
        <View style={{
          flex: 1,
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <View style={{
            zIndex: 2,
            position: 'absolute',
            bottom: 80,
            right: 20
          }}>
            <EasyboardButton
              type='bg-white'
              onPress={() => {
                setIsSearchModalOpen(false);
                if (searchLocation) {
                  navigation.navigate('TransitOptions', {
                    destinationName: searchLocation.description,
                    destination: searchLocation
                  });
                  setSearchLocation(null);
                }
              }}
              title='Done'
            />
          </View>
          <GoogleMapView
            onLocationMarkerDrop={(locationMarker: any) => setSearchLocation(locationMarker)}
            value={null}
          />
        </View>
      </Modal>
    </Page>
  )
}
